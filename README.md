# Vehicle Inspection System

A full-stack vehicle inspection management system built with React + TypeScript (frontend) and Express + TypeScript (backend).

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Backend

```bash
cd backend
cp .env.example .env   # optional — defaults work out of the box
npm install
npm run dev
```

Server runs on **http://localhost:3000**

### Frontend

```bash
cd frontend
cp .env.example .env   # optional — defaults work out of the box
npm install
npm run dev
```

App runs on **http://localhost:5173**

> Make sure the backend is running before using the frontend.

### Running Tests

```bash
cd backend
npm test
```

All 62 tests should pass.

---

## What Was Done

### Backend

1. **Implemented `createCheck` controller** — Validates request body, returns 400 on validation errors, creates the check and returns 201 on success.
2. **Fixed `hasIssue` bug** — The status comparison used `"FAILED"` instead of `"FAIL"`, and the boolean was negated. Both fixed.
3. **Completed `deleteCheck`** — Service filters out the check by ID and persists the updated list. Controller returns 204 on success, 404 if not found.

### Frontend

1. **Fixed form input bugs** — Added missing `OIL` and `COOLANT` to checklist items (was only 3 of 5). Fixed status to use `"OK"`/`"FAIL"` strings instead of boolean casts. Added numeric-only validation on odometer input.
2. **Replaced dropdowns with radio buttons** — Checklist items now use OK/FAIL radio button pairs.
3. **Added notes textarea** — Optional field with 300-character max limit and live character counter.
4. **Wired up toast notifications** — Success toast on submission, error toast with validation detail count on failure.
5. **Implemented delete** — Delete button on each inspection card with confirmation dialog and toast feedback.

### Additional

- Added GitHub Actions CI workflow (type check, lint, test, build on every push/PR)
- Added `.env` support with `.env.example` reference files

---

## Pull Requests

- [PR #1 — Backend](https://github.com/antonyprojects/vehicle-inspection-system/pull/1)
- [PR #2 — Frontend](https://github.com/antonyprojects/vehicle-inspection-system/pull/2)

---

## Questions

1. **Authentication:** If we need to add authentication to this system, how would you approach it?

<!-- Write your answer here -->

2. **Improvements:** What other improvements would you implement if this were going to production or if you have more time?

<!-- Write your answer here -->

3. **Tech Stack Experience:** Do you have experience with PHP, Vue.js, or mobile app development (React Native/Flutter)?

<!-- Write your answer here -->

4. **AI / Tools:** What tools/assistants did you use while working on this assignment (e.g., GitHub Copilot, ChatGPT, etc.)? We appreciate AI usage, we're interested in _how_ you use these tools.

<!-- Write your answer here -->

5. **Visa Status:** What visa are you currently on?

<!-- Write your answer here -->

6. **Languages:** What language(s) do you speak and what's your proficiency level?

<!-- Write your answer here -->
