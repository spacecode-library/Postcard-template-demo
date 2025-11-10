import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for creating a resizable sidebar
 * Supports mouse and touch events with localStorage persistence
 *
 * @param {Object} options - Configuration options
 * @param {number} options.defaultWidth - Default sidebar width in pixels
 * @param {number} options.minWidth - Minimum allowed width
 * @param {number} options.maxWidth - Maximum allowed width
 * @param {string} options.storageKey - LocalStorage key for persisting width
 * @returns {Object} { sidebarWidth, resizeHandleProps }
 */
export function useResizableSidebar({
  defaultWidth = 200,
  minWidth = 150,
  maxWidth = 500,
  storageKey = 'sidebarWidth'
} = {}) {
  // Calculate viewport-aware maximum width (40% of window width)
  const getViewportMaxWidth = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportBasedMax = Math.floor(viewportWidth * 0.4); // 40% of viewport
    return Math.min(maxWidth, viewportBasedMax);
  }, [maxWidth]);

  // Load saved width from localStorage or use default
  const getInitialWidth = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        const currentMaxWidth = getViewportMaxWidth();
        // Validate saved value is within constraints AND viewport-aware
        if (parsed >= minWidth && parsed <= currentMaxWidth) {
          return parsed;
        }
        // If saved width is too large for current viewport, use max allowed
        if (parsed > currentMaxWidth) {
          return currentMaxWidth;
        }
      }
    } catch (error) {
      console.warn('Failed to load sidebar width from localStorage:', error);
    }
    return defaultWidth;
  };

  const [sidebarWidth, setSidebarWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);

  // Use refs to avoid stale closures in event listeners
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Check if mobile (disable resize on small screens)
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize - adjust sidebar if it's too wide for new viewport
  useEffect(() => {
    let resizeTimeout;

    const handleWindowResize = () => {
      // Debounce resize events to avoid excessive updates
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth < 768;
        setIsMobile(newIsMobile);

        // Only adjust on desktop/tablet (not mobile)
        if (!newIsMobile) {
          const currentMaxWidth = getViewportMaxWidth();

          // If current sidebar width exceeds viewport-based max, reduce it
          setSidebarWidth(prevWidth => {
            if (prevWidth > currentMaxWidth) {
              console.log(`Viewport resized: Adjusting sidebar from ${prevWidth}px to ${currentMaxWidth}px`);
              return currentMaxWidth;
            }
            return prevWidth;
          });
        }
      }, 150); // Debounce by 150ms
    };

    handleWindowResize(); // Check on mount
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [getViewportMaxWidth]);

  // Save width to localStorage (debounced on resize end)
  const saveWidth = useCallback((width) => {
    try {
      localStorage.setItem(storageKey, width.toString());
    } catch (error) {
      console.warn('Failed to save sidebar width to localStorage:', error);
    }
  }, [storageKey]);

  // Get x position from mouse or touch event
  const getEventX = useCallback((e) => {
    if (e.type.includes('mouse')) {
      return e.clientX;
    } else if (e.touches && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    return 0;
  }, []);

  // Handle resize start (mouse down or touch start)
  const handleResizeStart = useCallback((e) => {
    if (isMobile) return;

    e.preventDefault();

    const startX = getEventX(e);

    isResizingRef.current = true;
    startXRef.current = startX;
    startWidthRef.current = sidebarWidth;

    setIsResizing(true);

    // Set cursor and prevent text selection during resize
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [isMobile, getEventX, sidebarWidth]);

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!isResizingRef.current) return;

    e.preventDefault();

    const currentX = getEventX(e);
    const deltaX = currentX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;

    // Enforce min/max constraints with viewport-aware max
    const currentMaxWidth = getViewportMaxWidth();
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), currentMaxWidth);

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      setSidebarWidth(constrainedWidth);
    });
  }, [getEventX, minWidth, getViewportMaxWidth]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!isResizingRef.current) return;

    isResizingRef.current = false;
    setIsResizing(false);

    // Restore cursor and text selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Save the final width to localStorage
    saveWidth(sidebarWidth);
  }, [sidebarWidth, saveWidth]);

  // Set up event listeners for mouse/touch move and end
  useEffect(() => {
    if (!isResizing) return;

    // Mouse events
    const handleMouseMove = (e) => handleResizeMove(e);
    const handleMouseUp = () => handleResizeEnd();

    // Touch events
    const handleTouchMove = (e) => handleResizeMove(e);
    const handleTouchEnd = () => handleResizeEnd();

    // Add listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Props to spread on the resize handle element
  const resizeHandleProps = {
    onMouseDown: handleResizeStart,
    onTouchStart: handleResizeStart,
    style: {
      display: isMobile ? 'none' : 'block'
    }
  };

  return {
    sidebarWidth,
    resizeHandleProps,
    isResizing,
    isMobile
  };
}

export default useResizableSidebar;
