import { useState, useCallback } from 'react';

/**
 * Custom hook for managing multi-page canvas state in Fabric.js
 * Supports front/back postcard pages
 * @param {fabric.Canvas} canvas - Fabric canvas instance
 * @returns {Object} Page management functions and state
 */
export function useFabricPages(canvas) {
  const [pages, setPages] = useState({
    front: null,
    back: null
  });

  const [currentPage, setCurrentPage] = useState('front');
  const [isDoubleSided, setIsDoubleSided] = useState(false);

  /**
   * Save current page state to memory
   */
  const saveCurrentPage = useCallback(() => {
    if (!canvas) return null;

    try {
      const pageJSON = canvas.toJSON(['psdMetadata', 'name']);
      return pageJSON;
    } catch (err) {
      console.error('Error saving page:', err);
      return null;
    }
  }, [canvas]);

  /**
   * Load a page from JSON state
   * @param {Object} pageJSON - Fabric.js canvas JSON
   */
  const loadPageFromJSON = useCallback(async (pageJSON) => {
    if (!canvas || !pageJSON) return;

    try {
      // Clear canvas
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Load objects from JSON
      await new Promise((resolve, reject) => {
        canvas.loadFromJSON(pageJSON, () => {
          canvas.renderAll();
          canvas.requestRenderAll();
          resolve();
        }, (error) => {
          console.error('Error loading canvas from JSON:', error);
          reject(error);
        });
      });

      console.log('Page loaded successfully, objects:', canvas.getObjects().length);
    } catch (err) {
      console.error('Error loading page from JSON:', err);
    }
  }, [canvas]);

  /**
   * Switch to a different page (front/back)
   * @param {string} pageName - 'front' or 'back'
   */
  const switchToPage = useCallback(async (pageName) => {
    if (!canvas || pageName === currentPage) return;

    console.log(`Switching from ${currentPage} to ${pageName}`);

    // Save current page state
    const currentPageJSON = saveCurrentPage();
    if (currentPageJSON) {
      setPages(prev => ({
        ...prev,
        [currentPage]: currentPageJSON
      }));
    }

    // Load target page
    if (pages[pageName]) {
      await loadPageFromJSON(pages[pageName]);
    } else {
      // New page - clear canvas
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }

    setCurrentPage(pageName);
  }, [canvas, currentPage, pages, saveCurrentPage, loadPageFromJSON]);

  /**
   * Initialize pages from a template or saved state
   * @param {Object} template - Template configuration
   * @param {Object} savedState - Previously saved multi-page state
   */
  const initializePages = useCallback((template, savedState = null) => {
    const doubleSided = template?.sides === 2 || template?.isDoubleSided;
    setIsDoubleSided(doubleSided);

    if (savedState) {
      // Load from saved state
      setPages(savedState.pages || { front: null, back: null });
      setCurrentPage(savedState.currentPage || 'front');
    } else {
      // Fresh start
      setPages({ front: null, back: null });
      setCurrentPage('front');
    }
  }, []);

  /**
   * Get all pages as JSON for saving
   * @returns {Object} Complete multi-page state
   */
  const getAllPagesJSON = useCallback(() => {
    // Save current page first
    const currentPageJSON = saveCurrentPage();

    const allPages = {
      ...pages,
      [currentPage]: currentPageJSON
    };

    return {
      pages: allPages,
      currentPage,
      isDoubleSided
    };
  }, [pages, currentPage, isDoubleSided, saveCurrentPage]);

  /**
   * Export all pages as PNG images
   * @param {Object} options - Export options (multiplier, format, etc.)
   * @returns {Promise<Object>} Object with front and back PNG data URLs
   */
  const exportAllPages = useCallback(async (options = {}) => {
    if (!canvas) return null;

    const exports = {};
    const originalPage = currentPage;

    try {
      // Export front page
      if (pages.front || currentPage === 'front') {
        if (currentPage !== 'front') {
          await switchToPage('front');
        }
        exports.front = canvas.toDataURL({
          format: options.format || 'png',
          quality: options.quality || 1,
          multiplier: options.multiplier || 2
        });
      }

      // Export back page if double-sided
      if (isDoubleSided && (pages.back || currentPage === 'back')) {
        if (currentPage !== 'back') {
          await switchToPage('back');
        }
        exports.back = canvas.toDataURL({
          format: options.format || 'png',
          quality: options.quality || 1,
          multiplier: options.multiplier || 2
        });
      }

      // Return to original page
      if (currentPage !== originalPage) {
        await switchToPage(originalPage);
      }

      return exports;
    } catch (err) {
      console.error('Error exporting pages:', err);
      return null;
    }
  }, [canvas, pages, currentPage, isDoubleSided, switchToPage]);

  return {
    currentPage,
    isDoubleSided,
    pages,
    switchToPage,
    initializePages,
    getAllPagesJSON,
    saveCurrentPage,
    loadPageFromJSON,
    exportAllPages
  };
}

export default useFabricPages;
