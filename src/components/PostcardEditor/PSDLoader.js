import CreativeEngine from '@cesdk/engine';
import { PSDParser, addGoogleFontsAssetLibrary, createWebEncodeBufferToPNG } from '@imgly/psd-importer';

export class PSDLoader {
  // Cache for parsed PSDs to avoid re-parsing
  static psdCache = new Map();
  static maxCacheSize = 2; // Limit cache size for memory management
  
  static async loadPSDToScene(engine, psdPath, onProgress, template = null) {
    try {
      // Check cache first
      const cacheKey = psdPath;
      if (this.psdCache.has(cacheKey)) {
        onProgress?.({ stage: 'cached', message: 'Loading from cache...', progress: 100 });
        return await this.applyPSDFromCache(engine, cacheKey, onProgress, template);
      }
      
      // Notify progress
      onProgress?.({ stage: 'fetching', message: 'Loading PSD file...', progress: 0 });
      
      // Fetch the PSD file with progress tracking
      const psdBuffer = await this.fetchPSDBufferWithProgress(psdPath, onProgress);
      
      if (!psdBuffer) {
        throw new Error('Failed to load PSD buffer');
      }
      
      // Check file size and warn for large files
      const sizeMB = psdBuffer.byteLength / (1024 * 1024);
      if (sizeMB > 20) {
        onProgress?.({ 
          stage: 'warning', 
          message: `Large file detected (${sizeMB.toFixed(1)}MB). This may take a moment...`,
          progress: 50
        });
      }
      
      onProgress?.({ stage: 'processing', message: 'Processing PSD layers...', progress: 60 });
      
      // Process the PSD
      const result = await this.processPSDBuffer(engine, psdBuffer, onProgress, template);
      
      // Cache successful result if not too large
      if (result.success && sizeMB < 50) {
        this.addToCache(cacheKey, { buffer: psdBuffer, result, template });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error loading PSD:', error);
      
      // More detailed error messages
      let errorMessage = error.message;
      if (error.message.includes('memory')) {
        errorMessage = 'File too large. Please try a smaller PSD file.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Loading timeout. The file may be too complex.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  static async switchToSide(engine, template, side = 'front') {
    try {
      // Get all pages in the scene
      const pages = engine.scene.getPages();
      console.log(`Available pages: ${pages.length}, switching to: ${side}`);
      
      if (!template || !template.sides || template.sides === 1) {
        console.log('Single-sided template, no switching needed');
        return { success: true };
      }
      
      // Determine target page index
      let targetPageIndex;
      if (side === 'front') {
        targetPageIndex = template.frontPageIndex || 0;
      } else if (side === 'back') {
        targetPageIndex = template.backPageIndex || 1;
      } else {
        throw new Error(`Invalid side: ${side}`);
      }
      
      if (targetPageIndex >= pages.length) {
        throw new Error(`Page ${targetPageIndex} not found. Available pages: ${pages.length}`);
      }
      
      // Hide all pages first
      pages.forEach((page, index) => {
        try {
          if (engine.block.isValid(page)) {
            engine.block.setVisible(page, index === targetPageIndex);
          }
        } catch (error) {
          console.warn(`Error setting visibility for page ${index}:`, error);
        }
      });
      
      // Focus on the target page
      const targetPage = pages[targetPageIndex];
      if (engine.block.isValid(targetPage)) {
        try {
          await engine.scene.zoomToBlock(targetPage, 0.8);
        } catch (zoomError) {
          console.warn('Failed to zoom to page:', zoomError);
        }
      }
      
      console.log(`Successfully switched to ${side} side (page ${targetPageIndex})`);
      return { success: true, pageIndex: targetPageIndex };
      
    } catch (error) {
      console.error('Error switching sides:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static addToCache(key, data) {
    // Remove oldest entry if cache is full
    if (this.psdCache.size >= this.maxCacheSize) {
      const firstKey = this.psdCache.keys().next().value;
      this.psdCache.delete(firstKey);
    }
    this.psdCache.set(key, data);
  }
  
  static async applyPSDFromCache(engine, cacheKey, onProgress, template = null) {
    try {
      const cached = this.psdCache.get(cacheKey);
      onProgress?.({ stage: 'processing', message: 'Applying cached template...', progress: 80 });
      
      // Re-apply the cached result to the engine
      return await this.processPSDBuffer(engine, cached.buffer, onProgress, template || cached.template);
    } catch (error) {
      // If cache fails, remove it and return error
      this.psdCache.delete(cacheKey);
      throw error;
    }
  }
  
  static async loadPSDFromLocal(engine, file, onProgress) {
    try {
      onProgress?.({ stage: 'fetching', message: 'Reading file...' });
      
      const psdBuffer = await file.arrayBuffer();
      
      onProgress?.({ stage: 'processing', message: 'Processing PSD...' });
      
      return await this.processPSDBuffer(engine, psdBuffer, onProgress);
      
    } catch (error) {
      console.error('Error loading PSD:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async fetchPSDBuffer(psdPath) {
    // Keep this for backward compatibility
    return this.fetchPSDBufferWithProgress(psdPath);
  }
  
  static async fetchPSDBufferWithProgress(psdPath, onProgress) {
    console.log(`🔍 Fetching PSD from path: ${psdPath}`);
    
    // Check if it's a data URL
    if (psdPath.startsWith('data:')) {
      const base64Data = psdPath.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log(`📊 Data URL buffer size: ${bytes.buffer.byteLength} bytes`);
      return bytes.buffer;
    }
    
    // Regular HTTP fetch with progress tracking
    console.log(`🌐 Making HTTP request to: ${psdPath}`);
    const response = await fetch(psdPath);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PSD: ${response.status} ${response.statusText}`);
    }
    
    // Get total file size
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    
    console.log(`📏 Content-Length header: ${contentLength} (${total} bytes)`);
    console.log(`📏 Expected file size: ${(total / 1024 / 1024).toFixed(2)} MB`);
    
    // If we can't get content length, fall back to simple blob
    if (!contentLength || !response.body) {
      console.log(`⚠️ No content-length or body stream, using blob fallback`);
      const psdBlob = await response.blob();
      const buffer = await psdBlob.arrayBuffer();
      console.log(`📊 Blob buffer size: ${buffer.byteLength} bytes (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
      return buffer;
    }
    
    // Stream the response with progress tracking
    const reader = response.body.getReader();
    const chunks = [];
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        // Calculate progress (0-50% for download)
        const downloadProgress = Math.round((loaded / total) * 50);
        onProgress?.({
          stage: 'fetching',
          message: `Downloading... ${(loaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB`,
          progress: downloadProgress
        });
      }
      
      // Combine chunks into single ArrayBuffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      console.log(`🧩 Combining ${chunks.length} chunks, total length: ${totalLength} bytes (${(totalLength / 1024 / 1024).toFixed(2)} MB)`);
      
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log(`✅ PSD buffer created successfully: ${result.buffer.byteLength} bytes`);
      return result.buffer;
      
    } catch (error) {
      console.error('Error streaming PSD:', error);
      throw new Error('Failed to download PSD file');
    } finally {
      reader.releaseLock();
    }
  }
  
  static async processPSDBuffer(engine, psdBuffer, onProgress, template = null) {
    // Add early validation checks
    if (!engine || !engine.scene || !engine.block) {
      throw new Error('Engine is not properly initialized or has been disposed');
    }
    
    // Add additional engine validation
    try {
      // Test if engine is still valid by trying a simple operation
      engine.scene.get();
    } catch (error) {
      throw new Error('Engine has been disposed or is no longer valid');
    }
    
    console.log(`📦 PSD buffer loaded successfully: ${psdBuffer.byteLength} bytes (${(psdBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    
    // Validate buffer size and content
    if (psdBuffer.byteLength < 1000) {
      throw new Error(`PSD file appears to be corrupted or too small: ${psdBuffer.byteLength} bytes`);
    }
    
    // Check for PSD file signature
    const headerView = new Uint8Array(psdBuffer, 0, Math.min(4, psdBuffer.byteLength));
    const signature = String.fromCharCode(...headerView);
    console.log(`🔍 File signature: ${signature} (hex: ${Array.from(headerView).map(b => b.toString(16).padStart(2, '0')).join(' ')})`);
    
    if (signature !== '8BPS') {
      console.warn(`⚠️ Unexpected file signature: ${signature}. Expected '8BPS' for PSD files.`);
    }
    
    // Clear any existing scene content safely
    try {
      let scene = engine.scene.get();
      if (!scene) {
        console.log('No scene exists, creating one');
        scene = engine.scene.create();
        
        // Validate scene creation
        if (!scene || !engine.block.isValid(scene)) {
          throw new Error('Failed to create valid scene');
        }
      } else {
        // Check if engine is still valid before clearing pages
        if (!engine.block.isValid(scene)) {
          console.warn('Scene is no longer valid, creating new one');
          scene = engine.scene.create();
        } else {
          // Clear existing pages safely
          try {
            const existingPages = engine.scene.getPages();
            console.log('Existing pages:', existingPages.length);
            existingPages.forEach(page => {
              try {
                if (engine.block.isValid(page)) {
                  console.log('Destroying page:', page);
                  engine.block.destroy(page);
                }
              } catch (pageError) {
                console.warn(`Failed to destroy page ${page}:`, pageError);
              }
            });
          } catch (pagesError) {
            console.warn('Error getting pages:', pagesError);
          }
        }
      }
    } catch (err) {
      console.warn('Could not clear existing pages:', err);
      // Try to create a fresh scene
      try {
        const scene = engine.scene.create();
        if (!scene) {
          throw new Error('Failed to create scene after error');
        }
      } catch (createError) {
        throw new Error(`Engine appears to be disposed: ${createError.message}`);
      }
    }
    
    // Parse PSD file
    onProgress?.({ stage: 'parsing', message: 'Parsing PSD layers...', progress: 70 });
    console.log('Parsing PSD file...');
    
    await addGoogleFontsAssetLibrary(engine);
    
    let parser = null;
    try {
      // Check engine validity before parsing
      if (!engine || !engine.scene || !engine.block) {
        throw new Error('Engine became invalid during PSD processing');
      }
      
      // Add timeout for large files
      const parseTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PSD parsing timeout')), 120000); // 2 minute timeout
      });

      const parseOperation = async () => {
        parser = await PSDParser.fromFile(
          engine,
          psdBuffer,
          createWebEncodeBufferToPNG()
        );
        
        // Check if parser was created successfully
        if (!parser) {
          throw new Error('Failed to create PSD parser');
        }

        onProgress?.({ stage: 'parsing', message: 'Processing layers...', progress: 80 });
        return await parser.parse();
      };
      
      const result = await Promise.race([parseOperation(), parseTimeout]);
      
      // Validate engine is still available after parsing
      if (!engine || !engine.scene || !engine.block) {
        throw new Error('Engine was disposed during PSD parsing');
      }
      
      console.log('PSD parsed successfully');
      
      // Get the imported page with error handling
      let pages;
      try {
        pages = engine.scene.getPages();
      } catch (pagesError) {
        throw new Error(`Failed to get pages after parsing: ${pagesError.message}`);
      }
      
      console.log('Pages after PSD import:', pages.length);
      
      if (pages.length > 0) {
        // Handle multiple pages for double-sided templates
        console.log(`Processing ${pages.length} page(s) for template:`, template?.name || 'Unknown');
        
        // Show all pages initially, we'll handle visibility later
        pages.forEach((page, index) => {
          if (engine.block.isValid(page)) {
            console.log(`Setting up page ${index}:`, page);
            engine.block.setVisible(page, true);
          }
        });
        
        // Focus on the first page initially (front side)
        const primaryPage = pages[0];
        
        // Validate primary page is still valid
        if (!engine.block.isValid(primaryPage)) {
          throw new Error('Primary page is not valid');
        }
        
        console.log('Primary page ID:', primaryPage);
        
        try {
          // Ensure proper page dimensions for primary page
          const pageWidth = engine.block.getWidth(primaryPage);
          const pageHeight = engine.block.getHeight(primaryPage);
          console.log('Primary page dimensions:', pageWidth, 'x', pageHeight);
          
          // Process all pages to enable editing capabilities
          pages.forEach((page, pageIndex) => {
            if (!engine.block.isValid(page)) {
              console.warn(`Page ${pageIndex} is not valid, skipping`);
              return;
            }
            
            // Get all blocks in each page
            const children = engine.block.getChildren(page);
            console.log(`Page ${pageIndex} has ${children.length} children`);
            
            // Make all children visible with validation and enable editing capabilities
            children.forEach(child => {
              try {
                if (engine.block.isValid(child)) {
                  engine.block.setVisible(child, true);
                  
                  // Check if it's an image that can be replaced
                  const type = engine.block.getType(child);
                  if (type === '//ly.img.ubq/graphic') {
                    // Tag images for replacement functionality
                    engine.block.setMetadata(child, 'replaceableImage', 'true');
                    // Enable fill changes for image replacement
                    engine.block.setScopeEnabled(child, 'fill/change', true);
                    console.log(`✅ Enabled image editing for PSD graphic on page ${pageIndex}: ${engine.block.getName(child) || child}`);
                  } else if (type === '//ly.img.ubq/text') {
                    // Enable text editing for all text blocks
                    engine.block.setScopeEnabled(child, 'text/edit', true);
                    const textContent = engine.block.getString(child, 'text/text');
                    console.log(`✅ Enabled text editing for PSD text on page ${pageIndex}: "${engine.block.getName(child) || child}" - Content: "${textContent}"`);
                    
                    // Ensure text is selectable
                    engine.block.setScopeEnabled(child, 'editor/select', true);
                    // But disable moving/resizing
                    engine.block.setScopeEnabled(child, 'layer/move', false);
                    engine.block.setScopeEnabled(child, 'layer/resize', false);
                    engine.block.setScopeEnabled(child, 'layer/rotate', false);
                  }
                }
              } catch (childError) {
                console.warn(`Error processing child block ${child} on page ${pageIndex}:`, childError);
              }
            });
          });
          
          // Zoom to fit with error handling (focus on primary/front page)
          try {
            await engine.scene.zoomToBlock(primaryPage, 0.8);
          } catch (zoomError) {
            console.warn('Failed to zoom to primary page:', zoomError);
          }
          
          // For double-sided templates, initially show only the front page
          if (template && template.sides === 2) {
            console.log('Double-sided template detected, setting up page visibility');
            pages.forEach((page, index) => {
              const isFront = index === (template.frontPageIndex || 0);
              engine.block.setVisible(page, isFront);
            });
          }
          
          onProgress?.({ stage: 'complete', message: 'PSD loaded successfully!', progress: 100 });
        } catch (processingError) {
          throw new Error(`Error processing imported page: ${processingError.message}`);
        }
      } else {
        console.error('No pages found after PSD import!');
        throw new Error('No pages found after PSD import');
      }
      
      return {
        success: true,
        logger: result.logger,
        messages: result.logger.getMessages(),
        pageCount: pages.length,
        isDoubleSided: template && template.sides === 2
      };
      
    } catch (parsingError) {
      // Better error handling with context
      const errorMessage = parsingError.message || 'Unknown parsing error';
      console.error('PSD parsing failed:', errorMessage);
      throw new Error(`PSD parsing failed: ${errorMessage}`);
    } finally {
      // Clean up parser if needed
      try {
        if (parser) {
          parser = null;
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up parser:', cleanupError);
      }
    }
  }
}