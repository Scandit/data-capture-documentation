---
toc_max_heading_level: 3
displayed_sidebar: titaniumSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: titanium
keywords:
  - titanium
---

## 6.28.8

**Released**: February 26, 2026

### Bug Fixes

#### Core

* Fixed a bug that could in rare cases produce a black screen when starting the camera

## 6.28.7

**Released**: November 3, 2025

No updates for this framework in this release.

## 6.28.6

**Released**: July 25, 2025

No updates for this framework in this release.

## 6.28.5

**Released**: April 4, 2025

No updates for this framework in this release.

## 6.28.4

**Released**: February 14, 2025

### Bug Fixes

#### Core

* Fixed an issue which reduced scans for low-resolution and blurry codes affected by distortion or damage, when multiple symbologies were enabled.
* Fixed an issue where scanned blurry codes locations are sometimes flipped.

## 6.28.3

**Released**: December 23, 2024

No updates for this framework in this release.

## 6.28.2

**Released**: December 12, 2024

No updates for this framework in this release.

## 6.28.1

**Released**: October 29, 2024

No updates for this framework in this release.

## 6.28.0

**Released**: October 8, 2024

### New Features

#### Barcode

* On Barcode Capture, we optimized the frame processing time in 4k-UHD resolution with dynamic resolution selection, resulting in up to 35% reduction on high-end devices and consistent performance improvements across all supported devices.
platforms.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.

## 6.27.2

**Released**: September 23, 2024

No updates for this framework in this release.

## 6.27.1

**Released** September 6, 2024

No updates for this framework in this version.

## 6.27.0

**Released**: September 5, 2024

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.

## 6.26.0

**Released**: August 15, 2024

### Performance Improvements

#### Barcode

* Improved ArUco scanning when color inverted codes are enabled.
* Improved tracking robustness on Barcode Count.
* Significantly lowered the rate of false positives (i.e., presumed unscanned barcodes) when using Barcode Count.
* Improved recognition rate for Composite Codes, with a particular focus on codes with small 2d components (e.g. PDF417).
* Improved recognition rate of linear codes which are partially affected by damage or covered in plastic wrap, with a particular focus on Codabar barcodes.
* Improved localization of postal codes, up to 25% faster.

## 6.25.3

**Released**: September 2, 2024

No updates for this framework in this release.

## 6.25.2

**Released**: August 2, 2024

No updates for this framework in this release.

## 6.25.1

**Released**: August 1, 2024

### New Features

#### Core

- Increased min Titanium SDK version to 12.2.1.GA.

## 6.25.0

**Released:** July 5, 2024

### New Features

#### Core

* Increased min Titanium SDK version to 12.2.1.GA.

### Performance Improvements

#### Barcode

* Improved recognition rate for Composite A and Composite B barcodes, thanks to an increased robustness for small and low resolution MicroPDF417.
* Improved recognition rate of long, thin linear 1d codes, such as those found on electronic shelf labels (ESLs).
* Improved recognition rate of linear codes which are partially affected by damage or glare, with a particular focus on codabar barcodes.

## 6.24.0

**Released**: May 8, 2024

### New Features

#### ID

- Added support for per state thresholds in id verification and removed the hardcoded number of features. This is a breaking change, old verification models will not work.

### Bug Fixes

#### Barcode

- Fixed the “Tap to Focus” animation when the view size changes.
