import CreativeEditorSDK from '@cesdk/cesdk-js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AdvancedEditorContext = createContext(undefined);

export const AdvancedEditorProvider = ({
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
      console.log('Container ref not available yet');
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
        console.log('Initializing Advanced Editor...');
        
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
          setError('Editor initialization timed out. Please refresh and try again.');
          setIsLoaded(false);
        }, 30000);

        const editorConfig = {
          license: import.meta.env.VITE_IMGLY_LICENSE,
          userId: 'postcard-user',
          baseURL: '/cesdk-assets',
          role: 'Creator',
          theme: 'light',
          ui: {
            elements: {
              dock: {
                show: true // Show dock for advanced mode
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
          },
          callbacks: {
            onExport: 'download',
            onUpload: 'local'
          },
          ...config
        };

        localInstance = await CreativeEditorSDK.create(containerRef.current, editorConfig);
        instanceRef.current = localInstance;
        console.log('Advanced Editor created successfully');

        if (!mountedRef.current) {
          localInstance.dispose();
          return;
        }

        // Add asset sources
        console.log('Adding asset sources...');
        await localInstance.addDefaultAssetSources();
        await localInstance.addDemoAssetSources({ sceneMode: 'Design' });
        console.log('Asset sources added');

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
        console.log('Advanced Editor fully loaded');
      } catch (error) {
        console.error('Failed to initialize advanced editor:', error);
        setError(error.message || 'Failed to initialize advanced editor');
        setIsLoaded(false);
        initializingRef.current = false;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (localInstance) {
          try {
            localInstance.dispose();
          } catch (disposeError) {
            console.warn('Error disposing failed advanced editor instance:', disposeError);
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
          console.warn('Error disposing advanced editor:', error);
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
          <div className="error-icon">⚠️</div>
          <h3>Editor Initialization Error</h3>
          <p>{error}</p>
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
    <AdvancedEditorContext.Provider value={value}>
      {children || <div />}
    </AdvancedEditorContext.Provider>
  );
};

export const useAdvancedEditor = () => {
  const context = useContext(AdvancedEditorContext);
  if (context === undefined) {
    throw new Error('useAdvancedEditor must be used within an AdvancedEditorProvider');
  }
  return context;
};