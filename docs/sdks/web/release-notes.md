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

## 8.5.0

**Released**: July 9, 2026
:::warning Known Issues

SDK 8.5.0 has a known issue that causes ID Capture to silently fail to scan any PDF417 ID in some customer configurations. Customers using ID Capture are recommended to stay on their current versions until version 8.5.1 is released.

:::

### New Features

#### Barcode

* Added the SelectionMode API to replace the SparkScan target-mode APIs and `ScanIntention.smartSelection`: Set `selectionMode` (off/on/auto) in the `BarcodeCaptureSettings` and `SparkScanSettings` to control whether an aimed-at barcode is scanned automatically or requires explicit selection.
* Added `logoStyle` and `logoAnchor` customization properties to `BarcodeArView`, `BarcodeCountView`, `BarcodeFindView`, `BarcodePickView`, and `BarcodeSequenceView`.

#### Id

* Added Irish Garda Age Card as `RegionSpecificSubtype.IrelandAgeCard`.
* Added a new `PassportType` property to `MrzResult`.
* Added double-sided support for the Oman residence card.
* Added single-sided support for extraction of issue date and birth date from the 2025 NYC Municipal ID.
* Added Web support for: Australia ACT Driver's License, USA Oklahoma Driver's License, and USA Puerto Rico ID.

#### Smart Label Capture

* Extended VIN label capture to also scan Code 128 barcodes (in addition to QR, Code 39, and Data Matrix) via `createVinLabelDefinition()`.
* Extended LabelCapture to accept label definitions where both "barcode" and "text" field types use the "semantics" feature simultaneously; previously this was restricted to only one field type at a time.
* Improved the add/remove lifecycle handling of the validation flow overlay.

### Performance Improvements

#### Barcode

* Enhanced detection of low-resolution QR codes, improving scan rates for QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
  - codes is now enabled by default, improving scan rates for challenging QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
* Improved scanning of micro-QR codes affected by quiet zone violations and perspective distortion.

#### Smart Label Capture

* Improved Receipt Scanning efficiency by optimizing receipt image processing before extraction.

#### Core

* Improved worker loading.

### Behavioral Changes

#### Barcode

* Reduced Code 128 minimum symbol count from 6 to 4; short codes (4 & 5 symbols) use stricter matching rules than longer codes. To explicitly exclude short codes, disable symbol counts 4 & 5 via `sc_symbology_settings_set_active_symbol_counts()` for Code 128. Note that if you previously enabled short code scanning, more strict settings are now in effect to reduce the chance of false positives, which are more likely for very short codes.
* Tightened Code 39 false positive filter thresholds by default; to restore the previous behavior, enable the `relaxed` extension on Code 39 via `sc_symbology_settings_set_extension_enabled()`. This is only advised when external validation measures are available, e.g. scanning against a known list of valid codes or when codes contain structured data.
* Updated `SymbologyDescription.forIdentifier` to return `null` for unrecognized identifiers (e.g. `"EAN-8"` instead of `"ean8"`); previously such input was silently mapped to `Codabar`.

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.
* Fixed BarcodeAR view settings not being taken into account.
* Fixed recommended BarcodeAR camera settings not being applied correctly.
* Fixed a `BarcodeFind` view issue where overlay dots were sometimes not rendered correctly after pausing.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed rare cases of incorrect (tiny) PDF417 location outlines.

#### Id

* Fixed an issue where cropped document images were rotated when Frame Image was also enabled.
* Corrected the orientation of cropped Visa document images that were being rotated incorrectly when scanned using a single-frame image source.
* Fixed parser handling of non-standard Surrey BC AAMVA barcodes that were incorrectly returning "Invalid Format".
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

#### Core

* Fixed the Web SDK camera preview expanding to full-screen in iOS WebViews by setting `playsinline` and `webkit-playsinline` attributes on the video element; the host `WKWebView` must also enable `allowsInlineMediaPlayback`.
* Fixed a bug that caused the zoom notification to not be shown when using the `ZoomSwitchControl`.
* Fixed a crash when the `DataCaptureContext` singleton was initialized more than once.
* Fixed an issue that caused the torch to turn off after minimizing the browser or switching tabs.

### Deprecations

#### Barcode

* The SparkScan target-mode APIs and `ScanIntention.smartSelection` are deprecated in favour of selectionMode.

## 8.4.1

**Released**: June 23, 2026

### Bug Fixes

#### Barcode

* Fixed BarcodeAR view settings not being taken into account.
* Fixed recommended BarcodeAR camera settings not being applied correctly.
* Fixed a memory leak in SparkScan when using the item-based API.

#### Id

* Fixed an issue where cropped document images were rotated when they are recovered using the getFrame API.

#### Core

* Fixed WebKit 26.x bugs causing pthreads WASM crashes (WebKit bug #303387) and SIMD corruption on affected versions (Apple Radar 176035764) by pinning memory and disabling SIMD engine-wide. This slows compute-heavy scanning on those versions, most noticeably Label Capture OCR.

## 8.4.0

**Released**: May 18, 2026

### New Features

#### Barcode

* Added `dotRadius` property to `BarcodeBatchBasicOverlay` to allow customizing the size of dots when using the Dot overlay style.

#### Id

* Added support for reading the vehicle table on the back of New Zealand driving licences, with the latest expiry date returned; supported vehicle classes are 1–6, including L=learner and R=restricted variants.
* Added support for new versions of USA, California – Driver's License; USA, North Carolina – Driver's License; USA, Texas – Driver's License; and USA, Oklahoma – Driver's License.

#### Smart Label Capture

* Added the `numberOfMandatoryInstances` property to the Web platform.

#### Core

* Redesigned `ZoomSwitchControl` to support multiple configurable zoom levels; the control now displays as a compact button that expands to show all available zoom levels, automatically filtered to those supported by the device hardware.
* Added a new `PinchToZoom` gesture.
* Introduced a new `ZoomListener` on the Camera object.
* Added support for the `SwipeToZoom` gesture.
* Added a default value to the `ZoomSwitchOrientation` enum.
* Adjusted control colors for better visibility on dark and light backgrounds.
* Fixed a bug where sound feedback was not correctly played in a multi-tab scenario.

### Performance Improvements

#### Barcode

* Improved Code 128 scan robustness for codes with uneven blur and geometric distortions. Available on all platforms except WebAssembly without SIMD and ARM without FP16.
* Improved 1D barcode scanning speed and reduced false positives for linear symbologies.
* Further improved scanning of square DataMatrix codes with damaged or occluded timing patterns.

#### Core

* Improved worker loading.

### Behavioral Changes

#### Barcode

* Smart Scan Intention now continuously adapts between Single Scan and Selection modes during a scanning session when Smart Scan Selection is enabled, switching back to Single Scan when the scene no longer requires Selection mode. Previously, once Selection mode was activated it remained active for the rest of the session.
* Changed ITF scanning to reduce false positives by introducing checksum-dependent scoring. ITF has an optional checksum which is mandated to be enabled by many of the standards that use ITF as the data carrier. Starting with this release, checksum-passing ITF codes are scanned with more relaxed conditions than codes that don't pass the checksum test. This happens even if the optional mod 10 checksum isn't enabled. To disable this behavior, enable the `no_checksum_dependent_validation` symbology extension for the ITF symbology.
* Removed the Abseil library dependency.
* Reduced Code 39 false positives.

#### Core

* Updated mbedtls from version 3.6.5 to 3.6.6.
* Updated the `CameraSwitchControl` and `TorchSwitchControl` UI.

### Bug Fixes

#### Barcode

* Fixed an issue where zoom notifications were not shown when zooming in and out.
* Fixed an issue causing the SparkScan mini preview to have an incorrect size in landscape orientation.
* Fixed an issue that caused the SparkScan camera to stop working when disposing the context and re-initializing it.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed an issue where the Smart Scan Selection aimer would become too small when scan-area margins restricted the visible scan area; the aimer is now sized relative to the view, keeping a consistent on-screen size regardless of margins.

#### Id

* Fixed an issue where the US Permanent Residence Card was not processed through the VizMrz flow.
* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture.
* Fixed an issue where AAMVA verification was being performed even when no AAMVA document types were enabled in the accepted documents.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture
* Fixed an issue where the validation flow viewfinder was not displayed.
* Fixed a race condition in the validation flow.
* Fixed an issue where adaptive scanning text was sometimes not correctly shown in the validation flow overlay.
* Fixed a bug in the validation flow where input was not fully visible when focused in landscape orientation.
* Fixed a bug that caused error messages in `DataCaptureView` to be rendered partially out-of-view.
* Fixed a rare race condition in Label Capture.
* Added `.asDate()` support to `ExpiryDate` and `PackingDate` label fields when the text is provided as manual input or as an Adaptive-Recognition-Engine response.
* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same LabelCapture mode instance.

#### Core

* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.
* Fixed a bug where setting the same `DataCaptureContext` instance twice on a `DataCaptureView` would lead to a crash.

### Deprecations

#### Core

* Added `zoomLevels` property to `CameraSettings` and deprecated `zoomGestureZoomFactor`.
* Deprecated `CameraFOVSwitchControl` in favor of `ZoomSwitchControl`.

## 8.3.1

**Released**: April 14, 2026

### Bug Fixes

#### Id

* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture

#### Smart Label Capture

* Fixed the validation flow to accept dates in more formats when manually entered
* Fixed a race condition in the validation flow

#### Core

* Fixed JavaScript syntax in the sdc-lib folder that was not correctly downleveled to respect the minimum browser version

## 8.3.0

**Released**: March 26, 2026

### New Features

#### Barcode

* Added support for composite codes in SparkScan

#### Id

* Corrected Mexican Voter ID parent names to firstName and lastName
* Added support for OCR scanning of the 2026 version of Victoria mobile driver licenses
* Added IdCaptureSettings.anonymizeDefaultFields setting that controls whether the SDK applies default anonymization rules for specific document types and regions
* US, EU/ Schengen + UK passports no longer fallback to MRZ only. Now, US, EU/ Schengen + UK passports must capture VIZ instead of returning MRZ values after the configurable timeout has elapsed. This applies to FullDocumentScanner or SingleSideScanner when both VIZ and MRZ zones are enabled.

#### Smart Label Capture

* Fixed a rare race condition
* Fixed some issues with keyboard handling in Validation Flow

### Performance Improvements

#### Barcode

* Improved EAN8 false positive filtering in strict mode
* Improved speed of MatrixScan Count scanning phase for mid- and high-end devices

### Bug Fixes

#### Barcode

* Fixed an issue that caused the SparkScan camera to stop working when disposing the context and re-initializing it.
* Fixed an issue causing the SparkScan toolbar buttons to be aligned incorrectly.

#### Id

* Fixed BarcodeDictionary anonymization setting for iOS and Web
* Fixed support for UAE Esaad card
* Sanitized name fields on ACT driver license to split FullName and populate first and last name properties
* Added support for scanning MRZ from the back of Argentinian DN when using `FullDocumentScanner`
* Fixed misplaced MRZ anonymization on FullFrame images.

#### Smart Label Capture

* Fixed issue where the `LabelCaptureValidationFlowOverlay` sometimes did not reflect label capture settings when reused
* Enhanced the `LabelCaptureValidationFlowOverlay` to resume when the mode is enabled and Validation Flow is paused.
* Fixed camera being incorrectly paused while cloud backup started in Validation Flow
* Fixed runtime error that sometimes occurred during cloud backup request when screen was tapped in validation flow

#### Core

* Fixed sound feedback playback in multi-tab scenarios
* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.

## 8.2.1

**Released**: March 5, 2026

### Bug Fixes

#### Id

* Corrected Mexican Voter ID parent names to map to firstName and lastName
* Sanitized name fields on ACT DL. Splits FullName to populate first and last name properties

#### Smart Label Capture

* Fixed `LabelCaptureValidationFlowOverlay` not reflecting Label Capture settings if reused
* Fixed `LabelCaptureValidationFlowOverlay` not correctly resuming if user changes view when in pause and comes back
* Fixed some issues with keyboard handling in Validation Flow
* Fixed camera being incorrectly paused while cloud backup started in Validation Flow
* Fixed runtime error thrown in Validation Flow when screen was tapped while a cloud backup request was running
* Fixed a rare race condition

## 8.2.0

**Released**: February 13, 2026

### New Features

#### Barcode

* Stopped emitting vibration feedbacks when the scanner is stopped without user interaction

#### Id

* Enabled scanning of MRZ on the backside of several EU residence permits
* Added extraction of a cropped document image from Passports and VISAs that do not support VIZ extraction
* Added extraction of the date of birth from Romanian IDs

#### Smart Label Capture

* The Validation Flow, our ready‑to‑use workflow in Smart Label Capture for capturing and validating label data with minimal code, now features a completely redesigned user interface. The update improves ergonomics through a simplified API and highly requested customization options, making Smart Label Capture more intuitive and significantly reducing integration and customization effort across a wider range of use cases

#### Core

* Removed Howler.hs and JavaScript Cookie 3rd party dependencies

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Improved the Smart Scan Intention logic for detecting main codes + five-digit add on codes. This improves the rate of complete main + add-on code pairs.
* Fixed a bug where the torch control would be shown even if the torch was not supported
* Fixed an issue where SparkScan would select the wrong camera
* Fixed an issue where the SparkScanView was not being disposed correctly

#### Id

* Treated Puerto Rico driver licenses as AAMVA to enforce barcode capture with FullScanner
* Fixed a bug that would cause Canada Northwest Territories driver license scans to be incomplete

#### Core

* Fixed an issue where in some webview scenarios the wrong back camera was selected on the iPhone Pro

### Deprecations

#### Smart Label Capture

* Deprecated some LabelCaptureValidationFlowSetting APIs: requiredFieldErrorText, missingFieldsHintText, manualInputButtonText, as those don't make sense anymore with the redesign of Validation Flow in 8.2

## 8.1.5

**Released**: June 10, 2026

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

## 8.1.4

**Released**: April 21, 2026

### Bug Fixes

#### Barcode

* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.

#### Id

* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture.

## 8.1.3

**Released**: March 25, 2026

### Bug Fixes

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed syntax in JavaScript sdc-lib folder not correctly downleveled to respect minimum browser version.

## 8.1.2

**Released**: March 9, 2026

### Bug Fixes

#### Barcode

* Fixed an issue where SparkScan would select the wrong camera

#### Smart Label Capture

* Fixed a rare race condition

#### Core

* Fixed an issue where in some webview scenarios on iPhone Pro the wrong back camera was selected

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Fixed an issue where the SparkScanView was not being disposed correctly

#### Id

* Removed the Centaurus dependency from the ID Capture package which was accidentally added in 8.1.0 but never actually used

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Smart Scan Selection is now available in Barcode Capture. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Added SymbologySettings.ocrFallbackRegex, allowing you to filter or constrain results returned from OCR fallback.
* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.
* [SparkScan](/sdks/web/sparkscan/intro.md) now supports Smart Scan Selection. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Users might have to manually switch to a special, more precise scanning mode (Target Mode), which is inefficient. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* Added `ScanditIconType.Delete` and `ScanditIconType.Slash` which can be used in `BarcodeArStatusIconAnnotationAnchor`.

#### Id

* Added NationalityISO property that maps results from Nationality field to country ISO code
* Added RejectionDiagnosticJSON property to CapturedId to report debug info during Timeout rejections
* Added rejectionTimeoutSeconds to IdCaptureSettings allowing customers to use timeout other than default (6s). Minimum timeout is 1s.
* Added support for new California DL, new South Carolina DL, Arizona Medical Marijuana Card, Kuwait Civil card, and new Texas DL

#### Core

* Added Electronic Product Code (EPC) parser and GS1_DIGITAL_LINK parsers

### Performance Improvements

#### Barcode

* Improved MicroQR detector tolerance to quiet zone violations
* Improved suppression of incorrect Codabar recognitions when using the [“strict" symbology extension](../symbology-properties#symbology-extension-descriptions)

#### Id

* Improved success rate when scanning using the ImageFrameSource or the SingleImageUploader as frame source

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
* Fixed an issue that caused continuous scanning to stop working when rotating the device
* Fixed an issue where FrameData was not usable for tracking modes

#### Core

* Fixed a small memory leak that affected fresh install runs only
* Overcome orientation change limitation in iOS PWAs when display mode is fullscreen or standalone

## 8.0.1

**Released**: January 14, 2026

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

#### Core

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

* The `Camera` API has been completely redesigned for this release. See the [API reference](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#camera) for complete details.
* The minimum Chrome version supported is now 85+.
* The `DataCaptureContext.create`, `createWithOptions` and `configure` methods have been removed in favor of `DataCaptureContext.forLicenseKey`.

#### Barcode

* Smart Scan Selection is now available in SparkScan for the Web SDK.
* Adapted `SparkScanView` to now be usable as a web component. Also added a `SparkScanReactSample` to demonstrate this usage.
* The following have been added to MatrixScan AR:
  * `BarcodeArView.getHighlightForBarcode`
  * `BarcodeAirView.getAnnotationForBarcode`

#### Smart Label Capture

* We’re introducing an enhancement that makes Smart Label Capture more robust and scalable by complementing its on-device model with a larger, more capable model. When the on-device model can’t capture certain labels, the SDK automatically escalates to this enhancement to handle complex or unforeseen cases with high accuracy and reliability. This capability is currently available in `beta`. If you’re interested in trying it, please contact Scandit Support. For configuration details, see `labelDefinition.adaptiveRecognitionEngine`.

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
* `fullName` now an optional field on all `IdCapture` result types and `capturedMrz` now an optional field on `MrzResult`.

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


## 7.6.7

Find earlier versions in the [release notes section of version 7](/7.6.14/sdks/web/release-notes)