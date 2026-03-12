---
description: "Release notes and updates for ID Bolt."
toc_max_heading_level: 3
displayed_sidebar: boltSidebar
framework: bolt
keywords:
  - bolt
hide_title: true
title: Release Notes
---

## 2.2.0

**Released**: February 24, 2026

### New Features

* Granular anonymization control: configure which specific fields to anonymize, either using a default set or by specifying extra fields per document type. See [Data Handling](../data-handling) for details.

## 2.1.0

**Released**: January 21, 2026

### New Features

* Allow scanning of the table on the back of EU driver licenses.
* Include the full decoded barcode result when scanning barcode on the back of US driver licenses.


## 2.0.0

**Released**: January 12, 2026

### New Features

* Updated Scandit Data Capture SDK to 8.x.
* ID-Bolt SDK changes to align with Scandit Data Capture SDK 8.x.
* Learn-more feature: User customizable content and external link to provide more information about the scanning process.

### Bug Fixes

* Improved translation strings with more concise error and success messaging.


## 1.19.0

**Released**: November 11, 2025

### Bug Fixes

* US RealID check now also checks RealID compliance for VIZ scan, before it would only check barcode. Requires update to ID-Bolt SDK 1.19.0.
* Other minor bug fixes.


## 1.18.0

**Released**: October 21, 2025

### New Features

* New configurator to be included in the customer dashboard.


## 1.17.0

**Released**: October 6, 2025

### New Features

* Add option to enforce VIZ being scanned when scanning passports.
* Support for UK Military ID and UAE ESAAD card.
* Support for supplying an external transaction ID to ID-Bolt, for better analytics and tracking.

### Bug Fixes

* Wrong help text being shown when scanning on mobile device with low resolution camera.
* Show personal id number instead of document number in result screen, when document number is not available.
* Fix incorrect caching issue during new version deployments of ID-Bolt service.

## 1.16.0

**Released**: September 18, 2025

### New Features

* Update of Scandit Data Capture Engine to 7.6.

### Bug Fixes

* Correctly differentiate between "unknown" and "unspecified" gender.
* Fixes case when user could end up with an infinite loading screen.
* Fixes issue with camera switch icon disappearing after changing pages.

## 1.14.0

**Released**: August 11, 2025

### New Features

* Add option to disable closing of ID-Bolt with the browser back button.

## 1.13.0

**Released**: July 21, 2025

### New Features

* Result from ID-Bolt now contains full MRZ and VIZ result sections.
* Update to Scandit Data Capture 7.4.0.

### Bug Fixes

* Fixed issue where camera would not be correctly stopped after a scan end.

## 1.11.0

**Released**: July 4, 2025

### New Features

* Issuing Authority exposed in the scan result.

## 1.10.0

**Released**: June 17, 2025

### New Features

* SDC updated to 7.3.0.

### Bug Fixes

* "Remote scan session expired" shows an improper error message.
* "ID scanned" image not showing when imaged disabled.
* Fix issues caused with very strict browser data security settings.

## 1.9.0

**Released**: June 10, 2025

### New Features

* CSS customization of buttons, links and titles is now available.

### Bug Fixes

* General bug fixes and improvements.

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

## 1.2.0

**Released**: February 5, 2025

### New Features

* Added support for new document types from WebSDK 7.x.
* Support for 2-letter country codes.
* Added accessibility labels to all elements of ID Bolt service.
* Allow customers to provide their own translations (new languages or different strings).
* Updated WebSDK to latest 7.x.

### Bug Fixes

* Fixed vertical scroll bar issue in handover flow result screen.
* Fixed issue with US RealID validation settings.
* Fixed issue where scanner stops responding after scanning ID card/DL/Resident permit with full scanner type in handover flow.

## 1.1.0

**Released**: October 11, 2024

### New Features

* Added support for scanning ICAO Visas.
* Provide more language support out of the box.
* Configurability of colors of text, background and icons.
* Make start guidance and result display optional.
* Attribution page for OSS components.

### Bug Fixes

* Fixed issue where welcome screen is still flashed once before proceeding even when disabled.
* Fixed issue where welcome text is wrong when multiple same document types selected.
