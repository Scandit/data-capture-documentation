---
toc_max_heading_level: 3
displayed_sidebar: boltSidebar
framework: bolt
tags: [bolt]
keywords:
  - bolt
hide_title: true
title: Release Notes
---

<!-- ## 1.5.0

**Released**: March 31, 2025

### New Features -->

## 1.4.0

**Released**: March 18, 2025

### New Features

* Improved Accessibility functionality.
* Improved handling of connection issues during handover flow.
* Using the browser back button now properly closes ID Bolt.
* ID Bolt now provides a better indication of data transfer state during handover flow.
* Custom data validators can now be asynchronous.

### Bug Fixes

* Fixed an issue where Camera permission was asked twice on Firefox Mobile.
* Fixed an error when no license key provided.

## 1.3.0

**Released**: February 18, 2025

### New Features

* Optimized data transfer speeds in hand-over flow.
* Added `personalIdNumber` to result structure.

### Bug Fixes

* Fixed an issue where users can get stuck in mobile flow when the welcome screen is disabled.
* Removed non-functional close button in hand-over flow.
* Fixed an issue where mobile flows were reported as desktop in analytics dashboard.
* Disable auto-capitalization of headers.
* Excluded document text override not shown when no documents excluded.
