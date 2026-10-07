---
description: "Release notes for the Scandit Data Capture SDK for Kotlin Multiplatform: new features, changes, and fixes by version."
toc_max_heading_level: 3
displayed_sidebar: kmpSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: kmp
keywords:
  - kmp
---

## 8.6.1

**Released**: October 1, 2026

### New Features

#### Id

* Visa VIZ results for Canadian visa stickers now report the full 10-character number in `VizResult.visaNumber` (the MRZ result remains truncated).

### Bug Fixes

#### Barcode

* Fixed a QR scanning accuracy regression introduced in 8.6 for codes with degraded finder patterns (round, dotted, curved, bent, damaged) in single-barcode scanning.
* Rectangular Micro QR: Fixed a rare crash during detection of codes whose finder pattern covers a large part of the frame, such as when scanning at very close range.
* Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.
* Fixed Data Matrix codes not being read when their encoder ends the data with an Unlatch codeword followed by more than one pad codeword.
* Fixed a 1D symbology scan regression from SDK 5.19 for codes with colored backgrounds, such as dark print on a saturated label.
* Fixed the barcode duplicate filter explicitly set to -2 under SelectionMode On not being respected and being incorrectly relaxed to 0.

#### Id

* Fixed the 2026 Oklahoma driver's license not returning the Jurisdiction and JurisdictionIso fields.
* Fixed a crash in the IdCapture overlay when it was tapped.

#### Smart Label Capture

* Fixed a bug where the camera preview could remain black or frozen when opening a scanning screen after leaving a LabelCapture validation flow screen.

#### Core

* Fixed a crash that terminated the app when a camera frame used a pixel layout the SDK cannot convert, for example frames produced by the camera image-injection features of automated testing services. Such frames are now skipped with a warning instead.
* Fixed customer archives for Capacitor, Cordova and React Native shipping unresolvable `workspace:*` dependency specifiers, so `npm install` now succeeds in the bundled samples.

## 8.6.0

**Released**: August 31, 2026

### New Features

The Scandit Data Capture SDK is now available for Kotlin Multiplatform, letting you write one Kotlin codebase that scans on both Android and iOS. The KMP SDK covers SparkScan, Barcode Capture, Barcode Selection, MatrixScan (Batch, AR, Count, Find, Pick), Barcode Generator, ID Capture, Smart Label Capture, and the Parser, with Compose Multiplatform UI companions for the view-based modules.

Android and shared code resolve from Maven Central (com.scandit.datacapture.kmp). On iOS you integrate through Swift Package Manager: add the datacapture-kmp-spm package and pick the prebuilt umbrella product matching the Scandit modules you use (barcode, ID, label and/or parser). The required native Scandit frameworks are resolved automatically as transitive dependencies. Apps that already ship their own shared KMP module can instead pin datacapture-spm directly.

Get started by understanding the [system requirements](/sdks/kmp/system-requirements.mdx) and [how to add the SDK to your project](/sdks/kmp/add-sdk.mdx).

To start the implementation of the different features you can follow the relevant guides for [single barcode scanning](/sdks/kmp/single-scanning.md) ([SparkScan](/sdks/kmp/sparkscan/intro.md), [Barcode Capture](/sdks/kmp/barcode-capture/get-started.md)), [multiple barcode scanning](/sdks/kmp/batch-scanning.md) ([MatrixScan Batch](/sdks/kmp/matrixscan/intro.md), [MatrixScan AR](/sdks/kmp/matrixscan-ar/intro.md), [MatrixScan Count](/sdks/kmp/matrixscan-count/intro.md), [MatrixScan Find](/sdks/kmp/matrixscan-find/intro.md), [MatrixScan Pick](/sdks/kmp/matrixscan-pick/intro.md)), [ID scanning](/sdks/kmp/id-capture/intro.md), or [label scanning](/sdks/kmp/label-capture/intro.md).
