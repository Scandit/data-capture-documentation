---
toc_max_heading_level: 3
displayed_sidebar: capacitorSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: capacitor
keywords:
  - capacitor
---

## 8.5.0-beta.1

**Released**: June 18, 2026

### New Features

#### Barcode

* Added an option to configure the duration of BarcodeSequence's idle timeout.
* Updated `SymbologyDescription.forIdentifier` to return `null` for unrecognized identifiers (e.g. `"EAN-8"` instead of `"ean8"`); previously such input was silently mapped to `Codabar`.
* Added `selectionMode` property to Barcode Capture and SparkScan settings.

#### Id

* Added Irish Garda Age Card as `RegionSpecificSubtype.IrelandAgeCard`.
* Added double-sided support for the Oman residence card.
* Added single-sided support for extraction of issue date and birth date from the 2025 NYC Municipal ID.

#### Smart Label Capture

* Extended VIN label capture to also scan Code 128 barcodes (in addition to QR, Code 39, and Data Matrix) via `createVinLabelDefinition()`.
* Extended LabelCapture to accept label definitions where both "barcode" and "text" field types use the "semantics" feature simultaneously; previously this was restricted to only one field type at a time.

### Performance Improvements

#### Barcode

* Enhanced detection of low-resolution QR codes is now enabled by default, improving scan rates for challenging QR codes with degraded print quality or unfavorable capture conditions.
* Improved scanning of micro-QR codes affected by quiet zone violations and perspective distortion.

#### Smart Label Capture

* Improved Receipt Scanning efficiency by optimizing receipt image processing before extraction.

### Behavioral Changes

#### Barcode

* Reduced Code 128 minimum symbol count from 6 to 4; short codes (4 & 5 symbols) use stricter matching rules than longer codes. To explicitly exclude short codes, disable symbol counts 4 & 5 via `sc_symbology_settings_set_active_symbol_counts()` for Code 128. Note that if you previously enabled short code scanning, more strict settings are now in effect to reduce the chance of false positives, which are more likely for very short codes.
* Tightened Code 39 false positive filter thresholds by default; to restore the previous behavior, enable the `relaxed` extension on Code 39 via `sc_symbology_settings_set_extension_enabled()`. This is only advised when external validation measures are available, e.g. scanning against a known list of valid codes or when codes contain structured data.

### Bug Fixes

#### Barcode

* Fixed BarcodeAR not displaying an overlay for every scanned barcode when duplicate barcode values are present.
* Fixed a memory leak in item-based scanning.
* Fixed an issue in BarcodeCount where the strap mode setting would not be saved in all cases.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.

#### Id

* Fixed an issue where cropped document images were rotated when Frame Image was also enabled.
* Corrected the orientation of cropped Visa document images that were being rotated incorrectly when scanned using a single-frame image source.
* Fixed parser handling of non-standard Surrey BC AAMVA barcodes that were incorrectly returning "Invalid Format".

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.
* Fixed a bug where setting `valueRegexes` or `anchorRegexes` to null in frameworks was incorrectly treated the same as setting them to an empty list; they now correctly fall back to the definition type's defaults.

#### Core

* Fixed SPM resolution failure in Capacitor 8 / Xcode 26 projects (CapApp-SPM) caused by an invalid Package.swift header and an outdated capacitor-swift-pm version pin.
* Fixed a rare crash when starting camera capture while under memory pressure.
* Fixed a rare crash when opening the camera.
* Fixed a crash when the `DataCaptureContext` singleton was initialized more than once.

### Deprecations

#### Barcode

* Added `selectionMode` (off/on/auto) to `BarcodeCaptureSettings` and `SparkScanSettings` in the Flutter binding, and deprecated the SparkScan target-mode APIs and `ScanIntention.smartSelection` in favour of `selectionMode`.

## 8.4.0

**Released**: May 18, 2026

### New Features

#### Barcode

* Added `dotRadius` property to `BarcodeBatchBasicOverlay` to allow customizing the size of dots when using the Dot overlay style.
* Added custom view support for barcode pick highlighting in JavaScript frameworks.
* Added support for PDF417 in the Barcode Generator.

#### Id

* Added support for reading the vehicle table on the back of New Zealand driving licences, with the latest expiry date returned; supported vehicle classes are 1–6, including L=learner and R=restricted variants.
* Added support for new versions of USA, California – Driver's License; USA, North Carolina – Driver's License; USA, Texas – Driver's License; and USA, Oklahoma – Driver's License.

#### Core

* Redesigned `ZoomSwitchControl` to support multiple configurable zoom levels; the control now displays as a compact button that expands to show all available zoom levels, automatically filtered to those supported by the device hardware.
* Added a new `PinchToZoom` gesture.

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

* Fixed an issue in `BarcodeCount` where the floating shutter button was not visible after setting `shouldShowFloatingShutterButton` to `true`.
* Fixed an issue preventing `BarcodeFind` from finding binary barcodes.
* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session.
* Fixed an issue where `BarcodeCountView` would display incorrectly after rotating the device when a sibling view was present in the same parent view.
* Fixed an unnecessary second scan callback that occurs after freezing barcode recognition.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed an issue where the Smart Scan Selection aimer would become too small when scan-area margins restricted the visible scan area; the aimer is now sized relative to the view, keeping a consistent on-screen size regardless of margins.
* Fixed an issue in BarcodeCount where the strap mode setting would not be saved in all cases.

#### Id

* Fixed an issue where the US Permanent Residence Card was not processed through the VizMrz flow.
* Fixed an issue where AAMVA verification was being performed even when no AAMVA document types were enabled in the accepted documents.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture
* Fixed an issue where the validation flow viewfinder was not displayed.
* Fixed a race condition in the validation flow.
* Fixed a bug where the label capture validation flow overlay sometimes did not reflect label capture settings when reused.
* Fixed a bug that caused error messages in `DataCaptureView` to be rendered partially out-of-view.
* Fixed a rare race condition in Label Capture.
* Added `.asDate()` support to `ExpiryDate` and `PackingDate` label fields when the text is provided as manual input or as an Adaptive-Recognition-Engine response.
* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same LabelCapture mode instance.

#### Core

* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.
* Fixed a rare crash when opening the camera.
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (e.g. industrial barcode scanners like the Newland NLS-MT93).
* Fixed custom sound not working in Barcode Find on Android.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.
* Fixed a rare crash when starting camera capture while under memory pressure.

## 8.3.1

**Released**: April 14, 2026

### Bug Fixes

#### Smart Label Capture

* Fixed the validation flow to accept dates in more formats when manually entered
* Fixed a race condition in the validation flow

## 8.3.0

**Released**: March 26, 2026

### New Features

#### Barcode

* Added support for composite codes in SparkScan

#### Id

* Added support for OCR scanning of the 2026 version of Victoria mobile driver licenses
* Added IdCaptureSettings.anonymizeDefaultFields setting that controls whether the SDK applies default anonymization rules for specific document types and regions

#### Smart Label Capture

* Fixed a rare race condition

#### Core

* Added Camera-related APIs for macro mode, torch, accessibility hints, as well as ImageBuffer and Timestamp for FrameData.
* Added shouldShowZoomNotification and setProperty to DataCaptureView
* Added new SparkScan APIs related to feedback, scanning mode change, and periscope mode.
* Added BarcodeFilterSettings public constructor and exposed excludedSymbolCounts property for JavaScript frameworks
* Added BarcodeCount-related APIs for BarcodeCountNotInListActionSettings, BarcodeCountToolbarSettings, BarcodeCountMappingFlowSettings, status mode and accessibility properties on BarcodeCountView, BarcodeCountStatusProvider with status items and callbacks, cluster support, capture list completion listener, and session update listener
* Added moduleCountX and moduleCountY to Barcode API

### Performance Improvements

#### Barcode

* Improved EAN8 false positive filtering in strict mode
* Improved speed of MatrixScan Count scanning phase for mid- and high-end devices

### Bug Fixes

#### Barcode

* Fixed an issue in BarcodeCount where the floating shutter button was not visible after setting shouldShowFloatingShutterButton to true.
* Fixed a bug that was causing BarcodeFind to render barcodes filtered out by the Transformer as if they were valid targets.
* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session.

#### Id

* Fixed BarcodeDictionary anonymization setting for iOS and Web
* Fixed support for UAE Esaad card
* Sanitized name fields on ACT driver license to split FullName and populate first and last name properties
* Added support for scanning MRZ from the back of Argentinian DN when using `FullDocumentScanner`
* Fixed misplaced MRZ anonymization on FullFrame images.

#### Smart Label Capture

* Fixed an issue in the `LabelCaptureValidationFlowOverlay` when using it with Jetpack Compose that caused focus loss when opening the keyboard
* Added `LabelCaptureValidationFlowOverlay.ShouldHandleKeyboardInsetsInternally` for cases when customers don't want to follow official Android edge-to-edge and inset guidelines

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.

## 8.2.1

**Released**: March 5, 2026

### Bug Fixes

#### Id

* Sanitized name fields on ACT DL. Splits FullName to populate first and last name properties

#### Smart Label Capture

* Fixed LabelCaptureValidationFlowOverlay possible issue with Jetpack Compose that caused focus loss when opening the keyboard
* Added LabelCaptureValidationFlowOverlay::ShouldHandleKeyboardInsetsInternally in case customers don't want to follow official Android guidelines for edge-to-edge and insets
* Fixed a rare race condition

## 8.2.0

**Released**: February 13, 2026

### New Features

#### Barcode

* Added new getFeedbackForScannedItem method to SparkScanFeedbackDelegate
* Added BarcodeArResponsiveAnnotation API
* Added BarcodeAr API to Capacitor
* Added some missing BarcodePick APIs to React-Native, Capacitor and Cordova

#### Smart Label Capture

* The Validation Flow, our ready‑to‑use workflow in Smart Label Capture for capturing and validating label data with minimal code, now features a completely redesigned user interface. The update improves ergonomics through a simplified API and highly requested customization options, making Smart Label Capture more intuitive and significantly reducing integration and customization effort across a wider range of use cases
* Smart Label Capture now supports Receipt Scanning Capture. The feature is available in beta (contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out).
* Added `getFrameData` to `didUpdateSession` of the LabelCaptureListener

#### Core

* Added Electronic Product Code (EPC) data format
* Added support for Capacitor 8

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes
* Barcode Generator: Improved DataMatrix encoding efficiency, which depending on input data may result in smaller generated codes

### Bug Fixes

#### Barcode

* Improved the Smart Scan Intention logic for detecting main codes + five-digit add on codes. This improves the rate of complete main + add-on code pairs.
* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed BarcodeCount Scan Preview issues including: fixed an issue where preview barcodes were used to populate the scanning list, the correct feedback is played when a barcode not in list is scanned, fixed an issue where scanning was not possible after the app was put in background, and corrected highlight orientation in landscape
* Added cameraStateOnStop property to BarcodeFindView to optimize camera transitions when switching between modes
* Fixed an issue where the successful hint in BarcodeFind is not displayed
* Fixed the missing found item icon in the MatrixScan Find carousel

#### Id

* Fixed an issue affecting MRZ scanning performance when using the user facing camera in portrait mode on Android
* Fixed a memory issue leading to a persistent black screen during ID Capture startup
* Treated Puerto Rico driver licenses as AAMVA to enforce barcode capture with FullScanner
* Fixed a bug that would cause Canada Northwest Territories driver license scans to be incomplete

#### Core

* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed an issue where some LabelCapture fields were being returned incorrectly on TS frameworks
* Fixed a crash in the DataCaptureView overlay management that could occur during rapid view updates.

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
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (e.g. industrial barcode scanners like the Newland NLS-MT93).
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

#### Smart Label Capture

* Fixed a rare race condition

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Id

* Fixed a memory issue leading to a persistent black screen during ID Capture startup

#### Core

* Fixed a crash in the DataCaptureView overlay management that could occur during rapid view updates
* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Smart Scan Selection is now available in Barcode Capture. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a seamless and more intuitive scanning experience.
* [SparkScan](/sdks/capacitor/sparkscan/intro.md) is not limited to only barcodes anymore, but can also scan items - in other words any combinations of barcodes and text present on a target to be scanned. The feature is available in beta at the moment, please contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out.
* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.

#### Id

* Added NationalityISO property that maps results from Nationality field to country ISO code
* Added RejectionDiagnosticJSON property to CapturedId to report debug info during Timeout rejections
* Added support for new California DL, new South Carolina DL, Arizona Medical Marijuana Card, Kuwait Civil card, and new Texas DL
* Our SDK can now scan the following documents both in single-side and double-side mode:
  - All Mexican DLs
  - Mexican Voter Cards

#### Core

* Added webViewContentOnTop to DataCaptureView so hybrid apps can place HTML overlays above the camera preview without sacrificing native gestures. Default behaviour stays unchanged; when you enable the property, the bridge now mirrors Android and iOS touch routing—JS UI elements receive taps first, and any unhandled touch paths through to the native DataCaptureView. Improved resilience: both platforms fall back automatically if the WebView can't evaluate the hit-test logic, preventing stalled gestures even under heavy load.

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
* Added the `cameraStateOnStop` property to BarcodeFindView to optimize camera transitions when switching between modes
* Fixed an issue where the successful notification in BarcodeFind was not displayed

#### Id

* Fixed an issue where front expiry date anonymization rectangle is erroneously drawn on front and back
* Fixed a bug that prevented VizResult anonymization of the following fields: additionalAddressInformation, bloodType, employer, fathersName, issuingAuthority, maritalStatus, mothersName, placeOfBirth, profession, race, residentialStatus
* Fixed a bug concerning return complete instead of cropped images on the back of EU driving licenses

#### Smart Label Capture

* Fixed an issue where LabelCapture fields would return default data in some frameworks

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
  * Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users seamlessly through sophisticated tasks to ensure the highest level of productivity.

#### Core

* The Capacitor Kotlin plugin version used is now `1.9.25`, enabling support for projects using Capacitor 7.

#### Barcode

* Updated the Gradle version for all sample applications to 8.14.3.
* `BarcodeBatchBasicOverlay` and `BarcodeBatchBasicOverlayListener` now allow for nullable brushes.

#### Smart Label Capture

* [Smart Label Capture](/sdks/capacitor/label-capture/intro.md) is now available for Capacitor. It enables the capture of any label, regardless of its layout or format, and extracts the relevant information automatically. This is achieved through a combination of AI-based text recognition and barcode scanning, allowing users to capture all necessary data in a single scan. Smart Label Capture is ideal for applications such as inventory management, asset tracking, and logistics, where labels can vary widely in design and content.
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

#### ID

* The configuration for the following documents has been changed as detailed below:
  * Australian mobile driver licenses (mDL) are now treated as normal documents, with no separate mode.
  * US Green Cards are now treated as residence permits.
* Removed the deprecated API `DateResult::toDate`. Use `DateResult::toLocalDate` or `DateResult::toUtcDate` instead.
* `fullName` now an optional field on all `IdCapture` result types and `capturedMrz` now an optional field on `MrzResult`.

### Bug Fixes

#### ID

* Fixed a bug that could get the scanner stuck when scanning a US passport card.

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.


## 7.6.7

Find earlier versions in the [release notes section of version 7](/7.6.14/sdks/capacitor/release-notes)