import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, IText, Rect, Circle, FabricImage as Image } from 'fabric';
import { Type, Square, Circle as CircleIcon, Trash2, ArrowLeft, Download, Upload, Save } from 'lucide-react';
import { loadPSDToCanvas } from '../../utils/agPsdLoader';
import CollapsibleSection from './CollapsibleSection';
import useFabricPages from '../../hooks/useFabricPages';
import useResizableSidebar from '../../hooks/useResizableSidebar';
import fabricCloudinaryService from '../../services/fabricCloudinaryService';
import supabaseCompanyService from '../../supabase/api/companyService';
import campaignService from '../../supabase/api/campaignService';
import toast from 'react-hot-toast';
import './FabricEditor.css';

const FabricEditor = forwardRef(({ selectedTemplate, onBack, onSave, campaignId, mode, currentPage: externalCurrentPage, onPSDAnalysis }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageUploadRef = useRef(null);

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectProperties, setObjectProperties] = useState({});
  const [layers, setLayers] = useState([]);
  const [psdLoaded, setPsdLoaded] = useState(false);

  // Editor mode (Simple/Advanced) - use prop if provided, otherwise internal state
  const [internalMode, setInternalMode] = useState('simple');
  const editorMode = mode || internalMode;
  const setEditorMode = mode ? () => {} : setInternalMode; // No-op if controlled

  // Brand data from Supabase
  const [brandData, setBrandData] = useState(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Multi-page hook (front/back postcards)
  const {
    currentPage: hookCurrentPage,
    isDoubleSided: hookIsDoubleSided,
    switchToPage,
    initializePages,
    getAllPagesJSON,
    saveCurrentPage
  } = useFabricPages(fabricCanvasRef.current);

  // Use external currentPage if provided (controlled by parent), otherwise use hook's currentPage
  const currentPage = externalCurrentPage || hookCurrentPage;

  // State to track if PSD is double-sided (from PSD analysis)
  const [psdIsDoubleSided, setPsdIsDoubleSided] = useState(false);

  // Use PSD's isDoubleSided if PSD is loaded, otherwise use hook's state
  const isDoubleSided = psdLoaded ? psdIsDoubleSided : hookIsDoubleSided;

  // Resizable sidebar hook
  const { sidebarWidth, resizeHandleProps } = useResizableSidebar({
    defaultWidth: 200,
    minWidth: 150,
    maxWidth: 500,
    storageKey: 'fabricEditorSidebarWidth'
  });

  // Expose saveDesign method to parent via ref
  useImperativeHandle(ref, () => ({
    saveDesign: async () => {
      try {
        const result = await handleSaveDesign();
        if (result && result.designUrl) {
          return result;
        }
        throw new Error('Failed to save design');
      } catch (error) {
        console.error('Save design error:', error);
        throw error; // Re-throw for parent to handle
      }
    }
  }));

  // Prevent locked objects from moving in multi-selection (for simple mode)
  const preventLockedMovement = (e) => {
    const selection = e.selected || e.target;
    if (!selection) return;

    // Check if it's a multi-selection (activeSelection)
    if (selection.type === 'activeSelection') {
      // Lock the entire selection group in simple mode
      selection.set({
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false
      });
    }
  };

  // Define handlers before useEffect
  const handleSelectionChange = (e) => {
    // Prevent locked objects from moving in simple mode
    if (editorMode === 'simple') {
      preventLockedMovement(e);
    }

    // Get selected object - handle both selection:created and selection:updated
    const obj = e.selected?.[0] || e.target;

    if (obj && obj.type !== 'activeSelection') {
      console.log('Object selected:', obj.name, obj.type);

      // Update object coordinates to prevent position jumping
      obj.setCoords();

      setSelectedObject(obj);
      setObjectProperties({
        type: obj.type,
        fill: obj.fill,
        stroke: obj.stroke,
        opacity: obj.opacity,
        text: obj.text,
      });

      // Re-render canvas to ensure proper display
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const handleSelectionClear = () => {
    setSelectedObject(null);
    setObjectProperties({});
  };

  const updateLayersList = (canvas) => {
    const objects = canvas.getObjects();
    const layersList = objects.map((obj, index) => {
      let displayType = obj.type;

      // Determine display type from metadata
      if (obj.psdMetadata) {
        if (obj.psdMetadata.isTextLayer) displayType = 'text';
        else if (obj.psdMetadata.isShape) displayType = 'shape';
        else if (obj.psdMetadata.isReplaceableImage) displayType = 'image';
      }

      return {
        id: index,
        name: obj.name || `Layer ${objects.length - index}`,
        type: displayType,
        object: obj,
        psdMetadata: obj.psdMetadata
      };
    }).reverse(); // Reverse so top layers appear first
    setLayers(layersList);
  };

  const selectLayer = (layerObj) => {
    if (!fabricCanvasRef.current) return;

    // Set the active object on the canvas
    fabricCanvasRef.current.setActiveObject(layerObj);
    fabricCanvasRef.current.renderAll();

    // CRITICAL: Update React state so Edit Layer section appears
    setSelectedObject(layerObj);
    setObjectProperties({
      type: layerObj.type,
      fill: layerObj.fill,
      stroke: layerObj.stroke,
      opacity: layerObj.opacity,
      text: layerObj.text,
    });
  };

  // Persist editor mode to localStorage
  useEffect(() => {
    localStorage.setItem('editorMode', editorMode);
  }, [editorMode]);

  // Load brand data from Supabase on mount
  useEffect(() => {
    async function loadBrandData() {
      try {
        const company = await supabaseCompanyService.getCompanyInfo();
        if (company) {
          console.log('[BRAND DATA] Loaded brand data:', company.name);

          // Parse color_palette if it's a string
          let colorPalette = company.color_palette;
          if (typeof colorPalette === 'string') {
            try {
              colorPalette = JSON.parse(colorPalette);
            } catch (e) {
              console.warn('Could not parse color_palette:', e);
              colorPalette = [];
            }
          }

          setBrandData({
            name: company.name,
            logoUrl: company.logo_url,
            logoIconUrl: company.logo_icon_url,
            primaryColor: company.primary_color,
            secondaryColor: company.secondary_color,
            colorPalette: colorPalette || []
          });
        }
      } catch (error) {
        console.error('Error loading brand data:', error);
      }
    }

    loadBrandData();
  }, []);

  // Initialize pages when template changes
  useEffect(() => {
    if (selectedTemplate) {
      initializePages(selectedTemplate);
    }
  }, [selectedTemplate, initializePages]);

  // Reload PSD when currentPage changes (for double-sided PSDs)
  useEffect(() => {
    // Only reload if:
    // 1. PSD is loaded
    // 2. It's a double-sided PSD
    // 3. Canvas is ready
    if (psdLoaded && psdIsDoubleSided && fabricCanvasRef.current && selectedTemplate?.psdFile) {
      console.log('Current page changed to:', currentPage, '- reloading PSD');
      loadTemplate(fabricCanvasRef.current);
    }
  }, [currentPage]);

  // Save design handler
  const handleSaveDesign = async () => {
    if (!fabricCanvasRef.current) {
      toast.error('Editor not ready. Please try again.');
      return null;
    }

    if (!campaignId) {
      toast.error('No campaign ID provided.');
      return null;
    }

    setIsSaving(true);
    const saveToast = toast.loading('Saving your design...');

    try {
      // Get all pages data
      const pagesData = getAllPagesJSON();

      console.log('[Save] Saving fabric.js design...');
      console.log('[Save] Pages data:', pagesData);

      // Save to Cloudinary
      const result = await fabricCloudinaryService.saveFabricDesign(
        fabricCanvasRef.current,
        pagesData,
        campaignId
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload to Cloudinary');
      }

      console.log('[Save] Files uploaded successfully');

      // Update campaign database
      toast.loading('Updating campaign...', { id: saveToast });

      const updateResult = await campaignService.saveCampaignDesign(
        campaignId,
        result.designUrl,
        result.previewUrl
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update campaign');
      }

      toast.success('Design saved successfully!', { id: saveToast });

      // Callback to parent
      if (onSave) {
        onSave({
          designUrl: result.designUrl,
          previewUrl: result.previewUrl
        });
      }

      // Return the URLs for ref-based calls
      return {
        designUrl: result.designUrl,
        previewUrl: result.previewUrl
      };

    } catch (error) {
      console.error('[Save] Error saving design:', error);
      toast.error(error.message || 'Failed to save design', { id: saveToast });
      throw error; // Re-throw for ref-based calls to handle
    } finally {
      setIsSaving(false);
    }
  };

  // Apply mode properties to a single object
  const applyModeToObject = (obj, mode) => {
    if (mode === 'simple') {
      // Simple mode: Lock position and scaling, but keep text editable
      obj.set({
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false, // Hide corner handles
        hasBorders: true, // Keep selection border visible
        selectable: true, // Allow selection
        evented: true, // Allow events (click, etc.)
        // Keep text editable for text objects
        editable: obj.type === 'i-text' || obj.type === 'textbox'
      });
    } else {
      // Advanced mode: Full control
      obj.set({
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        hasControls: true, // Show corner handles
        hasBorders: true,
        selectable: true,
        evented: true,
        editable: obj.type === 'i-text' || obj.type === 'textbox'
      });
    }

    // Update object coordinates to prevent jumping/popping
    obj.setCoords();
  };

  // Apply mode properties to all objects on canvas
  const applyModeToAllObjects = (mode) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach(obj => applyModeToObject(obj, mode));
    fabricCanvasRef.current.renderAll();
  };

  // Handle mode toggle
  const handleModeToggle = (newMode) => {
    console.log('Switching to', newMode, 'mode');
    setEditorMode(newMode);

    // Deselect any selected objects when switching modes
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.discardActiveObject();
      applyModeToAllObjects(newMode);
    }

    setSelectedObject(null);
    setObjectProperties({});
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Prevent double initialization - keep existing canvas
    if (fabricCanvasRef.current) {
      console.log('Canvas already initialized, reusing existing canvas');

      // If template changed, reload it on the existing canvas
      if (!psdLoaded) {
        console.log('Loading new template on existing canvas...');
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (fabricCanvasRef.current?.lowerCanvasEl) {
              loadTemplate(fabricCanvasRef.current);
            }
          }, 100);
        });
      }
      return;
    }

    let isMounted = true;
    let canvas = null;

    try {
      console.log('Initializing Fabric canvas...');
      console.log('Canvas element:', canvasRef.current);

      // Initialize Fabric canvas WITHOUT fixed dimensions
      // Let the PSD loader set the correct dimensions
      canvas = new Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        renderOnAddRemove: true,
        enableRetinaScaling: false, // Disabled to fix text cursor positioning on retina displays
      });

      console.log('Fabric canvas created:', canvas);
      console.log('Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());

      fabricCanvasRef.current = canvas;

      // Set up event handlers for object selection
      canvas.on('selection:created', handleSelectionChange);
      canvas.on('selection:updated', handleSelectionChange);
      canvas.on('selection:cleared', handleSelectionClear);

      // Add hover cursor effects for better discoverability
      canvas.on('mouse:over', (e) => {
        if (e.target) {
          canvas.defaultCursor = 'pointer';
          canvas.hoverCursor = 'pointer';
        }
      });

      canvas.on('mouse:out', () => {
        canvas.defaultCursor = 'default';
      });

      // Update layers list when objects are added/modified
      canvas.on('object:added', () => updateLayersList(canvas));
      canvas.on('object:removed', () => updateLayersList(canvas));
      canvas.on('object:modified', () => updateLayersList(canvas));

      // Add keyboard event handler for Delete key
      const handleKeyDown = (e) => {
        // Check if Delete or Backspace key is pressed
        if ((e.key === 'Delete' || e.key === 'Backspace') && fabricCanvasRef.current) {
          // Only delete if not currently editing text
          const activeObject = fabricCanvasRef.current.getActiveObject();
          if (activeObject && !activeObject.isEditing) {
            e.preventDefault();
            handleDelete();
          }
        }
      };

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      // Force an initial render
      canvas.renderAll();
      console.log('Initial render complete');

      // Wait for canvas to be fully initialized before loading template
      console.log('Canvas initialized, waiting for DOM to be ready...');

      // Use requestAnimationFrame to wait for next render cycle
      requestAnimationFrame(() => {
        if (!isMounted) {
          console.log('Component unmounted during initialization');
          return;
        }

        setTimeout(() => {
          if (!isMounted || !fabricCanvasRef.current) {
            console.log('Component unmounted, skipping template load');
            return;
          }

          console.log('Loading template now...');
          const currentCanvas = fabricCanvasRef.current;
          console.log('Lower canvas exists:', !!currentCanvas.lowerCanvasEl);
          console.log('Upper canvas exists:', !!currentCanvas.upperCanvasEl);

          // Only load if canvas is ready and still mounted
          if (currentCanvas.lowerCanvasEl && currentCanvas.upperCanvasEl && isMounted) {
            loadTemplate(currentCanvas);
          } else if (isMounted) {
            console.warn('Canvas not ready, waiting another 100ms...');
            setTimeout(() => {
              if (isMounted && fabricCanvasRef.current) {
                loadTemplate(fabricCanvasRef.current);
              }
            }, 100);
          }
        }, 100);
      });

      return () => {
        console.log('Cleanup called - isMounted:', isMounted);
        isMounted = false;

        // Don't dispose canvas - keep it for React StrictMode remounts
        // Only clean up event listeners
        if (canvas) {
          try {
            canvas.off('selection:created', handleSelectionChange);
            canvas.off('selection:updated', handleSelectionChange);
            canvas.off('selection:cleared', handleSelectionClear);
          } catch (e) {
            console.warn('Error cleaning up event listeners:', e);
          }
        }

        // Cleanup keyboard event listener
        document.removeEventListener('keydown', handleKeyDown);

        // Don't set fabricCanvasRef to null - keep the reference
        // fabricCanvasRef.current = null;
      };
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Failed to initialize editor: ' + err.message);
      setLoading(false);
    }
  }, [selectedTemplate, psdLoaded]);

  const loadTemplate = async (canvas) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('loadTemplate called for:', selectedTemplate?.name);

      // Check if selectedTemplate has a PSD file - load it with layers
      if (selectedTemplate?.psdFile) {
        const psdPath = `/PSD-files/${selectedTemplate.psdFile}`;
        console.log('Loading PSD:', psdPath, 'Page:', currentPage);

        // Clear canvas before loading
        try {
          canvas.clear();
          canvas.backgroundColor = '#ffffff';
        } catch (clearError) {
          console.warn('Could not clear canvas before loading:', clearError.message);
          // Continue anyway - canvas might not be fully initialized yet
        }

        // Load PSD with current page
        const psdResult = await loadPSDToCanvas(psdPath, canvas, currentPage);
        console.log('PSD Result:', psdResult);

        // Store if PSD is double-sided
        if (psdResult && psdResult.isDoubleSided !== undefined) {
          setPsdIsDoubleSided(psdResult.isDoubleSided);
          console.log('PSD is double-sided:', psdResult.isDoubleSided);

          // Notify parent component about PSD analysis
          if (onPSDAnalysis) {
            onPSDAnalysis(psdResult);
          }
        }

        // Apply editor mode to all loaded objects
        console.log('Applying', editorMode, 'mode to loaded objects');
        applyModeToAllObjects(editorMode);

        // Update layers list after loading
        updateLayersList(canvas);

        // Force render immediately
        canvas.renderAll();
        canvas.requestRenderAll();

        console.log('PSD load complete, hiding loading screen');
        setPsdLoaded(true);
        setLoading(false);

        // Force another render after state updates
        setTimeout(() => {
          if (canvas && fabricCanvasRef.current === canvas) {
            canvas.renderAll();
            canvas.requestRenderAll();
            console.log('Post-load render complete');
            console.log('Final object count:', canvas.getObjects().length);
          }
        }, 100);

        // Additional render pass after longer delay to ensure visibility
        setTimeout(() => {
          if (canvas && fabricCanvasRef.current === canvas) {
            canvas.renderAll();
            canvas.requestRenderAll();
            console.log('Extended render complete');
          }
        }, 300);

        return;
      }

      // For non-PSD templates, clear canvas first
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Calculate canvas dimensions based on selectedTemplate
      const width = (selectedTemplate?.dimensions?.width || 6) * 100;
      const height = (selectedTemplate?.dimensions?.height || 4) * 100;

      canvas.setWidth(Math.min(width, 1400));
      canvas.setHeight(Math.min(height, 1000));

      // Load selectedTemplate preview as background (non-blocking)
      if (selectedTemplate?.preview) {
        try {
          const img = await Image.fromURL(selectedTemplate.preview);

          // Scale image to fit canvas
          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;

          img.set({
            scaleX: scaleX,
            scaleY: scaleY,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
          });

          // Add image to canvas and move to back
          canvas.add(img);
          canvas.sendObjectToBack(img);
        } catch (imgErr) {
          console.error('Failed to load preview image:', imgErr);
          // Continue without background image
        }
      }

      // Add editable text elements on top
      addEditableElements(canvas);

      setLoading(false);
      canvas.renderAll();
    } catch (err) {
      console.error('Error loading template:', err);
      // Only show error if it's not a React StrictMode double-mount issue
      if (!err.message.includes('Canvas elements not initialized')) {
        setError('Failed to load template: ' + err.message);
      } else {
        console.log('Ignoring canvas initialization error (likely React StrictMode double-mount)');
      }
      setLoading(false);
    }
  };

  const addEditableElements = (canvas) => {
    // Add sample text elements based on selectedTemplate
    if (selectedTemplate?.editableElements?.includes('businessName')) {
      const businessText = new IText('Your Business Name', {
        left: 50,
        top: 50,
        fontSize: 32,
        fontWeight: 'bold',
        fill: selectedTemplate?.colors?.text || '#000000',
      });
      canvas.add(businessText);
    }

    if (selectedTemplate?.editableElements?.includes('headline')) {
      const headlineText = new IText('Your Headline Here', {
        left: 50,
        top: 100,
        fontSize: 24,
        fill: selectedTemplate?.colors?.text || '#000000',
      });
      canvas.add(headlineText);
    }

    if (selectedTemplate?.editableElements?.includes('bodyText')) {
      const bodyText = new IText('Add your message here...', {
        left: 50,
        top: 150,
        fontSize: 16,
        fill: selectedTemplate?.colors?.text || '#000000',
      });
      canvas.add(bodyText);
    }

    canvas.renderAll();
  };

  const handleAddText = () => {
    if (!fabricCanvasRef.current) {
      console.warn('Canvas not ready');
      return;
    }

    try {
      const text = new IText('New Text', {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: '#000000',
        editable: true,
      });

      // Apply current editor mode properties
      applyModeToObject(text, editorMode);

      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();

      // Force update layers list
      updateLayersList(fabricCanvasRef.current);

      console.log('Text added successfully:', text);
    } catch (err) {
      console.error('Failed to add text:', err);
      alert('Failed to add text element. Please try again.');
    }
  };

  const handleAddRectangle = () => {
    if (!fabricCanvasRef.current) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: selectedTemplate?.colors?.primary || '#4299e1',
    });

    // Apply current editor mode properties
    applyModeToObject(rect, editorMode);

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const handleAddCircle = () => {
    if (!fabricCanvasRef.current) return;

    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: selectedTemplate?.colors?.secondary || '#48bb78',
    });

    // Apply current editor mode properties
    applyModeToObject(circle, editorMode);

    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };

  const handleColorChange = (color) => {
    if (!selectedObject || !fabricCanvasRef.current) return;

    selectedObject.set('fill', color);
    fabricCanvasRef.current.renderAll();
    setObjectProperties({ ...objectProperties, fill: color });
  };

  const handleTextChange = (e) => {
    if (!selectedObject || !fabricCanvasRef.current) return;

    selectedObject.set('text', e.target.value);
    fabricCanvasRef.current.renderAll();
    setObjectProperties({ ...objectProperties, text: e.target.value });
  };

  const handleImageReplace = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedObject || !fabricCanvasRef.current) return;

    // Check if selected object is an image
    if (selectedObject.type !== 'image') {
      alert('Please select an image to replace');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = await Image.fromURL(e.target.result);

        // Copy properties from old image
        img.set({
          left: selectedObject.left,
          top: selectedObject.top,
          scaleX: selectedObject.scaleX,
          scaleY: selectedObject.scaleY,
          angle: selectedObject.angle,
        });

        fabricCanvasRef.current.remove(selectedObject);
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error replacing image:', err);
      alert('Failed to replace image');
    }
  };

  const handleUseBrandLogo = async (logoType = 'primary') => {
    if (!brandData || !selectedObject || !fabricCanvasRef.current) {
      toast.error('Brand logo not available');
      return;
    }

    // Check if selected object is an image
    if (selectedObject.type !== 'image') {
      toast.error('Please select an image layer to replace');
      return;
    }

    // Get the appropriate logo URL
    const logoUrl = logoType === 'icon'
      ? brandData.logoIconUrl
      : brandData.logoUrl;

    if (!logoUrl) {
      toast.error(`${logoType === 'icon' ? 'Icon' : 'Full'} logo not available for your brand`);
      return;
    }

    try {
      toast.loading('Loading brand logo...', { id: 'logo-load' });

      // Load image from brand logo URL
      const img = await Image.fromURL(logoUrl, { crossOrigin: 'anonymous' });

      // Copy position and scale from selected object
      img.set({
        left: selectedObject.left,
        top: selectedObject.top,
        scaleX: selectedObject.scaleX,
        scaleY: selectedObject.scaleY,
        angle: selectedObject.angle,
        name: `Brand Logo (${logoType})`,
        psdMetadata: selectedObject.psdMetadata // Preserve metadata if it exists
      });

      // Replace the image
      fabricCanvasRef.current.remove(selectedObject);
      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.setActiveObject(img);
      fabricCanvasRef.current.renderAll();

      toast.success('Brand logo applied!', { id: 'logo-load' });

      // Update selected object state
      setSelectedObject(img);
    } catch (err) {
      console.error('Error loading brand logo:', err);
      toast.error('Failed to load brand logo. Please try again.', { id: 'logo-load' });
    }
  };

  const handleDelete = () => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
      setObjectProperties({});
    }
  };

  const handleConvertToText = () => {
    if (!selectedObject || !fabricCanvasRef.current || selectedObject.type !== 'image') return;

    // Check if we have text metadata
    if (!selectedObject.psdMetadata || !selectedObject.psdMetadata.isTextLayer) {
      alert('This layer does not contain text information.');
      return;
    }

    const metadata = selectedObject.psdMetadata;

    // Get default text from PSD metadata
    const defaultText = metadata.originalText || selectedObject.name || 'Edit Text';

    // Prompt user for text content
    const textContent = prompt('Enter text for this layer:', defaultText);
    if (textContent === null) return; // User cancelled

    console.log('Converting to text with metadata:', metadata);

    // Calculate the correct font size
    // The fontSize in metadata is the ORIGINAL PSD size
    // We need to scale it by the canvas scale factor
    const canvasScale = selectedObject.scaleX; // This is the scale from PSD loader
    const fontSize = metadata.fontSize * canvasScale;

    console.log('Font size:', metadata.fontSize, '* scale:', canvasScale, '=', fontSize);

    // Create new text object with EXACT styling from PSD
    const text = new IText(textContent || defaultText, {
      left: selectedObject.left,
      top: selectedObject.top,
      fontSize: fontSize,
      fill: metadata.color || '#000000',
      fontFamily: metadata.fontFamily || 'Arial',
      fontWeight: metadata.fontWeight || 'normal',
      fontStyle: metadata.fontStyle || 'normal',
      textAlign: metadata.textAlign || 'left',
      selectable: true,
      editable: true,
      name: selectedObject.name,
      psdMetadata: metadata, // Preserve metadata
    });

    console.log('Created text object:', {
      text: text.text,
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      fill: text.fill,
      fontWeight: text.fontWeight
    });

    // Remove the image and add the text
    fabricCanvasRef.current.remove(selectedObject);
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const handlePSDUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !fabricCanvasRef.current) return;

    if (!file.name.endsWith('.psd')) {
      alert('Please select a PSD file');
      return;
    }

    try {
      setLoading(true);
      // Clear existing canvas
      fabricCanvasRef.current.clear();

      // Load PSD file with current page
      const psdResult = await loadPSDToCanvas(file, fabricCanvasRef.current, currentPage);
      console.log('Uploaded PSD Result:', psdResult);

      // Store if PSD is double-sided
      if (psdResult && psdResult.isDoubleSided !== undefined) {
        setPsdIsDoubleSided(psdResult.isDoubleSided);
        console.log('Uploaded PSD is double-sided:', psdResult.isDoubleSided);

        // Notify parent component about PSD analysis
        if (onPSDAnalysis) {
          onPSDAnalysis(psdResult);
        }
      }

      setPsdLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error('PSD upload error:', err);
      alert('Failed to load PSD file: ' + err.message);
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!fabricCanvasRef.current) return;

    try {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `${selectedTemplate?.name || 'postcard'}-edited.png`;
      link.href = dataURL;
      link.click();

      if (onExport) {
        onExport(dataURL);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export design');
    }
  };

  if (error) {
    return (
      <div className="fabric-editor-error">
        <p>{error}</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className={`fabric-editor-container ${editorMode}-mode`}>
      {loading && (
        <div className="fabric-editor-loading-overlay">
          <p>Loading editor...</p>
        </div>
      )}
      {/* Editor header removed - controls now in ProcessLayout topbar */}

      <div className="editor-workspace">
        <div className={`toolbar ${editorMode}-mode`} style={{ width: sidebarWidth }}>
          {/* Mode Toggle - Hidden for production (using simple mode only) */}
          {/* <ModeToggle mode={editorMode} onModeChange={handleModeToggle} /> */}

          {/* SIMPLE MODE SIDEBAR */}
          {editorMode === 'simple' && (
            <>
              {/* Instructional Banner */}
              <div style={{
                background: 'rgba(32, 178, 170, 0.05)',
                border: '1px solid rgba(32, 178, 170, 0.2)',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#047857',
                lineHeight: '1.5'
              }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Editor Instructions</strong>
                Click on any text, image, or element to edit it.
              </div>

              <CollapsibleSection title="Layers" defaultOpen={true}>
                <div className="layers-list">
                  {layers.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#718096', padding: '8px' }}>No layers yet</p>
                  ) : (
                    layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`layer-item ${selectedObject === layer.object ? 'active' : ''}`}
                        onClick={() => selectLayer(layer.object)}
                      >
                        <span className="layer-name">{layer.name}</span>
                        <span className="layer-type">{layer.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* ADVANCED MODE SIDEBAR - Disabled for production */}
          {/* {editorMode === 'advanced' && (
            <>
              <h3>File</h3>
              <input
                type="file"
                ref={fileInputRef}
                accept=".psd"
                onChange={handlePSDUpload}
                style={{ display: 'none' }}
              />
              <button
                className="tool-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                <span>Upload PSD</span>
              </button>

              <CollapsibleSection title="Layers" defaultOpen={false}>
                <div className="layers-list">
                  {layers.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#718096', padding: '8px' }}>No layers yet</p>
                  ) : (
                    layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`layer-item ${selectedObject === layer.object ? 'active' : ''}`}
                        onClick={() => selectLayer(layer.object)}
                      >
                        <span className="layer-name">{layer.name}</span>
                        <span className="layer-type">{layer.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleSection>

              <h3 style={{ marginTop: '24px' }}>Tools</h3>
              <button
                className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTool('text');
                  handleAddText();
                }}
              >
                <Type size={18} />
                <span>Add Text</span>
              </button>
              <button
                className={`tool-btn ${selectedTool === 'rectangle' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTool('rectangle');
                  handleAddRectangle();
                }}
              >
                <Square size={18} />
                <span>Rectangle</span>
              </button>
              <button
                className={`tool-btn ${selectedTool === 'circle' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTool('circle');
                  handleAddCircle();
                }}
              >
                <CircleIcon size={18} />
                <span>Circle</span>
              </button>
              <button className="tool-btn delete" onClick={handleDelete}>
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </>
          )} */}

          {!selectedObject && (
            <div style={{
              padding: '16px',
              background: '#F7FAFC',
              borderRadius: '6px',
              marginTop: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#2D3748',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Select a Layer
              </p>
              <p style={{
                fontSize: '12px',
                color: '#718096',
                marginBottom: '10px',
                lineHeight: '1.5',
                textAlign: 'left'
              }}>
                Click any element on the canvas to edit:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: '0 0 0 12px',
                fontSize: '12px',
                color: '#4A5568',
                lineHeight: '1.8',
                textAlign: 'left'
              }}>
                <li style={{ marginBottom: '4px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-12px', color: '#20B2AA' }}>•</span>
                  Edit text content
                </li>
                <li style={{ marginBottom: '4px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-12px', color: '#20B2AA' }}>•</span>
                  Change colors
                </li>
                <li style={{ marginBottom: '4px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-12px', color: '#20B2AA' }}>•</span>
                  Replace images
                </li>
              </ul>
            </div>
          )}

          {selectedObject && (
            <CollapsibleSection title="Edit Layer" defaultOpen={true}>
              <div className="properties-panel">
                <p className="property-label">{selectedObject.name || 'Layer'}</p>
                {selectedObject.psdMetadata && (
                  <p style={{
                    fontSize: '11px',
                    color: '#fff',
                    background: '#20B2AA',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {selectedObject.psdMetadata.isTextLayer && 'Text Layer'}
                    {selectedObject.psdMetadata.isShape && 'Shape Layer'}
                    {selectedObject.psdMetadata.isReplaceableImage && 'Image Layer'}
                    {!selectedObject.psdMetadata.isTextLayer && !selectedObject.psdMetadata.isShape && !selectedObject.psdMetadata.isReplaceableImage && 'Layer'}
                  </p>
                )}

                {/* Editable text object (IText or Textbox) */}
                {(selectedObject.type === 'i-text' || selectedObject.type === 'textbox') && (
                  <div className="property-group">
                    <label>Edit Text:</label>
                    <textarea
                      value={objectProperties.text || ''}
                      onChange={handleTextChange}
                      rows={4}
                      placeholder="Enter your text here..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '4px',
                        fontFamily: selectedObject.fontFamily || 'Arial',
                        fontSize: '14px'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                      Double-click text on canvas to edit directly
                    </p>
                  </div>
                )}

                {/* Image layers with metadata-based controls */}
                {selectedObject.type === 'image' && selectedObject.psdMetadata && (
                  <>
                    {/* Text layer rendered as image - show edit button */}
                    {selectedObject.psdMetadata.isTextLayer && (
                      <div className="property-group">
                        <button
                          className="tool-btn"
                          onClick={handleConvertToText}
                          style={{ marginTop: '8px', background: '#20B2AA', color: 'white', borderColor: '#20B2AA' }}
                        >
                          <Type size={18} />
                          <span>Make Text Editable</span>
                        </button>
                        <p style={{ fontSize: '11px', color: '#718096', marginTop: '8px' }}>
                          Text: "{selectedObject.psdMetadata.originalText}"
                        </p>
                      </div>
                    )}

                    {/* Replaceable image layer */}
                    {selectedObject.psdMetadata.isReplaceableImage && (
                      <div className="property-group">
                        {/* Brand Logo Section */}
                        {brandData?.logoUrl && (
                          <>
                            <p style={{ fontSize: '11px', color: '#20B2AA', fontWeight: '600', marginTop: '8px', marginBottom: '8px' }}>
                              Use Your Brand Logo:
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              {brandData.logoUrl && (
                                <button
                                  className="tool-btn"
                                  onClick={() => handleUseBrandLogo('primary')}
                                  style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    background: '#20B2AA',
                                    color: 'white',
                                    borderColor: '#20B2AA',
                                    fontSize: '13px'
                                  }}
                                  title="Use your brand's full logo"
                                >
                                  <span>Full Logo</span>
                                </button>
                              )}
                              {brandData.logoIconUrl && (
                                <button
                                  className="tool-btn"
                                  onClick={() => handleUseBrandLogo('icon')}
                                  style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    background: '#17a097',
                                    color: 'white',
                                    borderColor: '#17a097',
                                    fontSize: '13px'
                                  }}
                                  title="Use your brand's icon logo"
                                >
                                  <span>Icon Only</span>
                                </button>
                              )}
                            </div>
                            <p style={{ fontSize: '10px', color: '#718096', marginBottom: '12px', textAlign: 'center' }}>
                              Or upload custom image:
                            </p>
                          </>
                        )}

                        {/* Upload Custom Image */}
                        <input
                          type="file"
                          ref={imageUploadRef}
                          accept="image/*"
                          onChange={handleImageReplace}
                          style={{ display: 'none' }}
                        />
                        <button
                          className="tool-btn"
                          onClick={() => imageUploadRef.current?.click()}
                          style={{ marginTop: brandData?.logoUrl ? '0' : '8px' }}
                        >
                          <Upload size={18} />
                          <span>Replace Image</span>
                        </button>
                      </div>
                    )}

                    {/* Shape layer - show color options */}
                    {selectedObject.psdMetadata.isShape && (
                      <div className="property-group">
                        <p style={{ fontSize: '12px', color: '#4a5568', marginBottom: '8px' }}>
                          This is a shape. Colors are part of the original design.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Fallback for image without metadata */}
                {selectedObject.type === 'image' && !selectedObject.psdMetadata && (
                  <div className="property-group">
                    {/* Brand Logo Section */}
                    {brandData?.logoUrl && (
                      <>
                        <p style={{ fontSize: '11px', color: '#20B2AA', fontWeight: '600', marginTop: '8px', marginBottom: '8px' }}>
                          Use Your Brand Logo:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          {brandData.logoUrl && (
                            <button
                              className="tool-btn"
                              onClick={() => handleUseBrandLogo('primary')}
                              style={{
                                flex: 1,
                                padding: '10px 8px',
                                background: '#20B2AA',
                                color: 'white',
                                borderColor: '#20B2AA',
                                fontSize: '13px'
                              }}
                              title="Use your brand's full logo"
                            >
                              <span>Full Logo</span>
                            </button>
                          )}
                          {brandData.logoIconUrl && (
                            <button
                              className="tool-btn"
                              onClick={() => handleUseBrandLogo('icon')}
                              style={{
                                flex: 1,
                                padding: '10px 8px',
                                background: '#17a097',
                                color: 'white',
                                borderColor: '#17a097',
                                fontSize: '13px'
                              }}
                              title="Use your brand's icon logo"
                            >
                              <span>Icon Only</span>
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '10px', color: '#718096', marginBottom: '12px', textAlign: 'center' }}>
                          Or upload custom image:
                        </p>
                      </>
                    )}

                    {/* Upload Custom Image */}
                    <input
                      type="file"
                      ref={imageUploadRef}
                      accept="image/*"
                      onChange={handleImageReplace}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="tool-btn"
                      onClick={() => imageUploadRef.current?.click()}
                      style={{ marginTop: brandData?.logoUrl ? '0' : '8px' }}
                    >
                      <Upload size={18} />
                      <span>Replace Image</span>
                    </button>
                  </div>
                )}

                {(selectedObject.type === 'i-text' || selectedObject.type === 'textbox' || selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
                  <div className="property-group">
                    <label>Color:</label>

                    {/* Your Brand Colors from Brandfetch */}
                    {brandData?.colorPalette && brandData.colorPalette.length > 0 && (
                      <>
                        <p style={{ fontSize: '11px', color: '#20B2AA', fontWeight: '600', marginTop: '8px', marginBottom: '4px' }}>
                          Your Brand Colors {brandData.name && `(${brandData.name})`}:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          {brandData.colorPalette.slice(0, 8).map((colorObj, index) => {
                            const hexColor = colorObj.hex || colorObj;
                            return (
                              <div
                                key={index}
                                onClick={() => handleColorChange(hexColor)}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  backgroundColor: hexColor,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  border: objectProperties.fill === hexColor
                                    ? '3px solid #20B2AA'
                                    : '2px solid #E5E7EB',
                                  position: 'relative'
                                }}
                                title={`${colorObj.type || 'Brand'} - ${hexColor}`}
                              />
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Primary and Secondary Brand Colors (if available) */}
                    {(brandData?.primaryColor || brandData?.secondaryColor) && (
                      <>
                        <p style={{ fontSize: '11px', color: '#20B2AA', fontWeight: '600', marginBottom: '4px' }}>
                          Primary Brand Colors:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          {brandData.primaryColor && (
                            <div
                              onClick={() => handleColorChange(brandData.primaryColor)}
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: brandData.primaryColor,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: objectProperties.fill === brandData.primaryColor
                                  ? '3px solid #20B2AA'
                                  : '2px solid #E5E7EB'
                              }}
                              title="Primary Brand Color"
                            />
                          )}
                          {brandData.secondaryColor && (
                            <div
                              onClick={() => handleColorChange(brandData.secondaryColor)}
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: brandData.secondaryColor,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: objectProperties.fill === brandData.secondaryColor
                                  ? '3px solid #20B2AA'
                                  : '2px solid #E5E7EB'
                              }}
                              title="Secondary Brand Color"
                            />
                          )}
                        </div>
                      </>
                    )}

                    {/* Template Colors */}
                    {selectedTemplate?.colors && Object.keys(selectedTemplate.colors).length > 0 && (
                      <>
                        <p style={{ fontSize: '11px', color: '#718096', marginTop: '8px', marginBottom: '4px' }}>
                          Brand Colors:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          {Object.entries(selectedTemplate.colors).map(([key, color]) => (
                            <div
                              key={key}
                              onClick={() => handleColorChange(color)}
                              style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: color,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: objectProperties.fill === color ? '3px solid #20B2AA' : '2px solid #E5E7EB',
                                position: 'relative'
                              }}
                              title={key}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Common Colors */}
                    <p style={{ fontSize: '11px', color: '#718096', marginBottom: '4px' }}>
                      Common Colors:
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'].map(color => (
                        <div
                          key={color}
                          onClick={() => handleColorChange(color)}
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: color,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: objectProperties.fill === color ? '3px solid #20B2AA' : '2px solid #E5E7EB'
                          }}
                        />
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <p style={{ fontSize: '11px', color: '#718096', marginBottom: '4px' }}>
                      Custom Color:
                    </p>
                    <input
                      type="color"
                      value={objectProperties.fill || '#000000'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Resize handle */}
        <div className="resize-handle" {...resizeHandleProps}></div>

        <div className="canvas-container">
          <canvas ref={canvasRef} id="fabric-canvas"></canvas>
        </div>
      </div>
    </div>
  );
});

FabricEditor.displayName = 'FabricEditor';

export default FabricEditor;
