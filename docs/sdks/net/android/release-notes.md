---
toc_max_heading_level: 3
displayed_sidebar: netAndroidSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: netAndroid
keywords:
  - netAndroid
---

## 7.5.0-beta.1

**Released**: July 28, 2025

### New Features

#### Barcode

* SparkScan now supports Smart Scan Selection. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Users might have to manually switch to a special, more precise scanning mode (Target Mode), which is inefficient. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Added `BarcodeArResponsiveAnnotation`, which automatically switches between close-up and far-away info annotations based on the barcode’s size on screen.

#### ID

* Scanning of ISO-18013 compliant mobile driver licenses is now supported in select justifications (Queensland Digital License, Austria eAusweis).

### Bug Fixes

#### Core

* Fixed misinterpreted destination path in `robocopy` command to restore native library copying for iOS builds on Windows.

#### ID

* Fixed bug in `AAMVABarcodeVerifier` that triggered error callbacks for each verification after updating from some older SDK version.

### Behavioral Changes

* Sample applications now use `https` to access the DataCapture SPM repository instead of `ssh`.

### Deprecations

* Deprecated `BarcodeCaptureOverlayStyle`.

## 7.4.1

**Released**: July 14, 2025

No updates for this framework in this release.

## 7.4.0

**Released**: June 19, 2025

### New Features

#### ID

* Added support for Spanish residence permit "Green NIE".
* Added support for US Medical Marijuana IDs from West Virginia, Florida, Pennsylvania, Nevada, New York, and Oklahoma.

### Performance Improvements

* Updated ARM MbedTLS from 3.6.2 to 3.6.3.

#### ID

* Improved AAMVA Barcode Verification accuracy for Missouri documents.

### Bug Fixes

* Fixed an issue where the middle name read from an AAMVA-compliant barcode would be at times returned as `NONE`.

## 7.3.3

**Released**: July 25, 2025

### Bug Fixes

#### ID

* Fixed an issue where preexisting OTA models on the device, if any, would be loaded instead of the latest model for the SDK version, leading to errors.

## 7.3.2

**Released**: June 25, 2025

No updates for this framework in this release.

## 7.3.1

**Released**: June 13, 2025

No updates for this framework in this release.

## 7.3.0

**Released**: May 16, 2025

### New Features

#### Core

* The Data Capture SDK and all sample applications have been updated to include support for the latest version of .NET (v9).
* Introduced support for the `IDisposable` interface in the API for Android and iOS platforms. This enhancement allows for more efficient management of native resources, ensuring better performance and resource cleanup.

#### Barcode

* Added support for structured append QR codes in all MatrixScan modes. They are exposed over `ScObjectCountingSession` and rendered as a group. The API is identical to how structured append is used in a single barcode use case: the entire structured append data is accessible on all sub code results.

#### ID

* Unify the result value when parsing the sex field, including added support for special characters used, so that it is always one of the values `female`, `male` or `unspecified`.

### Bug Fixes

#### Barcode

* Fixed an issue in SparkScan where the mini preview was closed after a scan, even if the preview behavior was set to `Persistent`.

### Deprecations

* The following APIs have been removed:
  * `BarcodePickIconStyle`

### Behavioral Changes

* MatrixScan Check has been renamed to MatrixScan AR, including in the naming of all relevant APIs.

## 7.2.3

**Released**: June 24, 2025

No updates for this framework in this release.

## 7.2.2

**Released**: May 9, 2025

### Bug Fixes

* Fixed an issue in MatrixScan Batch occurring when Aruco marker pairs were detected in the multiscanner. The callback would return only a single marker instead of the result for marker pairs.

## 7.2.1

**Released**: April 24, 2025

No updates for this framework in this release.

## 7.2.0

**Released**: March 31, 2025

### New Features

#### Barcode

* MatrixScan AR is now available, offering prebuilt views designed to quickly build custom workflows with augmented reality to an existing app. By highlighting barcodes and displaying additional information or user interaction elements over them, any process can be enhanced with state-of-the-art augmented reality overlays.
* Added `DataCaptureContext` shared instance API.

#### ID

* ID Capture now supports the decoding of mobile driver’s licenses (currently limited to Australian licenses).

### Performance Improvements

#### Barcode

* We further optimized the resources management in SparkScan, improving battery life when in Target Mode.

### Behavioral Changes

* The default `BarcodeBatchBasicOverlay` brush when using the `BarcodeBatchBasicOverlayStyle.FRAME` style has been changed from white to Scandit blue.

### Bug Fixes

#### Core

* Fixed rare incorrect QR code reads of codes with a low error correction level.
* Fixed a bug in Barcode Selection that caused inconsistent selection times for single barcodes.
* Fixed `robocopy` command to properly handle paths with spaces on Windows builds.

## 7.1.3

**Released**: March 26, 2025

No updates for this framework in this release.

## 7.1.2

**Released**: March 13, 2025

### Bug Fixes

* Fixed an issue in SparkScan where the floating button would appear in the center as opposed to bottom-right of the screen.

## 7.1.1

**Released**: March 7, 2025

### Bug Fixes

* Fixed `sc_recognition_context_release` to abort potentially still in-progress background set up of the barcode scanner if `sc_barcode_scanner_wait_for_setup_completed` was not called explicitly.

## 7.1.0

**Released**: February 21, 2025

### New Features

#### Barcode

* MatrixScan Count now includes the ability to [cluster barcodes](/sdks/net/android/matrixscan-count/advanced.md#clustering) that belong together. Barcodes can be auto-clustered based on their visual context, or manually grouped by the user by circling them on screen.
* MatrixScan Count now includes the concept of a `Barcode Spacial Grid`, bringing the ability to map totes in a grid-like structure. Scanned codes will be returned with their relative location and can be displayed in a map view. This allows for fast and error-free in-store picking using dedicated carts and totes. The following classes have been added:
  * `BarcodeSpatialGrid`
  * `BarcodeSpatialGridEditorView`
  * `BarcodeSpatialGridEditorViewSettings`
  * `BarcodeSpatialGridEditorViewListener`
* Introducing the Smart Duplicate Filter: unlike traditional time-based filters, this intelligent solution prevents re-scanning the same barcode unless intended, eliminating delays and improving accuracy. In user testing, it boosted task completion speeds by 10% and reduced unintentional barcode scans by 5% in workflows requiring intentional duplicate scans. Enable this new behavior by setting the existing `codeDuplicateFilter` property to the special value `-2` — now the default for both Barcode Capture and SparkScan. See the [documentation](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) for details.
* The following APIs have been added:
  * `ImageFrameSource`
  * `BarcodeFindFeedback`
    * `BarcodeFindFeedback()`
    * `ItemListUpdated()`
  * `BarcodeFindViewSettings`
    * `withHardwareTriggers()`
    * `hardwareTriggerEnabled()`
    * `hardwareTriggerKeyCode()`
  * `BarcodeFindView`
    * `shouldShowZoomControl`
    * `hardwareTriggerSupported`

#### ID

* Launched DataConsistency Verification, which identifies suspicious documents by verifying the consistency of data encoded in various parts of the document. This helps detect potential tampering or anomalies.
* Launched a Rejection API to reject documents based on predefined criteria, streamlining validation processes. Examples include rejecting expired documents or those belonging to underage holders.
* Enhanced the scanning capabilities for specific document types. When `ScannerType::FullDocument` is enabled, seamless scanning is now supported even for documents where the Scandit DataCapture SDK offers only Machine Readable Zone (MRZ) scanning.
* Added support for scanning the Machine Readable Zone of  non-standard Indian passports, where an MRZ line consists of 42 characters instead of 44. 
* Added support for scanning the Machine Readable Zone of the Chinese Mainland Travel Permit issued for non-Chinese citizens being residents of Hong Kong or Macau.
* Unified the value of the sex field from VIZ and MRZ results so that it is always one of the values `female`, `male` or `unspecified`.

#### Core

* DataCaptureContext can be used as a singleton through `DataCaptureContext.SharedInstance`.
  * The license key must be set using `DataCaptureContext.Initialize`. This step is only required once. Once initialized, the context can be used as before.
  * It is important to call `DataCaptureContext.RemoveCurrentMode()` when the active mode is no longer needed, such as when navigating away from a screen used for scanning.
  * The following methods have been added (also see Deprecations, below, for removed methods):
    * `setMode`: Sets a mode to be the active mode in the context.
    * `removeCurrentMode`: Removes the currently active mode in the context.
    * `static sharedInstance`: Returns a singleton instance of `DataCaptureContext`. This instance is unusable until properly configured by calling initialize() on it.
    * `initialize(string licenseKey)`: Reinitializes the context by configuring it with a license key.
    * `initialize(string licenseKey, string? frameworkName, string? frameworkVersion, string? deviceName, string? externalId, DataCaptureContextSettings settings)`: Reinitializes the context by configuring it with new settings.
  * Calling `DataCaptureContext.addMode()` or `DataCaptureContext.setMode()` now replaces the current mode with the new one, so it’s no longer needed to remove a mode when adding a new one.
  * The old non-singleton API is still available.

### Performance Improvements

#### Barcode

* We’ve increased the scan rate of 10% on our datasets of QR codes with high perspective distortion (so scanned at high angles). This is particularly important for cases such as receiving boxes or scanning shelf labels.

#### ID

* Scandit ID Scanning now uses an improved AI model to detect forged barcodes on US documents, which significantly improves accuracy.

### Behavioral Changes

* XCode 16.1+ is now required.
* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

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

#### Barcode

* The following APIs have been removed:
  * `BarcodeCountSettings.enableUnrecognizedBarcodeDetection`
  * `BarcodeCountView.getTextForUnrecognizedBarcodesDetectedHint`
  * `BarcodeCountView.setBrushForUnrecognizedBarcode`
  * `BarcodeCountView.setTextForUnrecognizedBarcodesDetectedHint`
  * `BarcodeCountViewListener.brushForUnrecognizedBarcode`
  * `BarcodeCountViewListener.onUnrecognizedBarcodeTapped`

## 7.0.2

**Released**: January 20, 2025

### Bug Fixes

#### Core

* Fixed an issue causing the `SparkScanView` to not be rendered on top of the host application content.

#### ID

* Fixed an issue where it was not possible to scan Visual Inspection Zone of passports if a license included the Visual Inspection Zone flag but no Machine Readable Zone flag.
* Fixed an issue where the scanning would become unresponsive when scanning the back of Romanian ID Cards.
* Fixed an issue where the personal identification number was not correctly anonymized on certain passports.
* Fixed an issue with `ResidencePermit` not instantiating correctly for the Spanish NIE document.

## 7.0.1

**Released**: December 19, 2024

No updates for this framework in this release.

## 7.0.0

**Released**: November 29, 2024

### New Features

Scandit's Smart Data Capture SDK v7.0 addresses the industry's toughest scanning challenges with innovative solutions at every layer. Our enhanced scanning engine is context-aware, understanding both the environment and user needs. This results in smoother integrations, a richer user experience, and improved scanning performance without compromising flexibility.

Version 7.0 also offers increased versatility by supporting multiple input formats including text and barcodes.

SparkScan, our flagship barcode scanning product, embodies the full potential of v7.0 with its versatile user interface coupled with a robust, out-of-the-box scanning engine. SparkScan's success is a testament to our commitment to delivering seamless, high-performance camera-based scanning solutions.

#### Barcode

* SparkScan introduces a completely redesigned user interface, enhancing ergonomics with a simplified API and in-demand customization options. These updates make SparkScan even more versatile, seamlessly integrating with various use cases and blending smoothly into any existing workflow and UI. See the [migration guide](/migrate-6-to-7.md#sparkscan) for more details.
* Added the `remove_delimiter_data` extension to the CODABAR symbology.
* MatrixScan Count users can now further classify the "not in list" barcodes when scanning against a list. Tapping on them will show a popup where the barcodes can be accepted or rejected. Check `barcode.count.ui.BarcodeCountView.BarcodeNotInListActionSettings` to enable and customize the functionality. The classified barcodes will be added to `barcode.count.BarcodeCountCaptureListSession.AcceptedBarcodes` or `barcode.count.BarcodeCountCaptureListSession.RejectedBarcodes`.
* MatrixScan Count now includes torch control. For more information, see:
  * `BarcodeCountView.ShouldShowTorchControl`
  * `BarcodeCountView.TorchControlPosition`
* MatrixScan Count now supports the ability to “uncount” an item by tapping it.
* The MatrixScan Find user interface is now optimized for 4:3 camera resolution.

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

#### Text Capture

Text Capture functionality has been deprecated in 7.0. If your use case requires text recognition, we recommend using Smart Label Capture instead.

#### ID

The legacy ID Capture UI has been removed in 7.0. If you are using the legacy UI, you must migrate to the new ID Capture API.