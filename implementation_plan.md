# Expense Analyzer Master Development Plan

This document serves as the full roadmap and architectural blueprint for the Expense Analyzer application. It includes all past phases, current execution details, and newly requested enhancements so that the entire scope is documented in one place.

## Architecture Overview
- **Frontend**: Next.js 16 (App Router), TailwindCSS, React (Client/Server components).
- **Authentication Service**: Spring Boot, PostgreSQL (`finance` schema, `users` table), JWT token-based auth with Argon2id password hashing. Runs on port `8081`.
- **Expense Service**: Spring Boot, PostgreSQL (`finance` schema, `expenses` & `expense_categories` tables), stateless JWT verification filter. Runs on port `8080`.
- **Database**: Single PostgreSQL instance acting as a database for microservices.

---

## Development Phases & Enhancements

### [COMPLETED] Phase 1: Microservice Architecture Setup
- Initialize Spring Boot projects for `auth-service` and `expense-service`.
- Connect both microservices to a local PostgreSQL instance.
- Setup Next.js frontend with Turbopack and TailwindCSS.

### [COMPLETED] Phase 2: User Authentication (Sign up / Login)
- Build `/login` and `/signup` UI with TailwindCSS.
- Build JWT authentication flow, Argon2id password encoding.
- Frontend token storage in cookies (`auth_token`).

### [COMPLETED] Phase 3: JWT Security & Landing Page
- Build stateless `JwtAuthFilter` inside the `expense-service` to validate tokens issued by `auth-service`.
- Create a beautiful dark-mode landing page (`/`) with Hero sections, Feature grids, and Call to Actions.

### [COMPLETED] Phase 4: Core Manual Features
- Add Expense/Income forms via `/dashboard/add`.
- Expense List Table via `/dashboard/expenses`.
- Income List Table via `/dashboard/incomes`.
- Dashboard Aggregation (Total Income, Total Expenses, Balance) via `/dashboard`.
- Interactive responsive sidebar navigation.

### [COMPLETED] Phase 5: Testing & Refinement
- Stabilized DB schema constraints.
- Resolved build warnings in Next.js.
- Ensure API Gateways/CORS are functioning across `localhost:8080`, `localhost:8081`, and `localhost:3000`.

### [COMPLETED] Phase 6: Enhancements (User Profiles & Avatars)
- **Goal**: Add user personalization and profile avatars.
- **Backend**: Added `profile_picture` (Base64) to the `users` table. Added `/api/auth/me` endpoints for fetching profile and updating/removing avatars.
- **Frontend**: Created `/dashboard/settings` with a settings modal. Users can upload image files (converted to base64) or remove them.
- **Sidebar**: Displays the user's name, email, and their uploaded avatar (or a dynamic initial placeholder if none is set).

### [COMPLETED] Phase 7: Multi-Select Expense Categories & Emojis
- **Goal**: Make category selection dynamic and support multiple categories per expense.
- **Backend**: Converted single string category to `@ElementCollection` in Hibernate mapping to `finance.expense_categories`.
- **Frontend**: Transformed the Add Transaction form to use HTML5 Drag-and-Drop between "Available" and "Selected" zones. Added custom typed categories.
- **Enhancement**: Injected emojis directly into the category strings (e.g., "🍔 Food & Dining") which are seamlessly stored in the DB and rendered globally across the app.

---

## Next Steps / Upcoming Enhancements

### [PENDING] Phase 8: Currency Preferences
- **Goal**: Give the user an option to choose their preferred currency (e.g., $, €, £, ¥, ₹) globally across the app.
- **Backend**: Add a `currency` string field to the `User` model in `auth-service` (defaulting to `$`). 
- **Frontend Settings**: Add a dropdown in the Profile Settings Modal to allow the user to select and save their preferred currency.
- **Frontend Global Rendering**: Update the frontend auth context to store the preferred currency symbol, and replace all hardcoded `$` signs across `/dashboard`, `/dashboard/expenses`, and `/dashboard/add` with the dynamic currency symbol.

### [PENDING] Phase 9: Frontend AuthGuards & UX Navigation
- **AuthGuard Enhancement:** Implement a Higher-Order Component or Next.js Middleware to ensure URL navigation is protected. Users cannot manually type `/dashboard` if they are not logged in.
- **Navigation UX:** Add back/forward navigation buttons or breadcrumbs where required to make navigating nested pages (like settings/add transaction) smoother.

---

## Open Questions for Phase 8

> [!IMPORTANT]
> **Currency Conversion**: When a user changes their currency (e.g. from USD `$` to EUR `€`), do you just want to change the symbol for **display** purposes moving forward? Or do you actually want historical transactions mathematically converted using live exchange rates? (Changing just the display symbol is standard for most personal expense apps unless traveling).

## Verification Plan
- Backend schema migration check: Ensure adding a `currency` field to `auth.users` succeeds and falls back to a default value without crashing.
- Test changing the currency from the settings modal and navigating to the dashboard to verify the totals, expenses list, and incomes list immediately reflect the newly selected symbol.