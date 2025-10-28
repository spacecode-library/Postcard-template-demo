import React, { useState, useRef, useEffect } from 'react';
import { SimpleEditorProvider } from './SimpleEditorProvider';
import { AdvancedEditorProvider } from './AdvancedEditorProvider';
import { PSDLoader } from './PSDLoader';
import supabaseCompanyService from '../../supabase/api/companyService';
import cloudinaryService from '../../services/cloudinaryService';
import campaignService from '../../supabase/api/campaignService';
import toast from 'react-hot-toast';
import './PostcardEditor.professional.css';


// Postcard dimensions (industry standard)
const POSTCARD_WIDTH_PX = 1500; // 5" at 300 DPI
const POSTCARD_HEIGHT_PX = 2100; // 7" at 300 DPI  
const DPI = 300;

const PostcardEditorNew = ({ selectedTemplate, onBack, onSave, campaignId }) => {
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [currentSide, setCurrentSide] = useState('front');
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [companyBrandData, setCompanyBrandData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const simpleContainerRef = useRef(null);
  const advancedContainerRef = useRef(null);
  const currentEditorInstance = useRef(null);

  // Load company brand data from Supabase on mount
  useEffect(() => {
    async function loadBrandData() {
      try {
        const company = await supabaseCompanyService.getCompanyInfo();
        if (company) {
          console.log('[BRAND DATA] Loaded brand data for editor:', company.name);
          console.log('[BRAND DATA] Raw company data from Supabase:', {
            primary_color: company.primary_color,
            secondary_color: company.secondary_color,
            color_palette: company.color_palette
          });

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

          const brandData = {
            name: company.name,
            logo: company.logo_url,
            logoIcon: company.logo_icon_url,
            colors: {
              primary: company.primary_color || null,
              secondary: company.secondary_color || null,
              palette: Array.isArray(colorPalette) ? colorPalette : []
            },
            fonts: company.fonts
          };
          setCompanyBrandData(brandData);

          // Make brand data globally available for editor plugins
          window.brandColors = brandData.colors;
          window.brandName = brandData.name;
          window.brandLogo = brandData.logo;

          console.log('[BRAND COLORS] Brand colors loaded:', brandData.colors);
          console.log('[BRAND COLORS] Primary color type:', typeof brandData.colors.primary, 'Value:', brandData.colors.primary);
          console.log('[BRAND COLORS] Secondary color type:', typeof brandData.colors.secondary, 'Value:', brandData.colors.secondary);
        }
      } catch (error) {
        console.warn('Could not load brand data:', error);
        // Continue without brand data - editor will use template defaults
      }
    }
    loadBrandData();
  }, []);

  // Configuration for Simple Editor
  const simpleConfig = {
    role: 'Creator',
    theme: 'light'
  };

  // Configuration for Advanced Editor
  const advancedConfig = {
    role: 'Creator',
    theme: 'light',
    ui: {
      elements: {
        dock: {
          show: true
        },
        navigation: {
          action: {
            export: {
              show: true,
              format: ['image/png', 'application/pdf']
            }
          }
        }
      }
    }
  };

  // Configure simple editor
  const configureSimpleEditor = async (instance) => {
    try {
      // Add a small delay to ensure the engine is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (selectedTemplate) {
        await loadTemplateToEditor(instance, selectedTemplate);
      }
    } catch (error) {
      console.error('Failed to configure simple editor:', error);
      setError(error.message);
    }
  };

  // Configure advanced editor
  const configureAdvancedEditor = async (instance) => {
    try {
      // Add a small delay to ensure the engine is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (selectedTemplate) {
        await loadTemplateToEditor(instance, selectedTemplate);
      }
    } catch (error) {
      console.error('Failed to configure advanced editor:', error);
      setError(error.message);
    }
  };


  // Load template into editor (both simple and advanced)
  const loadTemplateToEditor = async (instance, template) => {
    try {
      // Validate the engine instance
      if (!instance || !instance.engine || !instance.engine.scene || !instance.engine.block) {
        throw new Error('Editor instance is not properly initialized');
      }

      // Test engine validity
      instance.engine.scene.get();

      // Check if this is a saved scene file from Cloudinary (for editing existing campaigns)
      if (template.psdPath && (template.psdPath.includes('cloudinary') || template.psdPath.endsWith('.scene'))) {
        console.log('[Editor] Loading saved scene from Cloudinary:', template.psdPath);
        setLoadingProgress({
          stage: 'fetching',
          message: 'Loading your saved design...',
          progress: 0
        });

        try {
          // Fetch the scene file from Cloudinary
          const response = await fetch(template.psdPath);
          if (!response.ok) {
            throw new Error('Failed to fetch scene file from Cloudinary');
          }

          setLoadingProgress({
            stage: 'processing',
            message: 'Restoring your design...',
            progress: 50
          });

          const sceneString = await response.text();

          // Load the scene into the editor
          await instance.engine.scene.loadFromString(sceneString);

          setLoadingProgress({
            stage: 'complete',
            message: 'Design loaded successfully!',
            progress: 100
          });

          console.log('[Editor] Scene loaded successfully from Cloudinary');

          // Clear loading progress after a short delay
          setTimeout(() => {
            setLoadingProgress(null);
          }, 500);

          return { success: true, isDoubleSided: instance.engine.scene.getPages().length > 1 };

        } catch (error) {
          console.error('[Editor] Error loading scene from Cloudinary:', error);
          setLoadingProgress(null);
          throw new Error(`Failed to load saved design: ${error.message}`);
        }
      }

      if (template.psdFile) {
        // Show file size warning for large files
        if (template.largeFileWarning && template.psdFileSize) {
          const sizeMB = (template.psdFileSize / 1024 / 1024).toFixed(1);
          setLoadingProgress({
            stage: 'warning',
            message: `Loading ${sizeMB}MB PSD file. This may take a moment...`,
            progress: 0
          });
        }
        
        // Load PSD template
        const psdPath = `/PSD-files/${template.psdFile}`;
        const result = await PSDLoader.loadPSDToScene(
          instance.engine,
          psdPath,
          (progress) => setLoadingProgress(progress),
          {
            ...template,
            brandColors: companyBrandData?.colors,
            brandName: companyBrandData?.name
          }
        );
        
        // Clear loading progress on completion
        if (result.success) {
          setLoadingProgress(null);
          setIsDoubleSided(result.isDoubleSided || false);
          currentEditorInstance.current = instance;

          // Zoom to fit and center the postcard (with retry logic)
          const attemptZoom = (retries = 3, delay = 200) => {
            setTimeout(() => {
              try {
                if (instance?.engine) {
                  const currentPage = instance.engine.scene.getCurrentPage();
                  instance.engine.scene.zoomToBlock(
                    currentPage,
                    40, 40, 40, 40 // padding top, right, bottom, left
                  );
                  console.log('[SUCCESS] Zoomed to fit postcard');
                }
              } catch (error) {
                if (retries > 0 && error.message && error.message.includes("hasn't been layouted yet")) {
                  console.log(`[RETRY] Block not ready, retrying zoom (${retries} attempts left)...`);
                  attemptZoom(retries - 1, delay + 100);
                } else {
                  console.warn('Could not zoom to fit:', error.message || error);
                }
              }
            }, delay);
          };

          attemptZoom();

          // Refresh Simple Editor content after PSD loading (ONLY if in simple mode)
          if (isSimpleMode && window.simpleEditorPluginAPI && window.simpleEditorPluginAPI.refreshContent) {
            console.log('🔄 Triggering Simple Editor content refresh...');
            setTimeout(() => {
              window.simpleEditorPluginAPI.refreshContent();
            }, 300); // Small delay to ensure PSD processing is complete
          }
        }
        
        if (!result.success) {
          setLoadingProgress(null);
          throw new Error(result.error || 'Failed to load PSD');
        }
      } else {
        // Create template from scratch
        const result = await createTemplateInEditor(instance, template);
        setIsDoubleSided(template.sides === 2);
        currentEditorInstance.current = instance;
      }
    } catch (error) {
      setLoadingProgress(null);
      throw error;
    }
  };


  // Create template from scratch in editor
  const createTemplateInEditor = async (instance, template) => {
    let scene = instance.engine.scene.get();
    if (!scene) {
      scene = instance.engine.scene.create();
    }
    
    const isDoubleSided = template.sides === 2;
    const pagesToCreate = isDoubleSided ? 2 : 1;
    
    for (let i = 0; i < pagesToCreate; i++) {
      // Create page
      const page = instance.engine.block.create('page');
      instance.engine.block.setWidth(page, POSTCARD_WIDTH_PX / DPI);
      instance.engine.block.setHeight(page, POSTCARD_HEIGHT_PX / DPI);
      instance.engine.block.appendChild(scene, page);

      // Set background color - use brand colors if available
      let backgroundColor = companyBrandData?.colors?.primary || template.primaryColor;
      if (isDoubleSided && i === 1) {
        // Use secondary color for back side
        backgroundColor = companyBrandData?.colors?.secondary || template.colors?.secondary || template.primaryColor;
      }
      
      if (backgroundColor && backgroundColor !== '#undefined') {
        try {
          const hex = backgroundColor.replace(/^#/, '').trim();
          if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;

            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
              instance.engine.block.setFillSolidColor(page, { r, g, b, a: 1 });
            }
          }
        } catch (error) {
          console.warn('Failed to set background color:', error);
        }
      }

      // Add content based on side
      if (i === 0) {
        // Front side content
        const titleText = instance.engine.block.create('text');
        instance.engine.block.setString(titleText, 'text/text', template.name || 'Your Business Name');
        instance.engine.block.setPositionX(titleText, 0.5);
        instance.engine.block.setPositionY(titleText, 1);
        instance.engine.block.setWidth(titleText, 4);
        instance.engine.block.setHeight(titleText, 0.8);
        instance.engine.block.appendChild(page, titleText);
        
        // Add subtitle
        const subtitleText = instance.engine.block.create('text');
        instance.engine.block.setString(subtitleText, 'text/text', 'Professional Services');
        instance.engine.block.setPositionX(subtitleText, 0.5);
        instance.engine.block.setPositionY(subtitleText, 2);
        instance.engine.block.setWidth(subtitleText, 3.5);
        instance.engine.block.setHeight(subtitleText, 0.6);
        instance.engine.block.appendChild(page, subtitleText);
      } else {
        // Back side content  
        const backTitle = instance.engine.block.create('text');
        instance.engine.block.setString(backTitle, 'text/text', 'Contact Information');
        instance.engine.block.setPositionX(backTitle, 0.5);
        instance.engine.block.setPositionY(backTitle, 1);
        instance.engine.block.setWidth(backTitle, 4);
        instance.engine.block.setHeight(backTitle, 0.8);
        instance.engine.block.appendChild(page, backTitle);
        
        // Add contact details
        const contactText = instance.engine.block.create('text');
        instance.engine.block.setString(contactText, 'text/text', 'Phone: (555) 123-4567\nEmail: info@business.com\nWebsite: www.business.com');
        instance.engine.block.setPositionX(contactText, 0.5);
        instance.engine.block.setPositionY(contactText, 2.5);
        instance.engine.block.setWidth(contactText, 4);
        instance.engine.block.setHeight(contactText, 2);
        instance.engine.block.appendChild(page, contactText);
      }
      
      // For double-sided templates, hide the back page initially
      if (isDoubleSided && i === 1) {
        instance.engine.block.setVisible(page, false);
      }
    }
    
    return { success: true, isDoubleSided };
  };

  const handleModeToggle = () => {
    setIsSimpleMode(!isSimpleMode);
  };

  const handleSideSwitch = async (side) => {
    if (!currentEditorInstance.current || !selectedTemplate || currentSide === side) {
      return;
    }
    
    try {
      console.log(`Switching to ${side} side...`);
      const result = await PSDLoader.switchToSide(
        currentEditorInstance.current.engine,
        selectedTemplate,
        side
      );
      
      if (result.success) {
        setCurrentSide(side);
        console.log(`Successfully switched to ${side} side`);
      } else {
        console.error('Failed to switch sides:', result.error);
        setError(`Failed to switch to ${side} side: ${result.error}`);
      }
    } catch (error) {
      console.error('Error switching sides:', error);
      setError(`Error switching to ${side} side: ${error.message}`);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentSide('front');
    setIsDoubleSided(false);
    currentEditorInstance.current = null;
    if (onBack) {
      onBack();
    }
  };

  /**
   * Export and save postcard design
   * Exports scene file and PNG preview to Cloudinary
   */
  const handleSaveDesign = async () => {
    if (!currentEditorInstance.current) {
      toast.error('Editor not ready. Please try again.');
      return;
    }

    if (!campaignId) {
      toast.error('No campaign ID provided.');
      return;
    }

    setIsSaving(true);
    const saveToast = toast.loading('Saving your design...');

    try {
      const instance = currentEditorInstance.current;

      // Ensure all pending operations are complete before export
      console.log('[Save] Waiting for pending operations...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // 1. Export scene as .scene file (PSD equivalent)
      console.log('[Save] Exporting scene...');
      const sceneString = await instance.engine.scene.saveToString();
      const sceneBlob = new Blob([sceneString], { type: 'application/json' });
      console.log('[Save] Scene exported, size:', (sceneBlob.size / 1024).toFixed(2), 'KB');

      // 2. Export PNG preview with full postcard dimensions
      console.log('[Save] Exporting PNG preview...');
      const pages = instance.engine.scene.getPages();
      const frontPage = pages[0]; // Export front page as preview

      // Get the actual page dimensions from the scene
      const pageWidth = instance.engine.block.getWidth(frontPage);
      const pageHeight = instance.engine.block.getHeight(frontPage);

      console.log('[Save] Page dimensions:', pageWidth, 'x', pageHeight);
      console.log('[Save] Exporting page ID:', frontPage);

      // Export at high resolution (2x) to maintain quality
      const pngBlob = await instance.engine.block.export(frontPage, 'image/png', {
        targetWidth: Math.round(pageWidth * 2),
        targetHeight: Math.round(pageHeight * 2),
        jpegQuality: 0.95
      });
      console.log('[Save] PNG exported, size:', (pngBlob.size / 1024).toFixed(2), 'KB');

      // 3. Upload to Cloudinary
      console.log('[Save] Uploading to Cloudinary...');
      toast.loading('Uploading to cloud storage...', { id: saveToast });

      const uploadResult = await cloudinaryService.uploadCampaignAssets(
        sceneBlob,
        pngBlob,
        campaignId
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload files');
      }

      console.log('[Save] Files uploaded successfully');
      console.log('[Save] Design URL:', uploadResult.designUrl);
      console.log('[Save] Preview URL:', uploadResult.previewUrl);

      // 4. Save URLs to campaign database
      toast.loading('Updating campaign...', { id: saveToast });

      const updateResult = await campaignService.saveCampaignDesign(
        campaignId,
        uploadResult.designUrl,
        uploadResult.previewUrl
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update campaign');
      }

      toast.success('Design saved successfully!', { id: saveToast });
      console.log('[Save] Campaign updated successfully');

      // 5. Callback to parent if provided
      if (onSave) {
        onSave({
          designUrl: uploadResult.designUrl,
          previewUrl: uploadResult.previewUrl
        });
      }

    } catch (error) {
      console.error('[Save] Error saving design:', error);
      toast.error(error.message || 'Failed to save design', { id: saveToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedTemplate) {
    return null; // Template selection will be handled by parent component
  }

  return (
    <div className="postcard-editor-professional">
      <div className="editor-header-professional">
        <button className="back-btn" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
          Back
        </button>
        
        <div className="editor-title-section">
          <h1>Postcard Editor</h1>
          <span className="template-name">{selectedTemplate.name}</span>
        </div>

        <div className="header-actions">
          {isDoubleSided && (
            <div className="side-toggle">
              <button
                className={`side-btn ${currentSide === 'front' ? 'active' : ''}`}
                onClick={() => handleSideSwitch('front')}
                disabled={currentSide === 'front'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                Front
              </button>
              <button
                className={`side-btn ${currentSide === 'back' ? 'active' : ''}`}
                onClick={() => handleSideSwitch('back')}
                disabled={currentSide === 'back'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M8 2v4"/>
                  <path d="M16 2v4"/>
                  <rect x="3" y="4" width="18" height="2"/>
                </svg>
                Back
              </button>
            </div>
          )}

          <div className="mode-toggle">
            <button
              className={`mode-btn ${isSimpleMode ? 'active' : ''}`}
              onClick={() => setIsSimpleMode(true)}
            >
              Simple
            </button>
            <button
              className={`mode-btn ${!isSimpleMode ? 'active' : ''}`}
              onClick={() => setIsSimpleMode(false)}
            >
              Advanced
            </button>
          </div>

          <button
            className="save-design-btn"
            onClick={handleSaveDesign}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Design
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="editor-content-professional">
        {isSimpleMode ? (
          <div 
            ref={simpleContainerRef}
            className="cesdk-container-professional simple-mode"
            style={{ width: '100%', height: '100%' }}
          >
            <SimpleEditorProvider
              config={simpleConfig}
              configure={configureSimpleEditor}
              containerRef={simpleContainerRef}
              LoadingComponent={<div className="loading-overlay professional"><div className="spinner"></div><p>Loading Simple Editor...</p></div>}
            />
          </div>
        ) : (
          <div 
            ref={advancedContainerRef}
            className="cesdk-container-professional advanced-mode"
            style={{ width: '100%', height: '100%' }}
          >
            <AdvancedEditorProvider
              config={advancedConfig}
              configure={configureAdvancedEditor}
              containerRef={advancedContainerRef}
              LoadingComponent={<div className="loading-overlay professional"><div className="spinner"></div><p>Loading Advanced Editor...</p></div>}
            />
          </div>
        )}
        
        {error && (
          <div className="error-overlay professional">
            <div className="error-box">
              <div className="error-icon" style={{ fontSize: '48px', color: '#F56565' }}>!</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button className="btn-secondary" onClick={handleBack}>
                  Choose Another Template
                </button>
              </div>
            </div>
          </div>
        )}
        
        {loadingProgress && (
          <div className="loading-progress-overlay">
            <div className="loading-progress-box">
              <h3>Loading Template</h3>
              <p className="progress-message">{loadingProgress.message}</p>
              
              {loadingProgress.progress !== undefined && (
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${loadingProgress.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{loadingProgress.progress}%</span>
                </div>
              )}
              
              {loadingProgress.stage === 'warning' && (
                <div className="warning-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 20h20L12 2zm0 3.5l7.5 13H4.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                  </svg>
                  <span>Large file detected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostcardEditorNew;