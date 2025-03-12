---
toc_max_heading_level: 3
displayed_sidebar: webSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: web
keywords:
  - web
---

## 7.2.0-beta.1

**Released**: March 12, 2025

### New Features

#### Barcode

* The following APIs have been added for Smart Label Capture:
  * `LabelCaptureBasicOverlay`
  * `LabelCaptureBasicOverlayListener`
* Added `DataCaptureContext` shared instance API.
* Added the `isPulsing` property to circle highlights in MatrixScan Check, enabling a pulsing animation effect.

#### ID

* ID Capture now supports the decoding of mobile driver’s licenses (currently limited to Australian licenses).

### Behavioral Changes

* The default `BarcodeBatchBasicOverlay` brush when using the `BarcodeBatchBasicOverlayStyle.FRAME` style has been changed from white to Scandit blue.

### Bug Fixes

* Fixed an issue in `SparkScanView` that could result in duplicate trigger buttons.

## 7.1.2

**Released**: March 13, 2025

### Bug Fixes

* Fixed a rare issue in SparkScan that would not allow for properly drawing the barcode location.
* Fixed an issue in SparkScan where the floating button would appear in the center as opposed to bottom-right of the screen.
* Fixed an issue where in some browsers `error 28` was shown when some internal files had names exceeding a certain number of characters.

## 7.1.1

**Released**: March 7, 2025

### Bug Fixes

* Fixed `sc_recognition_context_release` to abort potentially still in-progress background set up of the barcode scanner if `sc_barcode_scanner_wait_for_setup_completed` was not called explicitly.

## 7.1.0

**Released**: February 21, 2025

### New Features

#### Barcode

* [MatrixScan Check](/sdks/web/matrixscan-check/intro.md) in now available, offering prebuilt views designed to quickly build custom workflows with augmented reality for your existing app. By highlighting barcodes and displaying additional information or user interaction elements over them, any process can be enhanced with state-of-the-art augmented reality overlays.
* Introducing the Smart Duplicate Filter: unlike traditional time-based filters, this intelligent solution prevents re-scanning the same barcode unless intended, eliminating delays and improving accuracy. In user testing, it boosted task completion speeds by 10% and reduced unintentional barcode scans by 5% in workflows requiring intentional duplicate scans. Enable this new behavior by setting the existing `codeDuplicateFilter` property to the special value `-2` — now the default for both Barcode Capture and SparkScan. See the [documentation](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) for details.
* User Facing Camera in SparkScan: It is now possible to switch to the user-facing camera for scanning. This is useful in specific use-cases where the rear camera is not accessible or barcodes are hard to reach otherwise. See:
  * `SparkScanView.cameraSwitchButtonVisible`

#### ID

* Launched DataConsistency Verification, which identifies suspicious documents by verifying the consistency of data encoded in various parts of the document. This helps detect potential tampering or anomalies.
* Launched a Rejection API to reject documents based on predefined criteria, streamlining validation processes. Examples include rejecting expired documents or those belonging to underage holders.
* Enhanced the scanning capabilities for specific document types. When `ScannerType::FullDocument` is enabled, seamless scanning is now supported even for documents where the Scandit DataCapture SDK offers only Machine Readable Zone (MRZ) scanning.
* Added support for scanning the Machine Readable Zone of  non-standard Indian passports, where an MRZ line consists of 42 characters instead of 44. 
* Added support for scanning the Machine Readable Zone of the Chinese Mainland Travel Permit issued for non-Chinese citizens being residents of Hong Kong or Macau.
* Unified the value of the sex field from VIZ and MRZ results so that it is always one of the values `female`, `male` or `unspecified`.
* Added `UsRealIdStatus`.

### Performance Improvements

#### Barcode

* We’ve increased the scan rate of 10% on our datasets of QR codes with high perspective distortion (so scanned at high angles). This is particularly important for cases such as receiving boxes or scanning shelf labels.

#### ID

* Scandit ID Scanning now uses an improved AI model to detect forged barcodes on US documents, which significantly improves accuracy.

### Behavioral Changes

* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

### Bug Fixes

#### Barcode

* If using Safari, the browser would become stuck while opening `IndexedDB`.

#### ID

* Fixed an issue where it was not possible to scan the Visual Inspection Zone of passports if a license included the Visual Inspection Zone flag, but no Machine Readable Zone flag. 
* Fixed an issue where the scanning would become unresponsive when scanning certain passports.
* Fixed an issue where the scanning would become unresponsive when scanning the back side of Romanian IDs.
* Fixed an issue where some residence permits were incorrectly identified as ID cards when scanning their Machine Readable Zone.
* Fixed an issue where it was not possible to scan an Irish Passport Card when `ScannerType::FullDocumentScanner` was enabled.
* Fixed an issue where the personal identification number was not correctly anonymized on certain passports.
* When scanning German Passport or ID Card MRZs the nationality was returned as `D` instead of the three-letter ISO (3166 standard) code `DEU`.

### Deprecations

#### Core

* The following methods of `DataCaptureContext` have been removed:
  * `addMode`: Replaced by `setMode` as only one mode can be active at a time.
  * `removeAllModes`: Replaced by `removeCurrentMode` as only one mode can be active at a time.

## 7.0.2

**Released**: January 20, 2025

### Bug Fixes

#### Core

* Resolved a rare issue where a race condition during the deconstruction of MatrixScan Data Capture views could lead to invalid memory access.

#### ID

* Fixed an issue where it was not possible to scan Visual Inspection Zone of passports if a license included the Visual Inspection Zone flag but no Machine Readable Zone flag.
* Fixed an issue where the scanning would become unresponsive when scanning the back of Romanian ID Cards.
* Fixed an issue where the personal identification number was not correctly anonymized on certain passports.
* Fixed an issue with `ResidencePermit` not instantiating correctly for the Spanish NIE document.

## 7.0.1

**Released**: December 19, 2024

### Bug Fixes

* Fixed an issue in ID Capture where no more frame would be processed after a frame source change.

## 7.0.0

**Released**: November 29, 2024

### New Features

Scandit's Smart Data Capture SDK v7.0 addresses the industry's toughest scanning challenges with innovative solutions at every layer. Our enhanced scanning engine is context-aware, understanding both the environment and user needs. This results in smoother integrations, a richer user experience, and improved scanning performance without compromising flexibility.

Version 7.0 also offers increased versatility by supporting multiple input formats including text and barcodes.

SparkScan, our flagship barcode scanning product, embodies the full potential of v7.0 with its versatile user interface coupled with a robust, out-of-the-box scanning engine. SparkScan's success is a testament to our commitment to delivering seamless, high-performance camera-based scanning solutions.

#### Barcode

* SparkScan introduces a completely redesigned user interface, enhancing ergonomics with a simplified API and in-demand customization options. These updates make SparkScan even more versatile, seamlessly integrating with various use cases and blending smoothly into any existing workflow and UI. See the [migration guide](/migrate-6-to-7.md#sparkscan) for more details.
* Added the `remove_delimiter_data` extension to the CODABAR symbology.

#### Core

* Added the following API for fetching all Open Source Software (OSS) license text and attributions for all OSS used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo()`

#### ID

We’ve completely redesigned the ID Capture API to streamline document capture and validation. The latest version introduces enhanced configuration options and improved result structures for an intuitive integration experience. These include:

* Easily configure which documents you capture using `IdCaptureSettings.acceptedDocuments` and `IdCaptureSettings.rejectedDocuments`. Choose entire document classes or refine selections by specific countries for precise control.
* Use `IdCaptureSettings.scannerType` to specify which document sections are relevant for your capture process.
* With just two callbacks — `IdCaptureListener.onIdCaptured` for success and `IdCaptureListener.onIdRejected` for rejection — it's straightforward to understand outcomes and define next steps, making the API simpler and more intuitive.
* Access key aggregated data at the top level of `CapturedId` or retrieve details from specific document parts, such as `CapturedId.visualInspectionZone`, `CapturedId.machineReadableZone`, and `CapturedId.barcode`.
* Retrieve document images, including the complete frame, through `CapturedId.images`.

### Performance Improvements

* Improved tracking of 1D barcodes that are horizontally aligned.
* MatrixScan Count’s tracking robustness is improved with quick recovery of tracking failures.

### Breaking Changes

#### Barcode

* The MatrixScan API (`BarcodeTracking`) has been renamed to `BarcodeBatch`. All classes have been renamed accordingly (e.g. `BarcodeTrackingListener` → `BarcodeBatchListener`).

### Behavioral Changes

* The NPM package scope for all Scandit packages has been changed to `@scandit/web-datacapture-*`.
* The Parser is now a standalone NPM package as opposed to being bundled with the Barcode package.
*  Model files now have the file extension set to .model for easier web serving.
*  The engine library location has been changed from `build/engine` to `sdc-lib`.
* Feedback resources (e.g. audio files for beep) are now only loaded when needed. Additionally, the asset sizes have been optimized.
* The CSS templates bundled are now minified.

### Bug Fixes

* Fixed an issue with the camera switch control widget when switching to/from Standby mode.

### Deprecations

In 7.0, we removed all APIs that were deprecated during the lifetime of 6.0. Before [migrating to 7.0](/migrate-6-to-7.md), we suggest upgrading to 6.28, fixing all deprecation warnings and then upgrading to 7.0.

#### Barcode

The following SparkScan APIs have been deprecated in 7.0:
  * `SparkScanView.TorchButtonVisible`
  * `SparkScanView.StopCapturingText`
  * `SparkScanView.StartCapturingText`
  * `SparkScanView.ResumeCapturingText`
  * `SparkScanView.ScanningCapturingText`
  * `SparkScanView.CaptureButtonBackgroundColor`
  * `SparkScanView.CaptureButtonActiveBackgroundColor`
  * `SparkScanView.CaptureButtonTintColor`

#### ID

The legacy ID Capture UI has been removed in 7.0. If you are using the legacy UI, you must migrate to the new ID Capture API.