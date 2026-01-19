---
description: "Release notes and updates for the Scandit Android SDK."
toc_max_heading_level: 3
displayed_sidebar: androidSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: android
keywords:
  - android
---

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Smart Scan Selection is now available in Barcode Capture. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.
* Added, in `BarcodeAr`, a `BarcodeArFilter` interface to selectively control which barcodes are displayed in the AR overlay based on custom filtering logic. You can set a filter via `BarcodeAr.SetBarcodeFilter`.
* Added `ScanditIconType.Slash` which can be used in `BarcodeArStatusIconAnnotationAnchor`.
* BarcodeCountView now supports cameras with different aspect ratios.

#### Id

* Added NationalityISO property that maps results from Nationality field to country ISO code
* Added RejectionDiagnosticJSON property to CapturedId to report debug info during Timeout rejections
* Added rejectionTimeoutSeconds to IdCaptureSettings allowing customers to use timeout other than default (6s). Minimum timeout is 1s.
* Added support for new California DL, new South Carolina DL, Arizona Medical Marijuana Card, Kuwait Civil card, and new Texas DL
* Our SDK can now scan the following documents both in single-side and double-side mode:
  - All Mexican DLs
  - Mexican Voter Cards

#### Core

* Added support for QuadHD resolution to provide improved performance and extended range for MatrixScan modes on slower devices
* Added Electronic Product Code (EPC) parser

### Performance Improvements

#### Barcode

* Improved MicroQR detector tolerance to quiet zone violations
* Improved suppression of incorrect Codabar recognitions when using the [“strict" symbology extension](../symbology-properties#symbology-extension-descriptions)

#### Smart Label Capture

* Incremental improvements in accuracy across all use-cases for the OCR model powering Smart Label Capture.

### Behavioral Changes

#### Barcode

* Enabling the [“ocr_fallback" symbology extension](../symbology-properties#symbology-extension-descriptions) with missing OCR model resources now triggers the context error 28 (“Missing Resource”)

#### Smart Label Capture

* Validation Flow: Manually input values for barcodes will go through a stricter validation. Some values may no longer be accepted if they do not match the symbology specs for the symbology’s definition

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance
* Fixed a bug in the default color of BarcodeCapture highlights
* Fixed an issue where popover annotations with HIGHLIGHT_TAP_AND_BARCODE_SCAN trigger could not be opened again
* Fixed an issue in BarcodeSequence where camera would not be ON in portrait
* Fixed an issue where SparkScan mini preview would sometimes stay in regular when entering target mode
* Fixed the app becoming unresponsive after being in the background for extended periods
* Fixed an issue where the successful notification in BarcodeFind was not displayed

#### Id

* Fixed a bug concerning return complete instead of cropped images on the back of EU driving licenses

#### Core

* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed a small memory leak that affected fresh install runs only

## 8.0.1

**Released**: January 14, 2026

### New Features

#### Barcode

* Added, in `BarcodeAr`, a `BarcodeArFilter` interface to selectively control which barcodes are displayed in the AR overlay based on custom filtering logic. You can set a filter via `BarcodeAr.SetBarcodeFilter`.

### Bug Fixes

#### Barcode

* Fixed an issue where the successful hint in BarcodeFind was not displayed
* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

#### Core

* Fixed an issue where the camera would not restart when opened from another app
* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed a small memory leak that affected fresh install runs only

## 8.0.0

**Released**: November 4, 2025

### New Features

Scandit's SDK 8.0 marks the evolution of data capture from a high-performing scanning tool into an intelligent AI-powered workflow enabler. As frontline operations face mounting pressures with more data points to capture, increasingly complex workflows to navigate, and tighter resource constraints, SDK 8.0 delivers a set of innovations that: 
  * Adapt its scanning settings and UI to context by analyzing the scanning environment and user intent;
  * Automate the capture of any data format, barcode clustering, task handling or camera settings;
  * Accelerate critical use cases to maximize ROI through intuitive, streamlined scanning workflows, using interactive AR-guidance, adaptive UI and out-of-the-box custom-branded passenger experiences.

With SDK 8.0 businesses can transform data capture from a basic function to a strategic advantage. It enables intelligent scanning that:
  * Understands not just what is being scanned, but also what you want to scan and why you’re scanning it
  * Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users seamlessly through sophisticated tasks to ensure the highest level of productivity.

#### Core

* This release drops support for Android 6. The new `minSdk` version is now 24 (previously 23).

#### Barcode

* Updated the Gradle version for all sample applications to 8.14.3. 
* A new version of the SparkScan sample application implemented in Jetpack Compose is now available.
* SparkScan is not limited to only barcodes anymore, but can also scan items - in other words any combinations of barcodes and text present on a target to be scanned. The feature is available in beta at the moment, please contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out.

#### Smart Label Capture

* We’re introducing an enhancement that makes Smart Label Capture more robust and scalable by complementing its on-device model with a larger, more capable model. When the on-device model can’t capture certain labels, the SDK automatically escalates to this enhancement to handle complex or unforeseen cases with high accuracy and reliability. This capability is currently available in `beta`. If you’re interested in trying it, please contact [Scandit Support](mailto:support@scandit.com). For configuration details, see `labelDefinition.adaptiveRecognitionEngine`.

#### ID

* Added `ElementsToRetain` to `MobileDocumentScanner`: The set of data elements that the application intends to retain from scanned mobile documents. This information is used to set the `IntentToRetain` flag in ISO 18013-5 mdoc requests, which is required for legal compliance with data protection standards. An empty set indicates no elements will be retained, and `IntentToRetain` will be set to `false` for all fields.
* ID Capture now supports full-frame anonymization.
* The result of `decodeMobileDriverLicenseViz`, which is currently returned as part of the `VizResult` within `CapturedId`, will now be provided through a new field named `mobileDocumentOcr`.
* Added `CapturedId::isCitizenPassport`, which indicates whether the passport was issued to a citizen of the issuing country. Returns `false` for travel documents such as refugee, stateless, or alien passports, and for any passports issued by organizations rather than states.
* The following Chinese travel permits now extract VIZ + MIZ data during double-sided scanning flows:
  * CT - Taiwan Residents Mainland Travel Permit
  * W - Mainland Residents Exit-Entry Permit to and from Hong Kong and Macao
  * CD - Mainland Residents Entry-Exit Permit to and from Taiwan

### Behavioral Changes

#### Barcode

* Symbology `RM4SCC` has been renamed to `ROYAL_MAIL_4STATE`.
* Changed the default highlight brush in SparkScan and Barcode Capture.

#### Label

* The `LabelFieldDefinition` API has been updated with the following changes:
  * Renamed property: `pattern` → `valueRegex`, `patterns` → `valueRegexes`
  * Renamed property: `dataTypePattern` → `anchorRegex`, `dataTypePatterns` → `anchorRegexes`
* Our Receipt Scanning Capture feature, available in beta (contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out), has been updated to improve performance and the API:
  * `ReceiptScanningResult`:
    * Removed properties: `storeNumber`, `storeStreet`, `storeZip`, `storeState`, `storePhone`, `paymentMethod`, and `paymentCurrency`.
    * Added property: `storeAddress` - Full address of the store (Street Number, Street, City, State, NPA).
    * Renamed property: `paymentSubtotal` → `paymentPreTaxTotal` - Total balance before taxes are applied.
  * `ReceiptScanningLineItem`:
    * Removed property: `category`.
    * Renamed properties: `price` → `unitPrice` (Price for a single unit of the item), `total` → `totalPrice` (Total price for a specific product, quantity × unitPrice).

#### ID

* The configuration for the following documents has been changed as detailed below:
  * Australian mobile driver licenses (mDL) are now treated as normal documents, with no separate mode.
  * US Green Cards are now treated as residence permits.
* Removed the deprecated API `DateResult::toDate`. Use `DateResult::toLocalDate` or `DateResult::toUtcDate` instead.
* `fullName` now an optional field on all `IdCapture` result types and `capturedMrz` now an optional field on `MrzResult`.

### Bug Fixes

#### Core

* Fixed a class duplication build error caused by embedding `snapchat-djinni` sources.
* Fixed a flickering camera preview issue on some devices.

#### ID

* Fixed a bug that could get the scanner stuck when scanning a US passport card.

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.

#### Barcode

* The following previously deprecated APIs have been removed:
  * BarcodeCaptureOverlay Related APIs
  * BarcodeCaptureOverlayStyle enum
  * BarcodeCaptureOverlay.NewInstance(BarcodeCapture, DataCaptureView?, BarcodeCaptureOverlayStyle)factory method
  * BarcodeCaptureOverlay.DefaultBrushForStyle(BarcodeCaptureOverlayStyle) method
  * BarcodeCaptureOverlay.Style property
  * SparkScanViewHandMode enum
  * SparkScanView.torchButtonVisible property
  * SparkScanView.handModeButtonVisible property
  * SparkScanView.stopCapturingText property
  * SparkScanView.startCapturingText property
  * SparkScanView.resumeCapturingText property
  * SparkScanView.scanningCapturingText property
  * SparkScanView.captureButtonBackgroundColor property
  * SparkScanView.captureButtonActiveBackgroundColor property
  * SparkScanView.captureButtonTintColor property
  * SparkScanViewSettings.defaultHandMode property
  * SparkScan View Defaults APIs
  * SparkScanViewDefaults.DefaultHandModeButtonVisible property
  * SparkScanViewDefaults.DefaultTorchButtonVisible property
  * SparkScanViewDefaults.DefaultStopCapturingText property
  * SparkScanViewDefaults.DefaultStartCapturingText property
  * SparkScanViewDefaults.DefaultResumeCapturingText property
  * SparkScanViewDefaults.DefaultScanningCapturingText property
  * SparkScanViewDefaults.DefaultCaptureButtonActiveBackgroundColor property
  * SparkScanViewDefaults.DefaultCaptureButtonBackgroundColor property
  * SparkScanViewDefaults.DefaultCaptureButtonTintColorProperty 


## 7.6.5

Find earlier versions in the [release notes section of version 7](/7.6.5/sdks/android/release-notes)