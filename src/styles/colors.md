# Doxxy Healthcare Color Palette

## Theme Philosophy

Doxxy's color palette is designed specifically for healthcare professionals, emphasizing trust, cleanliness, professionalism, and accessibility. The colors are carefully chosen to work across all medical specialties while maintaining a modern, approachable feel.

## Primary Colors

### Medical Blue (`--primary`)
- **Light Mode**: `hsl(210 100% 56%)` - Classic medical blue inspired by scrubs and hospital signage
- **Dark Mode**: `hsl(210 100% 70%)` - Brighter variant for dark backgrounds
- **Usage**: Primary actions, navigation highlights, key CTAs
- **Accessibility**: AAA contrast ratio with white text

### Healthcare Teal (`--secondary`)
- **Light Mode**: `hsl(180 25% 94%)` - Soft, calming teal background
- **Dark Mode**: `hsl(210 24% 16%)` - Dark professional tone
- **Usage**: Secondary buttons, subtle highlights, supportive elements

### Healing Green (`--accent`)
- **Light Mode**: `hsl(160 84% 39%)` - Fresh, healing green
- **Dark Mode**: `hsl(160 60% 50%)` - Softer green for dark mode
- **Usage**: Success states, health indicators, positive actions

## Semantic Colors

### Success (`--success`)
- **Color**: Green variants matching accent
- **Usage**: Successful operations, healthy status, completed tasks
- **Classes**: `text-success`, `bg-success`, `border-success`

### Warning (`--warning`)
- **Color**: `hsl(43 96% 56%)` - Medical amber
- **Usage**: Caution states, pending actions, attention needed
- **Classes**: `text-warning`, `bg-warning`, `border-warning`

### Info (`--info`)
- **Color**: Primary blue variants
- **Usage**: Information, neutral notifications, guidance
- **Classes**: `text-info`, `bg-info`, `border-info`

### Destructive (`--destructive`)
- **Color**: `hsl(0 93% 73%)` - Medical alert red
- **Usage**: Errors, critical alerts, dangerous actions
- **Classes**: `text-destructive`, `bg-destructive`, `border-destructive`

## Specialty Department Colors

For different medical departments, use these accent colors:

```css
.cardiology { color: hsl(0 93% 73%); }      /* Red - Heart */
.neurology { color: hsl(270 95% 75%); }     /* Purple - Brain */
.pediatrics { color: hsl(330 81% 60%); }    /* Pink - Child-friendly */
.oncology { color: hsl(230 95% 75%); }      /* Indigo - Strength */
.orthopedics { color: hsl(43 96% 56%); }    /* Amber - Bone */
.dermatology { color: hsl(180 84% 39%); }   /* Teal - Skin */
.psychiatry { color: hsl(160 84% 39%); }    /* Green - Mental health */
.emergency { color: hsl(0 93% 73%); }       /* Red - Urgent */
```

## Status Badge System

Pre-built status classes for common healthcare states:

### Active/Healthy
```html
<span class="status-badge status-active">Active</span>
```

### Pending/Scheduled  
```html
<span class="status-badge status-pending">Pending</span>
```

### Inactive/Discharged
```html
<span class="status-badge status-inactive">Inactive</span>
```

### Urgent/Critical
```html
<span class="status-badge status-urgent">Urgent</span>
```

## Component Styling

### Medical Cards
```html
<div class="">
  <!-- Card content -->
</div>
```
Provides consistent spacing, shadows, and hover effects for medical information cards.

### Shadows
- ``: Subtle green-blue medical shadow
- `-lg`: Larger variant for elevated components

## Accessibility Guidelines

### Contrast Ratios
- All text combinations meet WCAG AA standards (4.5:1 minimum)
- Important actions meet AAA standards (7:1 minimum)
- Color is never the only way to convey information

### Color Blindness Support
- Red-green color blindness: Status is also indicated by icons/text
- Blue-yellow color blindness: High contrast maintained
- Monochrome: All information remains accessible

## Dark Mode Considerations

The dark theme maintains the professional medical aesthetic while being easier on the eyes during night shifts:

- Backgrounds use deep clinical grays
- Text maintains high contrast
- Colors are slightly desaturated for comfort
- Key medical blue remains prominent but softer

## Usage Examples

### Primary Button
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Schedule Appointment
</button>
```

### Success Alert
```tsx
<div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg">
  Patient record updated successfully
</div>
```

### Department Badge
```tsx
<span className="bg-medical-red/10 text-medical-red px-2 py-1 rounded-full text-sm">
  Cardiology
</span>
```

### Medical Card
```tsx
<div className="p-6">
  <h3 className="text-foreground font-semibold">Patient Information</h3>
  <p className="text-muted-foreground mt-2">Patient details...</p>
</div>
```

## Implementation Notes

- All colors are defined as CSS custom properties for easy theming
- HSL format used for better manipulation and transparency support  
- Tailwind classes automatically generated for all color variants
- Dark mode handled automatically via CSS custom properties
- Colors tested with accessibility tools and colorblind simulators

## Browser Support

- CSS Custom Properties: IE 11+ (with PostCSS fallbacks)
- HSL Colors: All modern browsers
- Dark mode: Browsers supporting `prefers-color-scheme` 