---
toc_max_heading_level: 4
displayed_sidebar: titaniumSidebar
hide_title: true
title: Release Notes
pagination_prev: null
---

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
