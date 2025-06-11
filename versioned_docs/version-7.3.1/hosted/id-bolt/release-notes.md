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

## 1.8.0

**Released**: May 26, 2025

### New Features

* Images in the flow can now be customized.
* Fonts used in the flow can now be customized.
* Reduction of images throughout the flow.
* New “connection status” indicator on the QR page.
* When scanning a rejected document, the flow stays in the scanner screen when using newest SDK.

### Bug Fixes

* Fixed an edge case in the SDK that could cause a page navigation in a callback to not execute.
* Document Type not properly extracted for residence permit and health insurance card.

## 1.6.0

**Released**: April 15, 2025

### New Features

* Large assets are now delivered compressed to speed up loading times.
* Comprehensive data analytics collection system.
* Raw MRZ data exposed in result.
* Browser history is reset to the original state when closing ID-Bolt modal.
* Error screen when loading of Scandit SDK fails.
* Ability to keep ID-Bolt “alive” after a successful session to retain camera permission and speed up subsequent sessions.
* Updated Scandit SDK to version 7.2.

### Bug Fixes

* Localization string improvements.
* Translations not properly applied in certain cases.

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
