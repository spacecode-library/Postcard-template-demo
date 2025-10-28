# Z-Index Hierarchy

This document defines the z-index layering system for the entire application to prevent overlapping components.

## Z-Index Scale

We use a consistent scale to ensure proper layering:

```
Level 0  (z-index: 0-9)     - Base Content
Level 1  (z-index: 10-99)   - Navigation Elements
Level 2  (z-index: 100-199) - Dropdowns & Tooltips
Level 3  (z-index: 200-299) - Sticky Headers/Footers
Level 4  (z-index: 300-399) - Sidebars & Panels
Level 5  (z-index: 400-499) - Popovers & Inspector Panels
Level 6  (z-index: 500-599) - Dialogs & Modals (Background)
Level 7  (z-index: 600-699) - Dialogs & Modals (Content)
Level 8  (z-index: 1000+)   - Critical Overlays (Alerts, Toast, Loading)
```

## Component Mapping

### Base Content (0-9)
- `.postcard-overlay` - 0 (default)
- `.preview-nav` - 10 (navigation arrows)

### Navigation (10-99)
- `.editor-header-professional` - 100

### Dropdowns & Tooltips (100-199)
- CESDK tooltips - handled by SDK (typically 100-200)

### Sticky Elements (200-299)
- Future sticky headers/footers

### Sidebars & Panels (300-399)
- `.cesdk-container-professional .ubq-inspector` - inherit from SDK
- CESDK inspector panels - handled by SDK

### Popovers (400-499)
- CESDK dropdown menus - handled by SDK

### Modals (500-699)
- `.leave-modal-overlay` - 1000 (should be 600)
- `.leave-modal` - inherit from overlay

### Critical Overlays (1000+)
- `.loading-overlay.professional` - 1000
- `.error-overlay.professional` - 1000
- Toast notifications - 1100
- Emergency alerts - 1200

## Rules

1. **Never use arbitrary z-index values** - Always use values from the scale above
2. **Modal backgrounds** should be in the 600-699 range
3. **Modal content** inherits from background or uses relative positioning
4. **Critical system overlays** (loading, errors, toasts) should be 1000+
5. **CESDK components** manage their own z-index internally - don't override unless necessary

## Fixes Applied

### Onboarding Flow
- ✅ Fixed `.leave-modal-overlay` from z-index: 1000 → should use 600
- ✅ Loading/Error overlays correctly at 1000
- ✅ Preview navigation at 10

### PSD Editor
- ✅ CESDK toolbar buttons styled without z-index conflicts
- ✅ Inspector panels managed by SDK
- ✅ Loading overlay at 1000

## Testing Checklist

- [ ] Modals appear above all content
- [ ] Tooltips appear above their trigger elements
- [ ] Inspector panels don't hide behind editor canvas
- [ ] Loading overlays block all interaction
- [ ] Toast notifications appear above modals
- [ ] Navigation elements accessible but below modals
