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

## 8.6.0-beta.1

**Released**: August 14, 2026

### New Features

The Scandit Data Capture SDK is now available for Kotlin Multiplatform, letting you write one Kotlin codebase that scans on both Android and iOS. The KMP SDK covers SparkScan, Barcode Capture, Barcode Selection, MatrixScan (Batch, AR, Count, Find, Pick), Barcode Generator, ID Capture, Smart Label Capture, and the Parser, with Compose Multiplatform UI companions for the view-based modules.

Android and shared code resolve from Maven Central (com.scandit.datacapture.kmp). On iOS you integrate through Swift Package Manager: add the datacapture-kmp-spm package and pick the prebuilt umbrella product matching the Scandit modules you use (barcode, ID, label and/or parser). The required native Scandit frameworks are resolved automatically as transitive dependencies. Apps that already ship their own shared KMP module can instead pin datacapture-spm directly.

Get started by understanding the system requirements and how to add the SDK to your project.

To start the implementation of the different features you can follow the relevant guides for single barcode scanning (SparkScan, Barcode Capture), multiple barcode scanning (MatrixScan Batch, MatrixScan AR, MatrixScan Count, MatrixScan Find, MatrixScan Pick), ID scanning, or label scanning
