---
description: "Release notes and updates for the Scandit Titanium SDK."
toc_max_heading_level: 3
displayed_sidebar: titaniumSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: titanium
keywords:
  - titanium
---

## 7.5.0

**Released**: August 12, 2025

### New Features

* Improved support for non-standard GS1 AI codes.
* The `Barcode` class now exposes a module count.

## 7.4.1

**Released**: July 14, 2025

No updates for this framework in this release.

## 7.4.0

**Released**: June 19, 2025

### Performance Improvements

* Updated ARM MbedTLS from 3.6.2 to 3.6.3.

## 7.3.3

**Released**: July 25, 2025

No updates for this framework in this release.

## 7.3.2

**Released**: June 25, 2025

No updates for this framework in this release.

## 7.3.1

**Released**: June 13, 2025

No updates for this framework in this release.

## 7.3.0

**Released**: May 16, 2025

* Ensure support for Titanium >= 12.2.1GA.

### Behavioral Changes

* MatrixScan Check has been renamed to MatrixScan AR, including in the naming of all relevant APIs.

## 7.2.4

**Released**: August 8, 2025

No updates for this framework in this release.

## 7.2.3

**Released**: June 24, 2025

No updates for this framework in this release.

## 7.2.2

**Released**: May 9, 2025

No updates for this framework in this release.

## 7.2.1

**Released**: April 24, 2025

No updates for this framework in this release.

## 7.2.0

**Released**: March 31, 2025

No updates for this framework in this release.

## 7.1.3

**Released**: March 26, 2025

No updates for this framework in this release.

## 7.1.2

**Released**: March 13, 2025

No updates for this framework in this release.

## 7.1.1

**Released**: March 7, 2025

### Bug Fixes

* Fixed `sc_recognition_context_release` to abort potentially still in-progress background set up of the barcode scanner if `sc_barcode_scanner_wait_for_setup_completed` was not called explicitly.

## 7.1.0

**Released**: February 21, 2025

### Performance Improvements

#### Barcode

* We’ve increased the scan rate of 10% on our datasets of QR codes with high perspective distortion (so scanned at high angles). This is particularly important for cases such as receiving boxes or scanning shelf labels.

### Behavioral Changes

* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

### Deprecations

#### Core

* The following methods of `DataCaptureContext` have been removed:
  * `addMode`: Replaced by `setMode` as only one mode can be active at a time.
  * `removeAllModes`: Replaced by `removeCurrentMode` as only one mode can be active at a time.

## 7.0.2

**Released**: January 20, 2025

No updates for this framework in this release.

## 7.0.1

**Released**: December 19, 2024

No updates for this framework in this release.

## 7.0.0

**Released**: November 29, 2024

### New Features

Scandit's Smart Data Capture SDK v7.0 addresses the industry's toughest scanning challenges with innovative solutions at every layer. Our enhanced scanning engine is context-aware, understanding both the environment and user needs. This results in smoother integrations, a richer user experience, and improved scanning performance without compromising flexibility.

Version 7.0 also offers increased versatility by supporting multiple input formats including text and barcodes.

#### Barcode

* Added the `remove_delimiter_data` extension to the CODABAR symbology.

#### Core

* Added the following API for fetching all Open Source Software (OSS) license text and attributions for all OSS used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo()`

### Performance Improvements

* Improved tracking of 1D barcodes that are horizontally aligned.

### Deprecations

In 7.0, we removed several APIs that were deprecated during the lifetime of 6.0. Before [migrating to 7.0](/migrate-6-to-7.md), we suggest upgrading to 6.28, fixing all deprecation warnings and then upgrading to 7.0.