# College Discovery Platform

College Discovery is a full-stack Next.js application for searching, comparing, saving, and ranking colleges. It combines authenticated user workflows, Prisma-backed data access, deterministic recommendation scoring, and an AI-assisted guidance layer for college decision support.

This repository is structured as an AI Software Engineer Internship submission, with emphasis on API design, database modeling, reliability controls, and maintainable application architecture.

## Resume-Ready Summary

- Built a full-stack college discovery platform with Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, JWT authentication, and protected saved-college workflows.
- Implemented searchable college listings, side-by-side comparison, personalized recommendation scoring, and Groq-backed AI assistance through validated server-side API routes.
- Designed relational data models with indexed lookup fields, cascade-safe relationships, transactional password reset handling, and seed data for local development.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers, Prisma Client, Zod validation |
| Database | PostgreSQL, Prisma migrations, seed data |
| Authentication | JWT, HTTP-only cookies, bcrypt password hashing |
| AI Integration | Groq OpenAI-compatible chat completions API |
| Tooling | ESLint, TypeScript, npm scripts |

## Core Features

- College discovery with keyword, location, rating, fee, sorting, and pagination filters.
- College detail pages with associated courses and reviews.
- Authenticated signup, login, logout, saved colleges, and password reset flows.
- Up to three-college comparison with normalized fees, placement, rating, and location metrics.
- Recommendation API that ranks colleges using configurable rank, fee, and placement weights.
- AI-assisted prediction and comparison guidance via a server-side proxy route.

## System Architecture
![System Architecture](screenshots/system_architecture.png)

## Screenshots

| College List | College Details
| --- | --- |
| ![College list](screenshots/college_list.png) |![Dashboard](screenshots/college_details.png) | 

| College Predictor | Recommendations |
| --- | --- |
| ![College predictor](screenshots/college_predictor.png) | ![Recommendations](screenshots/recommendation.png) |

| Compare Colleges | Saved Colleges |
| --- | --- |
| ![Compare colleges](screenshots/compare.png) | ![Saved colleges](screenshots/saved_college.png) |

| Login | Signup |
| --- | --- |
| ![Login](screenshots/login.png) | ![Signup](screenshots/signup.png) |

| Prisma Studio |
| --- |
| ![Prisma Studio](screenshots/prisma.png) |

## Project Architecture

The application uses Next.js App Router as the primary composition layer:

- `src/app` contains route segments, UI pages, reusable components, and API route handlers.
- `src/app/api` exposes backend endpoints colocated with the application.
- `src/lib` contains shared utilities for Prisma access, comparison logic, recommendation scoring, AI UX streaming, and page-state persistence.
- `prisma` owns the PostgreSQL schema, migrations, and development seed data.
- `middleware.ts` protects authenticated pages and API routes by checking the JWT cookie before requests reach route handlers.

For a deeper architecture, API, and database walkthrough, see `docs/ARCHITECTURE.md`.

## Folder Structure

```text
college-discovery/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   ├── auth/
│   │   │   ├── colleges/
│   │   │   ├── compare/
│   │   │   ├── recommend/
│   │   │   └── saved-colleges/
│   │   ├── colleges/
│   │   ├── compare/
│   │   ├── components/
│   │   ├── login/
│   │   ├── predict/
│   │   ├── saved/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   └── types/
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## API Documentation

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/auth/signup` | `POST` | Public | Create a user with hashed password storage. |
| `/api/auth/login` | `POST` | Public | Validate credentials and set an HTTP-only JWT cookie. |
| `/api/auth/logout` | `POST` | Public | Clear the auth cookie and redirect to the app root. |
| `/api/auth/forgot-password` | `POST` | Public | Generate a one-hour reset token and send a reset email. |
| `/api/auth/reset-password` | `POST` | Public | Validate reset token and update the hashed password transactionally. |
| `/api/colleges` | `GET` | Required | List, filter, sort, and paginate colleges. |
| `/api/colleges` | `POST` | Required | Create a college record. |
| `/api/colleges/search` | `GET` | Required | Search colleges by name, location, rating, and fee range. |
| `/api/colleges/[id]` | `GET` | Required | Return one college with courses and reviews. |
| `/api/compare` | `GET` | Required | Compare two or three colleges by normalized metrics. |
| `/api/recommend` | `POST` | Required | Rank colleges using student rank, budget, location, and scoring weights. |
| `/api/saved-colleges` | `GET` | Required | List saved colleges for the authenticated user. |
| `/api/saved-colleges` | `POST` | Required | Save a college for the authenticated user. |
| `/api/saved-colleges/[collegeId]` | `DELETE` | Required | Remove a saved college. |
| `/api/ai` | `POST` | Required | Proxy AI prompts to Groq without exposing the API key to the client. |

Development diagnostics also exist at `/api/test`, `/api/debug/ids`, and the legacy-compatible `/api/saved` route.

## Database Schema

The schema is defined in `prisma/schema.prisma` and uses PostgreSQL through Prisma.

| Model | Responsibility |
| --- | --- |
| `User` | Stores account identity, unique email, hashed password, and user-owned relations. |
| `College` | Stores searchable college profile fields including location, fees, ratings, package metrics, and overview. |
| `Course` | Stores college-specific course offerings and cascades on college deletion. |
| `Review` | Stores college reviews and cascades on college deletion. |
| `SavedCollege` | Join table connecting users and colleges with a unique `(userId, collegeId)` constraint. |
| `PasswordResetToken` | Stores single-use reset tokens with expiry and user relation. |

Indexes are defined for high-read paths such as college name, location, rating, user saved records, course lookup, and review lookup.

## Environment Variables

Create a local `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
GROQ_API_KEY="your-groq-api-key"

# Optional recommendation tuning
RECOMMEND_RANK_WEIGHT="0.4"
RECOMMEND_FEES_WEIGHT="0.35"
RECOMMEND_PLACEMENT_WEIGHT="0.25"
RECOMMEND_MIN_EXPECTED_RANK="500"
RECOMMEND_MAX_EXPECTED_RANK="500000"
RECOMMEND_MAX_RANK_DIFFERENCE="100000"
RECOMMEND_TOP_N="10"
```

Do not commit `.env` files. Use deployment-provider secret management for production values.

## Setup Instructions

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- PostgreSQL database
- Resend API key for password reset email
- Groq API key for AI routes

### Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open `http://localhost:3000` after the development server starts.

### Useful Commands

```bash
npm run dev      # Start local development server
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Run ESLint
npx prisma studio
```

## Deployment

Recommended deployment path:

1. Provision a managed PostgreSQL database.
2. Add all required environment variables in the hosting provider.
3. Run `npx prisma migrate deploy` during release.
4. Run `npm run build`.
5. Start with `npm run start` or deploy through a Next.js-compatible platform such as Vercel.

For Vercel deployments, configure `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, and `GROQ_API_KEY` in Project Settings. Seed production data only when intentional.

## Engineering Notes

- Request validation is handled with Zod at API boundaries.
- Authentication state is stored in an HTTP-only cookie to reduce client-side token exposure.
- Passwords are hashed with bcrypt before persistence.
- Password reset tokens are single-use, expiring records linked to users.
- Prisma Client is reused globally in development to avoid connection churn during hot reloads.
- Middleware centralizes access control for protected pages and APIs.

## 👨‍💻 Author

Amiya Krishna Chaurasiya

B.Tech CSE Student

Aspiring Software Development Engineer

Portfolio: https://amiya-krishna-portfolio.vercel.app

GitHub: https://github.com/Amiya-Krishna

LinkedIn: https://www.linkedin.com/in/amiya-krishna
