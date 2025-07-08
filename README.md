# WonderWorks

## Overview
WonderWorks is a modern, accessible e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Prisma. It features a robust admin dashboard for managing products, categories, users, and orders, with a focus on clean design, accessibility, and maintainability.

## Features
- **Admin Dashboard**: Manage products, categories, users, and orders with inline editing, validation, actionable error states, and bulk actions (select multiple items for delete, update, etc.).
- **Prisma Integration**: All data is managed via Prisma ORM, with a clear schema and seed data for development.
- **Robust Error Handling**: All actions (create, update, delete) provide specific, actionable feedback. API and database errors are surfaced to the user.
- **Validation**: All forms have client-side validation, required field indicators, and clear error messages.
- **Accessibility & Contrast**: All UI uses high-contrast, semantic colors and accessible patterns. No unreadable text or low-contrast elements.
- **Design System**: Consistent use of a UI kit (Button, Input, Card, Badge, etc.) and Tailwind-based design tokens.
- **No Redundant UI**: All non-functional or placeholder UI has been removed. Only working features are visible.
- **No Inline Styling**: All styles are managed via Tailwind and the design system.
- **Linting & Code Quality**: ESLint and TypeScript are enforced. Warnings are minimized and code is kept clean.
- **Bulk Actions**: Select multiple products, users, orders, or categories and perform bulk operations (delete, update, etc.) from the admin dashboard.
- **Password Visibility Toggle**: Eye icon in password and password confirmation fields on login/register screens to show/hide input.
- **Improved Modal UX**: All modals (e.g., "no categories" in product creation) have clear exit/okay buttons and ESC key support for accessibility.

## Getting Started
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Set up the database**:
   - Configure your `.env` file with the correct `DATABASE_URL`.
   - Run migrations and seed data:
     ```bash
     npx prisma db push
     npx prisma db seed
     ```
   - (Optional) Run Prisma Studio for manual data management:
     ```bash
     npx prisma studio
     ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Access the admin dashboard**:
   - Go to `http://localhost:3000/admin`
   - Default admin user: `admin@admin.com` / `admin123`

## Development & Linting
- Run lint checks:
  ```bash
  npx eslint --ext .ts,.tsx src/
  ```
- Fix warnings and errors as they appear. Unused variables, types, and imports should be removed.
- All code should use the UI kit and design system. No inline or ad-hoc styles.

## Troubleshooting
- **Failed to save product/category**: Check that all required fields are filled and valid. If no categories exist, create one first.
- **Cannot delete category**: You cannot delete a category that has products assigned. Reassign or delete products first.
- **API errors**: All errors are surfaced with specific messages. If you see a generic error, check the browser console and server logs for details.
- **Prisma issues**: Ensure your database is migrated and seeded. Use Prisma Studio to inspect data.
- **Cannot exit modal**: All modals now have an "Okay" button and support ESC to close.

## Accessibility & UX
- All text uses high-contrast, semantic colors.
- All forms have required field indicators and validation.
- No UI elements appear clickable unless they are actionable.
- All error states are clear and actionable.
- All forms have password visibility toggles for better usability.
- All modals are accessible and can be closed with a button or ESC key.

## Contributing
- Follow the design system and UI kit for all new components.
- Write clear, maintainable TypeScript code.
- Run lint and type checks before committing.
- Document any new features or changes in the appropriate `.md` files.

## Authentication & Security
- **Automated Password Hashing**: All user passwords are always hashed automatically via Prisma middleware, even if created/edited in Prisma Studio or scripts. No plain text passwords are ever stored.
- **Combined Login/Signup**: The login page supports both login and registration, with Google and Facebook social logins. Unified, user-friendly error messages are shown for all authentication issues.

## Analytics & Counters
- All product, category, and analytics counters exclude archived and out-of-stock products for accurate reporting.

## Directory Usage
- Always run scripts and commands from `D:\wonderworks\wonderworks`.

---
For more details, see `PLAN.md`, `