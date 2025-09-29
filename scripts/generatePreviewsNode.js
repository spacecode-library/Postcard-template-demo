#!/usr/bin/env node

/**
 * Node.js PSD Preview Generation Script
 * This script creates placeholder JPG files for templates until proper browser-based generation is completed
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a colored placeholder SVG that can serve as a temporary preview
function generatePlaceholderSVG(template) {
  const primaryColor = template.primaryColor || '#4A5568';
  const templateName = template.name;
  const features = template.features ? template.features.slice(0, 2).join(' • ') : 'Professional Design';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${primaryColor}CC;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad)" />
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Content area -->
  <rect x="40" y="60" width="320" height="180" rx="8" fill="rgba(255,255,255,0.9)" />
  
  <!-- Title -->
  <text x="200" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2D3748">
    ${templateName}
  </text>
  
  <!-- Features -->
  <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#4A5568">
    ${features}
  </text>
  
  <!-- File info -->
  <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#718096">
    PSD Template • ${template.editableElements ? template.editableElements.length : 'Multiple'} Elements
  </text>
  
  <!-- Status -->
  <text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="${primaryColor}">
    Ready for Editor
  </text>
  
  ${template.largeFileWarning ? `
  <!-- HD Badge -->
  <rect x="320" y="70" width="30" height="18" rx="3" fill="#20B2AA" />
  <text x="335" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white">HD</text>
  ` : ''}
  
  ${template.sides === 2 ? `
  <!-- Double-sided badge -->
  <rect x="280" y="70" width="35" height="18" rx="3" fill="#ed8936" />
  <text x="297.5" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="white">2-SIDED</text>
  ` : ''}
  
  <!-- Decorative elements -->
  <circle cx="80" cy="220" r="15" fill="rgba(255,255,255,0.3)" />
  <circle cx="320" cy="220" r="10" fill="rgba(255,255,255,0.2)" />
  <circle cx="120" cy="190" r="5" fill="rgba(255,255,255,0.4)" />
</svg>`;
}

// Convert SVG to a placeholder format (we'll create SVG files that browsers can display)
async function generatePlaceholderPreview(template, outputPath) {
  const svgContent = generatePlaceholderSVG(template);
  
  // For now, save as .svg but browsers will display them as images
  const svgPath = outputPath.replace('.jpg', '.svg');
  await fs.writeFile(svgPath, svgContent, 'utf8');
  
  console.log(`📸 Generated placeholder preview: ${path.basename(svgPath)}`);
  return svgPath;
}

async function generatePlaceholderPreviews() {
  try {
    console.log('🚀 Starting placeholder preview generation...');
    
    // Paths
    const templatesPath = path.join(__dirname, '..', 'public', 'templates.json');
    const previewsDir = path.join(__dirname, '..', 'public', 'template-previews');
    
    // Ensure template-previews directory exists
    await fs.mkdir(previewsDir, { recursive: true });
    console.log('📁 Template previews directory ready');
    
    // Load templates.json
    const templatesData = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(templatesData);
    
    console.log(`📋 Processing ${templates.length} templates...`);
    
    const results = [];
    
    for (const template of templates) {
      if (!template.psdFile || !template.available) {
        console.log(`⏭️ Skipping ${template.name} (no PSD file or not available)`);
        continue;
      }
      
      const previewFilename = template.psdFile.replace('.psd', '.svg'); // Using SVG for now
      const previewPath = path.join(previewsDir, previewFilename);
      
      try {
        await generatePlaceholderPreview(template, previewPath);
        results.push({
          templateId: template.id,
          templateName: template.name,
          success: true,
          previewPath: `/template-previews/${previewFilename}`
        });
      } catch (error) {
        console.error(`❌ Failed to generate preview for ${template.name}:`, error);
        results.push({
          templateId: template.id,
          templateName: template.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Update templates.json with new preview paths
    const updatedTemplates = templates.map(template => {
      const result = results.find(r => r.templateId === template.id);
      if (result && result.success) {
        return {
          ...template,
          preview: result.previewPath,
          hasPreview: true
        };
      }
      return template;
    });
    
    await fs.writeFile(
      templatesPath,
      JSON.stringify(updatedTemplates, null, 2),
      'utf8'
    );
    
    console.log('📝 Updated templates.json with preview paths');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n✅ Placeholder generation complete!`);
    console.log(`   - Successful: ${successful}`);
    console.log(`   - Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed templates:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.templateName}: ${result.error}`);
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. The OnboardingStep2 should now display placeholder template previews');
    console.log('2. For proper PSD previews, use the browser console: generatePreviews()');
    console.log('3. The IMG.LY editor will render the actual PSD content when selected');
    
  } catch (error) {
    console.error('❌ Placeholder generation failed:', error);
    process.exit(1);
  }
}

// Run the script
generatePlaceholderPreviews();