# WonderWorks Project Plan

## Methodology & Standards
- **Design System**: All UI uses a consistent, accessible design system with a UI kit (Button, Input, Card, Badge, etc.) and Tailwind-based tokens.
- **Accessibility**: All text and UI elements use high-contrast, semantic colors. No unreadable or low-contrast text.
- **Error Handling**: All actions (create, update, delete) provide specific, actionable feedback. API and database errors are surfaced to the user.
- **Validation**: All forms have client-side validation, required field indicators, and clear error messages.
- **No Redundant UI**: Only working features are visible. All non-functional or placeholder UI is removed.
- **No Inline Styling**: All styles are managed via Tailwind and the design system.
- **Code Quality**: ESLint and TypeScript are enforced. Warnings are minimized and code is kept clean.
- **Prisma Integration**: All data is managed via Prisma ORM, with a clear schema and seed data for development.
- **Authentication**: Combined login/signup page with Google/Facebook social logins, unified error messages, and automated password hashing via Prisma middleware (no plain text passwords, ever).
- **Analytics**: All counters and analytics exclude archived/out-of-stock products for accuracy.
- **Directory Usage**: All scripts/commands must be run from `D:\wonderworks\wonderworks`.
- **Bulk Actions**: Admin dashboard supports selecting multiple products, users, orders, or categories for batch operations (delete, update, etc.).
- **Password Visibility Toggle**: Eye icon in password and password confirmation fields for login/register.
- **Improved Modal UX**: All modals have clear exit/okay buttons and ESC key support.

## Roadmap & Priorities
1. **Audit & Refactor**
   - Remove all unused, legacy, or redundant files/code.
   - Ensure all components use the UI kit and design system.
   - Fix all text contrast and accessibility issues.
2. **Admin Dashboard**
   - Inline editing for products, categories, users, and orders.
   - Robust validation and error handling for all forms.
   - Actionable error states for all CRUD operations.
   - No avatar/profile picture UI.
   - No dropdowns or actions if data source is empty (e.g., no categories).
3. **Prisma & Data**
   - Keep schema and seed data up to date.
   - Use Prisma Studio for manual data management.
   - All API routes must return specific, actionable error messages.
4. **Testing & Linting**
   - Run lint checks regularly and fix all warnings/errors.
   - Add/update tests for all new features.
5. **Documentation**
   - Keep all `.md` files up to date with current standards, features, and troubleshooting steps.

## Next Steps
- [ ] Finalize all admin dashboard features and polish UI/UX.
- [ ] Clean up all lint warnings and unused code.
- [ ] Continue to improve accessibility and error handling.
- [ ] Expand test coverage and documentation.

---
For implementation details, see `DEVELOPMENT.md` and `README.md`. 

## Admin ↔︎ Client Synchronisation & Styling Refactor (July 2025)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Audit customer-facing pages for dynamic category/product data | dev | completed |
| 2 | Ensure `/api/categories` route returns live data (create if missing) | dev | completed |
| 3 | Refactor `CategoryBar` & related comps to fetch via SWR | dev | completed |
| 4 | Update product listing to use `categoryId` relation, include category name | dev | in_progress |
| 5 | Add ISR/revalidation or client cache refresh so new data appears without restart | dev | pending |
| 6 | Sweep for inline styles / hard-coded colours, migrate to Tailwind arbitrary values or CSS vars | dev | pending |
| 7 | Implement central CSS variable map for theme tokens | dev | pending |
| 8 | Verify admin controls cover all necessary customer features | dev | pending |
| 9 | Implement bulk actions for products, users, orders, categories | dev | completed |
| 10 | Add password visibility toggle to login/register | dev | completed |
| 11 | Improve modal accessibility (exit/okay button, ESC support) | dev | completed |

Progress on these items is tracked in `docs/ROADMAP.md` and in-code TODO markers. 