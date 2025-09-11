# Onboarding Layout Fix Documentation

## Issues Fixed

1. **Footer placement inconsistency** - Footer was not properly positioned due to conflicting CSS files
2. **Multiple CSS imports** - Different onboarding steps were importing different CSS files causing conflicts
3. **Layout glitches** - Inconsistent spacing and layout across different screens

## Solution Implemented

### 1. Created Unified CSS (`onboarding-unified.css`)
- Single source of truth for all onboarding styles
- Proper footer positioning using absolute positioning within the main content area
- Consistent spacing and responsive breakpoints
- Handles both `footer-section` and `form-footer` classes

### 2. Updated OnboardingLayout Component
- Now imports only the unified CSS file
- All child components inherit styles from the layout

### 3. Removed Conflicting CSS Imports
- Removed CSS imports from all OnboardingStep components
- Styles are now centralized in the layout component

### 4. Standardized OnboardingFooter Component
- Uses consistent `footer-section` class
- Accepts optional className prop for customization
- Works with the unified CSS system

## Key CSS Structure

```css
/* Container Structure */
.onboarding-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.onboarding-sidebar {
  width: 280px; /* Fixed width */
  height: 100vh;
  overflow-y: auto; /* Allows scrolling if needed */
}

/* Main Area */
.onboarding-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Content Area */
.main-content {
  height: 100%;
  padding-bottom: calc(var(--footer-height) + padding);
  overflow-y: auto;
}

/* Footer - Always at bottom */
.footer-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--footer-height);
  z-index: 100;
}
```

## Responsive Behavior

### Desktop (>1024px)
- Sidebar: 280px width
- Footer: Full width with horizontal layout

### Tablet (768-1024px)
- Sidebar: 240px width
- Footer: Remains horizontal

### Mobile (<768px)
- Sidebar: Horizontal at top (80px height)
- Footer: Vertical layout with stacked buttons
- Main content adjusts height accordingly

## Using the System

### For New Onboarding Steps

```jsx
import React from 'react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';

const OnboardingStepX = () => {
  const steps = [...]; // Define your steps
  
  return (
    <OnboardingLayout steps={steps} currentStep={X}>
      <div className="main-content">
        {/* Your form content */}
        
        <OnboardingFooter
          message="Optional helper text"
          currentStep={X}
          totalSteps={6}
          onContinue={handleContinue}
          continueDisabled={!isValid}
        />
      </div>
    </OnboardingLayout>
  );
};
```

### Important Notes

1. **Do NOT import any CSS files** in individual step components
2. **Always wrap content** in `main-content` div
3. **Use OnboardingFooter component** for consistency
4. **Footer is absolutely positioned** - content won't flow under it

## Files to Keep

- `onboarding-unified.css` - Main styling file
- `OnboardingLayout.jsx` - Layout wrapper
- `OnboardingFooter.jsx` - Footer component
- `OnboardingSidebar.jsx` - Sidebar component

## Files That Can Be Removed

- `onboarding-flex.css` - Replaced by unified
- `onboarding-refined.css` - Replaced by unified
- Any other onboarding CSS variations

This ensures a consistent, maintainable onboarding experience across all steps.