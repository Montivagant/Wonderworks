# WonderWorks Development Guide

## Design System & UI Kit
- Use the provided UI kit components (`Button`, `Input`, `Card`, `Badge`, etc.) for all UI.
- All styles are managed via Tailwind and the design system. No inline or ad-hoc styles.
- Use semantic, high-contrast colors for all text and UI elements.

### Example: Button
```tsx
<Button variant="primary">Save</Button>
<Button variant="outline">Cancel</Button>
```

### Example: Input
```tsx
<Input label="Product Name *" value={value} onChange={...} required error={error} />
```

## Validation & Error Handling
- All forms must have client-side validation for required fields and correct types.
- Show asterisk (*) for required fields.
- Show specific error messages for missing/invalid fields.
- Parse and display API error messages in toasts or inline errors.

### Example: Error Toast
```tsx
toast.error(errorData.details || errorData.message || 'Failed to save product');
```

## Accessibility
- All text uses `text-neutral-900`, `text-neutral-700`, or `text-neutral-500` for proper contrast.
- All error messages use `text-error-600`.
- No UI elements appear clickable unless they are actionable.

## Code Quality
- Use TypeScript for all code.
- Run lint checks regularly:
  ```bash
  npx eslint --ext .ts,.tsx src/
  ```
- Remove unused variables, imports, and types.
- Write clear, maintainable code and document complex logic.

## Troubleshooting
- **Failed to save product/category**: Check required fields and ensure at least one category exists.
- **Cannot delete category**: Reassign or delete products before deleting a category.
- **API errors**: Check browser console and server logs for details.
- **Prisma issues**: Run `npx prisma db push` and `npx prisma db seed` to sync and seed the database.

## Authentication & Security
- Prisma middleware automatically hashes all user passwords on create/update, even via Prisma Studio or scripts.
- Combined login/signup page with Google/Facebook social logins and unified error messages.

## Analytics & Counters
- All counters and analytics exclude archived/out-of-stock products for accuracy.

## Bulk Actions
- Use checkboxes and a "select all" option in admin tables to enable bulk actions (delete, update, etc.).
- Bulk actions are available for products, users, orders, and categories.

## Password Visibility Toggle
- Use an eye icon button to toggle password and password confirmation fields between text and password types.
- Example:
```tsx
<input type={showPassword ? 'text' : 'password'} ... />
<button onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff /> : <Eye />}</button>
```

## Modal Accessibility
- All modals (e.g., "no categories" in product creation) must have a clear exit/okay button and support closing with the ESC key.
- Use state to control modal visibility and add a keydown event listener for ESC.

## Directory Usage
- Always run scripts and commands from `