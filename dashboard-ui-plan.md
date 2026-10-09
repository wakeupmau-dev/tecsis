# Dashboard UI plan

Port of the Chiron dashboard's login and enrolment screens into the tecsis frontend.
Written 2026-10-09, before the decision to migrate the frontend from Vite to Next.
Steps marked (Vite only) drop out if the migration happens first.

## Source

Repo: `~/GitHub/English4Kids/english4kids-client`, branch `chiron-student-stats`.
Read with `git show chiron-student-stats:<path>` so the working copy is not touched.

| Component | Path |
| --- | --- |
| EnrolPage | `src/app/(production)/dashboard/enrol/[token]/page.tsx` |
| EnrolForm | `src/app/(production)/dashboard/enrol/[token]/enrol-form.tsx` |
| LoginPage | `src/app/(production)/dashboard/login/page.tsx` |
| LoginForm | `src/app/(production)/dashboard/login/login-form.tsx` |
| LoginCard, LOGIN_BUTTON | `src/app/common/login-card.tsx` |
| LogoComponent | `src/app/(production)/wof/[classId]/components/logo-component.tsx` |
| DASHBOARD_LANDING | `src/app/(production)/dashboard/landing.ts` |
| GrainientBackground | `src/app/common/grainient-background.tsx` |
| ThemeToggle | `src/app/common/theme-toggle.tsx` |
| ThemeProvider, useTheme | `src/app/context/themeContext.tsx` |
| GlareHover | `src/blocks/Animations/GlareHover/GlareHover.tsx` |
| TechText (844 lines, no deps) | `src/component/TechText.tsx`, `src/component/TechText.css` |
| Theme tokens, dark variant | `src/app/globals.css` |

Tokens used by these screens: `secondary`, `text`, `border`, `text-light-900`,
`text-dark-900`, `box-light-900`, `box-light-100`, `box-dark-600`. Dark mode is
class-based: `@custom-variant dark (&:where(.dark, .dark *));`.

## Milestones

**F1. Infrastructure**
1. Install `@simplewebauthn/browser` (and `react-router`, Vite only).
2. Dev proxy `/api` → `localhost:4000` (Vite only; Next uses `rewrites`).
3. Routes: `/dashboard/login`, `/dashboard/enrol/:token`, bare `/dashboard/enrol` → login,
   `/dashboard` as a placeholder landing (login redirects there).

**F2. Theme**
1. Tokens and the class-based `dark` variant into the global CSS.
2. Port `ThemeProvider` / `useTheme`.
3. Port `ThemeToggle`.

**F3. Shared components**
1. `GlareHover`.
2. `TechText` + CSS.
3. `GrainientBackground`, on the existing `Grainient`.
4. `LogoComponent`.
5. `LoginCard` + `LOGIN_BUTTON`.

**F4. API**
1. Backend: `GET /api/auth/session`.
2. Frontend: `src/lib/api.ts` — enrol options/verify, login options/verify, session.

**F5. Pages**
1. `LoginPage` + `LoginForm`.
2. `EnrolPage` + `EnrolForm`, without the username/password fields and with the
   English4Kids copy rewritten.

**F6. End-to-end**: run `npm run bootstrap -- <email>` again (tokens last 10 minutes)
and enrol in the browser.

## Backend contract (already built)

| Route | Body | Returns |
| --- | --- | --- |
| `POST /api/auth/enrol/options` | `{ token }` | `{ options }` or `{ error }` |
| `POST /api/auth/enrol/verify` | `RegistrationResponseJSON` | `{ success: true }` or `{ error }` |
| `POST /api/auth/login/options` | none | `{ options }` or `{ error }` |
| `POST /api/auth/login/verify` | `AuthenticationResponseJSON` | `{ success: true }` or `{ error }` |
| `POST /api/auth/logout` | none | `{ success: true }` |

Login options are wrapped in `{ options }`, unlike the source's `loginOptionsAction`.

## Open decisions (recommendations proposed, not yet answered)

1. Dark mode: port the class-based variant as-is; it changes `dark:` site-wide, but
   nothing on the landing page uses it yet.
2. Logo: no image yet; show the word "Logo" inside `GlareHover`, like the topbar.
3. `quiz-title` (Silkscreen font): drop the class rather than load the font for one heading.
