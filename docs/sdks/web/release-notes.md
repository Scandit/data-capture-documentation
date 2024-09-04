---
toc_max_heading_level: 3
displayed_sidebar: webSidebar
hide_title: true
title: Release Notes
pagination_prev: null
---

## 6.27.0

**Released**: September 19, 2024

### New Features

#### Barcode

* BarcodeFind is an API that implements [MatrixScan Find](/sdks/web/matrixscan-find/intro.md). MatrixScan Find is a pre-built UI that uses augmented reality overlays to highlight items that match predefined criteria. It allows you to add a search and find experience with augmented reality to an existing native app, with just a few lines of code

#### ID

* ID Capture supports scanning the Visual Inspection Zone (VIZ) of New York City IDs.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### ID

* Added properties [`VizResult.firstName`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FirstName), [`VizResult.lastName`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.LastName), [`VizResult.secondaryLastName`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.SecondaryLastName), [`VizResult.fullName`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FullName).
* Added [`DrivingLicenseDetails.restrictions`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Restrictions) and [`DrivingLicenseDetails.endorsements`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Endorsements) which correspond to the restrictions to driving privileges and to the additional privileges granted to the driver license owner respectively.
* Added [`IdCapture.parse()`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#method-scandit.datacapture.id.IdCapture.Parse) that parses string representations of MRZ and PDF417 barcode raw data, returning [`CapturedId`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId).

#### Core

* Added [`RectangularViewfinder.disabledColor`](https://docs.scandit.com/data-capture-sdk/web/core/api/rectangular-viewfinder.html#property-scandit.datacapture.core.ui.RectangularViewfinder.DisabledColor) to color the logo and viewfinder when the mode is disabled.

### Performance Improvements

#### Barcode

* Improved ArUco scanning when color inverted codes are enabled.
* Improved tracking robustness on Barcode Count.
* Significantly lowered the rate of false positives (i.e., presumed unscanned barcodes) when using Barcode Count.
* Improved recognition rate for Composite Codes, with a particular focus on codes with small 2d components (e.g. PDF417).
* Improved recognition rate of linear codes which are partially affected by damage or covered in plastic wrap, with a particular focus on Codabar barcodes.
* Improved localization of postal codes, up to 25% faster.

### Bug Fixes

#### ID

* Fixed an issue where ID Capture could get occasionally stuck when presented with the back side of a document while the front is expected.
* Fixed an issue introduced in 6.25, where capturing MRZ was not possible in Safari on MacOS and on iOS in landscape mode.
* Fixed an error 255 that would prevent capturing MRZ for some license keys, for which this feature was enabled.

### Deprecations

* Deprecated [`SparkScanSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcodes), prefer [`SparkScanSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcodes), prefer [`BarcodeCaptureSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcode).
* Deprecated [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/data-capture-sdk/web/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/web/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).

## 6.25.3

**Released**: September 2, 2024

### Bug Fixes

- Concatenated ArUco codes are now comma-separated.

## 6.25.2

**Released**: August 2, 2024

No updates for this framework in this release.

## 6.25.1

**Released**: August 1, 2024

### Bug Fixes

#### Barcode

- Fixed an issue in MatrixScan Count that was causing a reset after a rotation.

#### ID

- Fixed an error 255 that would prevent capturing MRZ for some licenses where this feature is supposed to be enabled.
- Fixed an issue where ID Capture could get stuck when presented with the backside of a document while the front is expected.
- Fixed an issue introduced in 6.25.0, where capturing MRZ was not possible in Safari on MacOS and on iOS in the landscape mode.

## 6.25.0

**Released:** July 5, 2024

### New Features

#### Barcode

* Added [Parser](https://docs.scandit.com/data-capture-sdk/web/parser/api/parser.html#class-scandit.datacapture.parser.Parser) for parsing many [data formats](https://docs.scandit.com/data-capture-sdk/web/parser/formats.html).

#### ID

* Added the following properties to [`SDCVizResult`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#viz-result):
  - `SDCVizResult.mothersName` to represent the mother’s name of the document owner.
  - `SDCVizResult.fathersName` to represent the father’s name of the document owner.
* Improved the extraction of the document number from UK driver’s licenses.

### Behavioral Changes

#### Core

* The license key encryption algorithm for Electron has changed to support larger license keys. See Electron section in the [Installation page](./add-sdk.md#electron) for more information.

### Performance Improvements

#### Barcode

* Improved recognition rate for Composite A and Composite B barcodes, thanks to an increased robustness for small and low resolution MicroPDF417.
* Improved recognition rate of long, thin linear 1d codes, such as those found on electronic shelf labels (ESLs).
* Improved recognition rate of linear codes which are partially affected by damage or glare, with a particular focus on codabar barcodes.

### Bug Fixes

#### ID

* Fixed missing property [`AAMVABarcodeResult.barcodeDataElements`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/aamva-barcode-result.html#property-scandit.datacapture.id.AamvaBarcodeResult.BarcodeDataElements) on [`CapturedId`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId).

## 6.24.0

**Released**: May 8, 2024

### New Features

#### Barcode

- **Smart Scan Intention**: Introduced a new algorithm named "smart" that intelligently identifies and scans the intended barcode, reducing errors. It can be manually set in Barcode Capture (`BarcodeCaptureSettings.scanIntention`).

- **Advanced Barcode Tracking for WebSDK**: Added advanced Barcode Tracking capabilities with `BarcodeTrackingAdvancedOverlay`, an overlay for `DataCaptureView` that allows anchoring a single user-provided View to each tracked barcode. Users can configure the view displayed for a barcode and its relative position by implementing `BarcodeTrackingAdvancedOverlayListener` or by calling `BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()`, `BarcodeTrackingAdvancedOverlay.setAnchorForTrackedBarcode()`, or `BarcodeTrackingAdvancedOverlay.setOffsetForTrackedBarcode()`. For more information, refer to the "Add AR Overlays in MatrixScan" documentation.

#### ID

- **Rejection Reason**: Added `RejectedId.rejectionReason` to provide the reason why a document was rejected.

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IdCaptureListener.didTimedOut()` to be invoked whenever a document is localized for a period but not captured.

- **Fixed Surnames in US Driver’s Licenses**: Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

- **Newly Supported Documents for MRZ Scanning**:
  - Mexico: Matrícula Consular

- **New Feature for French Passports**: Added `CapturedId.secondaryLastName` containing the common name (“nom d’usage”) on French passports.

### Performance Improvements

#### ID

- **Improved Capture Performance**: Enhanced capture performance for US driver’s license PDF417 barcodes with printing defects, particularly from Ohio, Louisiana, and Florida.

### Bug Fixes

#### Barcode

- Fixed the “Tap to Focus” animation when the view size changes.

#### ID

- Fixed a crash when scanning a passport MRZ followed by a non-passport VIZ.
- Fixed an issue causing the century of birth dates, issue dates, and expiry dates to be returned incorrectly when scanning the VIZ of European IDs, Swiss driver’s licenses, and UAE IDs.
- Fixed instances where information was incorrectly extracted from British Columbia PDF417.

## 6.23.2

**Released**: April 30, 2024

* Fixed crash (SIGILL) on Exynos 9810-based Galaxy S9 and Galaxy S9+ devices that advertise support for FP16 arithmetics. A previous fix in 6.21.0 only partially resolved the issue.
* Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.23.1

**Released**: April 24, 2024

* Added support for Mexican Matrícula Consular MRZ codes.
* Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

## 6.23.0

**Released**: March 22, 2024

### New Features

#### Core

- Added the possibility to consume the SDK inside an Electron app. The encrypted license location must be passed through `ConfigureOptions.licenseDataPath` option.

### Behavioral Changes

#### Core

- Removed the hard requirement of HTTPS protocol to support more execution contexts.

### Bug Fixes

#### ID

- Fixed issues with scanning AAMVA documents (barcode part) that contain characters from non-English alphabets.
- Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.
- Fixed a crash when scanning a passport MRZ then a non-passport VIZ.

#### Core

- Fixed the radius of the radius location selection for cases where the `DataCaptureView`’s aspect ratio is considerably different from the aspect ratio of the camera frames.

## 6.22.2

**Released**: April 30, 2024

* Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.22.1

**Released**: March 13, 2024

* Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.
* Fixed UI glitch that was happening when disabling ID Capture mode.

## 6.22.0

**Released**: February 16, 2024

### New Features

#### Barcode

- Added QR symbology extension called `strict` to suppress rare QR reader false positives. `strict` reduces the scan robustness of damaged codes.

#### ID

- Added `AamvaVizBarcodeComparisonResult.frontMismatchImage` that visualizes the document data printed on the front side that differs from what is encoded in the barcode. Please contact [Scandit Support](mailto:support@scandit.com) if you want to use this feature.
- Improved the accuracy of `AamvaVizBarcodeComparisonVerifier`.
- Improved the accuracy of `VizMrzComparisonVerifier`.
- Added `IdCaptureOverlay.showTextHints` for showing/hiding text hints.
- Added `AamvaVizBarcodeComparisonResult.frontMismatchImage` that highlights suspicious fields. This feature is currently in beta and may change significantly in future releases.

#### Core

- Added `DataCaptureView.allowPictureInPicture()` to configure video element picture-in-picture capability.

### Performance Improvements

#### Barcode

- Further improved QR code scan performance of codes occluded by glare.
- Improved scan performance for 1D barcodes with missing or damaged quiet zones.

### Bug Fixes

#### Barcode

- Fixed a bug in handling of active symbol counts for Codabar.

#### ID

- Fixed an issue on barcode localization overlay not being drawn on the screen.
- Fixed an issue where US Border Crossing Cards were not recognized.

## 6.21.3

**Released**: March 5, 2024

* Fixed UI glitch that was happening when disabling ID Capture mode.

## 6.21.2

**Released**: February 19, 2024

* Fixed an issue where US Border Crossing Cards were not recognized.
* Fixed Id Verification Zone Comparison reported erroneously as not included in a license for some licenses that, in fact, include it.

## 6.21.0

**Released**: December 8, 2024

### New Features

#### Barcode

- Added support for QR model 1 codes (legacy format).
- Added support for UPU 4-State codes with fluorescent orange ink (`fluorescent_orange_ink` extension, see also Symbology Properties).
- Added the possibility to freeze the barcode locations on the overlay after scan through `BarcodeCaptureOverlay.setShouldRemoveLocationsAfterScan()`.

#### ID

- Added `AAMVABarcodeResult.firstNameWithoutMiddleName`.

#### Core

- Added `Localization` class to manage localization strings from a central place.
- Improved file structure in distributed package to allow bundlers to tree-shake unused features of the SDK, resulting in lighter resources to download for the browser.
- Fixed an issue where code is executed at import time, causing issues in SSR context (Server Side Rendering).

### Behavioral Changes

#### Core

- Removed `ResizeObserver` polyfill as a dependency due to the browsers we support.

### Performance Improvements

#### Barcode

- Improved the responsiveness of MatrixScan Count on low-end devices.
- Improved QR code scan performance of codes occluded by glare.

#### Core

- Improved MatrixScan frames per second by 80% for SIMD-enabled browsers.

### Bug Fixes

#### Barcode

- Fixed a rare crash during the destruction of tracking-based capture modes.

#### ID

- Fixed issues with scanning `IdDocumentType.AAMVABarcode` documents that had some special characters in their content.
- Fixed an issue on barcode localization overlay not being drawn on the screen.

#### Core

- Fixed a crash (SIGILL) on Samsung Galaxy S9 (Exynos 9810 based) with Android version 8.
- Resolved an issue where a loading loop occasionally occurred on iOS 15.x devices when IndexedDB became unresponsive.

### Deprecations

#### ID

- Deprecated `IdCaptureOverlay.setBackSideTextHint()`, `IdCaptureOverlay.setFrontSideTextHint()`, `IdCaptureOverlay.setMoveCloserTextHint()`, and `IdCaptureOverlay.setMoveFurtherAwayTextHint()` in favor of the `Localization` class.

#### Core

- Deprecated `DataCaptureView.cameraRecoveryText` in favor of the `Localization` class.

## 6.20.3

**Released**: January 18, 2024

* Fixed Id Verification Zone Comparison reported erroneously as not included in a license for some licenses that, in fact, include it.
* Fixed the UI occasionally incorrectly presenting the front & back flow while capturing `IdDocumentType.AAMVABarcode`.

## 6.20.2

**Released**: December 14, 2023

* Fixed a crash (SIGILL) on Samsung Galaxy S9 (Exynos 9810 based) with Android version 8.

## 6.20.1

**Released**: November 28, 2023

* Fixed an issue that caused the SDK to get stuck during loading on certain devices.

## 6.20.0

**Released**: November 7, 2023

### New Features

#### Barcode

- Updated the camera behavior to overcome the scanning challenges found on the iPhone 13 Pro (Max) and iPhone 14 Pro (Max) when using the built-in camera for barcode scanning. Our testing showed that barcodes that are less than 2 cm or ~1 inch in size (and usually have such small features) were impacted.

#### ID

- New textual hints and animations guide the user if the camera is too close or too far to capture a document.
- Redesigned ID Capture viewfinders to enable smoother drawing performance.
- For ID cards issued by the United Arab Emirates, data parsed from the Machine Readable Zone (MRZ) is now returned automatically when `IdDocumentType.IdCardVIZ` and `SupportedSides.FrontAndBack` are selected.
- Added textual hints and animations appearing when the document is detected to be too close or too far from the camera.
- Improved recognition of cropped ID document images when using the `SingleImageUploader` frame source.

#### Core

- Added property `SingleImageUploaderSettings.onlyCameraCapture` to force the image to be captured by the camera instead of allowing the selection of an image from the device’s photo library.
- Added `ImageFrameSource`. This new type of `FrameSource` allows processing a single image, file, or [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
- Added `Camera.settings` to `Camera`.

### Bug Fixes

#### ID

- Fixed an issue where hints were not being shown when the `DataCaptureView` is attached after the `id.IdCapture` instance is created.

#### Core

- Restored some logs that were not being properly sent to the console anymore.

### API Changes

#### ID

- Added `IdCaptureOverlay.setMoveCloserTextHint()` and `IdCaptureOverlay.setMoveFurtherAwayTextHint()` that allow setting custom text for textual hints displayed when scanning a document.
