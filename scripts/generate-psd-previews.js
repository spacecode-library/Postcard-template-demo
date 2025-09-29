#!/usr/bin/env node

/**
 * Server-side PSD Preview Generator
 * 
 * This script provides instructions for generating PSD previews.
 * Note: Actual PSD rendering requires browser environment with IMG.LY SDK.
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   PSD Preview Generation Guide                  ║
╚════════════════════════════════════════════════════════════════╝

📋 PSD preview generation requires the IMG.LY SDK which runs in a browser environment.

🎯 To generate preview images from your PSD files:

1. Browser-Based Generation (Recommended):
   ─────────────────────────────────────
   a) Start the dev server:
      $ npm run dev
   
   b) Open the preview generator page:
      http://localhost:5175/generate-previews.html
   
   c) Click "Generate All Previews" button
   
   d) Move downloaded JPGs to:
      /public/template-previews/

2. Console-Based Generation:
   ────────────────────────
   a) Start the dev server:
      $ npm run dev
   
   b) Open the main app:
      http://localhost:5175
   
   c) Open browser console (F12)
   
   d) Run: generateRealPreviews()
   
   e) Save downloaded files to:
      /public/template-previews/

📁 PSD Files Found:
`);

// Check for PSD files
const psdDir = path.join(__dirname, '..', 'public', 'PSD-files');
const templatePreviewDir = path.join(__dirname, '..', 'public', 'template-previews');

try {
    const psdFiles = fs.readdirSync(psdDir).filter(f => f.endsWith('.psd'));
    psdFiles.forEach((file, i) => {
        const expectedJpg = file.replace('.psd', '.jpg');
        const jpgExists = fs.existsSync(path.join(templatePreviewDir, expectedJpg));
        console.log(`   ${i + 1}. ${file} → ${expectedJpg} ${jpgExists ? '✅' : '❌ Missing'}`);
    });
    
    console.log(`\n📊 Status: ${psdFiles.length} PSD files found`);
    
    // Check existing previews
    const existingPreviews = fs.readdirSync(templatePreviewDir).filter(f => f.endsWith('.jpg'));
    console.log(`   ${existingPreviews.length} preview images exist`);
    
    if (existingPreviews.length < psdFiles.length) {
        console.log(`\n⚠️  ${psdFiles.length - existingPreviews.length} preview images need to be generated!`);
    } else if (existingPreviews.length === psdFiles.length) {
        console.log(`\n✅ All preview images exist!`);
    }
    
} catch (error) {
    console.error('Error checking files:', error.message);
}

console.log(`
💡 Why browser-based generation?
   • IMG.LY SDK requires DOM and Canvas APIs
   • PSD parsing needs browser-specific features
   • WebAssembly modules run in browser context

🎨 The preview generator will:
   • Load each PSD file (6-35MB)
   • Render at 400x300px resolution
   • Export as high-quality JPG
   • Preserve all layers and effects

Need help? Check the console logs in your browser for detailed progress.
`);

// Create template-previews directory if it doesn't exist
if (!fs.existsSync(templatePreviewDir)) {
    fs.mkdirSync(templatePreviewDir, { recursive: true });
    console.log('\n✅ Created template-previews directory');
}