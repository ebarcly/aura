# AURA - The Developer Super-Portfolio

AURA analyzes a developer's GitHub profile to generate a rich, data-driven, and shareable report that proves their skills in a way a traditional resume cannot.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL & GitHub OAuth)
- **Deployment:** Vercel

---

## How to run

1.  Clone the repository
2.  Install dependencies with `npm install`
3.  Run `npm run dev` to start the development server
4.  Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Project Milestones

### Milestone 0: Project Setup & Scaffolding - ✅ COMPLETE

- **Objective:** Initialize the project, set up Supabase, and confirm a working database connection.
- **Status:** Completed.

### Milestone 1: Authentication & User Dashboard - ✅ COMPLETE

- **Objective:** Implement "Sign in with GitHub" and create a protected dashboard page.
- **Status:** Completed. Users can log in/out, and the `/dashboard` route is protected by middleware.

### Milestone 2: The Analyzer Core (Backend) - ✅ COMPLETE

- **Objective:** Build the API endpoint that fetches a user's repos, allows selection, and runs the first analysis (language breakdown).
- **Status:** Completed. The user can now select repositories and initiate an analysis. The backend clones the repo, analyzes the language composition, and saves the results.
- **Key Features:**
  - An API route to fetch a user's repositories from the GitHub API.
  - A UI on the dashboard to display repositories and allow the user to select them for analysis.
  - A backend service that clones a selected repository.
  - Integration of a tool like `cloc` to analyze the code and determine language composition.
  - Saving the analysis results back to our Supabase database.

### Milestone 3: The Report Generator

- **Objective:** Create a dynamic, shareable report page from the analysis data.
- **Key Features:**
  - A new route `/[username]/[reportId]` to display a specific analysis report.
  - A UI to present the language breakdown, commit history, and other metrics in a visually appealing way.
  - Functionality to make reports public or private.
  - A "Share" button that copies the public report URL to the clipboard.
