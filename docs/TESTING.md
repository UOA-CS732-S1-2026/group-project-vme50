# Testing Documentation – Platemates

## Overview
Testing was conducted on the core functionalities of Platemates to ensure that the application behaves correctly, provides a smooth user experience, and satisfies all required must-have features defined in the project proposal.

The frontend interface was tested for usability, responsiveness, and clarity. Features such as authentication, meal session management, invite creation, and dashboard updates were tested through multiple user interaction scenarios.

---

# Authentication & Authorization Testing

## Login Validation
When attempting to log in without first registering an account, the system correctly prevents access and displays a popup message:

- “Invalid credentials”

This ensures that only registered users are able to access the application.

## University Email Restriction
Registration was tested using non-University of Auckland email addresses. The system correctly rejected these attempts and displayed the following popup message:

- “Only University of Auckland students can register”

This confirms that registration restrictions for verified University of Auckland students are functioning correctly.

## Successful Registration & Login
After registering with a valid University of Auckland student email address, users were successfully able to:

- Create an account
- Login using registered credentials
- Access the dashboard and protected features

## Logout Functionality
Logout functionality was tested to ensure that authenticated sessions terminate correctly and users are redirected appropriately.

---

# Frontend & User Interface Testing

The frontend interface was tested for responsiveness, layout consistency, and usability.

The UI provides:
- A clean and modern dashboard
- Easy navigation between meal sessions
- Responsive meal cards displaying session information
- Clear buttons for creating, joining, and leaving meal sessions

The Create Meal Session modal was tested to ensure:
- Inputs accept valid data correctly
- Character limits display properly
- Interactive map integration functions correctly
- Date and slot selection work as expected

The interface updates dynamically based on user actions and provides clear visual feedback.

---

# Meal Session / Food Invite Testing

## Dashboard Functionality
The dashboard successfully displays all active meal sessions with the following information:

- Session title
- Session description
- Meal location
- Session time
- Available participant slots
- Session owner

All active sessions load correctly and update dynamically.

## Create Meal Session Feature
Meal session creation was tested successfully.

Users are able to:
- Create meal invites
- Add descriptions
- Select meal locations using the interactive map
- Choose meal start time
- Set maximum participant slots

Newly created sessions appear immediately on the dashboard after creation.

## Join / Leave Meal Session Feature
Join and leave functionalities were tested thoroughly.

Users are able to:
- Join active meal sessions
- Leave joined meal sessions
- View participant count updates in real time

The UI correctly reflects:
- Updated participant numbers
- Joined session status
- Full session status when maximum capacity is reached

## My Meals Section
The “My Meals” feature was tested successfully.

Users can:
- View sessions they have joined
- Separate their joined meals from all available meals

This improves user organization and accessibility.

---

# Real-Time Feature Testing

Real-time updates were tested to ensure frontend synchronization with backend changes.

The system successfully updates:
- Participant counts
- Join/leave status
- Session availability

Changes are reflected immediately on the UI after user interactions.

---

# Map Feature Testing

The interactive map feature was tested during meal session creation.

Testing verified:
- Map loads correctly
- Locations display properly
- Users can visually select meal locations
- Invalid or missing location handling functions correctly

---

# API & Backend Integration Testing

Frontend-backend integration was tested across all core functionalities.

The following API-related functionalities were verified:
- User registration
- User login
- Session creation
- Join/leave meal sessions
- Dashboard data retrieval

Backend database updates were confirmed after user actions, and frontend state updates correctly reflected backend responses.

Error handling was also tested to ensure invalid requests are managed appropriately.

---

# Must-Have Feature Verification

The following must-have requirements were fully implemented and tested successfully:

## User Authentication and Authorization
- Users can register, login, and logout
- Only verified University of Auckland students can register
- Only logged-in users can access Platemates

## Meal Session / Food Invites Dashboard
- Displays all active meal sessions
- Sessions display key details including:
  - Session name
  - Description
  - Location
  - Time
  - Available slots

## Create/Post Meal Session Feature
- Users can create and post meal sessions successfully

## Join/Leave Meal Session Feature
- Users can join and leave meal sessions
- Users can only join one active meal session at a time (changed to multiple meal sessions)

---

# Final Testing Summary

End-to-end testing was conducted on all core workflows within the application. Testing confirmed that the main must-have features are functioning correctly and that frontend-backend integration behaves as expected.

Overall, Platemates successfully delivers:
- Secure student authentication
- Shared meal session management
- Real-time interaction updates
- A responsive and user-friendly experience
- Core functionality outlined in the original project proposal

---

# Additional Automated Testing Workflow

The manual testing results above are retained as the original functional verification record. In addition to those checks, PlateMates now includes automated tests and CI checks to make the testing workflow more repeatable and closer to enterprise practice.

## Automated Testing Strategy

The project now uses a layered testing approach:

- Backend API tests verify server routes, authentication rules, meal session behavior, and database updates.
- Frontend unit and component tests verify authentication UI, protected routing, and local auth state behavior.
- Playwright end-to-end smoke tests verify the most important browser-level user journey.
- Manual acceptance testing is still used for responsiveness, map behavior, profile editing, and final user experience checks.

The recommended testing order for new features is:

1. Add or update unit/component tests for isolated frontend or backend behavior.
2. Add or update API tests for backend route and database behavior.
3. Add or update E2E tests for critical user journeys.
4. Run manual acceptance checks before final release or submission.

## Test Environment

Backend tests use Vitest with a MongoDB test database. Frontend tests use Vitest, jsdom, and React Testing Library. E2E smoke tests use Playwright with Chromium.

GitHub Actions starts a MongoDB service for CI test runs. Local E2E testing requires MongoDB to be available locally or through a `MONGO_URI` environment variable.

Default E2E ports:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5050`

## Local Test Commands

Run linting for both frontend and backend:

```bash
npm run lint
```

Run the current root CI command:

```bash
npm run ci
```

Run backend tests:

```bash
npm --prefix backend run test
```

Run frontend unit and component tests:

```bash
npm --prefix frontend run test
```

Run the frontend production build:

```bash
npm --prefix frontend run build
```

Install the Playwright browser dependency:

```bash
npm --prefix frontend run test:e2e:install
```

Run the Playwright E2E smoke test:

```bash
npm run test:e2e
```

## Current CI Workflow

The GitHub Actions workflow is defined in `.github/workflows/ci.yml`.

On pushes and pull requests to `main`, CI currently:

- Checks out the repository
- Sets up Node.js 20
- Starts a MongoDB service
- Installs backend dependencies
- Installs frontend dependencies
- Installs Playwright Chromium
- Runs `npm run ci`
- Runs `npm run test:e2e`

The current `npm run ci` command runs linting and backend tests. Frontend unit tests and frontend build should still be run locally before opening or merging a PR.

## Automated Test Matrix

| Area | Test Type | Tooling | Coverage |
| --- | --- | --- | --- |
| Authentication API | API integration | Vitest, Supertest | Register, login, invalid credentials, UOA email restriction |
| Meal session API | API integration | Vitest, Supertest | Create meal, get meals, join, leave, validation and business rules |
| Protected routing | Component test | Vitest, React Testing Library | Redirect behavior for authenticated and unauthenticated users |
| Login page | Component test | Vitest, React Testing Library | Form submission, error state, auth state persistence |
| Register page | Component test | Vitest, React Testing Library | Form submission, validation feedback, registration failure handling |
| Auth utilities | Unit test | Vitest | Local storage token/user helpers |
| Core user flow | E2E smoke test | Playwright | Register, login, create meal, join meal, leave meal, logout |
| Map selection | E2E/manual | Playwright, manual testing | Map click and location selection during meal creation |
| Responsive UI | Manual acceptance | Browser testing | Dashboard, forms, modal layout, mobile sizing |
| Real-time updates | Manual/E2E smoke | Socket.IO, Playwright | Join/leave participant count updates |

## Current Automated Coverage

Backend tests are located under `backend/src/tests`.

Current backend coverage includes:

- `/api/auth/register`
- `/api/auth/login`
- Authentication failures
- UOA email validation
- Meal creation
- Meal retrieval
- Join meal behavior
- Leave meal behavior
- Business rule validation

Frontend automated tests include:

- `frontend/src/components/redirect/ProtectedRoute.test.tsx`
- `frontend/src/pages/Login.test.tsx`
- `frontend/src/pages/Register.test.tsx`
- `frontend/src/utils/auth.util.test.ts`

The Playwright E2E smoke test is located at:

```text
frontend/e2e/core-user-flow.spec.ts
```

The current E2E smoke test covers:

1. Registering a creator account.
2. Logging in as the creator.
3. Creating a meal session.
4. Registering and logging in as another user.
5. Joining the meal session.
6. Verifying participant count updates.
7. Leaving the meal session.
8. Logging out and returning to the login page.

## Pull Request Quality Gate

Before opening or merging a PR, contributors should run the checks relevant to their change.

Minimum recommended checks:

```bash
npm run lint
npm --prefix backend run test
npm --prefix frontend run test
npm --prefix frontend run build
```

For changes affecting authentication, dashboard behavior, meal creation, join/leave behavior, maps, or routing, also run:

```bash
npm run test:e2e
```

PR review should confirm:

- New behavior has a matching test or documented manual verification.
- Negative cases are covered where practical.
- The PR does not rely only on manual testing for critical workflows.
- CI passes before merge.

## Testing Summary

The project now combines manual functional verification with automated backend, frontend, and end-to-end tests. This improves regression protection for the main authentication, meal session, dashboard, join/leave, and logout workflows.
