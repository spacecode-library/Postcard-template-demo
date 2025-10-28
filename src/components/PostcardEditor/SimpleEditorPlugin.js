import { isRGBAColor } from '@cesdk/engine';

const SCENE_PADDING = 60;

export const SimpleEditorPlugin = () => ({
  name: 'ly.img.simple-postcard-editor',
  version: '1.0.0',
  initialize: async ({ cesdk }) => {
    if (cesdk == null) return;

    const engine = cesdk.engine;

    // Configure engine for restricted editing
    engine.editor.setSettingBool('page/title/show', false);
    engine.editor.setSettingBool('mouse/enableScroll', false);
    engine.editor.setSettingBool('mouse/enableZoom', false);

    // Hide all UI elements - we want custom form-based controls
    cesdk.ui.setInspectorBarOrder([]);
    cesdk.ui.setDockOrder([]);
    cesdk.ui.setCanvasBarOrder([], 'bottom');
    cesdk.ui.setNavigationBarOrder([
      'ly.img.undoRedo.navigationBar',
      'ly.img.spacer',
      'ly.img.actions.navigationBar'
    ]);

    // Disable page resize feature
    cesdk.feature.enable('ly.img.page.resize', false);

    // Allow selection, but we'll control what can be selected per element
    engine.editor.setGlobalScope('editor/select', 'Allow');

    // Set up translations
    cesdk.i18n.setTranslations({
      en: {
        'panel.simple-editor': 'Edit Postcard'
      }
    });

    let imageBlocks = [];
    let editableImageBlocks = [];
    let textBlocks = [];
    let editableTextBlocks = [];
    let colors = {};

    // Set up automatic canvas fitting with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      const scene = engine.scene?.get();
      if (!engine.scene || !scene) {
        return;
      }
      
      // Fit the scene to the canvas with padding
      engine.scene.zoomToBlock(
        scene,
        SCENE_PADDING,
        SCENE_PADDING,
        SCENE_PADDING,
        SCENE_PADDING
      );
    });
    
    // Observe the engine canvas element for size changes
    if (engine.element) {
      resizeObserver.observe(engine.element);
    }

    // Function to refresh content after template loading with retry logic
    async function refreshContent(retryCount = 0) {
      console.log(`🔄 Refreshing content after template load... (attempt ${retryCount + 1})`);
      
      try {
        // Deselect all blocks (with null safety)
        if (engine && engine.block && typeof engine.block.findAllSelected === 'function') {
          engine.block.findAllSelected().forEach((block) => {
            engine.block.setSelected(block, false);
          });
        }

        // Re-discover content with more time for PSD elements to be processed
        await waitUntilLoaded(engine);
        
        // Wait a bit more for PSD processing to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        imageBlocks = getEditableImageBlocks(engine);
        editableImageBlocks = blocksToEditableProperties(engine, imageBlocks);

        textBlocks = getEditableTextBlocks(engine);
        editableTextBlocks = blocksToEditableProperties(engine, textBlocks, (block) => {
          const text = engine.block.getString(block, 'text/text');
          return {
            expanded: text.includes('\n')
          };
        });

        colors = getAllColors(engine);

        console.log(`✅ Content discovery results - Images: ${imageBlocks.length}, Text: ${textBlocks.length}, Colors: ${Object.keys(colors).length}`);

        // If we found no content and haven't retried too many times, try again
        if (imageBlocks.length === 0 && textBlocks.length === 0 && retryCount < 3) {
          console.log(`⏳ No content found, retrying in 500ms... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            refreshContent(retryCount + 1);
          }, 500);
          return;
        }

        // Configure selection permissions for all blocks
        setupSelectionPermissions(engine, imageBlocks, textBlocks);

        // Force sidebar to rebuild by triggering a panel update
        setTimeout(() => {
          try {
            // Try to force a UI update by temporarily changing selection (with null safety)
            if (engine && engine.block && typeof engine.block.findAll === 'function') {
              const allBlocks = engine.block.findAll();
              if (allBlocks.length > 0) {
                console.log('🔄 Triggering sidebar rebuild...');
                // Force a re-render of the panel by briefly deselecting and reselecting if something is selected
                if (typeof engine.block.findAllSelected === 'function') {
                  const selected = engine.block.findAllSelected();
                  if (selected.length > 0) {
                    engine.block.setSelected(selected[0], false);
                    setTimeout(() => {
                      if (engine && engine.block && engine.block.setSelected) {
                        engine.block.setSelected(selected[0], true);
                      }
                    }, 50);
                  }
                }
              }
            }
          } catch (error) {
            console.warn('Error triggering sidebar rebuild:', error);
          }
        }, 100);

        console.log(`✅ Content refresh complete - Final count: Images: ${imageBlocks.length}, Text: ${textBlocks.length}, Colors: ${Object.keys(colors).length}`);
      } catch (error) {
        console.error('Error refreshing content:', error);
        
        // If there's an error and we haven't retried too many times, try again
        if (retryCount < 2) {
          console.log(`⚠️ Error occurred, retrying content discovery in 1000ms...`);
          setTimeout(() => {
            refreshContent(retryCount + 1);
          }, 1000);
        }
      }
    }

    // Set up scene change handler
    engine.scene.onActiveChanged(() => {
      async function setupScene() {
        // Relocate resources to blob URLs for preview
        relocateResourcesToBlobURLs(engine);
        
        // Deselect all blocks (with null safety)
        if (engine && engine.block && typeof engine.block.findAllSelected === 'function') {
          engine.block.findAllSelected().forEach((block) => {
            engine.block.setSelected(block, false);
          });
        }

        // Find editable elements
        imageBlocks = getEditableImageBlocks(engine);
        editableImageBlocks = blocksToEditableProperties(engine, imageBlocks);

        textBlocks = getEditableTextBlocks(engine);
        editableTextBlocks = blocksToEditableProperties(engine, textBlocks, (block) => {
          const text = engine.block.getString(block, 'text/text');
          return {
            expanded: text.includes('\n')
          };
        });

        colors = getAllColors(engine);

        // Debug: Review all layers and components
        reviewAllLayersAndComponents(engine);

        // Configure selection permissions for all blocks
        setupSelectionPermissions(engine, imageBlocks, textBlocks);

        // Wait for resources to load then fit the canvas
        await waitUntilLoaded(engine);
        const scene = engine.scene.get();
        if (scene) {
          try {
            engine.scene.zoomToBlock(
              scene,
              SCENE_PADDING,
              SCENE_PADDING,
              SCENE_PADDING,
              SCENE_PADDING
            );
          } catch (zoomError) {
            console.warn('Could not zoom to scene immediately:', zoomError);
            // Try again after a short delay
            setTimeout(() => {
              try {
                engine.scene.zoomToBlock(scene, SCENE_PADDING, SCENE_PADDING, SCENE_PADDING, SCENE_PADDING);
              } catch (delayedZoomError) {
                console.warn('Delayed zoom also failed:', delayedZoomError);
              }
            }, 500);
          }
        }

        // Reset history to clean state
        try {
          let oldHistory = engine.editor.getActiveHistory();
          let newHistory = engine.editor.createHistory();
          engine.editor.setActiveHistory(newHistory);
          engine.editor.destroyHistory(oldHistory);
          engine.editor.addUndoStep();
        } catch (historyError) {
          console.warn('Error resetting history:', historyError);
        }
      }
      setupScene();
    });

    // Expose refreshContent function globally for template loading to use
    if (!window.simpleEditorPluginAPI) {
      window.simpleEditorPluginAPI = {};
    }
    window.simpleEditorPluginAPI.refreshContent = refreshContent;

    // Set up selection change handler to provide user feedback (with null safety)
    if (engine && engine.block && typeof engine.block.onSelectionChanged === 'function') {
      engine.block.onSelectionChanged(() => {
        if (!engine || !engine.block || typeof engine.block.findAllSelected !== 'function') {
          return;
        }
        
        const selected = engine.block.findAllSelected();
        if (selected.length > 0) {
        const selectedBlock = selected[0];
        const blockType = engine.block.getType(selectedBlock);
        const blockName = engine.block.getName(selectedBlock) || `Block ${selectedBlock}`;
        
        // Provide feedback about what's selected
        if (blockType === '//ly.img.ubq/text') {
          const textContent = engine.block.getString(selectedBlock, 'text/text');
          console.log(`📝 Text selected: "${blockName}" - Content: "${textContent}"`);
          console.log(`👉 You can now edit this text in the form panel on the right`);
        } else if (blockType === '//ly.img.ubq/graphic') {
          console.log(`🖼️ Image selected: "${blockName}"`);
          console.log(`👉 You can now replace this image in the form panel on the right`);
        }
        } else {
          console.log(`👆 Click on any text or image to select and edit it`);
        }
      });
    }

    // Register the dynamic selection-based panel for editing
    cesdk.ui.registerPanel(
      'simple-editor',
      ({ builder, engine, state }) => {
        const pages = engine.block.findByType('page');
        if (pages.length === 0) {
          console.warn('No pages found - sidebar will be empty');
          return;
        }

        // Get current selection (with null safety)
        let selectedBlocks = [];
        let selectedBlock = null;

        if (engine && engine.block && typeof engine.block.findAllSelected === 'function') {
          try {
            selectedBlocks = engine.block.findAllSelected();
            selectedBlock = selectedBlocks.length > 0 ? selectedBlocks[0] : null;
          } catch (selectionError) {
            console.warn('Error getting selection:', selectionError);
          }
        }
        
        // Build different sections based on what's selected
        if (selectedBlock) {
          buildContextualSidebar(builder, engine, state, selectedBlock, {
            imageBlocks,
            editableImageBlocks,
            textBlocks,
            editableTextBlocks,
            colors
          });
        } else {
          buildOverviewSidebar(builder, engine, state, {
            imageBlocks,
            editableImageBlocks,
            textBlocks,
            editableTextBlocks,
            colors
          });
        }

        // Remove old static sections - now using dynamic contextual sidebar
        /*
          builder.Section('simple-editor.images', {
            title: 'Images',
            children: () => {
              editableImageBlocks.forEach(({ blocks, name }) => {
                const block = blocks[0];
                const fillBlock = engine.block.getFill(block);
                const uri = 
                  engine.block.getSourceSet(fillBlock, 'fill/image/sourceSet')?.[0]?.uri ??
                  engine.block.getString(fillBlock, 'fill/image/imageFileURI');

                const uploadState = state(`imageUpload-${block}`, false);
                const blockName = name || 'Image';

                builder.MediaPreview(`imagePreview-${block}`, {
                  size: 'small',
                  preview: {
                    type: 'image',
                    uri
                  },
                  action: {
                    label: `Change ${blockName}`,
                    isLoading: uploadState.value,
                    onClick: () => {
                      uploadState.setValue(true);
                      uploadFile({
                        supportedMimeTypes: ['image/*']
                      }).then((files) => {
                        const [file] = files;
                        if (file != null) {
                          const url = URL.createObjectURL(file);
                          blocks.forEach((blockToChange) => {
                            const fillToChange = engine.block.getFill(blockToChange);
                            engine.block.setString(fillToChange, 'fill/image/imageFileURI', '');
                            engine.block.setSourceSet(fillToChange, 'fill/image/sourceSet', []);
                            
                            engine.block
                              .addImageFileURIToSourceSet(fillToChange, 'fill/image/sourceSet', url)
                              .then(() => {
                                uploadState.setValue(false);
                                engine.editor.addUndoStep();
                              })
                              .catch(() => {
                                console.error('Error uploading image');
                                uploadState.setValue(false);
                              });
                          });
                        }
                      }).catch(() => {
                        uploadState.setValue(false);
                      });
                    }
                  }
                });
              });
            }
          });
        }

        // Text editing section
        console.log(`📝 Building text section with ${textBlocks.length} blocks and ${editableTextBlocks.length} editable groups`);
        if (textBlocks.length > 0) {
          const textBlockState = state('textBlockState', new Map(
            editableTextBlocks.map(({ name, options }) => [name, options])
          ));
          
          // Force refresh text values when blocks change
          const textValuesState = state('textValues', new Map());
          
          builder.Section('simple-editor.text', {
            title: 'Text',
            children: () => {
              editableTextBlocks.forEach(({ blocks, name }) => {
                try {
                  // Validate blocks still exist
                  const validBlocks = blocks.filter(block => {
                    try {
                      return engine.block.isValid(block);
                    } catch (error) {
                      console.warn(`Block ${block} is no longer valid for text editing`);
                      return false;
                    }
                  });
                  
                  if (validBlocks.length === 0) {
                    console.warn(`No valid blocks found for text section: ${name}`);
                    return;
                  }

                  // Get current text value with error handling
                  let currentValue = '';
                  try {
                    currentValue = engine.block.getString(validBlocks[0], 'text/text') || '';
                  } catch (error) {
                    console.warn(`Failed to get text for block ${validBlocks[0]}:`, error);
                    currentValue = textValuesState.value.get(name) || '';
                  }
                  
                  // Update cached value
                  textValuesState.value.set(name, currentValue);
                  
                  const setValue = (newValue) => {
                    try {
                      if (!newValue && newValue !== '') {
                        console.warn('Invalid text value provided');
                        return;
                      }
                      
                      // Update all valid blocks
                      let updatedCount = 0;
                      validBlocks.forEach((block) => {
                        try {
                          if (engine.block.isValid(block)) {
                            engine.block.replaceText(block, newValue);
                            updatedCount++;
                          }
                        } catch (blockError) {
                          console.warn(`Failed to update text for block ${block}:`, blockError);
                        }
                      });
                      
                      if (updatedCount > 0) {
                        // Update cached value
                        textValuesState.value.set(name, newValue);
                        engine.editor.addUndoStep();
                        console.log(`✅ Updated text "${name}" to "${newValue}" (${updatedCount} blocks)`);
                      } else {
                        console.warn(`Failed to update any blocks for text "${name}"`);
                      }
                    } catch (setError) {
                      console.error(`Error setting text value for "${name}":`, setError);
                    }
                  };

                  const expanded = textBlockState.value.get(name)?.expanded ?? false;
                  
                  // Create unique key for each text input to ensure proper re-rendering
                  const inputKey = `text-${name}-${validBlocks[0]}`;
                  
                  if (expanded) {
                    builder.TextArea(inputKey, {
                      inputLabel: `${name} (${validBlocks.length} block${validBlocks.length > 1 ? 's' : ''})`,
                      value: currentValue,
                      setValue,
                      placeholder: 'Enter your text here...'
                    });
                  } else {
                    builder.TextInput(inputKey, {
                      inputLabel: `${name} (${validBlocks.length} block${validBlocks.length > 1 ? 's' : ''})`,
                      value: currentValue,
                      setValue,
                      placeholder: 'Enter your text here...'
                    });
                  }
                } catch (sectionError) {
                  console.error(`Error creating text input for "${name}":`, sectionError);
                  
                  // Create fallback text input
                  builder.TextInput(`text-error-${name}`, {
                    inputLabel: `${name} (Error)`,
                    value: 'Error loading text',
                    setValue: () => console.warn(`Text input "${name}" is in error state`),
                    disabled: true
                  });
                }
              });
            }
          });
        }

        // Color editing section
        if (Object.keys(colors).length > 0) {
          builder.Section('simple-editor.colors', {
            title: 'Colors',
            children: () => {
              Object.keys(colors).forEach((colorId, i) => {
                const color = JSON.parse(colorId);
                const colorState = state(`color-${colorId}`, color);
                const foundColors = colors[colorId];

                builder.ColorInput(`color-${colorId}`, {
                  inputLabel: `Color ${i + 1}`,
                  value: colorState.value,
                  setValue: (newValue) => {
                    colorState.setValue(newValue);

                    foundColors.forEach((foundColor) => {
                      if (foundColor.type === 'fill') {
                        const fill = engine.block.getFill(foundColor.id);
                        engine.block.setColor(fill, 'fill/color/value', {
                          ...newValue,
                          a: foundColor.initialOpacity
                        });
                      } else if (foundColor.type === 'stroke') {
                        engine.block.setStrokeColor(foundColor.id, {
                          ...newValue,
                          a: foundColor.initialOpacity
                        });
                      } else if (foundColor.type === 'text') {
                        engine.block.setTextColor(foundColor.id, {
                          ...newValue,
                          a: foundColor.initialOpacity
                        });
                      }
                    });
                    
                    engine.editor.addUndoStep();
                  }
                });
              });
            }
          });
        */

        // ===== BRAND COLORS SECTION =====
        // Show brand colors if available - check dynamically on each panel build
        const isValidHex = (color) => {
          if (!color || typeof color !== 'string') return false;
          const cleanHex = color.replace('#', '').trim();
          return /^[0-9A-Fa-f]{6}$/.test(cleanHex);
        };

        // Helper to convert hex to RGB
        const hexToRGB = (hex) => {
          if (!hex || typeof hex !== 'string') return null;
          const cleanHex = hex.replace(/^#/, '').trim();
          if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) return null;
          const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
          const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
          const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
          if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
          return { r, g, b, a: 1 };
        };

        if (window.brandColors && isValidHex(window.brandColors.primary)) {
          console.log('[BRAND COLORS] Adding brand colors section to sidebar:', window.brandColors);

          builder.Section('simple-editor.brand-colors', {
            title: 'Brand Colors',
            children: () => {
              // Show brand name
              if (window.brandName) {
                builder.Text('brand-name-display', {
                  text: `Brand: ${window.brandName}`,
                  style: { fontWeight: 'bold', marginBottom: '8px' }
                });
              }

              // Show primary color
              if (window.brandColors.primary) {
                const primaryRGB = hexToRGB(window.brandColors.primary);
                if (primaryRGB) {
                  builder.ColorInput('brand-primary-swatch', {
                    inputLabel: `Primary: ${window.brandColors.primary}`,
                    value: primaryRGB,
                    disabled: true
                  });
                }
              }

              // Show secondary color
              if (window.brandColors.secondary && isValidHex(window.brandColors.secondary)) {
                const secondaryRGB = hexToRGB(window.brandColors.secondary);
                if (secondaryRGB) {
                  builder.ColorInput('brand-secondary-swatch', {
                    inputLabel: `Secondary: ${window.brandColors.secondary}`,
                    value: secondaryRGB,
                    disabled: true
                  });
                }
              }

              // Show palette colors
              if (window.brandColors.palette && Array.isArray(window.brandColors.palette) && window.brandColors.palette.length > 0) {
                builder.Text('brand-palette-label', {
                  text: 'Brand Palette:',
                  style: { marginTop: '12px', fontWeight: '600', fontSize: '0.875rem' }
                });

                window.brandColors.palette.slice(0, 6).forEach((colorObj, index) => {
                  const colorHex = (typeof colorObj === 'string') ? colorObj : (colorObj.hex || null);
                  const colorName = (typeof colorObj === 'object') ? colorObj.name : null;

                  if (colorHex && isValidHex(colorHex)) {
                    const colorRGB = hexToRGB(colorHex);
                    if (colorRGB) {
                      builder.ColorInput(`brand-palette-color-${index}`, {
                        inputLabel: colorName ? `${colorName}: ${colorHex}` : `Color ${index + 1}: ${colorHex}`,
                        value: colorRGB,
                        disabled: true
                      });
                    }
                  }
                });
              }

              builder.Text('brand-colors-info', {
                text: 'Tip: These are your brand colors. Select text or shapes to apply them manually.',
                style: {
                  marginTop: '12px',
                  fontSize: '0.75rem',
                  color: '#718096',
                  fontStyle: 'italic'
                }
              });
            }
          });
        } else {
          console.log('[WARNING] Brand colors not available in sidebar (window.brandColors:', window.brandColors, ')');
        }

        // ===== BRAND LOGO SECTION =====
        // Show brand logo if available
        if (window.brandLogo || window.editorBrandLogo) {
          const logoUrl = window.brandLogo || window.editorBrandLogo;
          console.log('[BRAND LOGO] Adding brand logo section to sidebar:', logoUrl);

          builder.Section('simple-editor.brand-logo', {
            title: 'Brand Logo',
            children: () => {
              // Show brand name
              if (window.brandName) {
                builder.Text('brand-logo-name', {
                  text: `${window.brandName}`,
                  style: { fontWeight: 'bold', marginBottom: '8px' }
                });
              }

              // Show logo URL
              builder.Text('brand-logo-url', {
                text: `Logo: ${logoUrl.substring(0, 50)}...`,
                style: {
                  fontSize: '0.75rem',
                  color: '#4A5568',
                  marginBottom: '8px',
                  fontFamily: 'monospace'
                }
              });

              builder.Text('brand-logo-usage-info', {
                text: 'Tip: Click on any image placeholder, then use the "Use Brand Logo" button to replace it with your logo.',
                style: {
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: '#718096',
                  fontStyle: 'italic',
                  lineHeight: '1.4'
                }
              });
            }
          });
        } else {
          console.log('[WARNING] Brand logo not available in sidebar');
        }
      }
    );

    // Open the panel and make it non-closable
    cesdk.ui.openPanel('simple-editor', { closableByUser: false });

    // Cleanup function
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }
});

// Helper functions
const waitUntilLoaded = async (engine) => {
  // Add null safety checks
  if (!engine || !engine.scene || typeof engine.scene.get !== 'function') {
    console.warn('waitUntilLoaded: Engine not fully initialized yet');
    return;
  }

  const scene = engine.scene.get();
  if (scene) {
    await engine.block.forceLoadResources([scene]);
  }
};

const reviewAllLayersAndComponents = (engine) => {
  console.group('🔍 Scene Analysis - All Layers and Components');
  
  try {
    const scene = engine.scene.get();
    if (!scene) {
      console.log('No scene found');
      console.groupEnd();
      return;
    }

    const allBlocks = engine.block.findAll();
    console.log(`Total blocks in scene: ${allBlocks.length}`);
    
    // Filter out invalid blocks (like 4294967295)
    const validBlocks = allBlocks.filter((blockId) => {
      if (blockId === 4294967295 || blockId < 0) {
        console.warn(`Skipping invalid block ID: ${blockId}`);
        return false;
      }
      
      try {
        // Test if block still exists
        return engine.block.isValid(blockId);
      } catch (error) {
        console.warn(`Block ${blockId} is no longer valid:`, error);
        return false;
      }
    });
    
    console.log(`Valid blocks: ${validBlocks.length} out of ${allBlocks.length}`);
    
    // Analyze each valid block
    validBlocks.forEach((blockId, index) => {
      try {
        const blockType = engine.block.getType(blockId);
        const blockName = engine.block.getName(blockId) || `Block ${blockId}`;
        const isVisible = engine.block.isVisible(blockId);
        const hasParent = engine.block.getParent(blockId);
        const children = engine.block.getChildren(blockId);
        
        console.group(`📦 Block ${index + 1}: ${blockName} (ID: ${blockId})`);
        console.log(`Type: ${blockType}`);
        console.log(`Visible: ${isVisible}`);
        console.log(`Parent: ${hasParent}`);
        console.log(`Children: ${children.length}`);
        
        // Check specific properties based on type
        if (blockType === '//ly.img.ubq/text') {
          const text = engine.block.getString(blockId, 'text/text');
          const textEditScope = engine.block.isScopeEnabled(blockId, 'text/edit');
          const textColors = engine.block.getTextColors(blockId);
          console.log(`📝 Text content: "${text}"`);
          console.log(`📝 Text editable: ${textEditScope}`);
          console.log(`📝 Text colors: ${textColors.length} color(s)`);
          
          // Check if text has formatting
          try {
            const fontSizes = engine.block.getTextFontSizes(blockId);
            const fontFamilies = engine.block.getTextFontFamilies(blockId);
            console.log(`📝 Font families: ${fontFamilies.length} different font(s)`);
            console.log(`📝 Font sizes: ${fontSizes.length} different size(s)`);
          } catch (e) {
            console.log(`📝 Basic text formatting`);
          }
        } else if (blockType === '//ly.img.ubq/graphic') {
          const hasFill = engine.block.supportsFill(blockId);
          if (hasFill) {
            const fillBlock = engine.block.getFill(blockId);
            const fillType = engine.block.getType(fillBlock);
            const fillChangeScope = engine.block.isScopeEnabled(blockId, 'fill/change');
            console.log(`Fill type: ${fillType}`);
            console.log(`Fill changeable: ${fillChangeScope}`);
          }
        } else if (blockType === '//ly.img.ubq/page') {
          const width = engine.block.getWidth(blockId);
          const height = engine.block.getHeight(blockId);
          console.log(`Page dimensions: ${width}" x ${height}"`);
        }
        
        // Check selection scope
        const selectScope = engine.block.isScopeEnabled(blockId, 'editor/select');
        console.log(`Selectable: ${selectScope}`);
        
        console.groupEnd();
      } catch (blockError) {
        console.error(`Error analyzing block ${blockId}:`, blockError);
      }
    });
  } catch (error) {
    console.error('Error in reviewAllLayersAndComponents:', error);
  }
  
  console.groupEnd();
};

const setupSelectionPermissions = (engine, imageBlocks, textBlocks) => {
  console.group('🎯 Setting up selection permissions...');
  
  // Get all blocks in the scene
  const allBlocks = engine.block.findAll();
  
  // Create sets for easy lookup
  const editableImageSet = new Set(imageBlocks);
  const editableTextSet = new Set(textBlocks);
  
  console.log(`📊 Summary:`);
  console.log(`   • Editable images: ${imageBlocks.length}`);
  console.log(`   • Editable text blocks: ${textBlocks.length}`);
  console.log(`   • Total blocks: ${allBlocks.length}`);
  
  // Log details about each text block
  if (textBlocks.length > 0) {
    console.group('📝 Text blocks that will be editable:');
    textBlocks.forEach((blockId, index) => {
      const blockName = engine.block.getName(blockId) || `Text Block ${blockId}`;
      const textContent = engine.block.getString(blockId, 'text/text');
      console.log(`   ${index + 1}. "${blockName}": "${textContent}"`);
    });
    console.groupEnd();
  }
  
  // Log details about each image block  
  if (imageBlocks.length > 0) {
    console.group('🖼️ Image blocks that will be editable:');
    imageBlocks.forEach((blockId, index) => {
      const blockName = engine.block.getName(blockId) || `Image Block ${blockId}`;
      console.log(`   ${index + 1}. "${blockName}" (ID: ${blockId})`);
    });
    console.groupEnd();
  }
  
  allBlocks.forEach((blockId) => {
    const blockType = engine.block.getType(blockId);
    const blockName = engine.block.getName(blockId) || `Block ${blockId}`;
    
    // Disable selection for pages and non-editable elements
    if (blockType === '//ly.img.ubq/page') {
      engine.block.setScopeEnabled(blockId, 'editor/select', false);
      console.log(`❌ Disabled selection for page: ${blockName}`);
    }
    // Enable selection only for editable text and image blocks
    else if (editableTextSet.has(blockId) || editableImageSet.has(blockId)) {
      engine.block.setScopeEnabled(blockId, 'editor/select', true);
      
      // Disable moving/resizing for these blocks while keeping them selectable
      engine.block.setScopeEnabled(blockId, 'layer/move', false);
      engine.block.setScopeEnabled(blockId, 'layer/resize', false);
      engine.block.setScopeEnabled(blockId, 'layer/rotate', false);
      
      console.log(`✅ Enabled selection for editable element: ${blockName} (${blockType})`);
    }
    // Disable selection for all other elements (backgrounds, shapes, etc.)
    else {
      engine.block.setScopeEnabled(blockId, 'editor/select', false);
      console.log(`❌ Disabled selection for non-editable element: ${blockName} (${blockType})`);
    }
  });
  
  console.groupEnd();
};

const getAllColors = (engine) => {
  const allElements = engine.block.findAll();
  const blocksByColors = {};

  allElements.forEach((element) => {
    // Handle fill colors
    const hasFillColor = 
      engine.block.supportsFill(element) &&
      engine.block.isValid(engine.block.getFill(element)) &&
      engine.block.getType(engine.block.getFill(element)) === '//ly.img.ubq/fill/color' &&
      engine.block.isFillEnabled(element) &&
      engine.block.getType(element) !== '//ly.img.ubq/text';

    if (hasFillColor && engine.block.isScopeEnabled(element, 'fill/change')) {
      const fill = engine.block.getFill(element);
      const color = engine.block.getColor(fill, 'fill/color/value');
      if (isRGBAColor(color)) {
        const initialOpacity = color.a;
        const colorKey = JSON.stringify({ ...color, a: 1 });
        
        blocksByColors[colorKey] = blocksByColors[colorKey] || [];
        blocksByColors[colorKey].push({
          id: element,
          color: { ...color, a: 1 },
          initialOpacity,
          type: 'fill'
        });
      }
    }

    // Handle stroke colors
    const hasStroke = 
      engine.block.supportsStroke(element) &&
      engine.block.isStrokeEnabled(element);

    if (hasStroke && engine.block.isScopeEnabled(element, 'stroke/change')) {
      const color = engine.block.getStrokeColor(element);
      if (isRGBAColor(color)) {
        const initialOpacity = color.a;
        const colorKey = JSON.stringify({ ...color, a: 1 });
        
        blocksByColors[colorKey] = blocksByColors[colorKey] || [];
        blocksByColors[colorKey].push({
          id: element,
          color: { ...color, a: 1 },
          initialOpacity,
          type: 'stroke'
        });
      }
    }

    // Handle text colors
    if (engine.block.getType(element) === '//ly.img.ubq/text') {
      const textColors = engine.block.getTextColors(element);
      if (textColors.length === 1) {
        const color = textColors[0];
        if (isRGBAColor(color)) {
          const initialOpacity = color.a;
          const colorKey = JSON.stringify({ ...color, a: 1 });
          
          blocksByColors[colorKey] = blocksByColors[colorKey] || [];
          blocksByColors[colorKey].push({
            id: element,
            color: { ...color, a: 1 },
            initialOpacity,
            type: 'text'
          });
        }
      }
    }
  });

  return blocksByColors;
};

const getEditableTextBlocks = (engine) => {
  try {
    // Get ALL text blocks in the scene - use the correct type identifier
    const allTextBlocks = engine.block.findByType('//ly.img.ubq/text');
    
    console.log(`🔍 TEXT BLOCK DISCOVERY: Found ${allTextBlocks.length} text blocks total`);
    if (allTextBlocks.length > 0) {
      console.group('📝 Raw text blocks found:');
      allTextBlocks.forEach((blockId, index) => {
        try {
          const blockName = engine.block.getName(blockId) || `Unnamed`;
          const textContent = engine.block.getString(blockId, 'text/text') || '';
          const isEditable = engine.block.isScopeEnabled(blockId, 'text/edit');
          console.log(`   ${index + 1}. ID:${blockId} "${blockName}" - "${textContent}" (Editable: ${isEditable})`);
        } catch (error) {
          console.log(`   ${index + 1}. ID:${blockId} - ERROR: ${error.message}`);
        }
      });
      console.groupEnd();
    } else {
      console.warn('⚠️ NO TEXT BLOCKS FOUND - This could indicate:');
      console.warn('   • PSD import may not have completed yet');
      console.warn('   • Text blocks might be nested inside groups');
      console.warn('   • Text might be converted to shapes/images during import');
    }
    
    // Filter out invalid blocks and force enable text editing for valid ones
    const validTextBlocks = allTextBlocks.filter((blockId) => {
      try {
        // Check for invalid block IDs
        if (blockId === 4294967295 || blockId < 0) {
          console.warn(`Skipping invalid text block ID: ${blockId}`);
          return false;
        }
        
        if (!engine.block.isValid(blockId)) {
          console.warn(`Text block ${blockId} is no longer valid`);
          return false;
        }

        const currentlyEditable = engine.block.isScopeEnabled(blockId, 'text/edit');
        const blockName = engine.block.getName(blockId) || `Text Block ${blockId}`;
        const textContent = engine.block.getString(blockId, 'text/text');
        
        if (!currentlyEditable) {
          // Force enable text editing scope
          engine.block.setScopeEnabled(blockId, 'text/edit', true);
          console.log(`✅ Enabled text editing for: "${blockName}" - Content: "${textContent}"`);
        } else {
          console.log(`📝 Already editable: "${blockName}" - Content: "${textContent}"`);
        }
        
        return true;
      } catch (error) {
        console.warn(`Error processing text block ${blockId}:`, error);
        return false;
      }
    });
    
    console.log(`✅ VALID TEXT BLOCKS: ${validTextBlocks.length} out of ${allTextBlocks.length}`);
    
    if (validTextBlocks.length === 0 && allTextBlocks.length > 0) {
      console.error('❌ ALL TEXT BLOCKS WERE FILTERED OUT - Check error messages above');
    }
    
    if (validTextBlocks.length > 0) {
      console.group('📋 Final text blocks for sidebar:');
      validTextBlocks.forEach((blockId, index) => {
        try {
          const blockName = engine.block.getName(blockId) || `Text Block ${blockId}`;
          const textContent = engine.block.getString(blockId, 'text/text');
          console.log(`   ${index + 1}. "${blockName}": "${textContent}"`);
        } catch (error) {
          console.log(`   ${index + 1}. Block ${blockId}: ERROR - ${error.message}`);
        }
      });
      console.groupEnd();
    }
    
    // Return all valid text blocks, ordered by position
    return orderBlocksByPosition(engine, validTextBlocks);
  } catch (error) {
    console.error('Error getting editable text blocks:', error);
    return [];
  }
};

const getEditableImageBlocks = (engine) => {
  try {
    const graphicBlocks = engine.block.findByType('//ly.img.ubq/graphic');
    console.log(`🔍 IMAGE BLOCK DISCOVERY: Found ${graphicBlocks.length} graphic blocks total`);
    
    const validImageBlocks = graphicBlocks.filter((block) => {
      try {
        // Check for invalid block IDs
        if (block === 4294967295 || block < 0) {
          console.warn(`Skipping invalid graphic block ID: ${block}`);
          return false;
        }
        
        if (!engine.block.isValid(block)) {
          console.warn(`Graphic block ${block} is no longer valid`);
          return false;
        }

        const blockName = engine.block.getName(block) || `Graphic ${block}`;
        
        // Check if the block supports fill (can be an image)
        if (!engine.block.supportsFill(block)) {
          console.log(`🚫 Graphic "${blockName}" doesn't support fill - skipping`);
          return false;
        }

        // Check fill block - be more permissive here
        const fillBlock = engine.block.getFill(block);
        let isImageFill = false;
        
        if (fillBlock && engine.block.isValid(fillBlock)) {
          const fillType = engine.block.getType(fillBlock);
          isImageFill = fillType === '//ly.img.ubq/fill/image';
          
          if (!isImageFill) {
            console.log(`📝 Graphic "${blockName}" has ${fillType} fill - could be converted to image`);
          }
        } else {
          console.log(`📝 Graphic "${blockName}" has no fill - could add image fill`);
        }

        // Check if fill change is enabled
        const canChangeFill = engine.block.isScopeEnabled(block, 'fill/change');
        
        if (!canChangeFill) {
          // Try to enable fill change scope
          try {
            engine.block.setScopeEnabled(block, 'fill/change', true);
            console.log(`✅ Enabled fill/change scope for "${blockName}"`);
          } catch (scopeError) {
            console.warn(`Cannot enable fill/change for "${blockName}":`, scopeError);
            return false;
          }
        }

        console.log(`✅ Including graphic "${blockName}" as editable image (has fill support and change permission)`);
        return true;
        
      } catch (error) {
        console.warn(`Error checking graphic block ${block}:`, error);
        return false;
      }
    });

    console.log(`✅ VALID IMAGE BLOCKS: ${validImageBlocks.length} out of ${graphicBlocks.length}`);
    
    if (validImageBlocks.length > 0) {
      console.group('🖼️ Final image blocks for editing:');
      validImageBlocks.forEach((blockId, index) => {
        try {
          const blockName = engine.block.getName(blockId) || `Image Block ${blockId}`;
          console.log(`   ${index + 1}. "${blockName}" (ID: ${blockId})`);
        } catch (error) {
          console.log(`   ${index + 1}. Block ${blockId}: ERROR - ${error.message}`);
        }
      });
      console.groupEnd();
    }

    return orderBlocksByPosition(engine, validImageBlocks);
  } catch (error) {
    console.error('Error getting editable image blocks:', error);
    return [];
  }
};

const orderBlocksByPosition = (engine, blocks) => {
  const topLeft = { x: 0, y: 0 };
  return blocks.sort((a, b) => {
    const aPos = {
      x: engine.block.getPositionX(a),
      y: engine.block.getPositionY(a)
    };
    const bPos = {
      x: engine.block.getPositionX(b),
      y: engine.block.getPositionY(b)
    };

    const aDistance = Math.sqrt(
      Math.pow(aPos.x - topLeft.x, 2) + Math.pow(aPos.y - topLeft.y, 2)
    );
    const bDistance = Math.sqrt(
      Math.pow(bPos.x - topLeft.x, 2) + Math.pow(bPos.y - topLeft.y, 2)
    );

    return aDistance - bDistance;
  });
};

const blocksToEditableProperties = (engine, blocks, defaultOptions) => {
  return blocks
    .map((block) => {
      const name = engine.block.getName(block) || `Block ${block}`;
      return {
        name,
        blocks: [block],
        options: defaultOptions?.(block) ?? {}
      };
    })
    .reduce((acc, block) => {
      const name = block.name;
      const existing = acc.find((existing) => existing.name === name);
      if (existing) {
        existing.blocks.push(...block.blocks);
      } else {
        acc.push(block);
      }
      return acc;
    }, []);
};

const relocateResourcesToBlobURLs = (engine) => {
  try {
    if (!engine?.editor) {
      console.warn('Engine or editor not available for resource relocation');
      return;
    }

    const resources = engine.editor.findAllTransientResources();
    if (!resources || resources.length === 0) {
      return;
    }

    resources.forEach((resource) => {
      try {
        const uri = resource.URL;
        if (!uri || uri.includes('bundle://ly.img.cesdk/') || uri.startsWith('blob:')) {
          return;
        }

        // Validate buffer exists and has content
        const length = engine.editor.getBufferLength(uri);
        if (length <= 0) {
          console.warn(`Invalid buffer length for URI: ${uri}`);
          return;
        }

        const data = engine.editor.getBufferData(uri, 0, length);
        if (!data || data.length === 0) {
          console.warn(`No buffer data available for URI: ${uri}`);
          return;
        }

        const blob = new Blob([data]);
        const blobURL = URL.createObjectURL(blob);
        engine.editor.relocateResource(uri, blobURL);
      } catch (resourceError) {
        console.warn(`Failed to relocate resource: ${resource.URL}`, resourceError);
      }
    });
  } catch (error) {
    console.error('Failed to relocate resources to blob URLs:', error);
  }
};

// Build contextual sidebar when an element is selected
const buildContextualSidebar = (builder, engine, state, selectedBlock, data) => {
  const { imageBlocks, editableImageBlocks, textBlocks, editableTextBlocks, colors } = data;
  const blockType = engine.block.getType(selectedBlock);
  const blockName = engine.block.getName(selectedBlock) || `Block ${selectedBlock}`;
  
  console.log(`🎯 Building contextual sidebar for ${blockType}: "${blockName}"`);

  // Selection Info Section
  builder.Section('simple-editor.selection-info', {
    title: 'Selected Element',
    children: () => {
      builder.Text('selection-info', {
        text: `${blockName} (${blockType.includes('text') ? 'Text' : blockType.includes('graphic') ? 'Image' : 'Element'})`
      });
    }
  });

  // Text editing for selected text block
  if (blockType === '//ly.img.ubq/text') {
    console.log(`📝 Creating text editor for selected text block`);
    
    builder.Section('simple-editor.selected-text', {
      title: 'Edit Text Content',
      children: () => {
        try {
          if (!engine.block.isValid(selectedBlock)) {
            builder.Text('invalid-text', { text: 'Selected text is no longer valid' });
            return;
          }

          const currentValue = engine.block.getString(selectedBlock, 'text/text') || '';
          const textValuesState = state('selectedTextValue', currentValue);

          const setValue = (newValue) => {
            try {
              if (engine.block.isValid(selectedBlock)) {
                engine.block.replaceText(selectedBlock, newValue);
                textValuesState.setValue(newValue);
                engine.editor.addUndoStep();
                console.log(`✅ Updated selected text to: "${newValue}"`);
              }
            } catch (error) {
              console.error('Error updating selected text:', error);
            }
          };

          const isMultiline = currentValue.includes('\n');
          
          if (isMultiline) {
            builder.TextArea('selected-text-area', {
              inputLabel: `${blockName}`,
              value: textValuesState.value,
              setValue,
              placeholder: 'Enter your text here...'
            });
          } else {
            builder.TextInput('selected-text-input', {
              inputLabel: `${blockName}`,
              value: textValuesState.value,
              setValue,
              placeholder: 'Enter your text here...'
            });
          }
        } catch (error) {
          console.error('Error creating text editor:', error);
          builder.Text('text-error', { text: 'Error loading text editor' });
        }
      }
    });

    // Typography controls for selected text block
    builder.Section('simple-editor.selected-typography', {
      title: 'Text Formatting',
      children: () => {
        try {
          if (!engine.block.isValid(selectedBlock)) {
            builder.Text('invalid-typography', { text: 'Selected text is no longer valid' });
            return;
          }

          // Font Family Control
          let currentFontFamily = 'Arial';
          try {
            currentFontFamily = engine.block.getTextFontFamily(selectedBlock) || 'Arial';
          } catch (error) {
            console.warn('Could not get font family for text block:', error);
          }
          const fontFamilyState = state('selectedFontFamily', currentFontFamily);
          
          const availableFonts = [
            'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New',
            'Verdana', 'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS',
            'Palatino', 'Garamond', 'Bookman', 'Avant Garde', 'Tahoma'
          ];

          builder.Dropdown(`selected-font-family-${selectedBlock}`, {
            inputLabel: 'Font Family',
            value: fontFamilyState.value,
            options: availableFonts.map(font => ({ value: font, label: font })),
            setValue: (newFont) => {
              try {
                if (engine.block.isValid(selectedBlock)) {
                  engine.block.setTextFontFamily(selectedBlock, newFont);
                  fontFamilyState.setValue(newFont);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated font family to: ${newFont}`);
                }
              } catch (error) {
                console.error('Error updating font family:', error);
              }
            }
          });

          // Font Size Control
          let currentFontSize = 16;
          try {
            currentFontSize = engine.block.getTextFontSize(selectedBlock) || 16;
          } catch (error) {
            console.warn('Could not get font size for text block:', error);
          }
          const fontSizeState = state('selectedFontSize', currentFontSize);

          builder.NumberInput(`selected-font-size-${selectedBlock}`, {
            inputLabel: 'Font Size',
            value: fontSizeState.value,
            min: 8,
            max: 200,
            step: 1,
            setValue: (newSize) => {
              try {
                if (engine.block.isValid(selectedBlock)) {
                  engine.block.setTextFontSize(selectedBlock, newSize);
                  fontSizeState.setValue(newSize);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated font size to: ${newSize}px`);
                }
              } catch (error) {
                console.error('Error updating font size:', error);
              }
            }
          });

          // Font Weight Control
          let currentFontWeight = 400;
          try {
            currentFontWeight = engine.block.getTextFontWeight(selectedBlock) || 400;
          } catch (error) {
            console.warn('Could not get font weight for text block:', error);
          }
          const fontWeightState = state('selectedFontWeight', currentFontWeight);

          builder.Dropdown(`selected-font-weight-${selectedBlock}`, {
            inputLabel: 'Font Weight',
            value: fontWeightState.value.toString(),
            options: [
              { value: '300', label: 'Light (300)' },
              { value: '400', label: 'Normal (400)' },
              { value: '500', label: 'Medium (500)' },
              { value: '600', label: 'Semi Bold (600)' },
              { value: '700', label: 'Bold (700)' },
              { value: '800', label: 'Extra Bold (800)' },
              { value: '900', label: 'Black (900)' }
            ],
            setValue: (newWeight) => {
              try {
                const weightNumber = parseInt(newWeight);
                if (engine.block.isValid(selectedBlock)) {
                  engine.block.setTextFontWeight(selectedBlock, weightNumber);
                  fontWeightState.setValue(weightNumber);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated font weight to: ${weightNumber}`);
                }
              } catch (error) {
                console.error('Error updating font weight:', error);
              }
            }
          });

          // Text Alignment Control  
          let currentAlignment = 'left';
          try {
            currentAlignment = engine.block.getTextAlignment(selectedBlock) || 'left';
          } catch (error) {
            console.warn('Could not get text alignment for text block:', error);
          }
          const alignmentState = state('selectedTextAlignment', currentAlignment);

          builder.Dropdown(`selected-text-alignment-${selectedBlock}`, {
            inputLabel: 'Text Alignment',
            value: alignmentState.value,
            options: [
              { value: 'left', label: '← Left' },
              { value: 'center', label: '↔ Center' },
              { value: 'right', label: '→ Right' },
              { value: 'justify', label: '↔ Justify' }
            ],
            setValue: (newAlignment) => {
              try {
                if (engine.block.isValid(selectedBlock)) {
                  engine.block.setTextAlignment(selectedBlock, newAlignment);
                  alignmentState.setValue(newAlignment);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated text alignment to: ${newAlignment}`);
                }
              } catch (error) {
                console.error('Error updating text alignment:', error);
              }
            }
          });

          // Line Height Control
          let currentLineHeight = 1.2;
          try {
            currentLineHeight = engine.block.getLineHeight ? engine.block.getLineHeight(selectedBlock) : 1.2;
          } catch (error) {
            console.warn('Could not get line height for text block:', error);
          }
          const lineHeightState = state('selectedLineHeight', currentLineHeight);

          builder.NumberInput(`selected-line-height-${selectedBlock}`, {
            inputLabel: 'Line Height',
            value: lineHeightState.value,
            min: 0.5,
            max: 3,
            step: 0.1,
            setValue: (newLineHeight) => {
              try {
                if (engine.block.isValid(selectedBlock) && engine.block.setLineHeight) {
                  engine.block.setLineHeight(selectedBlock, newLineHeight);
                  lineHeightState.setValue(newLineHeight);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated line height to: ${newLineHeight}`);
                }
              } catch (error) {
                console.error('Error updating line height:', error);
              }
            }
          });
          
        } catch (error) {
          console.error('Error creating typography controls:', error);
          builder.Text('typography-error', { text: 'Error loading typography controls' });
        }
      }
    });
  }

  // Image editing for selected image block
  if (blockType === '//ly.img.ubq/graphic') {
    console.log(`🖼️ Creating image editor for selected graphic block`);
    
    builder.Section('simple-editor.selected-image', {
      title: 'Image Editing',
      children: () => {
        try {
          if (!engine.block.isValid(selectedBlock)) {
            builder.Text('invalid-image', { text: 'Selected element is no longer valid' });
            return;
          }

          // Check if this graphic supports fill (is an image)
          if (!engine.block.supportsFill(selectedBlock)) {
            builder.Text('not-image', { text: 'Selected element is not an editable image' });
            return;
          }

          const fillBlock = engine.block.getFill(selectedBlock);
          if (!fillBlock || !engine.block.isValid(fillBlock)) {
            // Try to create an image fill if none exists
            try {
              engine.block.setFillSolidColor(selectedBlock, { r: 0.9, g: 0.9, b: 0.9, a: 1 });
              engine.block.setString(engine.block.getFill(selectedBlock), 'fill/image/imageFileURI', '');
              builder.Text('no-image', { text: 'No image set. Use the replace button below to add an image.' });
            } catch (createError) {
              console.error('Error creating image fill:', createError);
              builder.Text('fill-error', { text: 'Cannot create image fill for this element' });
              return;
            }
          }

          // Get current image URI
          let uri = '';
          try {
            const validFillBlock = engine.block.getFill(selectedBlock);
            if (validFillBlock && engine.block.isValid(validFillBlock)) {
              const fillType = engine.block.getType(validFillBlock);
              if (fillType === '//ly.img.ubq/fill/image') {
                uri = engine.block.getSourceSet(validFillBlock, 'fill/image/sourceSet')?.[0]?.uri ??
                      engine.block.getString(validFillBlock, 'fill/image/imageFileURI') ?? '';
              }
            }
          } catch (uriError) {
            console.warn('Error getting image URI:', uriError);
            uri = '';
          }

          const uploadState = state(`selectedImageUpload-${selectedBlock}`, false);

          // Show current image preview (if available) and replace button
          builder.MediaPreview(`selectedImagePreview-${selectedBlock}`, {
            size: 'small',
            preview: {
              type: 'image',
              uri: uri || undefined // Don't show preview if no URI
            },
            action: {
              label: uri ? `Replace ${blockName}` : `Add Image to ${blockName}`,
              isLoading: uploadState.value,
              onClick: () => {
                uploadState.setValue(true);
                uploadFile({
                  supportedMimeTypes: ['image/*']
                }).then((files) => {
                  const [file] = files;
                  if (file != null) {
                    try {
                      const url = URL.createObjectURL(file);
                      const fillToChange = engine.block.getFill(selectedBlock);

                      if (!fillToChange || !engine.block.isValid(fillToChange)) {
                        throw new Error('Cannot get valid fill block');
                      }

                      // Clear existing image data
                      engine.block.setString(fillToChange, 'fill/image/imageFileURI', '');
                      engine.block.setSourceSet(fillToChange, 'fill/image/sourceSet', []);

                      // Add new image
                      engine.block
                        .addImageFileURIToSourceSet(fillToChange, 'fill/image/sourceSet', url)
                        .then(() => {
                          uploadState.setValue(false);
                          engine.editor.addUndoStep();
                          console.log(`✅ Successfully ${uri ? 'replaced' : 'added'} image for: "${blockName}"`);
                        })
                        .catch((addError) => {
                          console.error('Error adding image to source set:', addError);
                          uploadState.setValue(false);
                        });
                    } catch (replaceError) {
                      console.error('Error during image replacement:', replaceError);
                      uploadState.setValue(false);
                    }
                  } else {
                    uploadState.setValue(false);
                  }
                }).catch((uploadError) => {
                  console.error('Error during file upload:', uploadError);
                  uploadState.setValue(false);
                });
              }
            }
          });

          // Show "Use Brand Logo" button if brand logo is available
          if (window.brandLogo || window.editorBrandLogo) {
            const logoUrl = window.brandLogo || window.editorBrandLogo;
            const logoLoadingState = state(`brandLogoLoading-${selectedBlock}`, false);

            builder.Button(`use-brand-logo-${selectedBlock}`, {
              label: 'Use Brand Logo',
              isLoading: logoLoadingState.value,
              onClick: () => {
                try {
                  console.log('[BRAND LOGO] Applying brand logo:', logoUrl);
                  logoLoadingState.setValue(true);

                  const fillToChange = engine.block.getFill(selectedBlock);

                  if (!fillToChange || !engine.block.isValid(fillToChange)) {
                    throw new Error('Cannot get valid fill block');
                  }

                  // Clear existing image data
                  engine.block.setString(fillToChange, 'fill/image/imageFileURI', '');
                  engine.block.setSourceSet(fillToChange, 'fill/image/sourceSet', []);

                  // Add brand logo
                  engine.block
                    .addImageFileURIToSourceSet(fillToChange, 'fill/image/sourceSet', logoUrl)
                    .then(() => {
                      logoLoadingState.setValue(false);
                      engine.editor.addUndoStep();
                      console.log('[SUCCESS] Applied brand logo to:', blockName);
                    })
                    .catch((addError) => {
                      console.error('[ERROR] Adding brand logo to source set:', addError);
                      logoLoadingState.setValue(false);
                    });
                } catch (error) {
                  console.error('[ERROR] Applying brand logo:', error);
                  logoLoadingState.setValue(false);
                }
              }
            });

            // Show logo preview
            builder.Text('brand-logo-info', {
              text: 'Quick replace with your company logo',
              style: {
                fontSize: '0.75rem',
                color: '#718096',
                marginTop: '4px',
                fontStyle: 'italic'
              }
            });
          }

          // Add image properties if there's an image
          if (uri) {
            builder.Section('simple-editor.image-properties', {
              title: 'Image Properties',
              children: () => {
                try {
                  // Image opacity control
                  const fillBlock = engine.block.getFill(selectedBlock);
                  if (fillBlock && engine.block.isValid(fillBlock)) {
                    // Check if the fill block supports opacity
                    let currentOpacity = 1.0;
                    let supportsOpacity = false;
                    
                    try {
                      // Try to get opacity, but handle the case where it's not supported
                      currentOpacity = engine.block.getOpacity(fillBlock);
                      supportsOpacity = true;
                    } catch (opacityError) {
                      // Try to get it from the parent graphic block instead
                      try {
                        currentOpacity = engine.block.getOpacity(selectedBlock);
                        supportsOpacity = true;
                      } catch (parentOpacityError) {
                        // Block doesn't support opacity - this is expected for some block types
                        supportsOpacity = false;
                      }
                    }
                    
                    if (supportsOpacity) {
                      const opacityState = state(`selectedImageOpacity-${selectedBlock}`, currentOpacity || 1.0);

                      builder.NumberInput(`selected-image-opacity-${selectedBlock}`, {
                        inputLabel: 'Image Opacity',
                        value: opacityState.value,
                        min: 0,
                        max: 1,
                        step: 0.1,
                        setValue: (newOpacity) => {
                          try {
                            let opacitySet = false;
                            
                            // Try setting opacity on fill block first
                            if (engine.block.isValid(fillBlock)) {
                              try {
                                engine.block.setOpacity(fillBlock, newOpacity);
                                opacitySet = true;
                              } catch (fillOpacityError) {
                                console.warn('Could not set opacity on fill block:', fillOpacityError);
                              }
                            }
                            
                            // If that failed, try setting on parent graphic block
                            if (!opacitySet && engine.block.isValid(selectedBlock)) {
                              try {
                                engine.block.setOpacity(selectedBlock, newOpacity);
                                opacitySet = true;
                              } catch (parentOpacityError) {
                                console.warn('Could not set opacity on parent block:', parentOpacityError);
                              }
                            }
                            
                            if (opacitySet) {
                              opacityState.setValue(newOpacity);
                              engine.editor.addUndoStep();
                              console.log(`✅ Updated image opacity to: ${newOpacity}`);
                            } else {
                              console.warn('Could not update opacity on any block');
                            }
                          } catch (opacityError) {
                            console.error('Error updating image opacity:', opacityError);
                          }
                        }
                      });
                    } else {
                      builder.Text('opacity-not-supported', {
                        text: 'Opacity control not available for this image type'
                      });
                    }
                  }
                } catch (propertiesError) {
                  console.error('Error creating image properties:', propertiesError);
                  builder.Text('properties-error', {
                    text: 'Error loading image properties'
                  });
                }
              }
            });
          }

        } catch (error) {
          console.error('Error creating image editor:', error);
          builder.Text('image-error', { 
            text: `Error loading image editor: ${error.message}` 
          });
        }
      }
    });
  }

  // Color editing for elements with colors
  const elementColors = getColorsForBlock(engine, selectedBlock);
  if (elementColors.length > 0) {
    console.log(`🎨 Creating color editor for selected element with ${elementColors.length} colors`);
    
    builder.Section('simple-editor.selected-colors', {
      title: 'Element Colors',
      children: () => {
        elementColors.forEach((colorInfo, index) => {
          const colorState = state(`selectedColor-${selectedBlock}-${index}`, colorInfo.color);
          
          builder.ColorInput(`selectedColor-${selectedBlock}-${index}`, {
            inputLabel: `${colorInfo.type.charAt(0).toUpperCase() + colorInfo.type.slice(1)} Color`,
            value: colorState.value,
            setValue: (newValue) => {
              colorState.setValue(newValue);
              applyColorToBlock(engine, selectedBlock, colorInfo.type, newValue, colorInfo.initialOpacity);
              engine.editor.addUndoStep();
            }
          });
        });
      }
    });
  }
};

// Build overview sidebar when nothing is selected
const buildOverviewSidebar = (builder, engine, state, data) => {
  const { imageBlocks, editableImageBlocks, textBlocks, editableTextBlocks, colors } = data;
  
  console.log(`📋 Building overview sidebar`);

  // Instructions
  builder.Section('simple-editor.instructions', {
    title: 'How to Edit',
    children: () => {
      builder.Text('instructions-main', {
        text: 'Click on any text or image in the canvas to edit it directly'
      });
      builder.Text('instructions-sub', {
        text: 'Tip: Use the sections below to edit multiple elements at once'
      });
    }
  });

  // Page Background Controls
  builder.Section('simple-editor.page-background', {
    title: 'Page Background',
    children: () => {
      try {
        const pages = engine.block.findByType('page');
        if (pages.length === 0) {
          builder.Text('no-pages', { text: 'No pages found' });
          return;
        }

        const page = pages[0]; // Use first page
        
        // Check if page has a background fill
        let hasBackground = false;
        let currentBackgroundColor = { r: 1, g: 1, b: 1, a: 1 }; // Default white
        
        try {
          if (engine.block.supportsFill(page)) {
            const fill = engine.block.getFill(page);
            if (fill && engine.block.isValid(fill)) {
              const fillType = engine.block.getType(fill);
              if (fillType === '//ly.img.ubq/fill/color') {
                hasBackground = true;
                currentBackgroundColor = engine.block.getColor(fill, 'fill/color/value');
              }
            }
          }
        } catch (error) {
          console.warn('Error checking page background:', error);
        }

        // If no background fill, create one
        if (!hasBackground && engine.block.supportsFill(page)) {
          try {
            engine.block.setFillSolidColor(page, currentBackgroundColor);
            hasBackground = true;
            console.log('✅ Created page background fill');
          } catch (error) {
            console.warn('Error creating page background:', error);
          }
        }

        if (hasBackground) {
          const backgroundColorState = state('pageBackgroundColor', currentBackgroundColor);

          builder.ColorInput('page-background-color', {
            inputLabel: 'Background Color',
            value: backgroundColorState.value,
            setValue: (newColor) => {
              try {
                if (engine.block.isValid(page) && engine.block.supportsFill(page)) {
                  engine.block.setFillSolidColor(page, newColor);
                  backgroundColorState.setValue(newColor);
                  engine.editor.addUndoStep();
                  console.log(`✅ Updated page background color`);
                }
              } catch (error) {
                console.error('Error updating page background color:', error);
              }
            }
          });
        } else {
          builder.Text('no-background', { 
            text: 'Background color editing not available for this page' 
          });
        }
      } catch (error) {
        console.error('Error creating page background controls:', error);
        builder.Text('background-error', { text: 'Error loading background controls' });
      }
    }
  });

  // Quick overview of editable elements
  if (textBlocks.length > 0 || imageBlocks.length > 0) {
    builder.Section('simple-editor.overview', {
      title: 'Editable Elements',
      children: () => {
        if (textBlocks.length > 0) {
          builder.Text('text-overview', {
            text: `📝 ${textBlocks.length} text element${textBlocks.length > 1 ? 's' : ''} available`
          });
        }
        if (imageBlocks.length > 0) {
          builder.Text('image-overview', {
            text: `🖼️ ${imageBlocks.length} image element${imageBlocks.length > 1 ? 's' : ''} available`
          });
        }
        if (Object.keys(colors).length > 0) {
          builder.Text('color-overview', {
            text: `🎨 ${Object.keys(colors).length} color option${Object.keys(colors).length > 1 ? 's' : ''} available`
          });
        }
      }
    });
  }

  // Global theme colors section for bulk color changes
  if (Object.keys(colors).length > 0) {
    builder.Section('simple-editor.theme-colors', {
      title: 'Theme Colors',
      children: () => {
        try {
          builder.Text('theme-colors-info', {
            text: 'Change colors across multiple elements at once'
          });

          Object.entries(colors).forEach(([colorId, foundColors], index) => {
            const color = JSON.parse(colorId);
            const colorState = state(`themeColor-${colorId}`, color);
            
            // Count how many elements use this color
            const elementCount = foundColors.length;
            const elementTypes = [...new Set(foundColors.map(fc => fc.type))];
            
            let colorDescription = `Color ${index + 1}`;
            if (elementCount > 1) {
              colorDescription += ` (${elementCount} elements`;
              if (elementTypes.length > 1) {
                colorDescription += ` - ${elementTypes.join(', ')}`;
              }
              colorDescription += ')';
            }

            builder.ColorInput(`themeColor-${colorId}`, {
              inputLabel: colorDescription,
              value: colorState.value,
              setValue: (newValue) => {
                try {
                  colorState.setValue(newValue);
                  let updatedCount = 0;
                  
                  foundColors.forEach((foundColor) => {
                    try {
                      if (foundColor.type === 'fill') {
                        const fill = engine.block.getFill(foundColor.id);
                        if (fill && engine.block.isValid(fill)) {
                          engine.block.setColor(fill, 'fill/color/value', {
                            ...newValue,
                            a: foundColor.initialOpacity
                          });
                          updatedCount++;
                        }
                      } else if (foundColor.type === 'stroke') {
                        if (engine.block.isValid(foundColor.id)) {
                          engine.block.setStrokeColor(foundColor.id, {
                            ...newValue,
                            a: foundColor.initialOpacity
                          });
                          updatedCount++;
                        }
                      } else if (foundColor.type === 'text') {
                        if (engine.block.isValid(foundColor.id)) {
                          engine.block.setTextColor(foundColor.id, {
                            ...newValue,
                            a: foundColor.initialOpacity
                          });
                          updatedCount++;
                        }
                      }
                    } catch (elementError) {
                      console.warn(`Failed to update color for element ${foundColor.id}:`, elementError);
                    }
                  });
                  
                  if (updatedCount > 0) {
                    engine.editor.addUndoStep();
                    console.log(`✅ Updated theme color across ${updatedCount} elements`);
                  }
                } catch (colorError) {
                  console.error('Error updating theme color:', colorError);
                }
              }
            });
          });
        } catch (error) {
          console.error('Error creating theme colors section:', error);
          builder.Text('theme-colors-error', { 
            text: 'Error loading theme colors' 
          });
        }
      }
    });
  }

  // ===== BRAND COLOR OVERLAY CONTROLS =====
  // Show overlay controls if a brand overlay exists
  const allBlocks = engine.block.findAll();
  const brandOverlay = allBlocks.find(block => {
    try {
      return engine.block.getMetadata(block, 'isBrandOverlay') === 'true';
    } catch (e) {
      return false; // Block doesn't have this metadata
    }
  });

  if (brandOverlay && engine.block.isValid(brandOverlay)) {
    builder.Section('simple-editor.brand-overlay', {
      title: 'Brand Color Tint',
      children: () => {
        builder.Text('overlay-description', {
          text: 'Adjust the brand color overlay on your PSD template. Increase intensity for stronger brand color presence.',
          style: { fontSize: '0.875rem', color: '#718096', marginBottom: '12px' }
        });

        try {
          const fill = engine.block.getFill(brandOverlay);
          if (fill && engine.block.isValid(fill)) {
            const currentColor = engine.block.getColor(fill, 'fill/color/value');
            const currentOpacity = currentColor.a || 0.15;

            // Color picker for overlay
            const overlayColorState = state('overlay-color', currentColor);
            builder.ColorInput('overlay-tint-color', {
              inputLabel: 'Tint Color',
              value: overlayColorState.value,
              setValue: (newColor) => {
                engine.block.setFillSolidColor(brandOverlay, {
                  r: newColor.r,
                  g: newColor.g,
                  b: newColor.b,
                  a: currentOpacity  // Preserve current opacity
                });
                overlayColorState.setValue(newColor);
                engine.editor.addUndoStep();
              }
            });

            // Opacity slider
            const opacityState = state('overlay-opacity', currentOpacity);
            builder.Slider('overlay-intensity', {
              inputLabel: `Tint Intensity (${Math.round(opacityState.value * 100)}%)`,
              value: opacityState.value,
              min: 0,
              max: 0.5,  // Max 50% to prevent overwhelming the design
              step: 0.05,
              setValue: (newOpacity) => {
                const color = engine.block.getColor(fill, 'fill/color/value');
                engine.block.setFillSolidColor(brandOverlay, {
                  r: color.r,
                  g: color.g,
                  b: color.b,
                  a: newOpacity
                });
                opacityState.setValue(newOpacity);
                engine.editor.addUndoStep();
              }
            });

            // Reset button
            builder.Button('reset-overlay', {
              label: 'Reset to Original Brand Color',
              onClick: () => {
                const originalColor = engine.block.getMetadata(brandOverlay, 'originalColor');
                if (originalColor && typeof originalColor === 'string') {
                  const hex = originalColor.replace(/^#/, '').trim();
                  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
                    const r = parseInt(hex.substring(0, 2), 16) / 255;
                    const g = parseInt(hex.substring(2, 4), 16) / 255;
                    const b = parseInt(hex.substring(4, 6), 16) / 255;

                    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                      const resetColor = { r, g, b, a: 0.15 };
                      engine.block.setFillSolidColor(brandOverlay, resetColor);
                      overlayColorState.setValue(resetColor);
                      opacityState.setValue(0.15);
                      engine.editor.addUndoStep();
                      console.log('✅ Reset overlay to original brand color');
                    }
                  }
                }
              }
            });

            // Toggle visibility button
            const isVisible = engine.block.isVisible(brandOverlay);
            builder.Button('toggle-overlay-visibility', {
              label: isVisible ? 'Hide Brand Tint' : 'Show Brand Tint',
              onClick: () => {
                const currentVisibility = engine.block.isVisible(brandOverlay);
                engine.block.setVisible(brandOverlay, !currentVisibility);
                engine.editor.addUndoStep();
              }
            });
          }
        } catch (error) {
          console.warn('Error rendering overlay controls:', error);
          builder.Text('overlay-error', {
            text: 'Could not load overlay controls',
            style: { color: '#E53E3E' }
          });
        }
      }
    });
  }

  // Show all text blocks for editing if requested
  if (textBlocks.length > 0) {
    builder.Section('simple-editor.all-text', {
      title: '📝 Quick Text Editing',
      children: () => {
        editableTextBlocks.forEach(({ blocks, name }) => {
          const block = blocks[0];
          if (engine.block.isValid(block)) {
            const currentValue = engine.block.getString(block, 'text/text') || '';
            const textState = state(`overview-text-${block}`, currentValue);

            const setValue = (newValue) => {
              blocks.forEach((blockToUpdate) => {
                if (engine.block.isValid(blockToUpdate)) {
                  engine.block.replaceText(blockToUpdate, newValue);
                }
              });
              textState.setValue(newValue);
              engine.editor.addUndoStep();
            };

            builder.TextInput(`overview-text-input-${block}`, {
              inputLabel: name,
              value: textState.value,
              setValue,
              placeholder: 'Enter your text here...'
            });
          }
        });
      }
    });
  }
};

// Helper function to get colors for a specific block
const getColorsForBlock = (engine, blockId) => {
  const elementColors = [];

  try {
    // Check for fill color
    if (engine.block.supportsFill(blockId) && 
        engine.block.isValid(engine.block.getFill(blockId)) &&
        engine.block.getType(engine.block.getFill(blockId)) === '//ly.img.ubq/fill/color' &&
        engine.block.isFillEnabled(blockId)) {
      
      const fill = engine.block.getFill(blockId);
      const color = engine.block.getColor(fill, 'fill/color/value');
      if (isRGBAColor(color)) {
        elementColors.push({
          type: 'fill',
          color: { ...color, a: 1 },
          initialOpacity: color.a
        });
      }
    }

    // Check for stroke color
    if (engine.block.supportsStroke(blockId) && engine.block.isStrokeEnabled(blockId)) {
      const color = engine.block.getStrokeColor(blockId);
      if (isRGBAColor(color)) {
        elementColors.push({
          type: 'stroke',
          color: { ...color, a: 1 },
          initialOpacity: color.a
        });
      }
    }

    // Check for text color
    if (engine.block.getType(blockId) === '//ly.img.ubq/text') {
      const textColors = engine.block.getTextColors(blockId);
      if (textColors.length === 1 && isRGBAColor(textColors[0])) {
        const color = textColors[0];
        elementColors.push({
          type: 'text',
          color: { ...color, a: 1 },
          initialOpacity: color.a
        });
      }
    }
  } catch (error) {
    console.warn(`Error getting colors for block ${blockId}:`, error);
  }

  return elementColors;
};

// Helper function to apply color to a block
const applyColorToBlock = (engine, blockId, colorType, newColor, initialOpacity) => {
  try {
    const colorWithOpacity = { ...newColor, a: initialOpacity };
    
    if (colorType === 'fill') {
      const fill = engine.block.getFill(blockId);
      engine.block.setColor(fill, 'fill/color/value', colorWithOpacity);
    } else if (colorType === 'stroke') {
      engine.block.setStrokeColor(blockId, colorWithOpacity);
    } else if (colorType === 'text') {
      engine.block.setTextColor(blockId, colorWithOpacity);
    }
    
    console.log(`✅ Applied ${colorType} color to block ${blockId}`);
  } catch (error) {
    console.error(`Error applying ${colorType} color to block ${blockId}:`, error);
  }
};

export const uploadFile = (() => {
  let element;

  element = document.createElement('input');
  element.setAttribute('type', 'file');
  element.style.display = 'none';
  document.body.appendChild(element);

  return ({ supportedMimeTypes, multiple = false }) => {
    const accept = supportedMimeTypes.join(',');

    if (element == null) {
      return Promise.reject(new Error('No valid upload element created'));
    }

    return new Promise((resolve, reject) => {
      if (accept) {
        element.setAttribute('accept', accept);
      }
      if (multiple) {
        element.setAttribute('multiple', String(multiple));
      }

      element.onchange = (e) => {
        const target = e.target;
        if (target.files) {
          const files = Object.values(target.files);
          resolve(files);
        } else {
          reject(new Error('No files selected'));
        }
        element.onchange = null;
        element.value = '';
      };

      element.click();
    });
  };
})();