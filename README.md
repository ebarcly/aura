# AURA - The Developer Super-Portfolio

AURA analyzes a developer's GitHub profile to generate a rich, data-driven, and shareable report that proves their skills in a way a traditional resume cannot. This project is being built as a key portfolio piece.

## Tech Stack

- **Frontend:** Next.js (App Router) with TypeScript & Tailwind CSS
- **Backend:** Next.js API Routes
- **Database & Auth:** Supabase (PostgreSQL & GitHub OAuth)
- **Deployment:** Vercel

---

## Project Milestones

### Milestone 0: Project Setup & Scaffolding - ✅ COMPLETE

- **Objective:** Initialize the Next.js project, set up the GitHub repository, create the Supabase project, and establish a confirmed connection between the app and the database.
- **Status:** Completed. The `feat/supabase-integration` branch has been merged into `main`.

### Milestone 1: Authentication & User Dashboard

- **Objective:** Implement "Sign in with GitHub" using Supabase Auth. After login, the user should be redirected to a protected dashboard page that displays their basic GitHub information (avatar, username).
- **Key Features:**
  - GitHub OAuth provider setup in Supabase.
  - A login button on the home page.
  - A callback route to handle the authentication response from GitHub.
  - A protected `/dashboard` route.
  - A component to display user info and a logout button.
