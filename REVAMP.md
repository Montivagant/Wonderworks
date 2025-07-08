# WonderWorks Design System Revamp

## Color Palette & Design Tokens
- All colors use Tailwind theme tokens and custom CSS variables for primary, neutral, success, warning, and error states.
- Use only Tailwind classes, CSS variables (e.g. `text-[var(--primary-600)]`), or Tailwind arbitrary values (e.g. `rounded-[10px]`, `h-[42px]`) for all color, spacing, and border-radius.
- Never use hardcoded hex/rgb/rgba values or inline `style={{ ... }}` for static values.
- Dynamic heights/widths should use Tailwind arbitrary values (e.g. `h-[${value}%]`).
- All theme colors are defined as CSS variables in `globals.css` and mapped in `tailwind.config.js`.
- Example:
  ```css
  :root {
    --primary-500: #f27022;
    --neutral-700: #404040;
    --success-500: #22c55e;
    --warning-500: #f59e0b;
    --error-500: #ef4444;
  }
  ```

## Component Patterns
- All UI uses the provided UI kit: Button, Input, Card, Badge, etc.
- No inline or ad-hoc styles; all styles are via Tailwind and the design system.
- Example:
  ```tsx
  <Button variant="primary">Save</Button>
  <Input label="Product Name *" ... />
  <Badge variant="success">Active</Badge>
  ```

## Accessibility & Contrast
- All text uses high-contrast, semantic colors (`text-neutral-900`, `text-neutral-700`, etc.).
- All error messages use `text-error-600`.
- All forms have required field indicators and validation.
- No UI elements appear clickable unless they are actionable.
- All error states are clear and actionable.

## UI/UX Refactor
- Removed all redundant, legacy, and non-functional UI/components.
- All admin dashboard features use inline editing, validation, and actionable error states.
- Disabled product creation if no categories exist; category dropdown is empty if no categories.
- No avatar/profile picture UI in admin dashboard.

## Authentication & Security Revamp
- Prisma middleware ensures all user passwords are always hashed, even via Studio/scripts.
- Combined login/signup page with Google/Facebook social logins and unified error messages.

## Analytics & Counters
- All counters and analytics exclude archived/out-of-stock products for accuracy.

## Directory Usage
- All scripts/commands must be run from `D:\wonderworks\wonderworks`.

---
For implementation details, see `README.md`, `