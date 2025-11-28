 Complete Color Standardization Plan for Doxxy Healthcare

 Current State Analysis

 Your application has a well-structured semantic color system but scattered hardcoded colors in marketing pages and some components. We found:

 - 142+ hardcoded color classes across 32+ files
 - Marketing pages using bg-blue-600, text-green-700, bg-gray-50 instead of semantic colors
 - Inline styles with hex colors in billing components
 - Component inconsistencies in chips and email templates

 Implementation Strategy

 Phase 1: Core Theme Enhancement

 1. Extend Semantic Color System - Add missing 50-900 scales for all semantic colors
 2. Create Medical Department Colors - Standardized colors for 14+ medical specialties
 3. Update Tailwind Configuration - Enhance with complete color scales

 Phase 2: Marketing Pages Migration

 1. Replace All Hardcoded Colors in /src/pages/(marketing)/:
   - bg-blue-600 → bg-primary
   - text-green-700 → text-success
   - bg-gray-50 → bg-muted
   - border-blue-200 → border-primary/20

 Phase 3: Component Standardization

 1. Fix Inline Styles - Replace hex colors in billing modal
 2. Standardize Chip Components - Use semantic colors for selected states
 3. Update Email Templates - Use theme colors instead of hardcoded values

 Phase 4: Healthcare-Specific Colors

 1. Medical Status System - Standard colors for active/pending/critical states
 2. Department Colors - Cardiology (red), Neurology (purple), Pediatrics (pink), etc.
 3. Accessibility Compliance - Ensure WCAG contrast ratios for all color combinations

 Phase 5: Documentation & Tooling

 1. Color Usage Guide - Complete documentation of semantic color system
 2. Component Examples - Standard patterns for buttons, cards, badges, alerts
 3. Linting Rules - Prevent future hardcoded color usage

 Key Benefits

 - Complete Consistency - All colors standardized across entire application
 - Easy Theme Modification - Change colors once, update everywhere
 - Healthcare Focus - Medical-specific color system preserved
 - Dark Mode Ready - Current dark mode support maintained
 - Type Safety - Full TypeScript integration

 Files to Modify

 - tailwind.config.ts (enhance color scales)
 - All marketing page files (migrate hardcoded colors)
 - Billing components (remove inline styles)
 - Chip components (standardize to semantic colors)
 - Email templates (update to theme colors)
 - Documentation files (create comprehensive guides)

 This plan will eliminate all hardcoded color usage and create a unified, maintainable color system for your healthcare application.