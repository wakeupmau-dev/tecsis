# Backend auth plan

Passkey enrolment, login, sessions, admin and error logging for the tecsis Express backend.
Ported from the Chiron "Dashboard Enrollment" spec
(https://claude.ai/artifact/DqUAcLHwuhHCkG1b9DYYau). Built 2026-10-08 to 2026-10-09.
All milestones below are done; this file is for re-checking them.

## Decisions taken against the spec

- **No iNet identity proof.** Enrolment is live: the admin is present when the person
  enrols, so the forwarded-link attack the iNet check guards against does not apply.
  `inetUserId`, `askedAt` and the `asked` stage are gone; stages are `trusted` → `admitted`.
- **No `name` on users.** The email is the only identifier.
- **Express POST routes** instead of Next server actions. Every response is a value
  (`{ … }` or `{ error }`), never a thrown error.
- **Login options are wrapped in `{ options }`**, matching registration (the source
  returned them bare).
- **Sessions last a fixed 2 hours** from sign-in; use never extends them.
- **Plain collection names, set explicitly** on every model: `users`, `credentials`,
  `sessions`, `challenges`, `enrolment-codes`, `audits`, `error-logs`, `leads`.
- **Sessions follow the source implementation**: cookie carries 32 random bytes, row stores
  `sha256(token)`; revocation sets `revokedAt` rather than deleting; expiry checked on read;
  cookie `expires` equals the row's `expiresAt`; `getSession` returns the same `null` for
  every refusal and re-checks `user.active` on every read; `endSession` revokes before
  clearing the cookie.
- **Errors are logged to Mongo** (`error-logs`, 90-day TTL), not an external service.

## Milestones

**M1. Foundations**
1. Installed `@simplewebauthn/server` 14, `cookie-parser`.
2. `src/config/webauthn.ts`: `rpName = "Tecsis"`; `rpID()` / `rpOrigin()` from
   `WEBAUTHN_RP_ID` / `WEBAUTHN_ORIGIN`, throw in production when unset, fall back to
   `localhost` / `http://localhost:5173` in development.
3. `src/middleware/errorHandler.ts`: 4xx → `{ error: "Bad request" }`, else 500
   `{ error: "Something went wrong" }`. Mounted last.

**M2. Models** (`src/models/`)
1. `User`: email (unique, lowercased), userHandle (32 random bytes, unique), role
   `admin|collaborator`, stage `trusted|admitted`, addedBy, active.
2. `EnrolmentCode`: linkTokenHash (unique), email, expiresAt (TTL), usedAt, issuedBy.
   Lifetime 10 minutes.
3. `Challenge`: challengeId (unique), challenge, purpose, email (null for login),
   expiresAt (TTL). Lifetime 5 minutes.
4. `Credential`: userId (unique — one passkey per user), credentialID (unique), publicKey,
   counter, aaguid, backupEligible, backupState, transports, label, lastUsedAt.
5. `Audit`: event (free string), userId, email, detail; createdAt only; index on
   `{ event, createdAt }`.
6. `Session`: tokenHash (unique), userId, credentialID, expiresAt (TTL), revokedAt,
   lastUsedAt. Lifetime 2 hours.
7. `Lead`: collection name made explicit (`leads`, unchanged).

**M3. Helpers** (`src/lib/`)
1. `audit.ts`: `recordAudit`, outside transactions; a failed write goes to `logError` and
   never fails the request.
2. `tokens.ts`: `mintToken` (32 bytes base64url), `hashToken` (sha256 hex). Also used for
   `userHandle`.
3. `messages.ts`: `ENROLMENT_REFUSAL`, `PASSKEY_NOT_SAVED`, `LOGIN_REFUSAL`.

**M4. Enrolment** (`src/controllers/enrolment.ts`, mounted at `/api/auth/enrol`)
1. `POST /options` `{ token }`: live invitation → active user → not enrolled →
   options (`userID` = userHandle, `residentKey` and `userVerification` required,
   attestation `direct`, no `authenticatorAttachment`) → challenge row + `enrol_challenge`
   cookie (httpOnly, SameSite=Strict, Secure in prod, path `/api/auth`).
2. `POST /verify` (RegistrationResponseJSON): clear cookie → delete challenge before
   verifying → re-check user, not enrolled, invitation still live → verify with
   `requireUserVerification` → one transaction: credential + invitation `usedAt` + stage
   `admitted` → audits `credential.registered`, `code.consumed`, `user.admitted`.
3. Routes + `cookie-parser` mounted.

**M5. Login and sessions**
1. `src/controllers/login.ts`: `POST /api/auth/login/options` (discoverable, UV required,
   `login_challenge` cookie); `POST /api/auth/login/verify` (delete challenge first, find
   credential, check user and returned userHandle, verify, update counter / backup flags /
   lastUsedAt, audit `credential.backup_drift` on change).
2. `src/lib/session.ts`: `createSession`, `endSession`; `POST /api/auth/logout`.
3. `getSession`, `requireSession`, `requireAdmin` (`src/middleware/auth.ts`); `Auth` type.
4. Routes mounted at `/api/auth` (added mid-plan; the original plan had no routes step).

**M6. Admin** (`src/controllers/admin.ts`, mounted at `/api/admin`, all behind `requireAdmin`)
1. `POST /users` `{ email, role? }`: creates a `trusted` user; audit `user.trusted`.
2. `POST /invitations` `{ email }`: one transaction retires live invitations for the email
   and creates the new one (`src/lib/invitations.ts`); returns `{ token, expiresAt }`;
   audit `code.issued` / `code.issue_failed`.
3. `DELETE /users/:id/credential`: one transaction deletes the credential, revokes the
   user's sessions, sets stage back to `trusted`; audit `credential.revoked`.
4. Routes (added mid-plan, same reason as M5.4).

**M7. Bootstrap**: `npm run bootstrap -- <email>` (`src/scripts/bootstrap.ts`). Refuses
once any admin has a passkey; creates the admin if missing; prints a raw invitation token.

**M8.** `GET /api/leads` behind `requireAdmin`. `POST /api/leads` stays public.

**M9. Error logging**
1. `ErrorLog` model, `error-logs`, 90-day TTL.
2. `logError(error, { req?, userId?, context? })` (`src/lib/errorLog.ts`): method and path
   only, never bodies or query strings; never throws, falls back to the console.
3. `errorHandler` logs every 500.
4. `recordAudit` failures and the enrolment save failure go through `logError`;
   `unhandledRejection` / `uncaughtException` log then exit 1.
5. `GET /api/admin/errors?limit=&before=`: newest first, `limit` default 50 max 200,
   cursor is the last `_id`; returns `{ errors, next }`.

## Additions beyond the spec (re-check these)

- `issueInvitation` refuses "That person already has a passkey." — the spec lists no such
  refusal on the invite side.
- Revoking a credential also revokes that user's sessions and resets the stage.
- `LOGIN_REFUSAL` wording ("That did not work. Try again.") is ours; the spec gives none.
- Audit events added: `login.succeeded`, `login.failed`, `session.ended`,
  `credential.backup_drift`, `credential.revoked`.
- Enrolment verify re-checks the invitation by email, not by the exact token used at
  options. Correct only while minting keeps one live invitation per email (M6.2 does).
- If the `issueInvitation` transaction itself throws, it returns a 500 and is logged, but
  writes no `code.issue_failed` audit row.

## Verified so far

- Type-check passes on every step; the server starts.
- `GET /` health check; `POST /api/leads` with an invalid email → 400; malformed JSON → 400.
- Without a session: `POST /api/admin/users`, `GET /api/admin/errors`, `GET /api/leads` → 401.
- Bootstrap usage error; bootstrap with a real email produced a token (run by the user).

## Not yet exercised

Enrolment options/verify, login options/verify, logout, session expiry and revocation,
admin create/invite/revoke with a session, both transactions, `GET /api/admin/errors` with
a session. These need the frontend screens (`dashboard-ui-plan.md`, F6).

## Production settings

`WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, `NODE_ENV=production`, `MONGO_URL` (must be a replica
set; Atlas is). Changing `WEBAUTHN_RP_ID` after people enrol orphans every passkey.
