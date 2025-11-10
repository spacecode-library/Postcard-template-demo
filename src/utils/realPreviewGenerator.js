// TODO: Update real preview generator to use fabric.js instead of IMG.LY
// This preview generator was using IMG.LY's PSDLoader which has been removed
// For now, templates will use static preview images

export class RealPreviewGenerator {
  static async generatePreview() {
    console.warn('RealPreviewGenerator is deprecated - using static template previews');
    return null;
  }

  static async initialize() {
    console.warn('RealPreviewGenerator.initialize is deprecated');
    return true;
  }
}
