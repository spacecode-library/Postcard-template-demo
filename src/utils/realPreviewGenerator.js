import CreativeEditorSDK from '@cesdk/cesdk-js';

/**
 * Real PSD Preview Generator
 * Actually loads PSD files and generates preview images using IMG.LY SDK
 */
export class RealPreviewGenerator {
  
  /**
   * Generate real previews for all templates using actual PSD loading
   */
  static async generateAllRealPreviews() {
    try {
      console.log('🚀 Starting REAL PSD preview generation...');
      console.log('This will load actual PSD files and create real preview images.');
      
      // Load templates
      const response = await fetch('/templates.json');
      const templates = await response.json();
      
      const psdTemplates = templates.filter(t => t.available && t.psdFile);
      console.log(`📋 Found ${psdTemplates.length} PSD templates to process`);
      
      const results = [];
      
      for (let i = 0; i < psdTemplates.length; i++) {
        const template = psdTemplates[i];
        console.log(`\n📸 [${i + 1}/${psdTemplates.length}] Processing: ${template.name}`);
        
        try {
          const result = await this.generateSingleRealPreview(template);
          results.push({
            templateId: template.id,
            templateName: template.name,
            success: true,
            blob: result.blob,
            dataUrl: result.dataUrl,
            previewPath: `/template-previews/${template.psdFile.replace('.psd', '.jpg')}`
          });
          
          console.log(`✅ Generated preview for ${template.name}`);
          
        } catch (error) {
          console.error(`❌ Failed to generate preview for ${template.name}:`, error);
          results.push({
            templateId: template.id,
            templateName: template.name,
            success: false,
            error: error.message
          });
        }
        
        // Small delay between templates to avoid overwhelming the system
        if (i < psdTemplates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Download all successful previews
      console.log('\n📥 Downloading generated preview files...');
      let downloadCount = 0;
      
      for (const result of results) {
        if (result.success && result.blob) {
          const filename = result.previewPath.split('/').pop();
          
          // Add delay between downloads to prevent browser blocking
          setTimeout(() => {
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`📄 Downloaded: ${filename}`);
          }, downloadCount * 2000); // 2 second delay between downloads
          
          downloadCount++;
        }
      }
      
      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`\n✅ Real PSD Preview Generation Complete!`);
      console.log(`   - Successfully processed: ${successful}/${psdTemplates.length}`);
      console.log(`   - Failed: ${failed}`);
      console.log(`   - Files downloading: ${downloadCount}`);
      
      console.log(`\n🎯 Next Steps:`);
      console.log(`1. Save all downloaded JPG files to: public/template-previews/`);
      console.log(`2. Refresh the onboarding step 2 page`);
      console.log(`3. You should see real PSD content in the template previews!`);
      
      if (failed > 0) {
        console.log(`\n⚠️ Failed Templates:`);
        results.filter(r => !r.success).forEach(result => {
          console.log(`   - ${result.templateName}: ${result.error}`);
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Real preview generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate a real preview for a single template by loading the actual PSD
   */
  static async generateSingleRealPreview(template, options = {}) {
    const {
      width = 400,
      height = 300,
      quality = 0.9
    } = options;
    
    let editorContainer = null;
    let editorInstance = null;
    
    try {
      // Create temporary hidden container
      editorContainer = document.createElement('div');
      editorContainer.style.position = 'absolute';
      editorContainer.style.left = '-9999px';
      editorContainer.style.top = '-9999px';
      editorContainer.style.width = `${width * 2}px`; // Larger for better quality
      editorContainer.style.height = `${height * 2}px`;
      document.body.appendChild(editorContainer);
      
      console.log(`🔧 Setting up headless editor for ${template.name}...`);
      
      // Create editor instance
      const config = {
        license: 'LePTY688e8B3VoxIgNFWBLLbSijS9QJ-WRZQSFFJ9OiVl0z_Jsfu6PEQjMPL-yCX',
        userId: 'preview-generator',
        baseURL: '/cesdk-assets',
        role: 'Creator',
        theme: 'light',
        ui: {
          elements: {
            dock: { show: false },
            navigation: { show: false },
            panels: { show: false }
          }
        }
      };
      
      editorInstance = await CreativeEditorSDK.create(editorContainer, config);
      
      // Add default asset sources
      await editorInstance.addDefaultAssetSources();
      
      console.log(`📂 Loading PSD file: ${template.psdFile}...`);
      
      // Import PSD using the same method as the main editor
      const { PSDLoader } = await import('../components/PostcardEditor/PSDLoader');
      
      const psdPath = `/PSD-files/${template.psdFile}`;
      const loadResult = await PSDLoader.loadPSDToScene(
        editorInstance.engine,
        psdPath,
        (progress) => {
          console.log(`   📊 ${progress.stage}: ${progress.progress || 0}%`);
        },
        template
      );
      
      if (!loadResult.success) {
        throw new Error(`PSD loading failed: ${loadResult.error}`);
      }
      
      console.log(`✅ PSD loaded successfully, generating preview...`);
      
      // Get the first page for preview
      const pages = editorInstance.engine.scene.getPages();
      if (pages.length === 0) {
        throw new Error('No pages found after PSD import');
      }
      
      const primaryPage = pages[template.frontPageIndex || 0] || pages[0];
      
      // Ensure only the primary page is visible
      pages.forEach((page, index) => {
        if (editorInstance.engine.block.isValid(page)) {
          editorInstance.engine.block.setVisible(page, index === (template.frontPageIndex || 0));
        }
      });
      
      // Export as high-quality JPG
      console.log(`🖼️ Exporting preview image...`);
      
      const blob = await editorInstance.engine.block.export(primaryPage, 'image/jpeg', {
        quality: quality,
        exportDpi: 150, // Good balance of quality and file size
        targetWidth: width,
        targetHeight: height
      });
      
      if (!blob || blob.size === 0) {
        throw new Error('Export produced empty blob');
      }
      
      console.log(`📊 Preview exported: ${(blob.size / 1024).toFixed(1)}KB`);
      
      // Convert to data URL for immediate preview
      const dataUrl = await this.blobToDataUrl(blob);
      
      return {
        blob,
        dataUrl,
        width,
        height,
        fileSize: blob.size
      };
      
    } catch (error) {
      console.error(`Preview generation error for ${template.name}:`, error);
      throw error;
      
    } finally {
      // Clean up
      if (editorInstance) {
        try {
          editorInstance.dispose();
          console.log(`🧹 Editor disposed for ${template.name}`);
        } catch (disposeError) {
          console.warn('Error disposing editor:', disposeError);
        }
      }
      
      if (editorContainer && editorContainer.parentNode) {
        editorContainer.parentNode.removeChild(editorContainer);
      }
    }
  }
  
  /**
   * Convert blob to data URL for preview
   */
  static async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  window.RealPreviewGenerator = RealPreviewGenerator;
  window.generateRealPreviews = () => RealPreviewGenerator.generateAllRealPreviews();
  
  console.log('🎨 Real PSD Preview Generator loaded!');
  console.log('Use: generateRealPreviews() - Generate actual JPG previews from PSD files');
}