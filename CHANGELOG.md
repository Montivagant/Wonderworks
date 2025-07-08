# Changelog

## [Unreleased]
- Refactored admin dashboard to use UI kit and design system throughout.
- Removed all redundant, legacy, and non-functional UI/components.
- Added robust client-side validation and required field indicators to all forms.
- Improved error handling: all CRUD actions now show specific, actionable error messages from the API or database.
- Fixed all text contrast and accessibility issues in admin UI.
- Removed avatar/profile picture UI from admin dashboard.
- Disabled product creation if no categories exist; category dropdown is empty if no categories.
- All error toasts and form errors are now specific and actionable.
- Cleaned up unused variables, imports, and lint warnings in admin components.
- Updated Prisma schema and seed data for consistency with UI.
- Updated all documentation files (`README.md`, `PLAN.md`, `DEVELOPMENT.md`, `CHANGELOG.md`) to reflect current standards, features, and troubleshooting steps.
- Enforced code quality with ESLint and TypeScript.
- Added Prisma middleware to automatically hash all user passwords on create/update (no more plain text passwords, even via Studio/scripts).
- Combined login/signup page with Google and Facebook social logins.
- Unified, user-friendly error messages for all authentication issues.
- All counters and analytics now exclude archived and out-of-stock products for accuracy.
- Directory usage clarified: all scripts/commands must be run from `D:\wonderworks\wonderworks`.
- Removed all legacy/manual password handling and documentation.

## [Earlier]
- Initial project setup with Next.js, TypeScript, Tailwind CSS, and Prisma.
- Implemented basic e-commerce features and admin dashboard. 