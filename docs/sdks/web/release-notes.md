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

## 7.1.0-beta.1

**Released**: January 23, 2025

### New Features

#### Core

* `DataCaptureContext` has been adapted to work as a singleton.
  * You can use the `DataCaptureContext.SharedInstance` property to retrieve the singleton instance.
  * The license key must be set using `DataCaptureContext.Initialize`. This step is only required once. Once initialized, the context can be used as before.
  * It is important to call `DataCaptureContext.RemoveCurrentMode()` when the active mode is no longer needed, such as when navigating away from a screen used for scanning.
  * The following methods have been added (also see Deprecations, below, for removed methods):
    * `setMode`: Sets a mode to be the active mode in the context.
    * `removeCurrentMode`: Removes the currently active mode in the context.
    * `static sharedInstance`: Returns a singleton instance of DataCaptureContext. This instance is unusable until properly configured by calling initialize() on it.
    * `initialize(string licenseKey)`: Reinitializes the context by configuring it with a license key.
    * `initialize(string licenseKey, string? frameworkName, string? frameworkVersion, string? deviceName, string? externalId, DataCaptureContextSettings settings)`: Reinitializes the context by configuring it with new settings.
* Calling `DataCaptureContext.addMode()` or `DataCaptureContext.setMode()` now replaces the current mode with the new one, so it’s no longer needed to remove a mode when adding a new one.

### Performance Improvements

#### Barcode

* Improved scanning speed for color-inverted QR and MicroQR codes.
* Improved scanning rate for small QR codes.

### Behavioral Changes

* Enabled color-inverted decoding by default for QR and MicroQR symbologies.

### Bug Fixes

#### ID

* Fixed an issue where it was not possible to scan the Visual Inspection Zone of passports if a license included the Visual Inspection Zone flag, but no Machine Readable Zone flag. 
* Fixed an issue where the scanning would become unresponsive when scanning certain passports.
* Fixed an issue where the scanning would become unresponsive when scanning the back side of Romanian IDs.
* Fixed an issue where some residence permits were incorrectly identified as ID cards when scanning their Machine Readable Zone.
* Fixed an issue where it was not possible to scan an Irish Passport Card when `ScannerType::FullDocumentScanner` was enabled.
* Fixed an issue where the personal identification number was not correctly anonymized on certain passports.

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