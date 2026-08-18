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

## 8.6.0-beta.1

**Released**: August 14, 2026

### New Features

#### Barcode

* Added decoding of the DotCode Code Set B first-position "Macro" codewords (97-100), which expand to the corresponding ISO/IEC 15434 format envelopes. Previously these symbols decoded to incorrect data.
* Added Extended Channel Interpretation (ECI) support for DotCode. Symbols that switch character sets (for example to Cyrillic or another code page) now report the correct per-segment encoding. As part of this, the default character set for DotCode is now reported as ISO 8859-1 instead of ASCII.
* Added structured append support for DotCode. The "m of n" sequencing metadata is now stripped from the barcode data and exposed via `sc_barcode_get_segment_index` and `sc_barcode_get_segment_count`. DotCode has no file ID, so segments are not automatically grouped by the buffered barcode session.

#### Core

* Added support in the GS1 parser for the telecom Application Identifiers 8040 (IMEI), 8041 (IMEI2), 8042 (eSIM/EID), and 8043 (pSIM), so GS1 codes carrying them parse instead of being rejected as unrecognized.
* Added support for parsing the 2D-DOC (French 2D-Doc / ANTS) data format.
* Added more detailed error reporting when required resources are missing.
* Added iOS support for multiple DataCaptureView instances to render the camera preview simultaneously, so navigating between screens that each show a DataCaptureView no longer causes black or frozen previews, including during interactive edge-swipe transitions. DataCaptureView also now renders a preview when the frame source is an ImageFrameSource or SequenceFrameSource.
* Added LicenseInfo.allowedModes, exposing the set of capture modes a license key permits via the new CaptureMode enum.
* Added support for reading camera frames directly into a SharedArrayBuffer in supported environments (currently Chrome or Firefox, when pthread is enabled), avoiding an extra copy.

### Performance Improvements

#### Barcode

* Reduced the false positive rate for EAN13, UPCA, EAN8, and UPC-E.
* Improved ITF decoding robustness, reducing the number of unscanned codes.
* Improved MicroQR decoding for rotated codes and cluttered backgrounds.

#### Id

* Improved PDF417 scanning on Quebec, Alaska, and Oklahoma driver’s licenses.

### Behavioral Changes

#### Barcode

* Enabled detection and decoding of mirrored MaxiCodes by default. Previously this required enabling the symbology extension `mirrored`, which has been removed.
* Limited the GS1 format flag for DotCode to genuine GS1 openings (a leading digit pair without FNC1) per AIM DotCode v3.0, instead of defaulting all symbols to GS1.
* Disabled enhanced low-resolution scanning of QR codes (introduced in 8.5.0) for MatrixScan modes. Customers who need this feature should contact Scandit support.

### Bug Fixes

#### Barcode

* Fixed rare cases where DotCode Code Set C symbols using the date/lot macro decoded to incorrect data due to a dropped leading zero in a digit pair.
* Fixed a regression where short ITF codes with low wide/narrow ratio were not decoded.

#### Core

* Fixed a SequenceFrameSource occasionally delivering the same frame to its listeners twice.
* Fixed Nokia G11 and Nokia 8.3 5G devices not correctly getting the Camera2 path when API2-only features were requested.
* Fixed the Galaxy Note10 camera profile selection so the international Note10 family (SM-N970x/SM-N971x) gets its intended fixed-focus and Camera2 behaviors.
* Fixed the Galaxy S9+ (SM-G965x) camera profile selection so Camera2-based capture is enabled on those devices as intended.
* Fixed the camera preview appearing darker in single-scan modes after using a mode that applies its own exposure adjustment, such as SparkScan or MatrixScan Count.
* Fixed a race condition in SimplePropertyBehaviorSubject where mutating the subscriber list during a callback could cause crashes or missed notifications.
* Fixed an IllegalStateException in analytics HTTPS requests when the app is instrumented by APM tools such as Dynatrace.
* Fixed EventsResponse::getRetryTimeoutInSeconds to return a fallback instead of aborting on out-of-range header values.

## 8.5.3

**Released**: August 18, 2026

### Behavioral Changes

#### Barcode

* Disabled enhanced low-resolution scanning of QR codes (introduced in 8.5.0) for MatrixScan modes. Customers who need this feature should contact Scandit support.

### Bug Fixes

#### Core

* Fixed an IllegalStateException in analytics HTTPS requests when the app is instrumented by APM tools such as Dynatrace.

## 8.5.2

**Released**: July 31, 2026

No updates for this framework in this release.

## 8.5.1

**Released**: July 20, 2026

No updates for this framework in this release.

## 8.5.0

**Released**: July 9, 2026

### Performance Improvements

#### Barcode

* Enhanced detection of low-resolution QR codes, improving scan rates for QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
  - codes is now enabled by default, improving scan rates for challenging QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
* Improved scanning of micro-QR codes affected by quiet zone violations and perspective distortion.

### Behavioral Changes

#### Barcode

* Reduced Code 128 minimum symbol count from 6 to 4; short codes (4 & 5 symbols) use stricter matching rules than longer codes. To explicitly exclude short codes, disable symbol counts 4 & 5 via `sc_symbology_settings_set_active_symbol_counts()` for Code 128. Note that if you previously enabled short code scanning, more strict settings are now in effect to reduce the chance of false positives, which are more likely for very short codes.
* Tightened Code 39 false positive filter thresholds by default; to restore the previous behavior, enable the `relaxed` extension on Code 39 via `sc_symbology_settings_set_extension_enabled()`. This is only advised when external validation measures are available, for example, scanning against a known list of valid codes or when codes contain structured data.
* Updated `SymbologyDescription.forIdentifier` to return `null` for unrecognized identifiers (for example, `"EAN-8"` instead of `"ean8"`); previously such input was silently mapped to `Codabar`.

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed rare cases of incorrect (tiny) PDF417 location outlines.

#### Core

* Fixed a rare crash when starting camera capture while under memory pressure.
* Fixed a rare crash when opening the camera.
* Fixed a crash when the `DataCaptureContext` singleton was initialized more than once.

### Deprecations

#### Barcode

* The SparkScan target-mode APIs and `ScanIntention.smartSelection` are deprecated in favour of selectionMode.

## 8.4.1

**Released**: June 23, 2026

No updates for this framework in this release.

## 8.4.0

**Released**: May 18, 2026

### New Features

#### Barcode

* Added `dotRadius` property to `BarcodeBatchBasicOverlay` to allow customizing the size of dots when using the Dot overlay style.

#### Id

* Added support for reading the vehicle table on the back of New Zealand driving licences, with the latest expiry date returned; supported vehicle classes are 1–6, including L=learner and R=restricted variants.
* Added support for new versions of USA, California–Driver's License; USA, North Carolina–Driver's License; USA, Texas–Driver's License; and USA, Oklahoma–Driver's License.

#### Core

* Redesigned `ZoomSwitchControl` to support multiple configurable zoom levels; the control now displays as a compact button that expands to show all available zoom levels, automatically filtered to those supported by the device hardware.

### Performance Improvements

#### Barcode

* Improved Code 128 scan robustness for codes with uneven blur and geometric distortions. Available on all platforms except WebAssembly without SIMD and ARM without FP16.
* Improved 1D barcode scanning speed and reduced false positives for linear symbologies.
* Further improved scanning of square DataMatrix codes with damaged or occluded timing patterns.

### Behavioral Changes

#### Barcode

* Smart Scan Intention now continuously adapts between Single Scan and Selection modes during a scanning session when Smart Scan Selection is enabled, switching back to Single Scan when the scene no longer requires Selection mode. Previously, once Selection mode was activated it remained active for the rest of the session.
* Changed ITF scanning to reduce false positives by introducing checksum-dependent scoring. ITF has an optional checksum which is mandated to be enabled by many of the standards that use ITF as the data carrier. Starting with this release, checksum-passing ITF codes are scanned with more relaxed conditions than codes that don't pass the checksum test. This happens even if the optional mod 10 checksum isn't enabled. To disable this behavior, enable the `no_checksum_dependent_validation` symbology extension for the ITF symbology.
* Removed the Abseil library dependency.
* Reduced Code 39 false positives.

#### Core

* Updated mbedtls from version 3.6.5 to 3.6.6.

### Bug Fixes

#### Barcode

* Fixed an unnecessary second scan callback that occurs after freezing barcode recognition.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed an issue where the Smart Scan Selection aimer would become too small when scan-area margins restricted the visible scan area; the aimer is now sized relative to the view, keeping a consistent on-screen size regardless of margins.

#### Id

* Fixed an issue where the US Permanent Residence Card was not processed through the VizMrz flow.

#### Smart Label Capture

* Fixed a bug where the label capture validation flow overlay sometimes did not reflect label capture settings when reused.
* Fixed a bug that caused error messages in `DataCaptureView` to be rendered partially out-of-view.
* Fixed a rare race condition in Label Capture.
* Added `.asDate()` support to `ExpiryDate` and `PackingDate` label fields when the text is provided as manual input or as an Adaptive-Recognition-Engine response.

#### Core

* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.
* Fixed a rare crash when opening the camera.
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (for example, industrial barcode scanners like the Newland NLS-MT93).
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.
* Fixed a rare crash when starting camera capture while under memory pressure.

## 8.3.1

**Released**: April 14, 2026

No updates for this framework in this release.

## 8.3.0

**Released**: March 26, 2026

### Performance Improvements

#### Barcode

* Improved EAN8 false positive filtering in strict mode

### Bug Fixes

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.

## 8.2.1

**Released**: March 5, 2026

No updates for this framework in this release.

## 8.2.0

**Released**: February 13, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Improved the Smart Scan Intention logic for detecting main codes + five-digit add on codes. This improves the rate of complete main + add-on code pairs.
* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed the missing found item icon in the MatrixScan Find carousel

#### Core

* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed an issue where some LabelCapture fields were being returned incorrectly on TS frameworks

## 8.1.6

**Released**: July 29, 2026

No updates for this framework in this release.

## 8.1.5

**Released**: June 10, 2026

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

#### Core

* Fixed a rare crash when starting camera capture while under memory pressure.
* Fixed a rare crash when opening the camera.
* Fixed a rare native crash (SIGABRT in BitTube::recvObjects) that could occur on Android during camera preview rendering.

## 8.1.4

**Released**: April 21, 2026

### Bug Fixes

#### Barcode

* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.

#### Core

* Fixed a rare issue that was causing a crash when the app moved to the background.
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (for example, industrial barcode scanners like the Newland NLS-MT93).
* Fixed crashes caused by RuntimeExceptions thrown by OEM camera code that are not part of the standard Android Camera API contract; these exceptions are now caught and logged instead of crashing.

## 8.1.3

**Released**: March 25, 2026

### Bug Fixes

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.

## 8.1.2

**Released**: March 9, 2026

### Bug Fixes

#### Barcode

* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Id

* Fixed a memory issue leading to a persistent black screen during ID Capture startup

#### Core

* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.

### Performance Improvements

#### Barcode

* Improved MicroQR detector tolerance to quiet zone violations
* Improved suppression of incorrect Codabar recognitions when using the [“strict" symbology extension](../symbology-properties#symbology-extension-descriptions)

### Behavioral Changes

#### Barcode

* Enabling the [“ocr_fallback" symbology extension](../symbology-properties#symbology-extension-descriptions) with missing OCR model resources now triggers the context error 28 (“Missing Resource”)

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance
* Fixed a bug in the default color of BarcodeCapture highlights
* Fixed an issue where popover annotations with HIGHLIGHT_TAP_AND_BARCODE_SCAN trigger could not be opened again
* Fixed an issue in BarcodeSequence where camera would not be ON in portrait
* Fixed an issue where SparkScan mini preview would sometimes stay in regular when entering target mode
* Fixed the app becoming unresponsive after being in the background for extended periods
* Added the `cameraStateOnStop` property to BarcodeFindView to optimize camera transitions when switching between modes

#### Core

* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed a small memory leak that affected fresh install runs only
* Fixed an issue where barcode scanning would permanently stop after the app returned from background, particularly when camera permission dialogs were shown during initialization

## 8.0.1

**Released**: January 14, 2026

### Bug Fixes

#### Barcode

* Fixed an issue where the successful hint in BarcodeFind was not displayed
* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

#### Core

* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
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
  * Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users through sophisticated tasks to ensure the highest level of productivity.

#### Core

* Upgraded minimum Titanium SDK to `12.7.0.GA` and build modules with Titanium `13.0.0.GA` to enable 16 KB page size support.

#### Barcode

* Updated the Gradle version for all sample applications to 8.14.3.

### Behavioral Changes

#### Barcode

* Symbology `RM4SCC` has been renamed to `ROYAL_MAIL_4STATE`.
* Changed the default highlight brush in Barcode Capture.

### Bug Fixes

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.


## 7.6.7

Find earlier versions in the [release notes section of version 7](/7.6.14/sdks/titanium/release-notes)