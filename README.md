# Postcard Frontend

A React-based frontend application for the Postcard marketing platform.

## Features

- User authentication (Sign up, Login)
- Comprehensive onboarding flow
  - Company URL entry with enrichment
  - Template selection
  - Company information setup
  - Template customization
  - Targeting and budget configuration
  - Campaign review
- Responsive design based on Figma specifications

## Prerequisites

- Node.js (v20.19+ or v22.12+)
- npm or yarn
- Backend API running on http://localhost:3000

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
VITE_API_URL=http://localhost:3000/api
```

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts (Auth)
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   └── onboarding/    # Onboarding flow
├── services/          # API services
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Authentication Flow

1. User signs up or logs in
2. If onboarding not completed, redirected to onboarding
3. After onboarding, user accesses dashboard

## Onboarding Steps

1. **URL Entry**: Enter business website URL
2. **Template Selection**: Choose postcard template
3. **Company Info**: Fill company details
4. **Template Editor**: Customize template with IMG.LY Editor
5. **Targeting & Budget**: Set audience and budget
6. **Review**: Confirm campaign settings

## PSD Template Requirements

### Overview
The application uses PSD (Photoshop Document) files as postcard templates. For optimal editing capabilities, designers must follow these guidelines:

### ⚠️ Critical Requirements

#### 1. **Use Vector Shapes, Not Rasterized Layers**
- **Background elements MUST be vector shapes** (Shape Layers in Photoshop)
- **DO NOT rasterize background layers** - rasterized layers become images that cannot have colors changed
- Use Photoshop's Shape Tools (Rectangle, Ellipse, Polygon, Custom Shape)
- Keep shapes as Smart Objects when possible

#### 2. **Layer Naming Conventions**
- Name background layers with "Background" or "background" in the layer name
- Use descriptive names for editable elements:
  - Text layers: "Company Name", "Offer", "Address", etc.
  - Image placeholders: "Logo", "Product Image", etc.
  - Decorative elements: "Accent Shape", "Border", etc.

#### 3. **Color Fill Types**
- Use **Solid Color fills** for shapes that should accept brand colors
- Avoid **Image fills** or **Pattern fills** on background shapes
- Use **Layer Styles** (Color Overlay, Gradient Overlay) sparingly

#### 4. **Text Layers**
- Keep text as **editable text layers**, NOT rasterized
- Use standard fonts or include font files
- Avoid text effects that require rasterization

### ✅ Best Practices

1. **Layer Organization**
   ```
   ├── Front Side
   │   ├── Background (Vector Shape)
   │   ├── Logo (Smart Object)
   │   ├── Company Name (Text Layer)
   │   ├── Offer Text (Text Layer)
   │   └── Accent Shapes (Vector Shape)
   └── Back Side
       ├── Background (Vector Shape)
       ├── Address Block (Text Layer)
       └── Contact Info (Text Layer)
   ```

2. **Double-Sided Templates**
   - Create separate layer groups for "Front" and "Back"
   - Name groups clearly: "Front Side", "Back Side"

3. **File Format**
   - Save as `.psd` format
   - Maximum file size: 50MB (recommended)
   - Resolution: 300 DPI
   - Dimensions: 1500px × 2100px (5" × 7" at 300 DPI)

### ❌ Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Rasterized background image | Vector shape with solid color fill |
| Flattened text | Editable text layer |
| Image fill on background | Solid color fill on vector shape |
| Unnamed layers ("Layer 1", "Shape 2") | Descriptive names ("Background", "Title Text") |
| Single merged layer | Organized layer groups |

### 🔍 How to Check Your Template

1. **Check for Rasterized Layers**
   - In Photoshop, select a layer
   - If the layer icon shows pixels (thumbnail), it's rasterized
   - If it shows a vector icon (shape with points), it's a vector

2. **Verify Fill Type**
   - Double-click a shape layer
   - Check "Fill" property in the Properties panel
   - Should be "Solid Color", not "Pattern" or "Image"

3. **Test Color Changes**
   - Try changing the fill color of your background shape
   - If you can't change it easily, it needs to be a vector shape

### 🎨 Brand Color Integration

When templates are loaded in the editor:
- The system automatically detects vector shapes in background layers
- Brand colors from the user's company profile are suggested as color options
- Users can apply brand colors to:
  - ✅ Vector shapes with solid color fills
  - ✅ Text elements
  - ✅ Brand overlay layers
  - ❌ Rasterized images
  - ❌ Locked layers

### 📝 Template Metadata

Include a `templates.json` entry for each PSD:
```json
{
  "id": "template-1",
  "name": "Modern Business",
  "psdFile": "modern-business.psd",
  "preview": "/template-previews/modern-business.png",
  "sides": 2,
  "available": true,
  "editableElements": ["Company Name", "Offer", "Address"],
  "features": ["Double-Sided", "Logo Placement", "Brand Colors"]
}
```

### 🛠️ Technical Details

The application uses IMG.LY Creative Engine SDK to:
- Load PSD files and parse layers
- Detect block types (text, image, graphic/shape)
- Enable/disable color application based on block type
- Inject brand colors into the color picker UI

**Block Type Detection:**
- `//ly.img.ubq/text` - Text blocks (editable)
- `//ly.img.ubq/image` - Image blocks (replaceable, not colorable)
- `//ly.img.ubq/graphic` - Shape blocks
  - With `fill/solid` - Colorable ✅
  - With `fill/image` - Not colorable ❌

### 📚 Resources

- [IMG.LY Creative Engine Documentation](https://img.ly/docs/cesdk/)
- [Photoshop Shape Layers Guide](https://helpx.adobe.com/photoshop/using/creating-shapes.html)
- [Vector vs Raster Graphics](https://www.adobe.com/creativecloud/file-types/image/comparison/raster-vs-vector.html)

---

## Editor Features

### Brand Color Integration
- Automatically loads brand colors from user's company profile
- Displays brand colors in color picker when editing text or shapes
- "Apply Brand Color" buttons for quick background color changes
- Detects rasterized layers and shows helpful warnings

### Template Editing
- **Simple Mode**: Streamlined editing interface
- **Advanced Mode**: Full IMG.LY editor with all features
- Zoom and pan controls
- Export to PNG and PDF formats