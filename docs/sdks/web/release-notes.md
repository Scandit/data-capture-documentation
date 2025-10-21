---
description: "Release notes and updates for the Scandit Web SDK."
toc_max_heading_level: 3
displayed_sidebar: webSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: web
keywords:
  - web
---

## 8.0.0-beta.1

**Released**: October 16, 2025

### New Features

Scandit's SDK 8.0 marks the evolution of data capture from a high-performing scanning tool into an intelligent AI-powered workflow enabler. As frontline operations face mounting pressures with more data points to capture, increasingly complex workflows to navigate, and tighter resource constraints, SDK 8.0 delivers a set of innovations that:

* Adapt its scanning settings and UI to context by analyzing the scanning environment and user intent;
* Automate the capture of any data format, barcode clustering, task handling or camera settings;
* Accelerate critical use cases to maximize ROI through intuitive, streamlined scanning workflows, using interactive AR-guidance, adaptive UI and out-of-the-box custom-branded passenger experiences.

With SDK 8.0 businesses can transform data capture from a basic function to a strategic advantage. It enables intelligent scanning that:

* Understands not just what is being scanned, but also what you want to scan and why you’re scanning it
* Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users seamlessly through sophisticated tasks to ensure the highest level of productivity.

#### Core

* The `Camera` API has been completely redesigned for this release. See the API reference for complete details.
* The minimum Chrome version supported is now 85+.
* The `configure` method has been remove in favour of `DataCaptureContext.forLicenseKey`

#### Barcode

* Smart Scan Selection is now available in SparkScan for the Web SDK.
* Adapted `SparkScanView` to now be usable as a web component. Also added a `SparkScanReactSample` to demonstrate this usage.
* The following have been added to MatrixScan AR:
  * `BarcodeArView.getHighlightForBarcode`
  * `BarcodeAirView.getAnnotationForBarcode`

#### Smart Label Capture

* We’re introducing an enhancement that makes Smart Label Capture more robust and scalable by complementing its on-device model with a larger, more capable model. When the on-device model can’t capture certain labels, the SDK automatically escalates to this enhancement to handle complex or unforeseen cases with high accuracy and reliability. This capability is currently available in `beta`. If you’re interested in trying it, please contact Scandit Support. For configuration details, see `labelDefinition.adaptiveRecognitionEngine`.

#### ID

* ID Capture now supports full-frame anonymization.
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
  * Renamed property: `patterns` → `valueRegex`
  * Renamed property: `dataTypePatterns` → `anchorRegex`
* Receipt Scanning API has been updated with the following changes:
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

### Bug Fixes

#### ID

* Fixed a bug that could get the scanner stuck when scanning a US passport card.
* Fixed an issue where unavailable dates would not be properly set to `null` in an ID scan result.

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.

#### Barcode

* All previously deprecated APIs have been removed in this release.
* `DataCaptureContext.create`, `createWithOptions` and `configure` have been removed in favor of the `forLicenseKey` method.

## 7.6.2

**Released**: October 20, 2025

### Bug Fixes

#### Core

* Fixed a bug where the scanner wasn't working in Firefox for Android.

#### Barcode

* `BarcodeFind` cards now renders the default icon instead of the gray box.

#### Smart Label Capture

* A new method for `ReceiptScanningListener` was added. This is being invoked when a connection error occurs while trying to recognize a document.

## 7.6.1

**Released**: September 18, 2025

### Bug Fixes

#### Core

* Fixed decoding of some ASCII-encoded DataMatrix codes ending with '254' codeword followed by padding.
* Improved support for missing or damaged timing patterns in Aztec codes.

#### Barcode

* Fixed an issue where `BarcodeFindItemContent` was not correctly rendering the information.

## 7.6.0

**Released**: September 15, 2025

### New Features

#### Core

* It is now possible to set up the `Camera` into the Context before calling `configure()`, enabling the loading of WASM files while accessing the camera.
* The following new methods are available in `DataCaptureContext`:
  * `setMode`: Sets a mode to be the active mode in the context.
  * `removeCurrentMode`: Removes the currently active mode in the context.
  * `static sharedInstance`: Returns a singleton instance of DataCaptureContext. This instance is unusable until properly configured by calling initialize() on it.
  * `initialize(string licenseKey)`: Reinitializes the context by configuring it with a license key.
  * `initialize(string licenseKey, string? frameworkName, string? frameworkVersion, string? deviceName, string? externalId, DataCaptureContextSettings settings)`: Reinitializes the context by configuring it with new settings.
* See Deprecations, below, for methods deprecated in `DataCaptureContext`.
* Added `BarcodeScan` to `BarcodeArAnnotationTrigger` for persistent annotation behavior in MatrixScan AR.

#### Smart Label Capture

* Smart Label Capture now includes customizable feedback configurable via `LabelCapture.feedback`. The feedback is now automatic on scan, requiring less code to set it up.

#### ID

* A proprietary Transaction ID can now be attached to each ID scan to enable end-to-end traceability of user transactions.
* Better UX when scanning Mobile Driver Licenses (mDL) with new screens to handle Bluetooth device state and data transmission progress.
* Added support for the following documents:
  * Canadian IDs and Driver Licenses for Newfoundland And Labrador, Northwest Territories, Prince Edward island and Yukon
  * UK Military iD (MOD 90 ID Card)
  * New US Driver License versions in Alaska and New Hampshire
  * Georgia Medical Marijuana Card

#### Parser

* The GS1 parser now allows for dates in format `YYYYMM` also in non-strict mode if the year starts with `20XX`.

### Bug Fixes

#### Barcode

* Fixed a bug where tapping the mini preview resize control would prevent scanning on the next switch to active state.
* Fixed an issue in MatrixScan AR where certain code 128 were not correctly painted in the `BarcodeArView`.

#### Smart Label Capture

* Fixed an incorrect implementation of the `DataCaptureMode` interface in `LabelCapture` that would result in errors when calling `context.AddMode` in TypeScript projects.

#### ID

* ID scanning results  for `gender` of documents that do not specify a gender are now correctly mapped as `unspecified`.

### Behavioral Changes

#### Core

* The minimum supported Chrome version is now 64+.

#### ID

* The MRZ fields `optional` and `optional1` have been renamed to `optionalDataInLine1` and `optionalDataInLine2`, respectively.

### Deprecations

#### Core

* The following methods have been deprecated from `DataCaptureContext`:
  * `addMode`: Replaced by `setMode`, since only 1 mode can be active at a time in a `DataCaptureContext`.
  * `removeAllModes`: Replaced by `removeCurrentMode`, since only 1 mode can be active at a time in a `DataCaptureContext`.
* Deprecated `Camera` and `CameraAccess`. Both will be replaced in version 8.0.

#### Barcode

* Deprecated `BarcodeCaptureOverlayStyle` and `BarcodeCaptureOverlay.style`.

#### ID

* Deprecated `resultShouldContainImage`.
* Deprecated `AamvaBarcodeVerification`.
* Deprecated `IdCaptureSettings.decodeIsoMobileDriverLicenses` and `IdCaptureSettings.decodeMobileDriverLicenseViz`.

## 7.5.1

**Released**: September 4, 2025

### Bug Fixes

#### Core

* Fixed browser minimum support to be at least Chrome 64+.
* Some animations may not work correctly in older browsers, such as Chrome `<75`. A warning has been added suggesting `web-animation-js` polyfill for better UX.

## 7.5.0

**Released**: August 12, 2025

### New Features

#### Barcode

* SparkScan now supports Smart Scan Selection. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Users might have to manually switch to a special, more precise scanning mode (Target Mode), which is inefficient. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Barcode AR now supports customizable notifications.
* Tappable area for `BarcodeArStatusIconAnnotation` is now at least 48px.
* Added ARIA labels to `DataCaptureView` controls.
* Improved support for non-standard GS1 AI codes.
* The `Barcode` class now exposes a module count.

#### ID

* Scanning of ISO-18013 compliant mobile driver licenses is now supported in select justifications (Queensland Digital License).
* Added a new listener (`didLocalizeId`) called whenever a personal identification document or its part is localized within a frame.
* Exposed partial result after front-side scan via `IdCaptureSettings.notifyOnPartialCapture`.

### Bug Fixes

#### Barcode

* Fixed an issue where `BarcodeArStatusIconAnnotation.icon` could cause an error if the icon was not ready.
* Fixed a bug where continuous scanning in SparkScan was stopped when changing device orientation.
* Fixed an issue where `BarcodeArStatusIconAnnotation.backgroundColor` setter and getter were not working as expected.

#### ID

* Fixed bug in `AAMVABarcodeVerifier` that triggered error callbacks for each verification after updating from some older SDK version.

### Deprecations

* Deprecated `BarcodeCaptureOverlayStyle`.

## 7.4.3

**Released**: August 29, 2025

No updates for this framework in this release.

## 7.4.2

**Released**: August 15, 2025

### New Features

#### Core

* Improved support for non-standard GS1 AI codes.

### Bug Fixes

* Fixed a bug in SparkScan where continuous scanning was stopped when changing device orientation.
* Fixed an issue where `BarcodeArStatusIconAnnotation.backgroundColor` setter and getter were not working as expected.

## 7.4.1

**Released**: July 14, 2025

### Bug Fixes

#### ID

* Fixed an issue with missing `BirthName` on German passports. `BirthName` is now available on `additionalNameInformation` field.

## 7.4.0

**Released**: June 19, 2025

### New Features

#### Barcode

* The `LaserViewfinder` is now available.

#### ID

* Added support for Spanish residence permit "Green NIE".
* Added support for US Medical Marijuana IDs from West Virginia, Florida, Pennsylvania, Nevada, New York, and Oklahoma.

#### Smart Label Capture

* Smart Label Capture introduces a new workflow: Validation Flow. This workflow allows users to confirm OCR results, manually correct errors, or individually capture missing fields without needing to rescan the entire label. It is designed to address common issues such as glare, occlusion, and poor lighting that lead to incomplete label reads, helping you maintain high data integrity.
* Added `setDataPatterns` and `resetDataPatterns` methods to Weight, UnitPrice, and TotalPrice builders.

### Performance Improvements

* Updated ARM MbedTLS from 3.6.2 to 3.6.3.

#### ID

* Improved AAMVA Barcode Verification accuracy for Missouri documents.

### Bug Fixes

* Fixed an issue where the `triggerButtonCollapseTimeout` was being triggered in the wrong scenarios.
* Accessing `localStorage` or `sessionStorage` in contexts where they're explicitly disabled now is handled correctly.

#### ID

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

### Bug Fixes

* Fixed an issue where the `triggerButtonCollapseTimeout` was being triggered in the wrong scenarios.

## 7.3.0

**Released**: May 16, 2025

### New Features

#### Barcode

* For all MatrixScan products, the behavior of AR elements such as popovers and annotation has been updated to allow them to go outside the viewport.
* The ArUco symbology is now supported in the Web SDK.
* Added support for structured append QR codes in all MatrixScan modes. They are exposed over `ScObjectCountingSession` and rendered as a group. The API is identical to how structured append is used in a single barcode use case: the entire structured append data is accessible on all sub code results.

#### ID

* Unify the result value when parsing the sex field, including added support for special characters used, so that it is always one of the values `female`, `male` or `unspecified`.
* Added support mobile driver's license (mDL) scanning.

### Bug Fixes

#### Barcode

* Fixed an issue in SparkScan where the mini preview was closed after a scan, even if the preview behavior was set to `Persistent`.
* Fixed minor JavaScript errors by replacing access to unavailable API in Safari < 15.4 with available ones.
* Fixed error not being catchable from the `configure()` function when the WASM file fails to load.
* Fixed an issue where `SparkScanView` did not take into account the parent element dimensions.

#### ID

* Fixed an issue with the partial cleanup of resources when removing the Id Capture mode.

#### Smart Label Capture

* Fixed an issue where `ExpiryDateTextBuilder` and `PackingDateTextBuilder` could override the patterns even when the `labelDateFormat` was set.

### Behavioral Changes

* MatrixScan Check has been renamed to MatrixScan AR, including in the naming of all relevant APIs.

## 7.2.4

**Released**: August 8, 2025

No updates for this framework in this release.

## 7.2.3

**Released**: June 24, 2025

No updates for this framework in this release.

## 7.2.2

**Released**: May 9, 2025

### Bug Fixes

* Fixed an issue in MatrixScan Batch occurring when Aruco marker pairs were detected in the multiscanner. The callback would return only a single marker instead of the result for marker pairs.

## 7.2.1

**Released**: April 24, 2025

### Bug Fixes

* Fixed minor JavaScript errors by replacing access to unavailable API in Safari v15.4+ with available ones.
* SparkScanView is now taking into account the parent element dimensions.
* Fixed an issue where the mini preview was closed after a scan, even if the preview behavior was set to `Persistent`.

## 7.2.0

**Released**: March 31, 2025

### New Features

#### Barcode

* Releasing Smart Label Capture, our new product that enables multi-modal data capture, extracting barcode and text data from labels simultaneously and making complex data entry up to 7 times faster. Ideal for labels containing serial numbers, weights, or expiry dates, it improves accuracy, reduces errors, and prevents revenue loss from incorrect information.
* Added `DataCaptureContext` shared instance API.
* Added the `isPulsing` property to circle highlights in MatrixScan AR, enabling a pulsing animation effect.

#### ID

* ID Capture now supports the decoding of mobile driver’s licenses (currently limited to Australian licenses).

### Behavioral Changes

* The default `BarcodeBatchBasicOverlay` brush when using the `BarcodeBatchBasicOverlayStyle.FRAME` style has been changed from white to Scandit blue.

### Bug Fixes

* Fixed an issue in `SparkScanView` that could result in duplicate trigger buttons.

## 7.1.3

**Released**: March 26, 2025

No updates for this framework in this release.

## 7.1.2

**Released**: March 13, 2025

### Bug Fixes

* Fixed a rare issue in SparkScan that would not allow for properly drawing the barcode location.
* Fixed an issue where in some browsers `error 28` was shown when some internal files had names exceeding a certain number of characters.

## 7.1.1

**Released**: March 7, 2025

### Bug Fixes

* Fixed `sc_recognition_context_release` to abort potentially still in-progress background set up of the barcode scanner if `sc_barcode_scanner_wait_for_setup_completed` was not called explicitly.

## 7.1.0

**Released**: February 21, 2025

### New Features

#### Barcode

* [MatrixScan AR](/sdks/web/matrixscan-ar/intro.md) in now available, offering prebuilt views designed to quickly build custom workflows with augmented reality for your existing app. By highlighting barcodes and displaying additional information or user interaction elements over them, any process can be enhanced with state-of-the-art augmented reality overlays.
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

* Fixed an issue causing the `SparkScanView` to not be rendered on top of the host application content.

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
* Model files now have the file extension set to .model for easier web serving.
* The engine library location has been changed from `build/engine` to `sdc-lib`.
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
