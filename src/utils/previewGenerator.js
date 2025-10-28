import CreativeEditorSDK from '@cesdk/cesdk-js';
import { PSDLoader } from '../components/PostcardEditor/PSDLoader';

/**
 * PSD Preview Generator Utility
 * Generates JPG preview images from PSD files for template selection
 */
export class PreviewGenerator {
  
  /**
   * Generate preview images for all PSD templates
   */
  static async generateAllPreviews(options = {}) {
    const {
      outputDir = '/template-previews',
      quality = 0.85,
      previewWidth = 400,
      previewHeight = 300,
      onProgress = null
    } = options;

    try {
      console.log('🎨 Starting PSD preview generation...');
      
      // Load templates configuration
      const response = await fetch('/templates.json');
      if (!response.ok) {
        throw new Error('Failed to load templates.json');
      }
      const templates = await response.json();
      
      console.log(`Found ${templates.length} templates to process`);
      
      const results = [];
      
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        
        if (!template.psdFile) {
          console.log(`⚠️ Skipping ${template.name} - no PSD file specified`);
          continue;
        }
        
        onProgress?.({
          current: i + 1,
          total: templates.length,
          templateName: template.name,
          status: 'processing'
        });
        
        try {
          console.log(`📸 Generating preview for: ${template.name}`);
          
          const result = await this.generateSinglePreview(template, {
            quality,
            previewWidth,
            previewHeight
          });
          
          results.push({
            templateId: template.id,
            templateName: template.name,
            success: true,
            previewPath: `${outputDir}/${template.psdFile.replace('.psd', '.jpg')}`,
            ...result
          });
          
          onProgress?.({
            current: i + 1,
            total: templates.length,
            templateName: template.name,
            status: 'success'
          });
          
        } catch (error) {
          console.error(`❌ Failed to generate preview for ${template.name}:`, error);
          
          results.push({
            templateId: template.id,
            templateName: template.name,
            success: false,
            error: error.message
          });
          
          onProgress?.({
            current: i + 1,
            total: templates.length,
            templateName: template.name,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      console.log(`✅ Preview generation complete: ${results.filter(r => r.success).length}/${results.length} successful`);
      return results;
      
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate preview for a single PSD template
   */
  static async generateSinglePreview(template, options = {}) {
    const {
      quality = 0.85,
      previewWidth = 400,
      previewHeight = 300
    } = options;

    let editorInstance = null;
    
    try {
      // Create headless editor instance
      editorInstance = await this.createHeadlessEditor();
      
      if (!editorInstance || !editorInstance.engine) {
        throw new Error('Failed to create editor instance');
      }
      
      // Load PSD file
      const psdPath = `/PSD-files/${template.psdFile}`;
      console.log(`📂 Loading PSD: ${psdPath}`);
      
      const loadResult = await PSDLoader.loadPSDToScene(
        editorInstance.engine,
        psdPath,
        (progress) => {
          console.log(`${template.id}: ${progress.message || progress.stage}`);
        },
        template
      );
      
      if (!loadResult.success) {
        throw new Error(`PSD loading failed: ${loadResult.error}`);
      }
      
      console.log(`✅ PSD loaded successfully for ${template.name}`);
      
      // Get the primary page for preview
      const pages = editorInstance.engine.scene.getPages();
      if (pages.length === 0) {
        throw new Error('No pages found after PSD loading');
      }
      
      // Use the front page (page 0 or specified frontPageIndex)
      const frontPageIndex = template.frontPageIndex || 0;
      const primaryPage = pages[frontPageIndex] || pages[0];
      
      console.log(`📄 Using page ${frontPageIndex} for preview`);
      
      // Ensure only the primary page is visible
      pages.forEach((page, index) => {
        if (editorInstance.engine.block.isValid(page)) {
          editorInstance.engine.block.setVisible(page, index === frontPageIndex);
        }
      });
      
      // Export as JPG
      console.log(`🖼️ Exporting preview for ${template.name}...`);
      
      const jpgBlob = await editorInstance.engine.block.export(
        primaryPage,
        'image/jpeg',
        {
          quality,
          exportDpi: 150, // Good quality for web previews
          maxWidth: previewWidth,
          maxHeight: previewHeight
        }
      );
      
      if (!jpgBlob || jpgBlob.size === 0) {
        throw new Error('Export produced empty blob');
      }
      
      console.log(`📊 Preview size: ${(jpgBlob.size / 1024).toFixed(1)}KB`);
      
      // Convert to data URL for immediate use
      const dataUrl = await this.blobToDataUrl(jpgBlob);
      
      return {
        blob: jpgBlob,
        dataUrl: dataUrl,
        width: previewWidth,
        height: previewHeight,
        fileSize: jpgBlob.size
      };
      
    } catch (error) {
      console.error(`❌ Preview generation failed for ${template.name}:`, error);
      throw error;
    } finally {
      // Clean up editor instance
      if (editorInstance) {
        try {
          editorInstance.dispose();
          console.log(`🧹 Editor disposed for ${template.name}`);
        } catch (disposeError) {
          console.warn('⚠️ Error disposing editor:', disposeError);
        }
      }
    }
  }
  
  /**
   * Create a headless CreativeEditor instance for preview generation
   */
  static async createHeadlessEditor() {
    // Create a temporary container element
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Hide off-screen
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    try {
      const editorConfig = {
        license: import.meta.env.VITE_IMGLY_LICENSE,
        userId: 'preview-generator',
        baseURL: '/cesdk-assets',
        role: 'Creator',
        theme: 'light',
        ui: {
          elements: {
            dock: { show: false },
            navigation: { show: false }
          }
        }
      };
      
      const instance = await CreativeEditorSDK.create(container, editorConfig);
      
      // Add required asset sources
      await instance.addDefaultAssetSources();
      
      // Store reference to container for cleanup
      instance._previewContainer = container;
      
      return instance;
      
    } catch (error) {
      // Clean up container if editor creation fails
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      throw error;
    }
  }
  
  /**
   * Generate real JPG previews from PSD files and save them to public directory
   */
  static async generateAndSaveAllPreviews() {
    try {
      console.log('🎨 Starting comprehensive PSD preview generation...');
      
      const results = await this.generateAllPreviews({
        onProgress: (progress) => {
          console.log(`🖼️ ${progress.current}/${progress.total}: ${progress.templateName} - ${progress.status}`);
          if (progress.error) {
            console.error(`   ❌ Error: ${progress.error}`);
          }
        }
      });
      
      console.log('📥 Processing generated previews...');
      
      // Create JPG files in the template-previews directory
      for (const result of results) {
        if (result.success && result.blob) {
          const filename = result.previewPath.split('/').pop().replace('.svg', '.jpg');
          
          // Create a download link and trigger it
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log(`📄 Generated: ${filename}`);
        }
      }
      
      // Update templates.json to use JPG files
      const templatesResponse = await fetch('/templates.json');
      const templates = await templatesResponse.json();
      
      const updatedTemplates = templates.map(template => {
        if (template.psdFile) {
          return {
            ...template,
            preview: `/template-previews/${template.psdFile.replace('.psd', '.jpg')}`
          };
        }
        return template;
      });
      
      console.log('📝 Updated templates configuration with JPG previews');
      console.log('⚠️ IMPORTANT: Save the downloaded JPG files to public/template-previews/');
      console.log('⚠️ IMPORTANT: Update public/templates.json with the new preview paths');
      
      return {
        success: true,
        generatedPreviews: results.filter(r => r.success).length,
        totalTemplates: results.length,
        updatedTemplates
      };
      
    } catch (error) {
      console.error('❌ Comprehensive preview generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Convert blob to data URL
   */
  static async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Download preview as file (for browser testing)
   */
  static downloadPreview(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}