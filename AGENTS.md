# AI Agent Guide for Scandit Documentation

This document helps AI agents work effectively with the Scandit Data Capture documentation repository. It covers common patterns, important gotchas, and best practices.

## Repository Overview

This is a **Docusaurus 3.4.0** documentation site for Scandit's Smart Data Capture SDK. It supports multiple SDK platforms (iOS, Android, Web, React Native, Flutter, Cordova, Capacitor, Titanium, .NET) and hosted products (Scandit Express, ID Bolt).

**Key Technologies:**
- Docusaurus 3.4.0 (TypeScript configuration)
- SASS/SCSS for styling
- Algolia for search
- Custom theme components in `src/theme/`
- Python scripts for version management in `scripts/`

## Common Tasks

### 1. Adding/Updating Documentation Content
- Edit files in `docs/` for current version documentation
- Use MDX format (Markdown with JSX components)
- Follow existing frontmatter conventions (see Frontmatter section below)
- Reuse shared content via partials in `docs/partials/`

### 2. Managing Versions and Releases
- **DO NOT manually edit `versioned_docs/` or `versions.json`** - use Python scripts in `scripts/`
- See "Version Management" section below for detailed workflows

### 3. Configuration Changes
- Main config: `docusaurus.config.ts`
- Sidebar config: `sidebars.ts`
- Be cautious with redirects (see Redirects section)
- Theme customizations: `src/theme/` and `src/css/`

## Documentation Structure

### Directory Layout

```
docs/                          # Current version (next release)
├── sdks/                      # SDK documentation by platform
│   ├── ios/
│   ├── android/
│   ├── web/
│   └── ...                    # Other platforms
├── hosted/                    # Hosted products (Express, ID Bolt)
└── partials/                  # Shared content imported by multiple pages

versioned_docs/                # Frozen snapshots of past versions
├── version-7.6.5/
└── version-6.28.7/

versioned_sidebars/            # Sidebar configs for past versions
versions.json                  # List of available versions
```

### Frontmatter Conventions

**Required fields:**
```yaml
---
description: "Brief description for SEO and previews"
---
```

**Common optional fields:**
```yaml
sidebar_position: 1            # Order in sidebar
sidebar_label: 'Custom Label'  # Override title in sidebar
title: 'Page Title'            # Override H1 heading
pagination_prev: null          # Disable previous page link
pagination_next: null          # Disable next page link
toc_max_heading_level: 4       # Max heading depth in TOC
displayed_sidebar: iosSidebar  # Force specific sidebar
framework: ios                 # Platform identifier
keywords:                      # SEO keywords
  - ios
  - barcode
```

**Fields to AVOID:**
- `tags` - Removed from all pages (not useful for this site)

### Content Organization Patterns

1. **Platform-specific content** lives in `docs/sdks/{platform}/`
2. **Shared content** uses partials:
   ```mdx
   import SharedContent from '../../partials/_shared-content.mdx';
   <SharedContent/>
   ```
3. **Cross-references** use relative paths: `[Link](../other-page)`
4. **API references** link to external hosted API docs
5. **Code samples** embedded inline or linked to GitHub repos

## Version Management

### Understanding the Versioning System

Documentation versions are tightly coupled to SDK releases and can generally be in two states:
- *No ongoing beta*: The current version (`docs/`) is the latest stable version while the version snapshots (`versioned_docs/`) are the latest state of previous major versions.
- *Ongoing beta*: If there is an active beta the current version (`docs/`) is the next upcoming release (marked as "unreleased"), the first version snapshot (`versioned_docs/`) is the latest stable version (and still the default landing page) and all other snapshots are the latest state of previous major versions as usual.

### Version Lifecycle

#### Beta Release Process
1. **Before beta release:**
   - All work happens in `docs/` (current version)
   - Current version label shows next version number (e.g., "8.1.0")
   - Banner shows "unreleased"

2. **Beta release:**
   - Python scripts in `scripts/` create a snapshot of current version
   - Beta version becomes the current version with "unreleased" banner
   - Snapshot preserved temporarily during beta period

3. **Stable release:**
   - Snapshot removed (beta becomes the official version)
   - "unreleased" banner removed from current version
   - Current version bumped to next version number

#### Major Release Process (e.g., 7.0.0 → 8.0.0)
1. When a new major version is released, a **permanent snapshot** is created
2. The snapshot is frozen in `versioned_docs/version-{X}.{Y}.{Z}/`
3. This snapshot persists forever and shows documentation at that point in time
4. Major version snapshots are rarely updated (see "When to Edit Versioned Docs")

### When to Edit `docs/` vs `versioned_docs/`

**Edit `docs/` (current version) for:**
- ✅ New features in upcoming SDK releases
- ✅ Documentation improvements for next release
- ✅ Structural changes to navigation/organization
- ✅ New code examples or tutorials

**Edit `versioned_docs/version-X.Y.Z/` for:**
- ✅ Critical bug fixes in old version documentation
- ✅ Typos or errors in released documentation
- ✅ Release notes for patch versions (e.g., 8.0.1, 8.0.2)
- ✅ Backporting navigation changes from current version
- ✅ Corrections to incorrect API documentation

**General rule:** If unsure, edit `docs/` and ask. Versioned docs are snapshots and should only be touched for important corrections or patch release updates.

### Using Version Management Scripts

**DO NOT manually:**
- Edit `versions.json`
- Create/delete folders in `versioned_docs/`
- Modify version configuration in `docusaurus.config.ts`

**DO use Python scripts in `scripts/`:**
```bash
# Create a new version snapshot (when releasing)
python scripts/create_version.py 8.1.0

# Other version management tasks handled by scripts
# (Refer to scripts in scripts/ directory for available operations)
```

## Configuration Files

### docusaurus.config.ts

**Key configuration sections:**

1. **Docs plugin settings** (lines 236-274):
   ```typescript
   docs: {
     routeBasePath: "/",           // Docs at root
     sidebarPath: "./sidebars.ts",
     showLastUpdateTime: false,    // Disabled
     // NO editUrl - removed intentionally
     lastVersion: "8.0.0",         // Default version shown
     versions: {                    // Version-specific config
       current: { label: '8.1.0', banner: 'unreleased' },
       '8.0.0': { banner: 'none', badge: false },
       // ...
     }
   }
   ```

2. **Redirects plugin** (lines 34-226):
   - Extensive redirect configuration for legacy URLs
   - Xamarin platform redirects to migration guide
   - Old URL structure redirects to new structure

3. **Navbar** (lines 307-415):
   - SDK dropdown menu with all platforms
   - Version dropdown
   - External links (Log In, Sign Up, GitHub)

4. **Search** (lines 295-300):
   - Algolia search configuration
   - App ID: RYKD97E6SH
   - Index: scandit

### sidebars.ts

Multi-sidebar configuration for each platform:
- `iosSidebar`
- `androidSidebar`
- `webSidebar`
- etc.

Each sidebar is independently organized but follows similar structure.

## Redirects: Handle with Care

The redirect configuration in `docusaurus.config.ts` is extensive and critical for maintaining SEO and user bookmarks.

**Guidelines:**
1. **Study existing patterns** before adding new redirects
2. **Never remove existing redirects** - old URLs must continue working
3. **Test thoroughly** - broken redirects impact users and SEO
4. **Follow the pattern:**
   ```typescript
   {
     to: '/new/path',
     from: ['/old/path', '/another/old/path'],
   }
   ```

**Common redirect scenarios:**
- Legacy URL structure → New structure
- Deprecated Xamarin docs → Migration guide
- Consolidated pages → Single page
- Renamed SDK platforms → New names

**Warning:** There are some duplicate redirects (see build warnings) that create conflicting paths. Be aware of this when adding new redirects.

## Build and Testing

### Required Validation Steps

Before considering work complete, **always perform these checks:**

1. **Run full build:**
   ```bash
   npm run build
   ```
   - Must complete successfully
   - Pay attention to warnings (they often indicate real issues)
   - Redirect warnings are expected but review new ones
   - **A passing build does not mean the content passes the docs quality gate below** — they check different things and one can be green while the other is red.

2. **Run the docs quality gate on any `docs/` changes:**
   ```bash
   npm run docs:gate:setup   # once per machine — installs Vale styles if `vale` is on PATH
   npm run docs:gate
   ```
   - See "Docs Quality Gate" below — read it before assuming a clean run means the content is clean.

3. **Test locally:**
   ```bash
   npm start
   ```
   - Preview changes in browser
   - Test navigation and links
   - Check both light and dark themes

4. **Check multiple versions:**
   - Switch between version dropdown options
   - Verify changes appear correctly in intended version(s)
   - Ensure versioned docs weren't accidentally modified

5. **Validate links and references:**
   - Internal links work correctly
   - Cross-references between pages are valid
   - Images and assets load properly
   - External links are correct

### Docs Quality Gate

`npm run docs:gate` (`scripts/docs-gate/index.cjs`) is a separate check from the build. It runs frontmatter schema validation, a conservative relative-link check, cspell, and Vale (Google style guide + Scandit's own rules) — but **only against docs changed relative to the PR's target branch** (`git merge-base origin/<base> HEAD`), not the whole repo. It also runs as a local `pre-push` git hook (`.husky/pre-push`), and in CI as the "Docs Quality Gate" workflow on every PR into `main` or `release/**`.

**Only Vale errors (`✗`) block the push/PR — cspell findings are warnings (`⚠`) by design** (too many legitimate proper nouns and code identifiers for a hard block today) and don't need to be zero. Don't spend effort silencing cspell unless asked to; do treat every Vale `✗` as build-blocking.

**Vale/cspell must actually be installed to mean anything.** If they're missing, the script does *not* fail — it prints `Vale not installed — skipping prose style check` / `cspell not found — skipped` and returns a clean result. A "0 errors" from `docs:gate` on a machine without Vale installed only means "0 checked," not "0 issues." Install before trusting a green run:
```bash
brew install vale        # macOS; see https://vale.sh/docs/vale-cli/installation/ for others
npm run docs:gate:setup  # syncs the Google style package into styles/Google/ (gitignored, don't commit it)
```
(CI installs Vale itself and hard-fails the gate if it's somehow missing there — the local skip-with-warning behavior is a local-only convenience, not how it behaves in CI.)

**The ratchet means old content can suddenly fail.** The base for the diff is the PR's true fork point, not "since your last commit" — so a long-lived branch (like a release branch that hasn't merged `main` in a while) can surface Vale violations from *anyone's* earlier commit the first time the gate actually runs against it, not just from what you just touched. If a gate failure lists files you didn't edit, check `git log <merge-base>..HEAD -- <file>` before assuming your change caused it.

**Style rules that come up constantly in release notes and prose:**
- Bare dotted API/property references in prose (`someObject.SomeMethod`) get misread by Vale as a run-on sentence (`Google.Spacing`, "should have one space"). Wrap them in backticks — `` `someObject.SomeMethod` `` — matching how every other API reference in these docs is formatted. This is the correct fix, not a lint workaround: Vale's markdown parser treats backtick spans as code and exempts them from prose rules.
- No `e.g.` — write `for example,` (`Google.Latin`).
- No spaces around an em or en dash used as a connector or aside — `California–Driver's License`, `brushes—green, red, grey—and` (`Google.EmDash`).
- Commas and periods go inside closing quotation marks (`Google.Quotes`).
- A number and its unit need a nonbreaking space — `6 s`, not `6s` (`Google.Units`). Watch for false positives on non-duration tokens that happen to end in a unit letter (`1d` meaning "1-dimensional" gets misread as "1 day"); disambiguate instead of adding a duration that isn't there (for example, capitalize to `1D`, matching this repo's own usage elsewhere).
- Avoid `simply`, `seamless(ly)`, `effortlessly`, `obviously`, `blazing(ly) fast` (`Scandit.Banned`, prose body) — state the mechanism instead of the vibe. Frontmatter `description:` fields have their own, stricter anti-fluff check banning `efficiently`, `seamless(ly)`, `easily`, `simply`, `robust`, `powerful`, plus fluffy openers like "Learn how to..." (`scripts/docs-gate/frontmatter.cjs`) — different word list, same spirit.

### Build Performance

- Full build takes ~45-60 seconds
- Generates ~489 documentation pages
- Includes LLM-friendly documentation exports
- Creates static files in `build/`

## Important Gotchas

### Deprecated Platforms

**Xamarin is deprecated:**
- No new Xamarin content should be created
- All Xamarin URLs redirect to `/migrate-7-to-8#xamarin-sdk-changes`
- Xamarin docs exist in old versions but not in current
- Replacement: .NET iOS and .NET Android platforms

### UI Elements

**The following UI elements are intentionally disabled:**
- ✅ "Edit this page" button - Removed (no `editUrl` in config)
- ✅ "Last updated" timestamp - Removed (`showLastUpdateTime: false`)
- ✅ Page tags - Removed from all pages (not useful for this site)

### Version Naming

- **"current"** = next unreleased version
- **"lastVersion"** in config = default version shown to users
- Version labels can differ from version IDs:
  - ID: `current` → Label: `8.1.0`
  - ID: `8.0.0` → Label: `8.0.0` (same)

## Communication Style

When working on this repository:
- ✅ **Explain key decisions** - Brief context for important choices
- ✅ **Stay focused** - Don't over-explain trivial changes
- ✅ **Ask before major changes** - Confirm approach for multi-file impacts
- ✅ **Summarize results** - Show what was changed and why

## Platform Priority

All SDK platforms are treated equally - no platform gets special priority over others:
- Native: iOS, Android
- Web: Web, JavaScript
- Cross-platform: React Native, Flutter, Cordova, Capacitor, Titanium
- .NET: .NET iOS, .NET Android

## Quick Reference

### File Extensions
- `.md` - Markdown files
- `.mdx` - Markdown with JSX (can import/export components)
- `.ts` - TypeScript configuration
- `.tsx` - TypeScript React components
- `.scss` - SASS stylesheets

### Important Paths
- Main config: `/docusaurus.config.ts`
- Sidebar config: `/sidebars.ts`
- Current docs: `/docs/`
- Versioned docs: `/versioned_docs/`
- Version scripts: `/scripts/`
- Custom theme: `/src/theme/`
- Custom components: `/src/components/`
- Styles: `/src/css/`

### Commands
```bash
npm start              # Local dev server
npm run build          # Production build
npm run serve          # Serve built site
npm run clear          # Clear cache
```

## Questions or Issues?

If you encounter something not covered in this guide:
1. Check existing documentation patterns
2. Look at recent commits for similar changes
3. Review Python scripts in `scripts/` for version management
4. Ask the maintainer for clarification

---

*Last updated: 2025-12-11*
*Docusaurus version: 3.4.0*
