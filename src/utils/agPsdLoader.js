import { readPsd } from 'ag-psd';
import { IText, Textbox, FabricImage as Image } from 'fabric';

/**
 * Load a PSD file using ag-psd and convert it to Fabric.js layers
 * This implementation creates truly editable text layers from the start
 * @param {File|string} psdSource - PSD file object or URL
 * @param {fabric.Canvas} canvas - Fabric canvas instance
 * @param {string} currentPage - Which page to load ('front' or 'back'). Default: 'front'
 * @returns {Promise<Object>} Returns { isDoubleSided: boolean, currentPage: string }
 */
export async function loadPSDToCanvas(psdSource, canvas, currentPage = 'front') {
  console.log('=== AG-PSD LOADER STARTING ===');
  console.log('Source:', psdSource);
  console.log('Canvas:', canvas);
  console.log('Current Page:', currentPage);

  try {
    let arrayBuffer;

    // Load PSD from file or URL
    if (psdSource instanceof File) {
      console.log('Loading PSD from File object...');
      arrayBuffer = await psdSource.arrayBuffer();
      console.log('File loaded, size:', arrayBuffer.byteLength, 'bytes');
    } else if (typeof psdSource === 'string') {
      console.log('Fetching PSD from URL:', psdSource);
      const response = await fetch(psdSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch PSD: ${response.status} ${response.statusText}`);
      }
      arrayBuffer = await response.arrayBuffer();
      console.log('PSD fetched, size:', arrayBuffer.byteLength, 'bytes');
    } else {
      throw new Error('Invalid PSD source - must be File or string URL');
    }

    // Parse the PSD file using ag-psd - IMPORTANT: include readImageData option
    console.log('Parsing PSD with ag-psd...');
    const psd = readPsd(arrayBuffer, {
      readImageData: true,  // This ensures layer canvas data is loaded
      useImageData: true,   // Use ImageData for better performance
      skipCompositeImageData: false
    });

    if (!psd) {
      throw new Error('Failed to parse PSD - readPsd returned null/undefined');
    }

    const psdWidth = psd.width;
    const psdHeight = psd.height;

    // Extract document DPI/resolution for proper font size conversion
    // ag-psd stores fontSize in POINTS (1/72"), need DPI to convert to pixels
    const dpi = psd.resolutionInfo?.horizontalResolution || 72;
    const dpiUnit = psd.resolutionInfo?.resolutionUnits || 'PixelsPerInch';

    console.log('✅ PSD parsed successfully!');
    console.log('  Dimensions:', psdWidth, 'x', psdHeight);
    console.log('  Resolution:', dpi, dpiUnit);
    console.log('  Layers:', psd.children?.length || 0);
    console.log('  Full PSD object:', psd);

    // Calculate scale to fit a reasonable size (max 1000px width)
    const maxWidth = 1000;
    const maxHeight = 800;
    const scale = Math.min(maxWidth / psdWidth, maxHeight / psdHeight, 1);
    const scaledWidth = Math.round(psdWidth * scale);
    const scaledHeight = Math.round(psdHeight * scale);

    console.log('Scaling PSD by', scale);
    console.log('Canvas will be:', scaledWidth, 'x', scaledHeight);

    // Set canvas to match scaled PSD dimensions
    // CRITICAL: Only resize if canvas is fully initialized
    try {
      // Check if canvas elements are ready - wait up to 500ms
      let attempts = 0;
      while (!canvas.lowerCanvasEl && attempts < 5) {
        console.warn(`⚠️ Lower canvas not ready, waiting... (attempt ${attempts + 1}/5)`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Verify after waiting
      if (!canvas.lowerCanvasEl) {
        console.error('❌ Canvas elements not initialized after 500ms');
        console.error('  This likely means React StrictMode caused a double-mount');
        console.error('  If another instance loads successfully, this error can be ignored');
        throw new Error('Canvas elements not initialized - cannot resize');
      }

      // Use setDimensions for Fabric.js v6
      canvas.setDimensions({
        width: scaledWidth,
        height: scaledHeight
      });

      console.log('✅ Canvas resized to:', scaledWidth, 'x', scaledHeight);
      console.log('  Canvas.getWidth():', canvas.getWidth());
      console.log('  Canvas.getHeight():', canvas.getHeight());

      // Log the actual HTML canvas elements
      const canvasEl = canvas.lowerCanvasEl;
      console.log('  HTML canvas element width:', canvasEl?.width, 'height:', canvasEl?.height);
      console.log('  HTML canvas style width:', canvasEl?.style?.width, 'height:', canvasEl?.style?.height);

      // Check viewport transform
      console.log('  Viewport transform:', canvas.viewportTransform);
      console.log('  Zoom:', canvas.getZoom());
    } catch (err) {
      console.error('❌ Could not resize canvas:', err.message);
      // Don't throw - just log and continue with default size
      // This allows one successful load even if React StrictMode causes failures
      console.warn('⚠️ Continuing with default canvas size - objects may not fit correctly');
    }

    // Set white background (don't clear - it's already cleared in FabricEditor)
    canvas.backgroundColor = '#ffffff';

    // Analyze PSD structure to detect front/back pages
    const pageAnalysis = analyzePSDPages(psd);
    console.log('Page Analysis:', pageAnalysis);

    // Determine which layers to process based on current page
    let layersToProcess = [];

    if (pageAnalysis.isDoubleSided) {
      // Double-sided PSD: load only the selected page
      console.log(`Loading ${currentPage} page (double-sided PSD)`);

      if (currentPage === 'front') {
        layersToProcess = pageAnalysis.frontLayers;
      } else if (currentPage === 'back') {
        layersToProcess = pageAnalysis.backLayers;
      }

      // If the selected page has no layers, show a warning
      if (layersToProcess.length === 0) {
        console.warn(`No layers found for ${currentPage} page!`);
      }
    } else {
      // Single-sided PSD: load all layers
      console.log('Loading all layers (single-sided PSD)');
      layersToProcess = psd.children || [];
    }

    console.log('Found', layersToProcess.length, 'layers to process');

    // Process layers FORWARD (first to last)
    // ag-psd orders layers BOTTOM-to-TOP (index 0 = bottom/background layer)
    // Fabric.js renders objects added FIRST behind objects added LAST
    // So we process forward: background layers first, foreground layers last
    console.log('Processing layers (background to foreground)...');
    for (let i = 0; i < layersToProcess.length; i++) {
      await processLayerRecursive(layersToProcess[i], canvas, scale, dpi);
    }

    // Get all objects for inspection
    const objects = canvas.getObjects();
    console.log('✅ PSD LOADED SUCCESSFULLY!');
    console.log('  Total objects on canvas:', objects.length);
    console.log('  Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());

    // Log each object's details - VERBOSE for debugging
    console.log('=== OBJECT DETAILS ===');
    objects.forEach((obj, idx) => {
      const details = {
        name: obj.name,
        type: obj.type,
        left: Math.round(obj.left || 0),
        top: Math.round(obj.top || 0),
        width: Math.round(obj.width || 0),
        height: Math.round(obj.height || 0),
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        opacity: obj.opacity,
        visible: obj.visible !== false,
        fill: obj.fill,
        text: obj.text?.substring(0, 20) || ''
      };
      console.log(`Object ${idx}: ${details.name} (${details.type}) at (${details.left},${details.top}) size ${details.width}x${details.height} opacity=${details.opacity}`);
    });
    console.log('=== END OBJECT DETAILS ===');

    // Force render multiple times to ensure everything shows up
    console.log('Forcing canvas renders...');
    canvas.renderAll();
    canvas.requestRenderAll();

    // Force another render on next frame
    setTimeout(() => {
      console.log('Second render pass...');
      canvas.renderAll();
      canvas.requestRenderAll();
    }, 0);

    // And one more after a short delay
    setTimeout(() => {
      console.log('Third render pass...');
      canvas.renderAll();
      canvas.requestRenderAll();

      // Final check
      console.log('Final canvas state:');
      console.log('  Lower canvas exists:', !!canvas.lowerCanvasEl);
      console.log('  Upper canvas exists:', !!canvas.upperCanvasEl);
      console.log('  Lower canvas size:', canvas.lowerCanvasEl?.width, 'x', canvas.lowerCanvasEl?.height);
      console.log('  Context type:', canvas.contextContainer?.constructor?.name);

      // Check if any objects are outside viewport
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const outsideObjects = canvas.getObjects().filter(obj => {
        return obj.left < 0 || obj.top < 0 ||
               obj.left > canvasWidth || obj.top > canvasHeight;
      });
      if (outsideObjects.length > 0) {
        console.warn('⚠️ WARNING: Some objects are positioned outside the canvas:');
        outsideObjects.forEach(obj => {
          console.warn(`  - ${obj.name}: (${Math.round(obj.left)}, ${Math.round(obj.top)}) canvas is ${canvasWidth}x${canvasHeight}`);
        });
      } else {
        console.log('✅ All objects are within canvas bounds');
      }
    }, 100);

    // Return page analysis information
    return {
      isDoubleSided: pageAnalysis.isDoubleSided,
      currentPage: currentPage,
      totalLayers: (psd.children || []).length,
      processedLayers: layersToProcess.length
    };
  } catch (error) {
    console.error('❌ ERROR LOADING PSD:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Recursively process a PSD layer and its children
 * @param {Object} layer - ag-psd layer object
 * @param {fabric.Canvas} canvas - Fabric canvas instance
 * @param {number} scale - Scale factor to apply to all layers
 * @param {number} dpi - Document DPI for point-to-pixel conversion
 */
async function processLayerRecursive(layer, canvas, scale = 1, dpi = 72) {
  // Skip hidden layers
  if (layer.hidden) {
    console.log('Skipping hidden layer:', layer.name);
    return;
  }

  // If this layer has children, it's a group - process children recursively
  if (layer.children && layer.children.length > 0) {
    console.log('Processing group:', layer.name);
    // Process children FORWARD (same logic as top-level layers)
    for (let i = 0; i < layer.children.length; i++) {
      await processLayerRecursive(layer.children[i], canvas, scale, dpi);
    }
    return;
  }

  // Process actual content layer
  console.log('Processing layer:', layer.name, {
    hasText: !!layer.text,
    hasCanvas: !!layer.canvas,
    hasImageData: !!layer.imageData,
    opacity: layer.opacity,
    bounds: { left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom }
  });

  // Check if this is a TEXT layer - ag-psd makes this easy!
  if (layer.text) {
    await processTextLayer(layer, canvas, scale, dpi);
  } else if (layer.canvas || layer.imageData) {
    // This is a raster layer with pixel data
    await processRasterLayer(layer, canvas, scale);
  } else {
    console.log('⚠️ Skipping layer without renderable content:', layer.name);
  }
}

/**
 * Process a text layer and create an editable IText object
 * @param {Object} layer - ag-psd text layer
 * @param {fabric.Canvas} canvas - Fabric canvas instance
 * @param {number} scale - Scale factor
 * @param {number} dpi - Document DPI for point-to-pixel conversion
 */
async function processTextLayer(layer, canvas, scale, dpi = 72) {
  try {
    const textData = layer.text;
    const textContent = textData.text || '';

    console.log('✓ TEXT LAYER detected:', layer.name);
    console.log('  Text content:', textContent);
    console.log('  Full text data:', textData);
    console.log('  Layer bounds:', { left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom });

    // Extract text styling - handle both style and styleRun arrays
    let style = textData.style || {};

    // If there are styleRuns, use the first one for primary styling
    if (textData.styleRuns && textData.styleRuns.length > 0) {
      style = { ...style, ...textData.styleRuns[0].style };
    }

    // Extract font properties
    const fontFamily = style.font?.name || style.fontName || 'Arial';

    // CRITICAL FIX: ag-psd stores text in two different ways:
    // - Point text: Small base fontSize (4.32px) × large transform scale (15.4x) = actual size (66px)
    // - Box/paragraph text: Full fontSize (66.66px) × transform scale (1.0) = actual size (66px)
    // We MUST apply the transform matrix Y-scale to get the correct final fontSize
    let fontSizeFromPSD = style.fontSize || 16;

    // Apply transform matrix scaling (Y-scale from transform[3])
    // This is essential for point text which stores small base size with large scale
    if (textData.transform && textData.transform.length >= 4) {
      const transformYScale = textData.transform[3] || 1;
      fontSizeFromPSD = fontSizeFromPSD * transformYScale;
    }

    // OPTIONALLY: Apply character scaling if Photoshop style has it
    // (different from transform matrix - this is actual text character stretching)
    if (style.verticalScale && style.verticalScale !== 1) {
      fontSizeFromPSD = fontSizeFromPSD * style.verticalScale;
    }

    const fontSize = fontSizeFromPSD * scale;

    // Extract font weight and style
    let fontWeight = 'normal';
    if (style.syntheticBold || style.fontWeight === 'bold' || (style.font?.name && style.font.name.toLowerCase().includes('bold'))) {
      fontWeight = 'bold';
    }

    let fontStyle = 'normal';
    if (style.syntheticItalic || style.fontStyle === 'italic' || (style.font?.name && style.font.name.toLowerCase().includes('italic'))) {
      fontStyle = 'italic';
    }

    // Convert RGB color to hex
    let fillColor = '#000000';
    if (style.fillColor) {
      const { r, g, b } = style.fillColor;
      fillColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    // Extract position - prefer layer bounds over transform matrix
    // Layer bounds are more reliable for positioning
    let left = (layer.left || 0) * scale;
    let top = (layer.top || 0) * scale;

    // Only use transform matrix if layer bounds are zero/undefined
    if (textData.transform && (!layer.left && !layer.top)) {
      const transform = textData.transform;
      left = transform[4] * scale;
      top = transform[5] * scale;
    }

    // Extract line height (leading) - both values should be in same units from ag-psd
    let lineHeight = 1.16; // Fabric.js default
    if (style.leading !== undefined && typeof style.leading === 'number' && fontSizeFromPSD > 0) {
      // Both style.leading and fontSizeFromPSD are in pixels from ag-psd
      // Their ratio gives us the lineHeight multiplier
      const calculatedLineHeight = style.leading / fontSizeFromPSD;

      // Only use calculated value if it's reasonable (between 0.5 and 5.0)
      // Values like 0.01 are errors in the PSD data
      if (calculatedLineHeight >= 0.5 && calculatedLineHeight <= 5.0) {
        lineHeight = calculatedLineHeight;
      } else {
        // Fall back to default for unreasonable values
        lineHeight = 1.2;
        console.warn('  ⚠️ Unreasonable line height calculated:', calculatedLineHeight, '- using default 1.2');
      }
    } else if (style.autoLeading) {
      lineHeight = 1.2; // Photoshop's auto leading is typically 120%
    }

    // Extract letter spacing (tracking)
    let charSpacing = 0;
    if (style.tracking !== undefined) {
      // Photoshop tracking is in 1/1000 em units
      charSpacing = style.tracking;
    }

    // Extract paragraph alignment
    let textAlign = 'left';
    if (textData.paragraphStyle) {
      const align = textData.paragraphStyle.align || textData.paragraphStyle.alignment;
      if (align === 'center' || align === 1) textAlign = 'center';
      else if (align === 'right' || align === 2) textAlign = 'right';
      else if (align === 'justify' || align === 3) textAlign = 'justify';
    }

    // Calculate text box width from layer bounds (for logging and config)
    let textBoxWidth = null;
    if (layer.right !== undefined && layer.left !== undefined) {
      textBoxWidth = (layer.right - layer.left) * scale;
    }

    // Log text type and transform information
    const textType = textData.shapeType || 'unknown';
    const transformYScale = (textData.transform && textData.transform[3]) || 1;
    console.log('  Text type:', textType, '(point vs box)');
    console.log('  Transform Y-scale:', transformYScale.toFixed(4));
    console.log('  Font:', fontFamily);
    console.log('  Size (base):', (style.fontSize || 16) + 'px', '× transform:', transformYScale.toFixed(2), '= (final):', fontSizeFromPSD.toFixed(2) + 'px', '→ (scaled):', fontSize.toFixed(2) + 'px');
    if (style.verticalScale && style.verticalScale !== 1) {
      console.log('  Vertical scale:', style.verticalScale);
    }
    console.log('  Weight:', fontWeight, 'Style:', fontStyle);
    console.log('  Color:', fillColor, 'Align:', textAlign);
    console.log('  Position:', left.toFixed(2), top.toFixed(2));
    if (layer.right !== undefined && layer.left !== undefined) {
      console.log('  Layer bounds width:', (layer.right - layer.left).toFixed(2), '→ Text box width:', textBoxWidth ? textBoxWidth.toFixed(2) : 'N/A');
    }
    console.log('  Line height:', lineHeight.toFixed(3), 'Leading:', style.leading, 'Char spacing:', charSpacing);

    // Get layer opacity
    const opacity = layer.opacity !== undefined ? layer.opacity : 1;

    // Create text object configuration
    const textConfig = {
      left: left,
      top: top,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: fillColor,
      opacity: opacity,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textAlign: textAlign,
      lineHeight: lineHeight,
      charSpacing: charSpacing,
      selectable: true,
      editable: true,
      name: layer.name,
      psdMetadata: {
        layerType: 'text',
        isTextLayer: true,
        canEdit: true,
        originalText: textContent,
        color: fillColor,
        fontSizeFromPSD: fontSizeFromPSD,  // Store original size from PSD (pixels)
        fontFamily: fontFamily
      }
    };

    // Set text box width if we have valid bounds
    // This constrains text to match PSD text box dimensions
    if (textBoxWidth && textBoxWidth > 0) {
      textConfig.width = textBoxWidth;
    }

    // CRITICAL FIX: Determine if this is point text or box/paragraph text
    // - Point text: Single-line text that auto-expands (use IText, ignore width)
    // - Box text: Multi-line text with width constraint (use Textbox with width)
    const isBoxText = textData.shapeType === 'box';

    // Create appropriate text object type
    let text;
    if (isBoxText && textBoxWidth && textBoxWidth > 0) {
      // Box/paragraph text - use Textbox with width constraint for proper wrapping
      text = new Textbox(textContent, textConfig);
      console.log('  ✓ Using Textbox (box text with width constraint)');
    } else {
      // Point text - use IText (no width constraint, auto-expands)
      text = new IText(textContent, textConfig);
      console.log('  ✓ Using IText (point text, auto-expand)');
    }

    canvas.add(text);
    console.log('✓ Added EDITABLE TEXT:', layer.name, {
      left: text.left,
      top: text.top,
      width: text.width,
      height: text.height,
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      textLength: text.text.length
    });
  } catch (err) {
    console.error('Error processing text layer:', layer.name, err);
    console.error('Error details:', err.stack);
    // Fallback: try to render as image
    await processRasterLayer(layer, canvas, scale);
  }
}

/**
 * Process a raster layer and create an Image object
 * @param {Object} layer - ag-psd layer with image data
 * @param {fabric.Canvas} canvas - Fabric canvas instance
 * @param {number} scale - Scale factor
 */
async function processRasterLayer(layer, canvas, scale) {
  try {
    // ag-psd provides canvas or imageData
    let layerCanvas;

    if (layer.canvas) {
      // Layer already has a canvas element
      layerCanvas = layer.canvas;
    } else if (layer.imageData) {
      // Need to convert ImageData to canvas
      const width = layer.imageData.width;
      const height = layer.imageData.height;

      layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;

      const ctx = layerCanvas.getContext('2d');
      ctx.putImageData(layer.imageData, 0, 0);
    } else {
      console.log('No image data for layer:', layer.name);
      return;
    }

    // Convert canvas to data URL
    const dataURL = layerCanvas.toDataURL('image/png');
    const img = await Image.fromURL(dataURL);

    // Determine layer type from metadata
    // All raster layers are replaceable by default
    let layerType = 'raster';
    let psdMetadata = {
      layerType: layerType,
      canEdit: true,
      isReplaceableImage: true  // Default: all raster layers are replaceable
    };

    // Check if it's a shape layer (vector mask)
    if (layer.vectorMask) {
      layerType = 'shape';
      psdMetadata.layerType = 'shape';
      psdMetadata.canEdit = true;
      psdMetadata.isShape = true;
      psdMetadata.isReplaceableImage = false;  // Shapes are NOT replaceable images
    }

    // No keyword check needed - all raster layers are replaceable by default

    const left = (layer.left || 0) * scale;
    const top = (layer.top || 0) * scale;

    // Get layer opacity - ag-psd already returns 0-1 range (not 0-255 like psd.js)
    const opacity = layer.opacity !== undefined ? layer.opacity : 1;

    img.set({
      left: left,
      top: top,
      scaleX: scale,
      scaleY: scale,
      opacity: opacity,
      selectable: true,
      name: layer.name,
      psdMetadata: psdMetadata
    });

    canvas.add(img);

    const editType = psdMetadata.isShape ? 'SHAPE' : psdMetadata.isReplaceableImage ? 'IMAGE' : 'RASTER';
    console.log(`✓ Added ${editType}:`, layer.name, {
      left: img.left,
      top: img.top,
      width: img.width,
      height: img.height,
      scaleX: img.scaleX,
      scaleY: img.scaleY,
      opacity: img.opacity,
      originalSize: layerCanvas.width + 'x' + layerCanvas.height
    });
  } catch (err) {
    console.error('Error processing raster layer:', layer.name, err);
  }
}

/**
 * Detect if a layer name indicates it belongs to front or back page
 * @param {string} layerName - Layer name from PSD
 * @returns {string|null} 'front', 'back', or null if not determined
 */
function detectPageFromLayerName(layerName) {
  if (!layerName) return null;

  const lowerName = layerName.toLowerCase().trim();

  // Check for explicit "front" keywords
  if (lowerName.includes('front') || lowerName === 'page 1' || lowerName === 'side 1') {
    return 'front';
  }

  // Check for explicit "back" keywords
  if (lowerName.includes('back') || lowerName === 'page 2' || lowerName === 'side 2') {
    return 'back';
  }

  return null;
}

/**
 * Analyze PSD structure to detect front and back pages
 * @param {Object} psd - Parsed PSD object from ag-psd
 * @returns {Object} { isDoubleSided: boolean, frontLayers: Array, backLayers: Array }
 */
function analyzePSDPages(psd) {
  const result = {
    isDoubleSided: false,
    frontLayers: [],
    backLayers: [],
    uncategorizedLayers: []
  };

  if (!psd.children || psd.children.length === 0) {
    return result;
  }

  let hasFrontGroup = false;
  let hasBackGroup = false;

  // Scan all top-level layers
  psd.children.forEach(layer => {
    const pageType = detectPageFromLayerName(layer.name);

    if (pageType === 'front') {
      hasFrontGroup = true;
      result.frontLayers.push(layer);
    } else if (pageType === 'back') {
      hasBackGroup = true;
      result.backLayers.push(layer);
    } else {
      // If no page type detected, add to uncategorized
      result.uncategorizedLayers.push(layer);
    }
  });

  // Determine if this is a double-sided PSD
  result.isDoubleSided = hasFrontGroup && hasBackGroup;

  console.log('PSD Page Analysis:', {
    isDoubleSided: result.isDoubleSided,
    frontLayers: result.frontLayers.length,
    backLayers: result.backLayers.length,
    uncategorized: result.uncategorizedLayers.length
  });

  return result;
}

/**
 * Get PSD metadata without loading full layers
 * @param {File|string} psdSource - PSD file or URL
 * @returns {Promise<Object>} PSD metadata
 */
export async function getPSDMetadata(psdSource) {
  try {
    let arrayBuffer;

    if (psdSource instanceof File) {
      arrayBuffer = await psdSource.arrayBuffer();
    } else {
      const response = await fetch(psdSource);
      arrayBuffer = await response.arrayBuffer();
    }

    const psd = readPsd(arrayBuffer, { skipLayerImageData: true });

    // Analyze pages
    const pageAnalysis = analyzePSDPages(psd);

    return {
      width: psd.width,
      height: psd.height,
      layers: psd.children?.length || 0,
      name: 'PSD Document',
      isDoubleSided: pageAnalysis.isDoubleSided,
      frontLayerCount: pageAnalysis.frontLayers.length,
      backLayerCount: pageAnalysis.backLayers.length
    };
  } catch (error) {
    console.error('Error reading PSD metadata:', error);
    throw error;
  }
}
