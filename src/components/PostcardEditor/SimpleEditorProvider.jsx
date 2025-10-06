import CreativeEditorSDK from '@cesdk/cesdk-js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SimpleEditorPlugin } from './SimpleEditorPlugin';

const SimpleEditorContext = createContext(undefined);

export const SimpleEditorProvider = ({
  children,
  config,
  configure,
  containerRef,
  LoadingComponent = null
}) => {
  const [instance, setInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const instanceRef = useRef(null);
  const timeoutRef = useRef(null);
  const isConfiguring = useRef(false);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!containerRef?.current) {
      console.log('Container ref not available yet for Simple Editor');
      return;
    }

    mountedRef.current = true;
    let localInstance = null;

    const initializeEditor = async () => {
      try {
        if (!mountedRef.current) {
          console.log('Component unmounted, skipping initialization');
          return;
        }
        
        if (initializingRef.current) {
          console.log('Initialization already in progress, skipping');
          return;
        }
        
        initializingRef.current = true;
        console.log('Initializing Simple Editor...');
        
        // Ensure container has dimensions
        const containerRect = containerRef.current.getBoundingClientRect();
        console.log('Container dimensions:', containerRect.width, 'x', containerRect.height);
        
        if (containerRect.width === 0 || containerRect.height === 0) {
          console.warn('Container has no dimensions, waiting...');
          setTimeout(initializeEditor, 100);
          return;
        }
        
        // Set timeout for initialization
        timeoutRef.current = setTimeout(() => {
          setError('Simple Editor initialization timed out. Please refresh and try again.');
          setIsLoaded(false);
        }, 30000);

        // Get brand colors and logo from global state
        const brandColors = window.brandColors || {};
        const brandLogo = window.brandLogo || null;

        // Build color palette for CESDK
        const colorPalette = [];
        if (brandColors.primary) {
          colorPalette.push({
            id: 'brand-primary',
            name: 'Brand Primary',
            color: brandColors.primary
          });
        }
        if (brandColors.secondary) {
          colorPalette.push({
            id: 'brand-secondary',
            name: 'Brand Secondary',
            color: brandColors.secondary
          });
        }
        if (brandColors.palette && Array.isArray(brandColors.palette)) {
          brandColors.palette.forEach((color, index) => {
            const hexColor = typeof color === 'string' ? color : color.hex;
            if (hexColor) {
              colorPalette.push({
                id: `brand-color-${index}`,
                name: `Brand Color ${index + 1}`,
                color: hexColor
              });
            }
          });
        }

        console.log('[BRAND COLORS] Injecting brand colors into CESDK:', colorPalette);
        if (brandLogo) {
          console.log('[BRAND LOGO] Brand logo available for suggestions:', brandLogo);
        }

        const editorConfig = {
          license: 'LePTY688e8B3VoxIgNFWBLLbSijS9QJ-WRZQSFFJ9OiVl0z_Jsfu6PEQjMPL-yCX',
          userId: 'postcard-user',
          baseURL: '/cesdk-assets',
          role: 'Creator',
          theme: 'light',
          ui: {
            elements: {
              dock: {
                show: false // Hide dock for simple mode
              },
              navigation: {
                action: {
                  export: {
                    show: true,
                    format: ['image/png', 'application/pdf']
                  }
                }
              },
              view: {
                navigation: {
                  zoomToFit: true // Enable zoom to fit button
                }
              },
              // Add brand colors to the inspector panel
              inspector: {
                colorPalettes: colorPalette.length > 0 ? [
                  {
                    id: 'brand-colors',
                    name: 'Your Brand Colors',
                    colors: colorPalette.map(c => c.color)
                  }
                ] : undefined
              }
            },
            canvasActions: {
              zoom: true, // Enable zoom controls
              pan: true, // Enable pan controls
              wheel: true // Enable mouse wheel zoom
            }
          },
          callbacks: {
            onExport: 'download',
            onUpload: 'local'
          },
          ...config
        };

        localInstance = await CreativeEditorSDK.create(containerRef.current, editorConfig);
        instanceRef.current = localInstance;
        console.log('Simple Editor created successfully');

        if (!mountedRef.current) {
          localInstance.dispose();
          return;
        }

        // Add asset sources
        console.log('Adding asset sources...');
        await localInstance.addDefaultAssetSources();
        await localInstance.addDemoAssetSources({ sceneMode: 'Design' });
        console.log('Asset sources added');

        // Add the Simple Editor plugin
        console.log('Adding Simple Editor plugin...');
        await localInstance.addPlugin(SimpleEditorPlugin());
        console.log('Simple Editor plugin added');

        // Inject brand colors into the engine's color library
        if (colorPalette.length > 0) {
          try {
            console.log('[INJECT] Injecting brand colors into engine color library...');

            // Store brand colors in engine metadata for access by inspector
            const scene = localInstance.engine.scene.get();
            if (scene) {
              localInstance.engine.block.setMetadata(scene, 'brandColors', JSON.stringify(colorPalette));
              localInstance.engine.block.setMetadata(scene, 'brandColorsArray', JSON.stringify(colorPalette.map(c => c.color)));
            }

            // Make colors globally available for the plugin
            window.editorBrandColors = colorPalette;
            console.log('[SUCCESS] Brand colors injected successfully');
          } catch (err) {
            console.warn('Failed to inject brand colors:', err);
          }
        }

        // Inject brand logo for image replacement suggestions
        if (brandLogo) {
          try {
            console.log('[INJECT] Injecting brand logo for image suggestions...');
            const scene = localInstance.engine.scene.get();
            if (scene) {
              localInstance.engine.block.setMetadata(scene, 'brandLogo', brandLogo);
            }
            window.editorBrandLogo = brandLogo;
            console.log('[SUCCESS] Brand logo injected successfully');
          } catch (err) {
            console.warn('Failed to inject brand logo:', err);
          }
        }

        // Custom configuration
        if (configure && mountedRef.current) {
          console.log('Running custom configuration...');
          isConfiguring.current = true;
          try {
            await configure(localInstance);
            console.log('Custom configuration completed');
          } catch (configError) {
            console.error('Configuration failed:', configError);
          } finally {
            isConfiguring.current = false;
          }
        }

        // Clear timeout on successful initialization
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        setInstance(localInstance);
        setIsLoaded(true);
        setError(null);
        initializingRef.current = false;
        console.log('Simple Editor fully loaded');
      } catch (error) {
        console.error('Failed to initialize Simple Editor:', error);
        setError(error.message || 'Failed to initialize Simple Editor');
        setIsLoaded(false);
        initializingRef.current = false;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (localInstance) {
          try {
            localInstance.dispose();
          } catch (disposeError) {
            console.warn('Error disposing failed instance:', disposeError);
          }
        }
      }
    };

    initializeEditor();

    return () => {
      mountedRef.current = false;
      initializingRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (instanceRef.current && !isConfiguring.current) {
        try {
          if (typeof instanceRef.current.dispose === 'function') {
            instanceRef.current.dispose();
          }
        } catch (error) {
          console.warn('Error disposing editor:', error);
        }
        instanceRef.current = null;
      }
      setInstance(null);
      setIsLoaded(false);
      setError(null);
    };
  }, [containerRef]);

  if (error) {
    return (
      <div className="error-overlay professional">
        <div className="error-box">
          <div className="error-icon" style={{ fontSize: '48px', color: '#F56565' }}>!</div>
          <h3>Simple Editor Initialization Error</h3>
          <p>{error}</p>
          <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!instance || !isLoaded) {
    return LoadingComponent;
  }

  const value = {
    instance,
    engine: instance.engine,
    isLoaded
  };

  return (
    <SimpleEditorContext.Provider value={value}>
      {children || <div />}
    </SimpleEditorContext.Provider>
  );
};

export const useSimpleEditor = () => {
  const context = useContext(SimpleEditorContext);
  if (context === undefined) {
    throw new Error('useSimpleEditor must be used within a SimpleEditorProvider');
  }
  return context;
};