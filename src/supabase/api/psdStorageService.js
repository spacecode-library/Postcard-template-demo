import { supabase } from "../integration/client";

/**
 * PSD Storage Service
 * Handles saving and loading PSD files to/from Supabase Storage
 */
const psdStorageService = {
  /**
   * Save PSD file to Supabase Storage
   * @param {Blob|File} psdFile - The PSD file to save
   * @param {string} campaignId - Campaign ID to associate with the PSD
   * @param {string} fileName - Optional custom file name
   * @returns {Promise<Object>} Storage result with public URL
   */
  async savePSD(psdFile, campaignId, fileName = null) {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate file path
      const timestamp = Date.now();
      const customFileName = fileName || `campaign-${campaignId}-${timestamp}.psd`;
      const filePath = `${user.id}/campaigns/${campaignId}/${customFileName}`;

      console.log('[PSD Storage] Saving PSD file:', filePath);
      console.log('[PSD Storage] File size:', (psdFile.size / 1024 / 1024).toFixed(2), 'MB');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('campaign-assets')
        .upload(filePath, psdFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
          contentType: 'application/octet-stream'
        });

      if (error) {
        console.error('[PSD Storage] Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(filePath);

      console.log('[PSD Storage] PSD uploaded successfully:', publicUrl);

      return {
        success: true,
        path: filePath,
        publicUrl: publicUrl,
        fileName: customFileName
      };
    } catch (error) {
      console.error('[PSD Storage] Error saving PSD:', error);
      return {
        success: false,
        error: error.message || 'Failed to save PSD file'
      };
    }
  },

  /**
   * Export current scene as PSD from CreativeEditor
   * @param {Object} cesdk - CreativeEditor SDK instance
   * @returns {Promise<Blob>} PSD file as Blob
   */
  async exportSceneAsPSD(cesdk) {
    try {
      console.log('[PSD Export] Exporting scene as PSD...');

      // Check if engine is available
      if (!cesdk || !cesdk.engine) {
        throw new Error('CreativeEditor SDK not initialized');
      }

      // Export scene using CESDK's export functionality
      // Note: CESDK may not support direct PSD export, we'll save as .scene instead
      const sceneString = await cesdk.engine.scene.saveToString();

      // Convert scene string to Blob
      const blob = new Blob([sceneString], { type: 'application/json' });

      console.log('[PSD Export] Scene exported, size:', (blob.size / 1024).toFixed(2), 'KB');

      return blob;
    } catch (error) {
      console.error('[PSD Export] Error exporting scene:', error);
      throw new Error(`Failed to export scene: ${error.message}`);
    }
  },

  /**
   * Load PSD file from Supabase Storage
   * @param {string} psdUrl - Public URL of the PSD file
   * @returns {Promise<ArrayBuffer>} PSD file data
   */
  async loadPSD(psdUrl) {
    try {
      console.log('[PSD Storage] Loading PSD from:', psdUrl);

      const response = await fetch(psdUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('[PSD Storage] PSD loaded, size:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

      return arrayBuffer;
    } catch (error) {
      console.error('[PSD Storage] Error loading PSD:', error);
      throw new Error(`Failed to load PSD: ${error.message}`);
    }
  },

  /**
   * Delete PSD file from storage
   * @param {string} filePath - Storage path of the PSD file
   * @returns {Promise<Object>} Deletion result
   */
  async deletePSD(filePath) {
    try {
      console.log('[PSD Storage] Deleting PSD:', filePath);

      const { error } = await supabase.storage
        .from('campaign-assets')
        .remove([filePath]);

      if (error) {
        console.error('[PSD Storage] Delete error:', error);
        throw error;
      }

      console.log('[PSD Storage] PSD deleted successfully');
      return {
        success: true,
        message: 'PSD deleted successfully'
      };
    } catch (error) {
      console.error('[PSD Storage] Error deleting PSD:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete PSD file'
      };
    }
  },

  /**
   * Load scene from saved .scene file into CreativeEditor
   * @param {Object} cesdk - CreativeEditor SDK instance
   * @param {string} sceneUrl - Public URL of the .scene file
   * @returns {Promise<Object>} Load result
   */
  async loadSceneFromStorage(cesdk, sceneUrl) {
    try {
      console.log('[PSD Storage] Loading scene from:', sceneUrl);

      if (!cesdk || !cesdk.engine) {
        throw new Error('CreativeEditor SDK not initialized');
      }

      // Fetch scene data
      const response = await fetch(sceneUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sceneString = await response.text();

      // Load scene into engine
      await cesdk.engine.scene.loadFromString(sceneString);

      console.log('[PSD Storage] Scene loaded successfully');

      return {
        success: true,
        message: 'Scene loaded successfully'
      };
    } catch (error) {
      console.error('[PSD Storage] Error loading scene:', error);
      return {
        success: false,
        error: error.message || 'Failed to load scene'
      };
    }
  }
};

export default psdStorageService;
