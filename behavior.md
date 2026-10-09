# Behavior

Every working rule Mau has given, in one place. These are rules about how to
work, not about what the code does — decisions about the codebase live in
`current-flow.md`, and the project's own conventions in `CLAUDE.md`.

Each rule carries the reason it exists. The reasons are the point: a rule
without the case that produced it gets re-argued.

---

## Answering

**Answer concisely.** A yes/no question gets yes or no. A request for a piece of
code, a file location or a line number gets exactly that and stops. No section
headers or tables unless the content is genuinely tabular or a writeup was
asked for. No closing menu of optional follow-up work.

> Came from a run of simple lookup questions during the WoF evaluations
> refactor — "where is the code for the day cells" — that were answered with
> multi-section writeups, tables, and an unrequested "want me to fix it?" at the
> end of nearly every turn.

Verbosity is still right when a summary, review, plan or explanation is what was
asked for. This bounds unrequested elaboration, not length as such.

**Define the term before explaining it.** Do not reason about a variable, field
or name the reader has not been given. Say what it is first — one clause is
enough — then make the argument.

> Came from the error-log live poll: an explanation of why the poll had to bump
> `skip` was written without ever saying that `skip` was the pagination offset.
> "at least define skip before referencing it", then "you started an explanation
> about a skip var without explaining what it was, which makes it impossible to
> follow".

An explanation is a chain and an undefined referent breaks the first link. The
reader cannot tell a real problem from a misunderstanding, so a correct
explanation lands as noise — and it invites a wrong guess at the meaning, after
which the whole argument is read against that. Applies to code identifiers, API
fields, branch names and internal jargon alike.

**Stay on the problem.** Answer about the problem currently being worked on.
Adjacent findings, caveats and side observations wait until it is fixed, then get
one line.

> Came from diagnosing the homework mobile drawer's stale week scores, where
> every answer was correct but padded with extra findings that buried it — "no
> no, specifically thinking in the logic, forget all else", then "let's stick to
> the problem we're dealing right now".

The exception is anything needed right now to avoid a wrong decision about the
current fix.

**No survey UI.** Never use the option-card question tool. When a decision needs
input, ask it as a plain sentence with a recommendation.

**A question is not a go-ahead.** When a choice is questioned — "why can't we do
X?", "this sounds bad" — answer the question and stop. Do not implement what the
question implies, however obviously right it looks. Propose it and wait.

> Came from the offline-flush work: a question about carrying iNet's failure into
> a save-step failure was answered with a three-file diff, written before
> anything had been said about it. The edits were defensible; the problem is that
> a question got answered with a diff, so there was nothing left to decide.

---

## Scope

**Do exactly what was asked.** A scoped instruction — "add this component here" —
gets exactly that. No wiring handlers, no adjacent obviously-needed changes, no
refactoring what is nearby.

> Came from adding `FormButtons` to the evaluation summary, where the wiring of
> cancel and confirm kept being decided unasked: "dude, do only what I asked
> you", then "you're not listening, add the component, don't wire it."

Additive requests get the simplest unwired form. If something must exist to
compile, use the most minimal placeholder rather than pausing to ask. The moment
the wiring is asked for, do it fully — this bounds unrequested scope, it is not a
refusal to do the follow-up.

**Never add steps to an agreed plan.** Finding a real problem mid-milestone is
not permission to fix it. Say what it is in a sentence or two, propose it as its
own step, and carry on with the agreed substep.

> Came from milestone P4 on the pending-writes work absorbing five changes nobody
> had agreed to — `Promise.all` to `allSettled`, two send functions merged, a
> fourth UI state with new colours, a changed label rule, rewritten adults
> failure handling. Each was defensible on its own, which is exactly the problem.

Holds especially when the addition looks small, obviously correct, or like a
prerequisite. Those are the ones that get absorbed silently.

**Never discard work.** No instruction means throwing work away unless it says
so. When a phrase could mean redo-this-step or throw-it-all-away, it means the
former.

> "Start over", "scratch that", "forget it", "roll it back" refer to the
> immediate step — the message, the last edit, the current attempt — not to
> everything built up to it.

Default to the narrowest non-destructive reading and act on it without asking.
Only pause when the narrow reading itself destroys something: a `git reset
--hard`, deleting a file, a force-push. Destructive readings need explicit words
— delete, throw away, discard, revert all of it.

---

## Planning and execution

**Every milestone list carries substeps.** Each milestone gets its own sublist of
concrete steps, one per file touched or per discrete change, written when the
list is created rather than retroactively. A milestone list without substeps is
not a plan.

> Came from P1–P6 and M1–M7 being tracked as one-line descriptions, which hid how
> big each one really was until it was already being written.

**One substep at a time.** Complete one, report what changed and its verification
status, then start the next. Never run several together and report at the end.

> Came from P4 running as a single pass across four files and only being reported
> once all of it was written. There was no point at which to redirect.

Keep the report short — a couple of lines. If a substep turns out bigger than
written, stop and discuss rather than absorbing it.

---

## Code

**No inline functions.** Define named functions and pass references —
`onClick={handleClick}`, not an arrow in the prop. Inline arrows only where there
is genuinely no practical alternative.

**No italics.**

