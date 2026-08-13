# GitHub Pages PR Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every PR against `main` or `release/**` gets a live GitHub Pages preview link (posted as a PR comment) that is automatically removed once the PR is closed.

**Architecture:** A single new GitHub Actions workflow, `.github/workflows/docs-preview.yml`, builds the Docusaurus site with a PR-specific `base_url` and hands it to `rossjrw/pr-preview-action`, which deploys it to a per-PR subfolder on the `gh-pages` branch, posts a sticky PR comment with the link, and removes the subfolder when the PR closes — all via that one action's built-in `auto` mode (deploy on open/reopen/synchronize, remove on close).

**Tech Stack:** GitHub Actions, `actions/checkout@v4`, `actions/setup-node@v4`, Yarn, Docusaurus 3 (`yarn build`), `rossjrw/pr-preview-action@v1`.

## Global Constraints

- Node version: `18` (match `.github/workflows/build-docs.yml`).
- Dependency install: `yarn install --frozen-lockfile` (match existing workflows).
- Trigger scope: `pull_request` targeting `main` and `release/**` (match `build-docs.yml` / `docs-gate.yml`).
- Preview deploys independently of `docs-gate.yml` — no `needs:` dependency on it.
- Preview URL must resolve to `https://scandit.github.io/data-capture-documentation/pr-preview/pr-<N>/` (the action's default path — do not override `umbrella-dir`/`pr-number`/`pages-base-url`).
- Contributor model is internal-only (same-repo branches, not forks) — `rossjrw/pr-preview-action` does not support fork PRs today, which matches this repo's usage and needs no extra handling.
- Do not put any new files under `docs/` — that directory is the live Docusaurus content tree (governed by `docs-schema.yml`); use `.claude/` for planning artifacts instead.
- Two one-time **repository settings** (not code) are required for this to work at all, per the action's own documentation:
  1. **Settings → Pages → Build and deployment → Source** = "Deploy from a branch", branch = `gh-pages` / `(root)`.
  2. **Settings → Actions → General → Workflow permissions** = "Read and write permissions". This is a hard ceiling — a workflow's own `permissions:` block cannot grant more than this repo-wide default allows, no matter what the YAML says.

---

### Task 1: Add the `docs-preview.yml` workflow and verify it end-to-end

**Files:**
- Create: `.github/workflows/docs-preview.yml`

**Interfaces:**
- Consumes: nothing from other tasks (this is the only task).
- Produces: nothing consumed elsewhere — this is a standalone CI workflow, not a library.

There is no unit-test framework for a GitHub Actions workflow, so "tests" here are (a) a fast local YAML-syntax check as the red/green loop, and (b) a real end-to-end check on an actual pull request, which is the only way to verify GitHub-side behavior (comment posting, Pages deploy, cleanup on close).

- [ ] **Step 1: Write the workflow file**

Create `.github/workflows/docs-preview.yml` with this exact content:

```yaml
name: Deploy PR Preview

on:
  pull_request:
    types: [opened, reopened, synchronize, closed]
    branches:
      - main
      - 'release/**'

concurrency:
  group: docs-preview-${{ github.event.number }}
  cancel-in-progress: true

permissions:
  contents: write
  pull-requests: write

jobs:
  docs-preview:
    name: Deploy or remove PR preview
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        if: github.event.action != 'closed'
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        if: github.event.action != 'closed'
        run: yarn install --frozen-lockfile

      - name: Build documentation
        if: github.event.action != 'closed'
        run: yarn build
        env:
          base_url: /data-capture-documentation/pr-preview/pr-${{ github.event.number }}/

      - name: Deploy or remove PR preview
        uses: rossjrw/pr-preview-action@v1
        with:
          source-dir: ./build/
```

Notes for the implementer:
- The `if: github.event.action != 'closed'` guards skip the build steps on a `closed` event — there's nothing to build when the preview is about to be torn down.
- `rossjrw/pr-preview-action`'s `action` input defaults to `auto`: it deploys on `opened`/`reopened`/`synchronize` and removes on `closed`, based on the same event payload the `if:` guards above check. No need to set `action:` explicitly.
- Do not set `umbrella-dir`, `pr-number`, or `pages-base-url` — their defaults already produce `https://scandit.github.io/data-capture-documentation/pr-preview/pr-<N>/`, matching the `base_url` set on the build step above. Changing one without the other will break asset paths.

- [ ] **Step 2: Validate YAML syntax locally**

Run:
```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/docs-preview.yml', 'utf8')); console.log('valid yaml')"
```
Expected: prints `valid yaml` with no exception. (`js-yaml` is already a `devDependency` in `package.json` — no install needed.)

If this throws, fix the indentation/syntax error it reports and re-run before moving on.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/docs-preview.yml
git commit -m "$(cat <<'EOF'
ci: add GitHub Pages PR preview deploys

Builds each PR with a per-PR base_url and deploys it to a gh-pages
subfolder via rossjrw/pr-preview-action, which also removes the
preview automatically when the PR closes.
EOF
)"
```

- [ ] **Step 4: Check/set the two required repository settings**

Attempt to read the current state via the API first:
```bash
gh api repos/Scandit/data-capture-documentation/actions/permissions/workflow
gh api repos/Scandit/data-capture-documentation/pages
```

If either call 403s (insufficient permission on the current `gh` auth) or shows the wrong value, **stop and ask a repo admin** to set, via the web UI, both of:
1. Settings → Pages → Build and deployment → Source → "Deploy from a branch" (branch `gh-pages` will appear in the dropdown only after Step 5 below has pushed to it at least once — if it's not there yet, do Step 5 first, then come back to this).
2. Settings → Actions → General → Workflow permissions → "Read and write permissions" → Save.

Do not proceed to Step 5's live verification until permission #2 is confirmed — without it, the workflow run will fail with a git push permission error, not a useful "Pages isn't set up" error.

- [ ] **Step 5: Push and open the real PR to verify deploy behavior**

This branch (`feat/github-pages-per-mr`) already exists and is clean apart from this task's commits — push it and open the PR against `main`:
```bash
git push -u origin feat/github-pages-per-mr
gh pr create --title "ci: add GitHub Pages PR preview deploys" --body "Adds a preview-link workflow for docs PRs. Verifying end-to-end in this PR before requesting review." --draft
```
Then watch the run:
```bash
gh pr checks --watch
```
Expected: the `docs-preview` job succeeds, and `gh pr view --comments` shows a sticky comment from the action containing a link of the form `https://scandit.github.io/data-capture-documentation/pr-preview/pr-<N>/`. Open that link and confirm the page loads with correctly-resolved CSS/JS (not a blank/broken-asset page — that would indicate a `base_url` mismatch).

- [ ] **Step 6: Verify cleanup, then verify re-deploy, without losing the PR**

Close the PR without merging, confirm removal, then reopen it (this exercises both the `closed`/remove path and the `reopened`/re-deploy path using the same PR, so nothing is thrown away):
```bash
gh pr close <PR_NUMBER>
gh pr checks <PR_NUMBER> --watch
```
Expected: the `docs-preview` job runs again (this time skipping the build steps per the `if:` guard) and the sticky comment updates to say the preview was removed. Confirm the URL from Step 5 now 404s.

```bash
gh pr reopen <PR_NUMBER>
gh pr checks <PR_NUMBER> --watch
```
Expected: job runs the full build+deploy path again, comment updates back to a working link, and the URL loads again.

Leave the PR open (as a draft) for normal review — merging it later will trigger the same removal path for real, which is the intended steady-state behavior for every future PR.

- [ ] **Step 7: Verify subfolder isolation with a second PR**

The spec's verification plan calls for confirming that two PRs deploying at once don't clobber each other. Actually racing two workflow runs against the same instant isn't reliably reproducible on demand; what we can and should check is the property that actually matters — that a second PR's preview is written to its own subfolder and doesn't disturb the first PR's still-open preview from Step 6. Make a trivial throwaway change on a second branch (e.g. fix a typo in `README.md`) and open a second PR:
```bash
git checkout main && git pull
git checkout -b chore/docs-preview-isolation-check
# make a trivial one-line edit, e.g. to README.md
git commit -am "chore: trivial edit to verify PR preview isolation"
git push -u origin chore/docs-preview-isolation-check
gh pr create --title "chore: trivial edit to verify PR preview isolation" --body "Throwaway PR to confirm PR previews don't collide. Will close without merging once confirmed." --draft
gh pr checks --watch
```
Expected: this second PR gets its own comment with its own `pr-preview/pr-<other-N>/` link, and re-fetching the Step-6 PR's link still 200s with its own content unaffected. Then clean up the throwaway:
```bash
gh pr close <OTHER_PR_NUMBER> --delete-branch
```
Expected: that PR's preview is removed and the original PR's preview from Step 6 is still untouched.

- [ ] **Step 8: Mark the PR ready for review**

Once Steps 5–7 all pass, undraft it:
```bash
gh pr ready <PR_NUMBER>
```
