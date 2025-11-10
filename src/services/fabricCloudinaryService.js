import cloudinaryService from './cloudinaryService';

/**
 * Fabric.js Cloudinary Service
 * Handles saving and loading Fabric.js canvas designs to/from Cloudinary
 * Saves as JSON format (instead of IMG.LY's .scene format)
 */

const fabricCloudinaryService = {
  /**
   * Save complete fabric.js design to Cloudinary
   * Saves both the JSON state and PNG preview
   * @param {fabric.Canvas} canvas - Fabric canvas instance
   * @param {Object} pagesData - Multi-page data from useFabricPages hook
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Object>} Upload result with URLs
   */
  async saveFabricDesign(canvas, pagesData, campaignId) {
    try {
      console.log('[FabricCloudinary] Saving fabric.js design...');

      // 1. Export canvas JSON state (editable format)
      const designJSON = {
        version: '1.0',
        editor: 'fabric.js',
        timestamp: new Date().toISOString(),
        ...pagesData // Includes pages, currentPage, isDoubleSided
      };

      // Convert JSON to Blob
      const jsonString = JSON.stringify(designJSON, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      console.log('[FabricCloudinary] Design JSON size:', (jsonBlob.size / 1024).toFixed(2), 'KB');

      // 2. Export PNG preview (for display in dashboard)
      const previewDataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.95,
        multiplier: 2 // 2x resolution for crisp previews
      });

      // Convert data URL to Blob
      const previewBlob = await this.dataURLToBlob(previewDataURL);

      console.log('[FabricCloudinary] Preview PNG size:', (previewBlob.size / 1024).toFixed(2), 'KB');

      // 3. Upload both to Cloudinary
      const result = await cloudinaryService.uploadCampaignAssets(
        jsonBlob,      // Design JSON (raw file)
        previewBlob,   // Preview PNG (image)
        campaignId
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload to Cloudinary');
      }

      console.log('[FabricCloudinary] Design saved successfully');
      console.log('[FabricCloudinary] Design URL:', result.designUrl);
      console.log('[FabricCloudinary] Preview URL:', result.previewUrl);

      return {
        success: true,
        designUrl: result.designUrl,      // JSON file URL
        previewUrl: result.previewUrl,    // PNG preview URL
        psdPublicId: result.psdPublicId,  // JSON publicId (keeping name for compatibility)
        previewPublicId: result.previewPublicId
      };
    } catch (error) {
      console.error('[FabricCloudinary] Error saving design:', error);
      return {
        success: false,
        error: error.message || 'Failed to save design'
      };
    }
  },

  /**
   * Load fabric.js design from Cloudinary URL
   * @param {string} designUrl - Cloudinary URL to JSON file
   * @returns {Promise<Object>} Design data including pages
   */
  async loadFabricDesign(designUrl) {
    try {
      console.log('[FabricCloudinary] Loading design from:', designUrl);

      const response = await fetch(designUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch design: ${response.status} ${response.statusText}`);
      }

      const designData = await response.json();

      console.log('[FabricCloudinary] Design loaded successfully');
      console.log('[FabricCloudinary] Version:', designData.version);
      console.log('[FabricCloudinary] Editor:', designData.editor);
      console.log('[FabricCloudinary] Is double-sided:', designData.isDoubleSided);

      return {
        success: true,
        data: designData
      };
    } catch (error) {
      console.error('[FabricCloudinary] Error loading design:', error);
      return {
        success: false,
        error: error.message || 'Failed to load design'
      };
    }
  },

  /**
   * Convert data URL to Blob
   * @param {string} dataURL - Data URL from canvas.toDataURL()
   * @returns {Promise<Blob>} Blob object
   */
  async dataURLToBlob(dataURL) {
    return new Promise((resolve, reject) => {
      try {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        resolve(new Blob([u8arr], { type: mime }));
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Export single page as PNG
   * @param {fabric.Canvas} canvas - Fabric canvas instance
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} PNG blob
   */
  async exportPageAsPNG(canvas, options = {}) {
    try {
      const dataURL = canvas.toDataURL({
        format: options.format || 'png',
        quality: options.quality || 1,
        multiplier: options.multiplier || 2
      });

      return await this.dataURLToBlob(dataURL);
    } catch (error) {
      console.error('[FabricCloudinary] Error exporting PNG:', error);
      throw error;
    }
  },

  /**
   * Export all pages as PNG blobs
   * Useful for multi-page postcards (front/back)
   * @param {Object} pagesData - Multi-page data from useFabricPages
   * @param {fabric.Canvas} canvas - Fabric canvas instance
   * @param {Function} loadPageFn - Function to load page onto canvas
   * @returns {Promise<Object>} Object with front/back PNG blobs
   */
  async exportAllPagesAsPNG(pagesData, canvas, loadPageFn) {
    try {
      const exports = {};

      // Export front page
      if (pagesData.pages.front) {
        await loadPageFn(pagesData.pages.front);
        exports.frontBlob = await this.exportPageAsPNG(canvas);
      }

      // Export back page if exists
      if (pagesData.isDoubleSided && pagesData.pages.back) {
        await loadPageFn(pagesData.pages.back);
        exports.backBlob = await this.exportPageAsPNG(canvas);
      }

      return exports;
    } catch (error) {
      console.error('[FabricCloudinary] Error exporting all pages:', error);
      throw error;
    }
  },

  /**
   * Check if a design URL is a fabric.js design (vs IMG.LY .scene)
   * @param {string} url - Design URL
   * @returns {boolean} True if fabric.js JSON format
   */
  isFabricDesign(url) {
    if (!url) return false;

    // Fabric designs are JSON files
    // IMG.LY designs are .scene files
    return url.includes('.json') || url.includes('scene_') && url.includes('.json');
  },

  /**
   * Check if a design URL is an IMG.LY .scene file
   * @param {string} url - Design URL
   * @returns {boolean} True if IMG.LY .scene format
   */
  isIMGLYDesign(url) {
    if (!url) return false;
    return url.includes('.scene') || (url.includes('scene_') && !url.includes('.json'));
  }
};

export default fabricCloudinaryService;
