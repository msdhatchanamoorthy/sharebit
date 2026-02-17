# 🎨 Complete Layout Structure Reference

## Page Layout Architecture

```
┌─────────────────────────────────────────────────┐
│  📱 HEADER (Sticky)                             │
│  ┌──────────┐          ┌──────────────────────┐ │
│  │ 🍽️ Logo  │          │ Find  Share  Profile │ │
│  │ Moodify  │          │ Logout (if logged)  │ │
│  └──────────┘          └──────────────────────┘ │
│  [Border]                                       │
└─────────────────────────────────────────────────┘
│
│ 🎬 HERO SECTION (flex-grow)
│ ┌─────────────────────────────────────────────┐
│ │         Share Food, Spread Joy              │
│ │                                             │
│ │  🎉 Food Sharing Made Simple 🎉            │
│ │                                             │
│ │  Connect with your community. Share...      │
│ │                                             │
│ │ ┌──────────────┐  ┌──────────────────┐     │
│ │ │ Find Food    │  │ Share Your Food  │     │
│ │ │ Near You     │  │ (Secondary)      │     │
│ │ └──────────────┘  └──────────────────┘     │
│ └─────────────────────────────────────────────┘
│
│ 🌟 FEATURES SECTION
│ ┌──────────────┐  ┌──────────────┐  ┌───────────┐
│ │ 📍 Find Food │  │ 🔄 Easy      │  │ ❤️ Build  │
│ │ Nearby       │  │ Sharing      │  │ Community │
│ │              │  │              │  │           │
│ │ Discover food│  │ Post your... │  │ Connect.. │
│ │ within 5km   │  │              │  │           │
│ └──────────────┘  └──────────────┘  └───────────┘
│
│ 🔗 FOOTER (mt-auto = sticks to bottom)
│ ┌─────────────────────────────────────────────┐
│ │ © 2026 Moodify. All rights reserved.        │
│ └─────────────────────────────────────────────┘
└─────────────────────────────────────────────────┘
```

## CSS Flexbox Structure

### Main Container (Home Page)
```tsx
<div class="flex flex-col min-h-screen">
  {/* Header stays at top */}
  <header class="sticky top-0 z-40">...</header>
  
  {/* Main content grows to fill space */}
  <section class="flex-grow">
    {/* Hero content */}
  </section>
  
  {/* Features section */}
  <section>...</section>
  
  {/* Footer pushed to bottom */}
  <footer class="mt-auto">...</footer>
</div>
```

## Navbar Layout (Horizontal Flexbox)

```
┌──────────────────────────────────────────────────────┐
│ [Logo]  [Spacing]  [Nav Links]  [Buttons]  [Mobile] │
│  ↑                                                    ↑
│  justify-start                                    justify-end
└──────────────────────────────────────────────────────┘
```

**Desktop**: All items visible, flexbox spacing
**Mobile**: Logo + Mobile Menu Button only

## Typography Hierarchy

```
<h1> - Hero Title
├─ Font: Poppins Bold 48-64px
├─ Color: Gradient (brand-600 → warm-orange)
└─ Spacing: Max-width 48rem, centered

<h2> - Section Titles
├─ Font: Poppins Bold 28-36px
├─ Color: Gray-800
└─ Spacing: MB-6

<h3> - Card Titles
├─ Font: Poppins Bold 20px
├─ Color: Gray-800
└─ Spacing: MB-2

<p> - Body Text
├─ Font: Inter Regular 16px
├─ Color: Gray-600
└─ Line-height: 1.6
```

## Color Palette

```
Primary Gradient:
┌─ brand-600 (#DC6F39) → warm-orange (#FF9D3D) ─┐
│                                                  │
│ Used for: Headers, CTAs, Gradients             │
└──────────────────────────────────────────────────┘

Background:
├─ brand-50 (#FEF8F5)     - Lightest
├─ warm-cream (#FEF5F0)   - Cream tone
└─ brand-100 (#FDE6DB)    - Light peach

Accents:
├─ warm-peach (#FFD9B3)   - Highlights
├─ warm-coral (#FF6B4A)   - Error/urgent
└─ warm-brown (#8B4513)   - Secondary

Text:
├─ Gray-900 (#111827)     - Primary text
├─ Gray-700 (#374151)     - Secondary text
└─ Gray-600 (#4B5563)     - Tertiary text
```

## Spacing Reference

```
Hero Section Padding:  py-12 md:py-20
├─ Mobile: 48px vertical
└─ Desktop: 80px vertical

Container Padding:     px-4 sm:px-6 lg:px-8
├─ Mobile: 16px
├─ Tablet: 24px
└─ Desktop: 32px

Feature Cards Gap:     gap-8
├─ 32px between cards
└─ Responsive grid

Button Padding:        px-8 py-3
├─ Horizontal: 32px
└─ Vertical: 12px
```

## Responsive Breakpoints

```
Mobile          Tablet          Desktop         Wide
(< 640px)       (640px-1024px)  (1024px+)      (1280px+)

Hero:           
- 36px text     - 48px text     - 60px text    - 64px text
- 1 col         - 1 col         - 1 col        - 1 col

Features:
- Stacked       - Stacked       - 3 columns    - 3 columns
- 100% width    - 100% width    - 1/3 width    - 1/3 width

Nav:
- Menu icon     - Menu icon     - Full menu    - Full menu
- Mobile menu   - Mobile menu   - Horizontal   - Horizontal
```

## Animation Details

```
Transitions: 300ms cubic-bezier(0.4, 0, 0.2, 1)

Applied to:
├─ Hover effects (shadow, bg-color)
├─ Button states
├─ Link hovers
└─ Modal/menu animations

Keyframes:
├─ fadeIn     - 300ms opacity 0 → 1
├─ slideUp    - 300ms translateY(10px) → 0
└─ slideDown  - 300ms translateY(-10px) → 0
```

## Form Component Structure

```
FormField Component:
┌────────────────────────────────┐
│ Label (Required *)             │
├────────────────────────────────┤
│ [Input/Select/Textarea]        │
│ (suppressHydrationWarning)     │
├────────────────────────────────┤
│ ⚠️ Error message (if error)    │
└────────────────────────────────┘

Classes:
- Input: w-full px-4 py-2 rounded-lg border-2
- Focus: border-brand-500 focus:border-brand-500
- Error: border-red-300 focus:border-red-500
- transition-smooth on all
```

## Button Variants

```
Primary Button:
├─ Background: Gradient (brand-500 → warm-orange)
├─ Color: White
├─ Padding: px-8 py-3
├─ Border: None
└─ Hover: Shadow elevation

Secondary Button:
├─ Background: None
├─ Color: brand-600
├─ Padding: px-8 py-3
├─ Border: 2px brand-500
└─ Hover: bg-brand-50

Small Button:
├─ Padding: px-4 py-2
├─ Font-size: sm
└─ Rounded: lg
```

## Icon Integration

```
Icon + Text Layout:
┌─────────────────────────────────┐
│ [Icon] Text Label               │
│  ↑      ↑                        │
│  size-18  flex items-center gap-2
└─────────────────────────────────┘

Icon Only Layout:
┌────────────┐
│   [Icon]   │
│ bg-gradient│
│ rounded-lg │
│ shadow-md  │
└────────────┘
```

## Shadow & Depth

```
Shadow Elevation:
├─ shadow-sm   - Subtle (cards on hover)
├─ shadow-md   - Medium (default cards)
├─ shadow-lg   - Strong (buttons, focus)
└─ shadow-xl   - Deep (modals)

Border Styling:
├─ Default: border-brand-200/20
├─ Hover: border-brand-300/50
└─ Error: border-red-300
```

---

This complete layout structure ensures a professional, responsive, and visually appealing user experience! ✨
