// TODO: Update preview generator to use fabric.js instead of IMG.LY
// This preview generator was using IMG.LY's PSDLoader which has been removed
// For now, templates will use static preview images

export class PSDLoader {
  static async loadPSDToScene() {
    console.warn('PSDLoader.loadPSDToScene is deprecated - using fabric.js editor now');
    return { success: false, message: 'Preview generation disabled - using static previews' };
  }
}

export class PreviewGenerator {
  static async generatePreview() {
    console.warn('PreviewGenerator is deprecated - using static template previews');
    return null;
  }
}
