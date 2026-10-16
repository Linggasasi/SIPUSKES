---
name: Puskesmas Integrated Clinical Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

### Personality & Purpose
The design system powers an integrated public healthcare ecosystem serving medical professionals, administrative staff, and patients across mobile and desktop environments. The personality is clinical, serene, highly accessible, and deeply reassuring. The interface balances high-density clinical data with patient-facing clarity, eliminating anxiety while maximizing operational speed.

### Target Audience
- **Healthcare Providers & Staff:** Doctors, nurses, triage officers, and pharmacists requiring rapid scanning, zero-friction data entry, and distinct status indicators.
- **Patients & Families:** Diverse demographics needing unequivocal booking, queue monitoring, and prescription clarity regardless of technical literacy.

### Design Movement
**Modern Clinical Ergonomics.** A disciplined synthesis of modern medical minimalism and functional tactile structure. Interfaces rely on structured tonal white-and-slate surfaces, high-contrast typography, and purposeful clinical color cues to differentiate medical statuses instantly.

## Colors

### Palette Philosophy
The palette pairs restorative emerald green with precise clinical medical blue. Emerald Green anchors primary workflows (confirmations, appointments, healthy metrics), while Medical Blue signals diagnostic pathways, specialized consultations, and technological infrastructure.

### Functional Roles
- **Primary Emerald (`#059669` / `#10b981`):** Core action buttons, validated vitals, active patient queue tokens, and primary brand cues.
- **Secondary Clinical Blue (`#0284c7` / `#0ea5e9`):** Diagnostic lab tags, doctor schedule filters, tele-consultation indicators, and secondary navigation.
- **Slate Neutrals:**
  - Base Background: `#f8fafc`
  - Card & Container Surface: `#ffffff`
  - Subtle Surface Alt: `#f1f5f9`
  - Borders & Dividers: `#e2e8f0`
  - Text Muted: `#64748b`
  - Text High-Contrast: `#0f172a`
- **Clinical Semantic Alerts:**
  - Emergency / Triage Critical: `#e11d48`
  - Observation / Warning: `#d97706`
  - Stable / Routine: `#059669`
  - Administrative / Info: `#0284c7`

## Typography

### Structural Decisions
`Plus Jakarta Sans` is selected across all roles. Its geometric balance provides high legibility at dense micro-scales (patient vital sheets, dosage schedules), while its friendly terminals soften the clinical clinical setting for patient interfaces.

### Hierarchy & Legibility Rules
- Numerical data (queue numbers, vital readings, dosage amounts) use tabular figure formatting (`tnum`) with semibold or bold weight.
- All body copy adheres strictly to minimum contrast ratios against surfaces (AAA standard for vital info, AA minimum for body narrative).
- Headings maintain tightened negative tracking (`-0.01em` to `-0.02em`) to maintain cohesion on wide clinical monitor displays.

## Layout & Spacing

### Layout Architecture
- **Desktop (1024px+):** 12-column responsive grid with `2rem` outer canvas padding and `1.5rem` gutters. Accommodates split clinical views: patient navigation sidebar, live consultation/record workspace, and quick-glance vitals/triage rail.
- **Tablet (768px - 1023px):** 8-column layout. The vitals rail collapses into contextual sheet drawers.
- **Mobile (< 768px):** 4-column layout with `1rem` margin and `0.75rem` gutter. Bottom tab navigation prioritizes queue monitoring, digital health card, and emergency booking.

### Spacing Cadence
Built on an 8pt base grid with an 4pt sub-unit:
- Micro spacing (`space-xs` = 4px, `space-sm` = 8px) controls label-to-input relations, badge internals, and dense metric rows.
- Macro spacing (`space-md` = 16px, `space-lg` = 24px, `space-xl` = 40px) controls card interiors, medical card grouping, and dashboard sectional breaks.

## Elevation & Depth

### Depth Model
The system uses a clinical layered plane model combining crisp hairline borders (`#e2e8f0`) with ultra-soft ambient occlusion shadows. This guarantees clean contrast under bright hospital lighting and low-glare tablet screens.

### Elevation Levels
- **Level 0 (Base Canvas):** `#f8fafc`. Flat background for high contrast against active content cards.
- **Level 1 (Card & Module Layer):** Pure white `#ffffff`, bordered by `1px solid #e2e8f0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Interactive Floating Elements & Dropdowns):** `#ffffff`, bordered by `1px solid #cbd5e1`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Dialogs & Critical Triage Overlays):** `#ffffff` with high diffusion shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. Accompanied by a 30% alpha slate backdrop overlay (`rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(4px)`).

## Shapes

### Geometry & Curvature
The system applies Level 2 (Rounded) geometry, conveying approachable, high-trust healthcare without sacrificing dense clinical structure.

- Standard buttons, form fields, and table cards: `0.5rem` (8px).
- Content cards, diagnostic sections, and patient summary containers: `1rem` (16px).
- Bottom sheets, modal dialogue containers, and active queue alert panels: `1.5rem` (24px).
- Badges, status chips, and avatar containers: Pill-shaped (`9999px`) for quick biological and status differentiation.

## Components

### Buttons
- **Primary Action (Emerald):** Background `#059669`, text `#ffffff`, border radius `0.5rem`, height 44px (touch friendly). Active/Hover state: `#047857`. Focus ring: 3px `#a7f3d0`.
- **Secondary Action (Medical Blue):** Background `#f0f9ff`, text `#0284c7`, border `1px solid #bae6fd`. Hover state: `#e0f2fe`.
- **Destructive / Emergency Action:** Background `#e11d48`, text `#ffffff`. Focus ring: 3px `#fecdd3`.

### Clinical Status Chips & Badges
- Constructed with pill geometry (`9999px`) and uppercase `label-sm` typography.
- **Normal / Selesai (Emerald):** Background `#ecfdf5`, text `#065f46`, border `1px solid #a7f3d0`.
- **Proses / Konsultasi (Medical Blue):** Background `#f0f9ff`, text `#0369a1`, border `1px solid #bae6fd`.
- **Menunggu / Antrean (Amber):** Background `#fffbeb`, text `#92400e`, border `1px solid #fde68a`.
- **Gawat Darurat / Triage Merah (Rose):** Background `#fff1f2`, text `#9f1239`, border `1px solid #fecdd3`.

### Input Fields & Controls
- Height: 44px minimum for comfortable tablet bedside operation.
- Base: White background, `1px solid #cbd5e1` outline, `0.5rem` radius, label styled in `label-md` with slate `#475569`.
- Active/Focus: Border transitions to `#059669` with `box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15)`.
- Checkboxes & Radios: Sized 20x20px with crisp `#059669` fill when checked, providing unequivocal tactile confirmation of medical checkboxes.

### Cards & Clinical Panels
- Built on `Level 1` surface elevation with `1rem` radius.
- Includes a subtle top or left border accent (3px) in Emerald or Medical Blue for prioritized queue items, vital sign abnormal warnings, or active doctor consultation states.

### Specialized Healthcare Components
- **Queue Number Token:** Large high-contrast display (`display` size), centered inside a soft tinted green container (`#ecfdf5`) with bold queue designation (e.g., `A-042`) and department sub-label.
- **Vital Sign Micro-Card:** Compact card showing measurement label (e.g., `Tekanan Darah`), large tabular numeric value (`120/80`), unit (`mmHg`), and a colored dot marker denoting clinical status.