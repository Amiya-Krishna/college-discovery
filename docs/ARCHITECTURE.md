# Architecture Reference

This document explains the structure, API surface, database schema, and operational considerations for the College Discovery application.

## System Overview

College Discovery is a monolithic full-stack Next.js application. The frontend, backend route handlers, authentication middleware, and database access layer live in one TypeScript codebase.

```text
Browser
  │
  ▼
Next.js App Router pages and client components
  │
  ▼
Middleware access control
  │
  ▼
Next.js API route handlers
  │
  ├── Prisma Client ── PostgreSQL
  ├── Resend ──────── Password reset email
  └── Groq API ────── AI guidance responses
```

## Architecture Decisions

| Area | Decision | Engineering Rationale |
| --- | --- | --- |
| Application model | Next.js App Router monolith | Keeps UI, APIs, and middleware colocated for a compact internship-scale system. |
| Data access | Prisma Client | Provides typed database access, migrations, relation modeling, and safer query construction. |
| Validation | Zod schemas in route handlers | Rejects invalid payloads before business logic and database writes. |
| Authentication | JWT in HTTP-only cookie | Supports stateless protected routes while reducing direct client-side token access. |
| Authorization boundary | `middleware.ts` | Applies centralized protection for non-public pages and APIs. |
| Recommendations | Deterministic weighted scoring | Keeps recommendations explainable, tunable, and testable without depending on AI output. |
| AI integration | Server-side `/api/ai` proxy | Prevents API key exposure and isolates third-party request handling. |
| Persistence reliability | Unique constraints and cascades | Prevents duplicate saved colleges and cleans dependent data when parent records are removed. |

## Route Structure

```text
src/app/
├── page.tsx
├── colleges/page.tsx
├── colleges/[id]/page.tsx
├── compare/page.tsx
├── predict/page.tsx
├── saved/page.tsx
├── login/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── api/
    ├── ai/route.ts
    ├── auth/
    ├── colleges/
    ├── compare/route.ts
    ├── recommend/route.ts
    └── saved-colleges/
```

## API Documentation

| Endpoint | Method | Auth | Request | Success Response | Error Handling |
| --- | --- | --- | --- | --- | --- |
| `/api/auth/signup` | `POST` | Public | `{ name, email, password }` | `201` with created user profile | `422` invalid input, `409` duplicate email |
| `/api/auth/login` | `POST` | Public | `{ email, password }` | `200` with user profile and `token` cookie | `422` invalid format, `401` invalid credentials |
| `/api/auth/logout` | `POST` | Public | None | Redirect to `/` and cleared cookie | Requires `NEXT_PUBLIC_APP_URL` |
| `/api/auth/forgot-password` | `POST` | Public | `{ email }` | `200` success even when email is unknown | Avoids email enumeration |
| `/api/auth/reset-password` | `POST` | Public | `{ token, password }` | `200` after password update and token marked used | `400` invalid/expired token, `422` invalid input |
| `/api/colleges` | `GET` | Required | Query: `search`, `name`, `location`, `state`, `city`, `rating`, `minFees`, `maxFees`, `sortBy`, `order`, `page`, `limit` | Paginated `{ data, total, page, limit, totalPages, hasNextPage, hasPrevPage }` | `400` invalid query |
| `/api/colleges` | `POST` | Required | `{ name, city, state, rating?, fees?, description?, website?, establishedYear? }` | `201` with created college | `400` invalid body, `409` unique conflict |
| `/api/colleges/search` | `GET` | Required | Query: `q`, `search`, `name`, `location`, `state`, `rating`, `minFees`, `maxFees`, `page`, `limit` | Paginated search response | `400` invalid query |
| `/api/colleges/[id]` | `GET` | Required | UUID path parameter | College with `courses` and `reviews` | `400` invalid UUID, `404` not found |
| `/api/compare` | `GET` | Required | Query: `ids=uuid1,uuid2,uuid3` | Ordered colleges plus comparison metrics | `400` invalid IDs or more than three, `404` missing college |
| `/api/recommend` | `POST` | Required | `{ rank, maxFees, preferredLocation? }` | Ranked recommendation list with scores and explanations | `400` invalid body |
| `/api/saved-colleges` | `GET` | Required | Cookie auth | Saved college summaries | `401` unauthenticated |
| `/api/saved-colleges` | `POST` | Required | `{ collegeId }` | `201` saved record | `400` invalid UUID, `404` college missing, `409` duplicate |
| `/api/saved-colleges/[collegeId]` | `DELETE` | Required | UUID path parameter | `200` deletion success | `400` invalid UUID, `404` missing saved record |
| `/api/ai` | `POST` | Required | `{ messages }` or `{ prompt }` | `{ text }` from Groq completion | `400` invalid body, `500` missing API key, upstream status on AI failure |
| `/api/test` | `GET` | Required | None | College count and sample colleges | Diagnostic route |
| `/api/debug/ids` | `GET` | Required | None | College IDs and names | Diagnostic route |

## Database Schema

### `User`

Stores application users.

- Primary key: `id` UUID.
- Unique email for login identity.
- Password is stored as a bcrypt hash.
- Relations: many saved colleges and password reset tokens.
- Index: `name`.

### `College`

Stores searchable college records.

- Primary key: `id` UUID.
- Core fields: `name`, `state`, `city`, `fees`, `rating`, `highestPackage`, `averagePackage`, `overview`.
- Relations: many courses, reviews, and saved records.
- Indexes: `name`, `(state, city)`, `rating`.
- Search implementation currently uses case-insensitive `contains`; PostgreSQL full-text or trigram indexes can improve larger datasets.

### `Course`

Stores courses offered by colleges.

- Primary key: `id` UUID.
- Foreign key: `collegeId`.
- Deletes cascade when the parent college is deleted.
- Indexes: `collegeId`, `name`.

### `Review`

Stores college reviews.

- Primary key: `id` UUID.
- Foreign key: `collegeId`.
- Deletes cascade when the parent college is deleted.
- Indexes: `collegeId`, `rating`.

### `SavedCollege`

Join table for user-college saved state.

- Primary key: `id` UUID.
- Foreign keys: `userId`, `collegeId`.
- Unique constraint: `(userId, collegeId)` prevents duplicate saves.
- Deletes cascade when the related user or college is deleted.
- Indexes: `userId`, `collegeId`.

### `PasswordResetToken`

Stores password reset lifecycle state.

- Primary key: `id` CUID.
- Unique token generated with cryptographic randomness.
- Foreign key: `userId`.
- `expiresAt` enforces one-hour reset validity at application level.
- `used` prevents replay after a successful reset.

## Recommendation Logic

The recommendation route filters colleges by budget and optional location, then ranks eligible records using weighted subscores:

- Rank match score compares the student's rank to an expected rank inferred from college rating.
- Affordability score rewards lower fees relative to the student's maximum budget.
- Placement score normalizes highest package across the eligible result set.
- Final score is a weighted sum, controlled by environment variables.

This keeps recommendations explainable and stable while allowing future tuning without code changes.

## Reliability and Security Considerations

- Zod guards all major request boundaries.
- Prisma parameterization avoids unsafe raw SQL usage.
- JWT is stored in an HTTP-only cookie.
- Middleware rejects unauthenticated API requests before handler execution.
- Password reset returns success for unknown emails to reduce account enumeration.
- Reset tokens are deleted before issuing a new token and marked used after reset.
- Prisma Client is cached globally in development to reduce hot-reload connection churn.
- Database uniqueness constraints enforce integrity for emails, reset tokens, and saved-college pairs.

## Scalability Considerations

- Pagination limits college list and search responses.
- Indexed fields support common lookup and filtering paths.
- Recommendation logic operates on filtered candidate sets rather than the entire table where possible.
- AI calls are isolated behind one proxy route, making it easier to add rate limiting, caching, or provider fallback.
- The current architecture can scale vertically for an internship project; future growth could split AI, recommendation, and search into dedicated services.

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens. |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL for redirects and password reset links. |
| `RESEND_API_KEY` | Yes | API key for reset-password email delivery. |
| `GROQ_API_KEY` | Yes | API key for AI guidance completions. |
| `RECOMMEND_RANK_WEIGHT` | No | Weight for rank compatibility score. |
| `RECOMMEND_FEES_WEIGHT` | No | Weight for affordability score. |
| `RECOMMEND_PLACEMENT_WEIGHT` | No | Weight for placement score. |
| `RECOMMEND_MIN_EXPECTED_RANK` | No | Best expected rank bound for recommendation normalization. |
| `RECOMMEND_MAX_EXPECTED_RANK` | No | Lowest expected rank bound for recommendation normalization. |
| `RECOMMEND_MAX_RANK_DIFFERENCE` | No | Maximum rank gap used for rank-match scoring. |
| `RECOMMEND_TOP_N` | No | Number of recommendations returned. |

## Deployment

1. Create a production PostgreSQL database.
2. Configure required environment variables in the hosting provider.
3. Run `npx prisma migrate deploy`.
4. Build the application with `npm run build`.
5. Start the server with `npm run start` or deploy through a managed Next.js platform.

Operationally, production deployments should also add log monitoring, API rate limiting for AI and auth endpoints, and a scheduled database backup policy.
