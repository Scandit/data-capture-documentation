# Design: GitHub Pages PR preview deploys

Date: 2026-08-13
Status: Approved

## Problem

Reviewers currently have no way to see a rendered preview of a docs PR — only
the diff and the `build-docs.yml` build-success signal. We want each PR to get
a live preview link that is automatically removed once the PR is closed
(merged or abandoned).

## Context

- Docs site is Docusaurus 3, built with `yarn build`.
- `docusaurus.config.ts` already reads `baseUrl` from `process.env.base_url`
  (currently unused elsewhere in the repo) — this is the hook we use to make
  each PR's build resolve its assets under its own subpath.
- Production `docs.scandit.com` is deployed by something outside this repo;
  `build-docs.yml` only builds to verify, it doesn't deploy. Adding GitHub
  Pages here is net-new and doesn't touch production deployment.
- Repo is public (`Scandit/data-capture-documentation`), so GitHub Pages
  content is not a new exposure — it mirrors what's already public at
  docs.scandit.com.
- No `gh-pages` branch or Pages configuration exists yet.
- Contributor model is internal-only (trusted Scandit branches, not random
  public forks), so the preview workflow can use the default `GITHUB_TOKEN`
  with elevated `permissions:` declared at the workflow level, without needing
  fork-PR approval gating.
- Existing `build-docs.yml` and `docs-gate.yml` both trigger on PRs targeting
  `main` and `release/**`.

## Approach

Use `rossjrw/pr-preview-action`, a GitHub Action purpose-built for this exact
pattern: deploy a PR's build output to a per-PR subfolder on a `gh-pages`
branch, post/update a sticky PR comment with the live link, and automatically
remove that subfolder (and update the comment) when the PR closes.

Rejected alternatives:

- **Hand-rolled** (`peaceiris/actions-gh-pages` + a comment action + a
  separate cleanup workflow): reinvents what the action already does, and the
  cleanup/concurrency logic on a shared `gh-pages` branch is exactly where
  hand-rolled solutions tend to develop subtle races.
- **Netlify/Cloudflare Pages previews**: first-class PR preview support, but
  introduces a new third-party integration/account, which is more than this
  request needs given GitHub Pages was explicitly asked for.

## Design

### New workflow: `.github/workflows/docs-preview.yml`

Separate file from `build-docs.yml`/`docs-gate.yml` because it needs
different permissions (`contents: write`, `pull-requests: write`) and a
`closed` trigger neither of the existing workflows has.

- Trigger: `pull_request`, types `[opened, synchronize, reopened, closed]`,
  branches `[main, release/**]` — matches the scope of the existing
  build/gate workflows.
- Concurrency: `group: docs-preview-${{ github.event.number }}`,
  `cancel-in-progress: true` — a rapid string of pushes to one PR cancels the
  stale run instead of racing it.
- Permissions declared explicitly on the workflow: `contents: write`,
  `pull-requests: write`.

Two paths based on event type:

1. **Not closed** (`opened`, `synchronize`, `reopened`):
   - Checkout, setup Node/Yarn (same versions as `build-docs.yml`), install
     deps.
   - `yarn build` with
     `base_url=/data-capture-documentation/pr-preview/pr-<PR_NUMBER>/`.
   - Run `rossjrw/pr-preview-action` with `source-dir: build`, deploying to
     the `gh-pages` branch (created automatically on first run if absent).
   - The action posts/updates a single sticky PR comment with the resulting
     URL: `https://scandit.github.io/data-capture-documentation/pr-preview/pr-<N>/`.
   - Runs independently of `docs-gate.yml` — no `needs:` dependency. Preview
     deploys regardless of gate pass/fail so reviewers can see the rendered
     page while style/lint issues are still being fixed.

2. **Closed** (merged or just closed):
   - No build step needed.
   - Run `rossjrw/pr-preview-action` in its removal mode: deletes that PR's
     `pr-preview/pr-<N>/` subfolder from `gh-pages` and updates the sticky
     comment to say the preview was removed.

### One-time setup outside this repo's code

After the first workflow run creates the `gh-pages` branch, a repo admin
needs to confirm **Settings → Pages → Source** is set to "Deploy from a
branch" / `gh-pages` / `(root)`. GitHub sometimes auto-configures this on
first branch push; this needs to be checked and set manually if not. (I don't
have admin rights on this repo to verify this myself — confirmed via `gh api`
returning 403/404 on the Pages and Actions-permissions endpoints.)

### Edge cases

- **Concurrent PRs deploying at once**: handled by the action itself — each
  PR writes to its own subfolder; this is the action's designed use case.
- **Failing `yarn build`**: job fails, no deploy, no comment update/change —
  same failure signal as `build-docs.yml` today.
- **PR closed without ever having a successful preview build** (e.g. build
  always failed): removal step is a no-op if the subfolder doesn't exist.

## Verification plan

No unit tests apply — this is CI configuration. Verify by:

1. Opening a real test PR and confirming the sticky comment appears with a
   working link, and that the deployed site's assets resolve correctly
   (`base_url` correctness).
2. Closing that PR and confirming the subfolder is removed from `gh-pages`
   and the comment is updated.
3. Opening two PRs concurrently and confirming neither preview clobbers the
   other.
