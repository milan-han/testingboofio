# Boofed.io Global Style Guide

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout & Grid](#layout--grid)
6. [Components](#components)
7. [Animations](#animations)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Code Standards](#code-standards)

---

## Design Philosophy

Boofed.io embraces a **retro-futuristic aesthetic** inspired by classic arcade games and early gaming interfaces. The design principles are:

- **Sharp & Clean**: No rounded corners, clean rectangular shapes
- **High Contrast**: Bold colors against dark backgrounds
- **Pixel Perfect**: Crisp edges and precise positioning
- **Functional**: Every element serves a purpose
- **Consistent**: Unified visual language across all components

---

## Color Palette

### Primary Colors
```scss
// Background Colors
--color-bg: #050510;           // Main background - deep space blue
--color-panel-bg: #111418;     // Panel backgrounds - dark gray

// Accent Colors
--color-accent: #c62828;       // Primary red accent
--color-border: #666666;       // Standard borders - medium gray
```

### Player Colors
```scss
// Player 1 (Red Team)
--player1-color: #c62828;      // Primary red
--player1-accent: #ff5252;     // Light red accent

// Player 2 (Blue Team)
--player2-color: #2962ff;      // Primary blue
--player2-accent: #448aff;     // Light blue accent
```

### Semantic Colors
```scss
// UI States
--color-success: #4caf50;      // Green for success states
--color-warning: #ff9800;      // Orange for warnings
--color-error: #f44336;        // Red for errors
--color-info: #2196f3;         // Blue for information

// Text Colors
--color-text-primary: #ffffff;  // Primary text - white
--color-text-secondary: #cccccc; // Secondary text - light gray
--color-text-muted: #888888;    // Muted text - medium gray
```

### Component-Specific Colors
```scss
// Buttons
--btn-default-bg: #666666;
--btn-default-border: #333333;
--btn-hover-bg: #c62828;
--btn-active-bg: #555555;

// Panels
--panel-shadow: #333333;
--panel-highlight: rgba(255, 255, 255, 0.1);
```

---

## Typography

### Font Family
**Primary Font**: `'Press Start 2P', monospace`
- Used for all UI elements, buttons, and game text
- Maintains the retro arcade aesthetic
- Ensures pixel-perfect rendering

### Font Size Scale
```scss
// Base sizes (in pixels for pixel-perfect rendering)
--font-size-xs: 7px;     // Small labels, secondary text
--font-size-sm: 8px;     // Button text, form labels
--font-size-base: 10px;  // Default body text
--font-size-md: 12px;    // Panel titles, important text
--font-size-lg: 16px;    // Primary buttons, headings
--font-size-xl: 20px;    // Game titles, major headings
```

### Text Shadows
```scss
// Standard text shadows for depth
--text-shadow-default: 1px 1px 0px #000000;
--text-shadow-raised: 2px 2px 0px #ffffff;
--text-shadow-deep: 2px 2px 4px rgba(0, 0, 0, 0.5);
```

### Line Height
- **Default**: `1.4` - Optimal for readability with pixel fonts
- **Headings**: `1.2` - Tighter spacing for impact
- **UI Elements**: `1.0` - Compact for space efficiency

---

## Spacing System

### Spacing Scale
```scss
--space-0: 0;        // No spacing
--space-1: 0.25rem;  // 4px - Micro spacing
--space-2: 0.5rem;   // 8px - Small spacing
--space-3: 0.75rem;  // 12px - Medium spacing
--space-4: 1rem;     // 16px - Default spacing
--space-5: 1.5rem;   // 24px - Large spacing
--space-6: 2rem;     // 32px - Extra large spacing
--space-7: 3rem;     // 48px - Section spacing
--space-8: 4rem;     // 64px - Major section spacing
```

### Usage Guidelines
- **Micro spacing (4px)**: Inner component spacing, fine adjustments
- **Small spacing (8px)**: Form field spacing, button padding
- **Medium spacing (12px)**: Related element grouping
- **Default spacing (16px)**: Standard margin/padding
- **Large spacing (24px)**: Component separation
- **Section spacing (48px+)**: Major layout sections

---

## Layout & Grid

### Z-Index Scale
```scss
$z-indices: (
  "behind": -1,    // Background elements
  "base": 1,       // Default layer
  "ui": 100,       // UI components
  "overlay": 900,  // Overlays and modals
  "modal": 1000,   // Top-level modals
);
```

### Breakpoints
```scss
$bp-sm: 48rem;   // 768px - Small screens
$bp-md: 64rem;   // 1024px - Medium screens
$bp-lg: 80rem;   // 1280px - Large screens
```

### Grid System
- **Desktop**: 3-column layout (left sidebar, main content, right sidebar)
- **Tablet**: Stacked layout with responsive reflow
- **Mobile**: Single column with component reordering

---

## Components

### Buttons

#### Primary Button (.start-game-button)
```scss
// Large CTA button
background: #cccccc;
color: #000000;
border: 4px solid #666666;
padding: 15px 30px;
font-size: 16px;
box-shadow: 6px 6px 0px #333333;
text-shadow: 2px 2px 0px #ffffff;
```

#### Secondary Button (.action-btn)
```scss
// Standard action button
background: #666666;
color: #ffffff;
border: 2px solid #333333;
padding: 8px 12px;
font-size: 8px;
transition: all 0.2s;
```

#### Button States
- **Hover**: Background changes to accent color (`#c62828`)
- **Active**: Pressed effect with adjusted shadows
- **Disabled**: Reduced opacity and no pointer events

### Panels

#### Standard Panel
```scss
background: #111418;
border: 3px solid #444;
padding: 15px;
box-shadow: 4px 4px 0px #333333;
```

#### Panel Components
- **Panel Title**: 12px font, uppercase, `#ffffff` color
- **Panel Row**: 8px bottom margin, flex layout
- **Panel Label**: 8px font, `#cccccc` color

### Forms

#### Input Fields
```scss
background: #000;
color: #fff;
border: 2px solid #666666;
padding: 6px;
font-family: "Press Start 2P", monospace;
font-size: 8px;
```

#### Form Layout
- Labels above inputs
- 8px spacing between form elements
- Full-width inputs within containers

---

## Animations

### Timing Functions
```scss
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
```

### Duration Scale
```scss
--duration-fast: 0.1s;     // Micro interactions
--duration-normal: 0.2s;   // Standard transitions
--duration-slow: 0.3s;     // Complex animations
--duration-extra-slow: 0.5s; // State changes
```

### Common Animations
- **Pulse**: Gentle scale animation for attention
- **Hover**: Color transitions on interactive elements
- **Slide**: Panel and overlay entrances
- **Fade**: Opacity changes for state transitions

---

## Responsive Design

### Mobile-First Approach
- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly targets (minimum 44px)

### Responsive Patterns
- **Stacked Layout**: Vertical stacking on small screens
- **Collapsible Panels**: Accordion-style on mobile
- **Simplified Navigation**: Essential actions only
- **Readable Text**: Minimum 12px font size on mobile

---

## Accessibility

### Color Contrast
- **Text on Background**: Minimum 4.5:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio
- **Focus States**: 2px solid accent color outline

### Focus Management
- Visible focus indicators on all interactive elements
- Logical tab order through interface
- Skip navigation for screen readers

### Semantic HTML
- Proper heading hierarchy
- Form labels associated with inputs
- ARIA labels for complex interactions

---

## Code Standards

### CSS Architecture
```scss
// BEM Methodology
.component { }
.component__element { }
.component--modifier { }

// State Classes
.is-active { }
.is-hidden { }
.has-error { }
```

### File Organization
```
scss/
├── base/           # Reset, variables, typography
├── layout/         # Grid, z-index system
├── components/     # UI components
├── states/         # Visibility, transitions
└── utils/          # Mixins, helpers
```

### Naming Conventions
- **Components**: Descriptive, component-based names
- **States**: Verb-prefixed (is-, has-, can-)
- **Utilities**: Prefix with `u-` (u-text-center)
- **JavaScript Hooks**: Use `data-js` attributes

### Performance Guidelines
- Minimize CSS specificity
- Use CSS custom properties for theming
- Optimize for 60fps animations
- Minimize layout thrashing

---

## Usage Examples

### Creating a New Component
```scss
// 1. Create component file
// scss/components/_new-component.scss

.new-component {
  background: var(--color-panel-bg);
  border: 3px solid var(--color-border);
  padding: var(--space-4);
  
  &__title {
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  &--highlighted {
    border-color: var(--color-accent);
  }
}

// 2. Add to main.scss
@use "components/new-component";
```

### Using the Spacing System
```scss
// Good - Use spacing variables
margin-bottom: var(--space-4);
padding: var(--space-2) var(--space-4);

// Bad - Magic numbers
margin-bottom: 16px;
padding: 8px 16px;
```

### Responsive Design
```scss
.component {
  // Mobile first
  width: 100%;
  
  // Tablet and up
  @media (min-width: $bp-md) {
    width: 300px;
  }
}
```

---

## Maintenance

### Regular Reviews
- Monthly design system audit
- Component usage analysis
- Performance metrics review
- Accessibility compliance check

### Updates
- Version control for design changes
- Documentation updates with code changes
- Team communication for breaking changes
- Migration guides for major updates

---

This style guide is a living document that should be updated as the design system evolves. All team members should reference this guide when creating new components or modifying existing ones. 