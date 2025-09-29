import { PreviewGenerator } from './previewGenerator';
import { RealPreviewGenerator } from './realPreviewGenerator';

/**
 * Browser-based preview generation utility
 * Exposes preview generation functions to the browser console
 */

// Expose to window for browser console access
window.generatePreviews = async function(options = {}) {
  const {
    downloadPreviews = true,
    onProgress = (progress) => {
      console.log(`🎨 ${progress.current}/${progress.total}: ${progress.templateName} - ${progress.status}`);
      if (progress.error) {
        console.error(`   ❌ Error: ${progress.error}`);
      }
    }
  } = options;
  
  try {
    console.log('🚀 Starting preview generation...');
    console.log('This may take several minutes as PSD files are processed...');
    
    const results = await PreviewGenerator.generateAllPreviews({
      onProgress
    });
    
    // Download generated previews for manual saving
    if (downloadPreviews) {
      console.log('\n📥 Downloading preview files...');
      console.log('Save these files to public/template-previews/ directory:');
      
      for (const result of results) {
        if (result.success && result.blob) {
          const filename = result.previewPath.split('/').pop();
          console.log(`   - ${filename}`);
          
          // Add a delay between downloads to avoid browser blocking
          setTimeout(() => {
            PreviewGenerator.downloadPreview(result.blob, filename);
          }, results.indexOf(result) * 1000);
        }
      }
    }
    
    // Log summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n✅ Preview generation complete!`);
    console.log(`   - Successful: ${successful}`);
    console.log(`   - Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed templates:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.templateName}: ${result.error}`);
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Save the downloaded JPG files to public/template-previews/');
    console.log('2. Refresh the OnboardingStep2 to see real template previews');
    
    return results;
    
  } catch (error) {
    console.error('❌ Preview generation failed:', error);
    return null;
  }
};

// Test function for single template
window.generateSinglePreview = async function(templateId) {
  try {
    const response = await fetch('/templates.json');
    const templates = await response.json();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return null;
    }
    
    if (!template.psdFile) {
      console.error(`Template ${templateId} has no PSD file`);
      return null;
    }
    
    console.log(`🎨 Generating preview for: ${template.name}`);
    
    const result = await PreviewGenerator.generateSinglePreview(template);
    
    if (result) {
      console.log('✅ Preview generated successfully');
      
      // Download the preview
      const filename = template.psdFile.replace('.psd', '.jpg');
      PreviewGenerator.downloadPreview(result.blob, filename);
      
      return result;
    }
    
  } catch (error) {
    console.error('❌ Single preview generation failed:', error);
    return null;
  }
};

// Generate and save all PSD previews as JPG files
window.generateAndSaveAllPreviews = async function() {
  try {
    console.log('🚀 Starting comprehensive PSD-to-JPG conversion...');
    
    const result = await PreviewGenerator.generateAndSaveAllPreviews();
    
    console.log(`\n✅ PSD Preview Generation Complete!`);
    console.log(`   - Generated: ${result.generatedPreviews}/${result.totalTemplates} previews`);
    console.log(`   - Format: High-quality JPG from actual PSD files`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Save all downloaded JPG files to: public/template-previews/');
    console.log('2. Update public/templates.json to use .jpg extensions');
    console.log('3. Refresh OnboardingStep2 to see real PSD previews');
    
    console.log('\n📋 Updated Templates Configuration:');
    result.updatedTemplates.forEach(template => {
      if (template.psdFile) {
        console.log(`   - ${template.name}: ${template.preview}`);
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Comprehensive preview generation failed:', error);
    return null;
  }
};

// Initialize console helpers
console.log('🎨 Enhanced PSD Preview Generator loaded!');
console.log('Available functions:');
console.log('  - generatePreviews() - Generate template previews (legacy)');  
console.log('  - generateSinglePreview(templateId) - Generate single preview (legacy)');
console.log('  - generateAndSaveAllPreviews() - Generate previews (legacy method)');
console.log('  - generateRealPreviews() - 🆕 REAL PSD-to-JPG conversion');
console.log('');
console.log('🎯 RECOMMENDED: Use generateRealPreviews() for ACTUAL PSD conversion');
console.log('Example: generateRealPreviews()');
console.log('');
console.log('ℹ️  The Real Preview Generator loads actual PSD files and exports real images!');

export { PreviewGenerator };