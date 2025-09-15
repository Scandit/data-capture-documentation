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

## 7.6.0

**Released**: September 15, 2025

### New Features

#### Core

* A new setting, `MaxResolution`, has been added to the available camera resolutions. This will select the highest resolution available for the device based on total pixel count, providing the maximum possible image quality. Note that this may impact performance.

#### Barcode

* The `MatrixScanARSimpleSample` has been updated to now demonstrate 4 different configurations for `BarcodeAr`.
* Added `BarcodeScan` trigger for MatrixScan AR annotations that displays immediately when a barcode is scanned and remains visible during scanning.

#### Smart Label Capture

* Smart Label Capture supports extracting information from purchase receipts, such as items, prices and much more. The feature is released in beta and can be tested by contacting our [support](mailto:support@scandit.com).
* Introduced a pre-built field, `DateText`, useful to match a single plain date text (as opposed to specific dates such as Packaging and Expiry) when creating Label Definitions.
* The following parameter has been added to `LabelDefinitions`:
  * `numberOfMandatoryInstances`
* Smart Label Capture now includes customizable feedback configurable via `LabelCapture.feedback`. The feedback is now automatic on scan, requiring less code to set it up.

#### ID

* A proprietary Transaction ID can now be attached to each ID scan to enable end-to-end traceability of user transactions.
* Better UX when scanning Mobile Driver Licenses (mDL) with new screens to handle Bluetooth device state and data transmission progress.
* Added support for the following Canadian IDs and Driver Licenses: Newfoundland And Labrador, Northwest Territories, Prince Edward island and Yukon.


#### Parser

* The GS1 parser now allows for dates in format `YYYYMM` also in non-strict mode if the year starts with `20XX`.

### Bug Fixes

#### Core

* Fixed an issue where the camera auto-exposure would stop working, resulting in a black screen.
* Fixed a memory leak in the `Camera` object.

#### ID

* ID scanning results  for `gender` of documents that do not specify a gender are now correctly mapped as `unspecified`.

### Behavioral Changes

* The MRZ fields `optional` and `optional1` have been renamed to `optionalDataInLine1` and `optionalDataInLine2`, respectively.

### Deprecations

#### ID

* Deprecated `resultShouldContainImage`.
* Deprecated `AamvaBarcodeVerification`.
* Deprecated `IdCaptureSettings.decodeIsoMobileDriverLicenses` and `IdCaptureSettings.decodeMobileDriverLicenseViz`.

## 7.5.1

**Released**: September 4, 2025

No updates for this framework in this release.

## 7.5.0

**Released**: August 12, 2025

### New Features

#### Core

* Added a new property to the `DataCaptureView`: `shouldShowZoomNotification `. When enabled, the data capture view may display notifications to inform users about updates in zoom level. Defaults to `true`.
* Added accessibility labels and hints to the Zoom Switch Control.
* Improved support for non-standard GS1 AI codes.
* The `Barcode` class now exposes a module count.

#### Barcode

* SparkScan now supports Smart Scan Selection. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Users might have to manually switch to a special, more precise scanning mode (Target Mode), which is inefficient. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Added `BarcodeArResponsiveAnnotation`, which automatically switches between close-up and far-away info annotations based on the barcode’s size on screen.
* Barcode AR now supports customizable notifications.
* Updated the `SearchAndFindSample` application to use SparkScan instead of BarcodeCapture.

#### Smart Label Capture

* Smart Label Capture can now support reading numeric values from 7-segment displays, such as digital scales, meters, or other electronic displays. Scanning such targets is possible via a new pre-made label definition. You can enable it using `LabelDefinition.createSevenSegmentDisplayLabelDefinition()`.

### ID

* Scanning of ISO-18013 compliant mobile driver licenses is now supported in select justifications (Queensland Digital License).
  :::tip
  Additional bluetooth permissions are required to scan mobile driver licenses. See [here](/sdks/android/id-capture/get-started.md#mobile-id-scanning) for more information.
  :::

### Performance Improvements

#### Smart Label Capture

* Improved performance when extracting text from 7-segment displays.

### Bug Fixes

#### Core

* Fixed a small memory leak in the camera object.

#### Barcode

* Fixed a crash in SparkScan when navigating away from SparkScan when holding the scan button.
* Fixed a crash when setting a `ScanditIcon` in a `BarcodeArRectangleHighlight`.

#### ID

* Fixed bug in `AAMVABarcodeVerifier` that triggered error callbacks for each verification after updating from some older SDK version.

### Deprecations

* Deprecated `BarcodeCaptureOverlayStyle`.

## 7.4.3

**Released**: August 29, 2025

### Bug Fixes

#### Core

* Fixed double-pairing in the ArUco marker pair detection for MatrixScan Pick and MatrixScan Batch.

## 7.4.2

**Released**: August 15, 2025

### New Features

#### Core

* Improved support for non-standard GS1 AI codes.

### Bug Fixes

* Fixed an issue with the UI in sample applications that resulted in content shifting under the status bar in Android 15+.
* Fixed a small memory leak in the `camera` object.
* Fixed an issue resulting in a crash when setting a `ScanditIcon` in a `BarcodeArRectangleHighlight`.

## 7.4.1

**Released**: July 14, 2025

### New Features

#### Core

* Added an API to set content description to `ZoomSwitchControl`.
* Added support for [16 KB page sizes](https://android-developers.googleblog.com/2025/05/prepare-play-apps-for-devices-with-16kb-page-size.html).

### Bug Fixes

#### Barcode

* Fixed a crash in SparkScan when navigating away from SparkScan while holding the scan button.

#### ID

* Fixed an issue with missing `BirthName` on German passports. `BirthName` is now available on `additionalNameInformation` field.

## 7.4.0

**Released**: June 19, 2025

### New Features

#### Smart Label Capture

* Added the following new method to `LabelCaptureSettings`: 
  * `getSymbologySettings()`
* Label Capture `PriceCapture` label definition factory method added.
* VIN labels are now supported via the added creator method `createVinLabelDefinition()` to `LabelDefinition`.
* Added landscape mode for LabelCapture validation flow.

#### Barcode

* OCR fallback can now be enabled for certain symbologies. Use `SymbologySettings.ocrFallbackRegex` to constrain the results. 
* Added serialization to `BarcodeFindSession`.
* Added APIs in MatrixScan Find to track session updates and modify the progress bar color.
* Add the possibility via `BarcodeCountCaptureList.SetBarcodeDataTransformer` to set a barcode data transformer. The transformer will be applied to transform the barcode data before matching to the target barcodes.

#### ID

* The minimum Android API version is now 24.
* Added support for Spanish residence permit "Green NIE".
* Added support for US Medical Marijuana IDs from West Virginia, Florida, Pennsylvania, Nevada, New York, and Oklahoma.

### Performance Improvements

* Updated ARM MbedTLS from 3.6.2 to 3.6.3.

#### ID

* Improved AAMVA Barcode Verification accuracy for Missouri documents.

### Bug Fixes

#### ID

* Fixed an issue where the middle name read from an AAMVA-compliant barcode would be at times returned as `NONE`.

## 7.3.3

**Released**: July 25, 2025

### Bug Fixes

#### ID

* Fixed an issue where preexisting OTA models on the device, if any, would be loaded instead of the latest model for the SDK version, leading to errors.

## 7.3.2

**Released**: June 25, 2025

### Bug Fixes

* Fixed an issue where the camera could be displayed 90 degrees sideways.
* Fixed a typo in the `labelCaptureValidationFlowOverlay:didCaptureLabelWithFields:` method.

## 7.3.1

**Released**: June 13, 2025

No updates for this framework in this release.

## 7.3.0

**Released**: May 16, 2025

### New Features

#### Barcode

* The following APIs have been added to MatrixScan Count:
  * A new `shouldShowStatusIconsOnScan` field has been added to `BarcodeCountView`, which makes the status icons visible as soon as a barcode is scanned.
* Added hidden properties to enable and setup dynamic camera resolution.
* MatrixScan AR now allows custom highlights and annotations to be used.
* The `LaserViewfinder` is now available.
* In MatrixScan Pick you can now specify different loading text for picking and unpicking in `BarcodePickViewSettings`.
* Added support for structured append QR codes in all MatrixScan modes. They are exposed over `ScObjectCountingSession` and rendered as a group. The API is identical to how structured append is used in a single barcode use case: the entire structured append data is accessible on all sub code results.

#### ID

* Unify the result value when parsing the sex field, including added support for special characters used, so that it is always one of the values `female`, `male` or `unspecified`.

#### Smart Label Capture

* Smart Label Capture introduces a new workflow: [Validation Flow](/sdks/android/label-capture/intro.md#validation-flow). This workflow allows users to confirm OCR results, manually correct errors, or individually capture missing fields without needing to rescan the entire label. It is designed to address common issues such as glare, occlusion, and poor lighting that lead to incomplete label reads, helping you maintain high data integrity.
* Added a new overlay for `LabelCapture`: `LabelCaptureValidationFlowOverlay`. This allows the user to follow a validation flow when scanning a label during several scans, instead of just in one go. Also includes a `LabelCaptureValidationFlowListener` to get the final results of the validation process.
* Enabled `dataTypePatterns` for all text fields in Smart Label Capture.

### Bug Fixes

#### Barcode

* Fixed an issue in SparkScan where the mini preview was closed after a scan, even if the preview behavior was set to `Persistent`.

##### Smart Label Capture

* Fixed an issue where `ExpiryDateTextBuilder` and `PackingDateTextBuilder` could override the patterns even when the `labelDateFormat` was set.

### Behavioral Changes

* MatrixScan Check has been renamed to MatrixScan AR, including in the naming of all relevant APIs.

## 7.2.4

**Released**: August 8, 2025

No updates for this framework in this release.

## 7.2.3

**Released**: June 24, 2025

### Bug Fixes

* Fixed issue where camera could be displayed 90 degrees sideways.

## 7.2.2

**Released**: May 9, 2025

### Bug Fixes

* Fixed an issue in MatrixScan Batch occurring when Aruco marker pairs were detected in the multiscanner. The callback would return only a single marker instead of the result for marker pairs.

## 7.2.1

**Released**: April 24, 2025

### Bug Fixes

* Fixed two distinct memory leaks in SparkScan.

## 7.2.0

**Released**: March 31, 2025

### New Features

#### Barcode

* MatrixScan Count now includes the option to set the text hint when clear screen is pressed.
* QuadHD (Quad High Definition) is now a supported resolution. QHD is a resolution of `2560×1440` pixels, fitting between standard HD (`1920x1080`) and 4K(`3840×2160` pixels).
* Added the `isPulsing` property to circle highlights in MatrixScan AR, enabling a pulsing animation effect.
* A new [sample application](/sdks/android/samples.md) is available for [tote mapping in MatrixScan Count](/sdks/android/matrixscan-count/advanced/#tote-mapping).

#### ID

* ID Capture now supports the decoding of mobile driver’s licenses (currently limited to Australian licenses).

#### Smart Label Capture

* Improved recognition rate of expiry dates in Smart Label Capture, with a particular focus on dot matrix fonts.

### Performance Improvements

#### Barcode

* We further optimized the resources management in SparkScan, improving battery life when in Target Mode.
* Better handling of multi-status barcodes when using clustering.
* Refined UI of the mapping flow when using MatrixScan Count.

### Behavioral Changes

* The default `BarcodeBatchBasicOverlay` brush when using the `BarcodeBatchBasicOverlayStyle.FRAME` style has been changed from white to Scandit blue.

### Bug Fixes

#### Barcode

* Fixed a bug where the `DataCaptureView` was not showing up when opening and closing the view in a short sequence.
* Fixed a crash in SparkScan when pressing certain buttons during hold-to-scan.

#### Core

* Fixed rare incorrect QR code reads of codes with a low error correction level.
* Fixed a bug in Barcode Selection that caused inconsistent selection times for single barcodes.

## 7.1.3

**Released**: March 26, 2025

### Bug Fixes

* Fixed a crash in SparkScan when pressing certain buttons during hold-to-scan.

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

* [MatrixScan AR](/sdks/android/matrixscan-ar/intro.md) in now available, offering prebuilt views designed to quickly build custom workflows with augmented reality for your existing app. By highlighting barcodes and displaying additional information or user interaction elements over them, any process can be enhanced with state-of-the-art augmented reality overlays.
* MatrixScan Count now includes the ability to [cluster barcodes](/sdks/android/matrixscan-count/advanced.md#clustering) that belong together. Barcodes can be auto-clustered based on their visual context, or manually grouped by the user by circling them on screen.
* MatrixScan Count now includes the concept of a `Barcode Spacial Grid`, bringing the ability to map totes in a grid-like structure. Scanned codes will be returned with their relative location and can be displayed in a map view. This allows for fast and error-free in-store picking using dedicated carts and totes. The following classes have been added:
  * `BarcodeSpatialGrid`
  * `BarcodeSpatialGridEditorView`
  * `BarcodeSpatialGridEditorViewSettings`
  * `BarcodeSpatialGridEditorViewListener`
* Introducing the Smart Duplicate Filter: unlike traditional time-based filters, this intelligent solution prevents re-scanning the same barcode unless intended, eliminating delays and improving accuracy. In user testing, it boosted task completion speeds by 10% and reduced unintentional barcode scans by 5% in workflows requiring intentional duplicate scans. Enable this new behavior by setting the existing `codeDuplicateFilter` property to the special value `-2` — now the default for both Barcode Capture and SparkScan. See the [documentation](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) for details.
* The following function has been added to `BarcodePickAsyncMapperProductProvider`, to enable changing the product database and restart picking:
  * `UpdateProductList`
* The following methods have been added to `BarcodeCountView`:
  * `setBrushForAcceptedBarcode()`
  * `setBrushForRejectedBarcode()`
* Added a new constructor for `BarcodeFindItemSearchOptions` for receiving a Brush, allowing different barcodes to use different Brushes for rendering the dots.

#### ID

* Launched DataConsistency Verification, which identifies suspicious documents by verifying the consistency of data encoded in various parts of the document. This helps detect potential tampering or anomalies.
* Launched a Rejection API to reject documents based on predefined criteria, streamlining validation processes. Examples include rejecting expired documents or those belonging to underage holders.
* Enhanced the scanning capabilities for specific document types. When `ScannerType::FullDocument` is enabled, seamless scanning is now supported even for documents where the Scandit DataCapture SDK offers only Machine Readable Zone (MRZ) scanning.
* Added support for scanning the Machine Readable Zone of  non-standard Indian passports, where an MRZ line consists of 42 characters instead of 44. 
* Added support for scanning the Machine Readable Zone of the Chinese Mainland Travel Permit issued for non-Chinese citizens being residents of Hong Kong or Macau.
* Unified the value of the sex field from VIZ and MRZ results so that it is always one of the values `female`, `male` or `unspecified`.

#### Label Capture

* To simplify working with dates in Smart Label Capture (e.g., capturing an expiry date), we’ve added native support for dates in `LabelField`. Now, if a field contains a date you can retrieve it as a date object using `LabelField.asDate()`.

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

* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

### Bug Fixes

#### Barcode

* Fixed a rare crash affecting the camera.
* Fixed a rare camera crash that occurred if updating the camera settings while the camera is active.
* Fixed bugs in `BarcodeCountView` where filtered barcode indicators would not be tapable and where TalkBack would incorrectly focus on empty, unlabeled views.
* Fixed a bug in `BarcodeCountView` where setting a property would not immediately refresh the UI.

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

* Fixed an issue causing the `SparkScanView` to not be rendered on top of the host application content.

#### Barcode

* Fixed an issue that was causing a crash when creating multiple instances of `BarcodeCapture` without setting a `BatterySavingMode`.

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
* MatrixScan Find now uses a 4:3 aspect ratio, providing a significantly larger field of view for enhanced scanning accuracy and coverage.
* MatrixScan Count users can now further classify the "not in list" barcodes when scanning against a list. Tapping on them will show a popup where the barcodes can be accepted or rejected. Check `barcode.count.ui.BarcodeCountView.BarcodeNotInListActionSettings` to enable and customize the functionality. The classified barcodes will be added to `barcode.count.BarcodeCountCaptureListSession.AcceptedBarcodes` or `barcode.count.BarcodeCountCaptureListSession.RejectedBarcodes`.
* SparkScan now provides the ability to switch between SparkScan and Smart Label Capture via a button in the toolbar. See `SparkScanView::labelCaptureButtonVisible` for more information.
* The `BarcodePickView` API now includes a Reset function for restarting the workflow, where calling it clears all picked items and restores the initial state.
* For `BarcodeCountView`, the `SetBrushForBarcode` methods now allow setting a null brush, using a transparent brush when so set.
* Added the following property to `BarcodeBatchSettings`: `expectsOnlyUniqueBarcodes`.
* Added the following function to `BarcodePickAsyncMapperProductProvider`: `UpdateProductList`. This function is used to change the product database and restart picking.

#### Core

* Added the following API for fetching all Open Source Software (OSS) license text and attributions for all OSS used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo()`

#### Smart Label Capture

* A new [sample application](/sdks/android/samples.md) has been created to demonstrate Smart Label Capture functionality.

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
* Improved decoding of blurry 1D barcodes on new Android devices.

### Breaking Changes

#### Barcode

* The MatrixScan API (`BarcodeTracking`) has been renamed to `BarcodeBatch`. All classes have been renamed accordingly (e.g. `BarcodeTrackingListener` → `BarcodeBatchListener`).

### Behavioral Changes

#### Barcode

* Smart Scan Intention is now enabled by default.
* Updated `BarcodeCountSession` to now expose a `Barcode` list.

### Bug Fixes

* Fixed an issue where calling `applySettings` would not update the Camera API.
* Fixed a rare crash affecting the camera.
* Fixed a sporadic crash in `BarcodePickView` caused by negative view sizing when opening the keyboard.
* Fixed a MatrixScan Count issue where the tap-to-uncount hints did not correctly show the number of uncounted items.

### Deprecations

In 7.0, we removed all APIs that were deprecated during the lifetime of 6.0. Before [migrating to 7.0](/migrate-6-to-7.md), we suggest upgrading to 6.28.1, fixing all deprecation warnings and then upgrading to 7.0.

#### Barcode

* The following SparkScan APIs have been deprecated:
  * `SparkScanViewHandMode`
  * `SparkScanView.HandModeButtonVisible`
  * `SparkScanViewSettings.DefaultHandMode`
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