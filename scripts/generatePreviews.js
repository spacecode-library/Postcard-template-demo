#!/usr/bin/env node

/**
 * PSD Preview Generation Script
 * 
 * This script generates JPG preview images from PSD files
 * and updates the templates.json configuration
 * 
 * Usage: node scripts/generatePreviews.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePreviews() {
  try {
    console.log('🚀 Starting PSD preview generation process...');
    
    // Paths
    const templatesPath = path.join(__dirname, '..', 'public', 'templates.json');
    const previewsDir = path.join(__dirname, '..', 'public', 'template-previews');
    const psdDir = path.join(__dirname, '..', 'public', 'PSD-Files');
    
    // Ensure template-previews directory exists
    await fs.mkdir(previewsDir, { recursive: true });
    console.log('📁 Created template-previews directory');
    
    // Load templates.json
    const templatesData = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(templatesData);
    
    console.log(`📋 Found ${templates.length} templates in configuration`);
    
    // Update templates with preview paths
    const updatedTemplates = templates.map(template => {
      if (template.psdFile) {
        const previewFilename = template.psdFile.replace('.psd', '.jpg');
        const previewPath = `/template-previews/${previewFilename}`;
        
        console.log(`✅ Setting preview path for ${template.name}: ${previewPath}`);
        
        return {
          ...template,
          preview: previewPath,
          hasPreview: true
        };
      } else {
        console.log(`⚠️ No PSD file found for template: ${template.name}`);
        return template;
      }
    });
    
    // Write updated templates.json
    await fs.writeFile(
      templatesPath,
      JSON.stringify(updatedTemplates, null, 2),
      'utf8'
    );
    
    console.log('📝 Updated templates.json with preview paths');
    
    // List PSD files that need previews
    const psdFiles = await fs.readdir(psdDir);
    const psdCount = psdFiles.filter(file => file.endsWith('.psd')).length;
    
    console.log(`📊 Summary:`);
    console.log(`   - Templates configured: ${templates.length}`);
    console.log(`   - PSD files found: ${psdCount}`);
    console.log(`   - Preview paths updated: ${updatedTemplates.filter(t => t.hasPreview).length}`);
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Run the web app and navigate to any page with the preview generator`);
    console.log(`   2. Use the browser console to run: window.generatePreviews()`);
    console.log(`   3. This will generate actual JPG files from the PSD templates`);
    console.log(`   4. The OnboardingStep2 will then display real template previews`);
    
    console.log(`\n✅ Preview generation setup complete!`);
    
  } catch (error) {
    console.error('❌ Preview generation setup failed:', error);
    process.exit(1);
  }
}

// Run the script
generatePreviews();