---
toc_max_heading_level: 3
displayed_sidebar: iosSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: ios
keywords:
  - ios
---

## 6.28.3

**Released**: December 23, 2024

### Bug Fixes

#### Core

* Resolved a rare issue where a race condition during the deconstruction of MatrixScan Data Capture views could lead to invalid memory access.

## 6.28.2

**Released**: December 12, 2024

No updates for this framework in this release.

## 6.28.1

**Released**: October 29, 2024

### New Features

#### ID

* ID Capture now supports scanning the following additional documents:
  * Armenia - Passport
  * Bahamas - Residence Permit, Work Permit
  * Colombia - Temporary Protection Permit
  * Comoros - Passport
  * Dominican Republic - Non-Voter ID
  * Jamaica - Voter ID
  * Kazakhstan - Passport
  * Kyrgyzstan - Passport
  * Lebanon - Driver's License
  * Peru - Minor ID
  * Tajikistan - Passport
  * Turkmenistan - Passport
  * Uzbekistan - Passport, ID Card

### Bug Fixes

#### Barcode

* Fixed a sporadic issue where camera errors would result in a crash on some devices.

## 6.28.0

**Released**: October 8, 2024

### New Features

#### Barcode

* Our [Barcode Generator](/sdks/ios/barcode-generator.md) now allows the generation of Aztec codes. See [`SDCAztecBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.AztecBarcodeGeneratorBuilder).
* On Barcode Capture and SparkScan, we optimized the frame processing time in 4k-UHD resolution with dynamic resolution selection, resulting in up to 35% reduction on high-end devices and consistent performance improvements across all supported devices.
platforms.
* MatrixScan Count users can now further classify the "not in list" barcodes when scanning against a list. Tapping on them will show a popup where the barcodes can be accepted or rejected. Check [`barcode.count.ui.BarcodeCountView.BarcodeNotInListActionSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.BarcodeNotInListActionSettings) to enable and customize the functionality. The classified barcodes will be added to [`barcode.count.BarcodeCountCaptureListSession.AcceptedBarcodes`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-count-capture-list-session.html#property-scandit.datacapture.barcode.count.BarcodeCountCaptureListSession.AcceptedBarcodes) or [`barcode.count.BarcodeCountCaptureListSession.RejectedBarcodes`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-count-capture-list-session.html#property-scandit.datacapture.barcode.count.BarcodeCountCaptureListSession.RejectedBarcodes).
* MatrixScan Find now uses a 4:3 aspect ratio, providing a significantly larger field of view for enhanced scanning accuracy and coverage.
* Added [`BarcodeFindView.ShouldShowZoomControl`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#property-scandit.datacapture.barcode.find.ui.BarcodeFindView.ShouldShowZoomControl) which enables the display of a button that allows switching to ultra wide lenses on supported devices for scanning at close range in narrow environments.

#### ID

* ID Capture now supports scanning:
  * Visual Inspection Zone (VIZ) of New York City IDs.
  * Florida Medical Marijuana IDs.
* Added [`scandit.datacapture.id.CapturedId.UsRealIdStatus`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.UsRealIdStatus) to indicate whether a document is REAL ID compliant.

#### Label

* Added support for text fields that are identified only based on their data pattern. These do not need textual identifiers to be identified, and therefore no data type patterns (i.e., patterns for the textual identifiers) need to be specified for them.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.

## 6.27.2

**Released**: September 23, 2024

No updates for this framework in this release.

## 6.27.1

**Released** September 6, 2024

No updates for this framework in this version.

## 6.27.0

**Released**: September 5, 2024

### API Changes

#### Barcode

- The [`BarcodeTrackingAdvancedOverlay.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode) and [`BarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) methods no longer support rendering any kind of images. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### Barcode

* Added torch control to BarcodeCount with [`BarcodeCountView.shouldShowTorchControl`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowTorchControl) and [`BarcodeCountView.torchControlPosition`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.TorchControlPosition) to control visibility and position in [`BarcodeCountView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView).

#### ID

* Added [`AamvaBarcodeVerificationResult.status`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.Status) which includes classification confidence as [`AamvaBarcodeVerificationStatus.FORGED`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#value-scandit.datacapture.id.AamvaBarcodeVerificationStatus.Forged) or [`AamvaBarcodeVerificationStatus.LIKELY_FORGED`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#value-scandit.datacapture.id.AamvaBarcodeVerificationStatus.LikelyForged).
* Added properties [`VizResult.firstName`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FirstName), [`VizResult.lastName`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.LastName), [`VizResult.secondaryLastName`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.SecondaryLastName), [`VizResult.fullName`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FullName).
* Added [`DrivingLicenseDetails.restrictions`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Restrictions) and [`DrivingLicenseDetails.endorsements`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Endorsements) which correspond to the restrictions to driving privileges and to the additional privileges granted to the driver license owner respectively.

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/data-capture-sdk/ios/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/data-capture-sdk/ios/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

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

* [`AamvaVizBarcodeComparisonResult.frontMismatchImage`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.FrontMismatchImage) now only returns an image when [`AamvaVizBarcodeComparisonResult.checksPassed`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.ChecksPassed) is false.
* Fixed an error 255 that would prevent capturing MRZ for some license keys, for which this feature was enabled.

### Deprecations

* Deprecated [`SparkScanSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcodes), prefer [`SparkScanSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcodes), prefer [`BarcodeCaptureSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) in favor of [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving).
* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/data-capture-sdk/ios/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/data-capture-sdk/ios/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/ios/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/data-capture-sdk/ios/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).
* Deprecated [`AamvaBarcodeVerificationResult.allChecksPassed`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.AllChecksPassed). [`AamvaBarcodeVerificationResult.status`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.Status) should be used instead.

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

#### Core

## 6.25.0

**Released**: July 5, 2024

### New Features

#### Barcode

* Added torch control to BarcodePick with [`SDCBarcodePickViewSettings.showTorchButton`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ShowTorchButton) to enable showing a torch button when using [`SDCBarcodePickView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView). The torch button as well as the zoom button (shown with: [`SDCBarcodePickViewSettings.showZoomButton`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ShowZoomButton)) can be repositioned with [`SDCBarcodePickViewSettings.torchButtonPosition`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.TorchButtonPosition) and [`SDCBarcodePickViewSettings.zoomButtonPosition`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ZoomButtonPosition).
* Added ability to customize the minimum width and height of the highlights in the following styles:
  - [`SDCBarcodePickViewHighlightStyleRectangular`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular.html#class-scandit.datacapture.barcode.pick.ui.Rectangular)
  - [`SDCBarcodePickViewHighlightStyleRectangularWithIcons`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#class-scandit.datacapture.barcode.pick.ui.RectangularWithIcons)
  - [`SDCBarcodePickViewHighlightStyleCustomView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-highlight-style-custom-view.html#class-scandit.datacapture.barcode.pick.ui.CustomView)
* Added the following properties to apply a [`SDCBarcodePickStatusIconSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-status-icon-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickStatusIconSettings) object and customize the status icons appearance:
  - [`SDCBarcodePickViewHighlightStyleRectangularWithIcons.statusIconSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#property-scandit.datacapture.barcode.pick.ui.RectangularWithIcons.StatusIconSettings)
  - [`SDCBarcodePickViewHighlightStyleCustomView.statusIconSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-highlight-style-custom-view.html#property-scandit.datacapture.barcode.pick.ui.CustomView.StatusIconSettings)

#### ID

* ID Capture now supports extracting information from the back side of European driver’s licenses.
* Added the following properties to [`SDCVizResult`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/viz-result.html#viz-result):
  - `SDCVizResult.bloodType` to represent the blood type of the document owner.
  - `SDCVizResult.sponsor` to represent the sponsor of the document owner.
  - `SDCVizResult.mothersName` to represent the mother’s name of the document owner.
  - `SDCVizResult.fathersName` to represent the father’s name of the document owner.

* ID Capture now supports scanning the Visual Inspection Zone (VIZ) on the back of the European Health Insurance Card.
* Improved the extraction of the document number from UK driver’s licenses.

### Performance Improvements

#### Barcode

* Improved recognition rate for Composite A and Composite B barcodes, thanks to an increased robustness for small and low resolution MicroPDF417.
* Improved recognition rate of long, thin linear 1d codes, such as those found on electronic shelf labels (ESLs).
* Improved recognition rate of linear codes which are partially affected by damage or glare, with a particular focus on codabar barcodes.

#### ID

* Improved the accuracy of the AAMVA Barcode Verification.

## 6.24.0

**Released**: May 8, 2024

### New Features

#### Barcode

- **Smart Scan Intention**: Introduced a new algorithm that intelligently identifies and then scans the barcode that the user intends to capture, reducing errors. It is enabled in SparkScan by default (see `SDCSparkScanSettings.scanIntention`) and can be manually set in Barcode Capture (see `SDCBarcodeCaptureSettings.scanIntention`).
  
- **Improved Scanning Range**: The scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels was improved by 30-40% in both Full HD and 4K without compromising scanning speed. This enhancement enables the fastest and most ergonomic scanning experience for tiny barcodes and ESLs, particularly those on top or bottom shelves.

- **User Facing Camera in SparkScan**: It is now possible to switch to the user-facing camera for scanning. This is useful in specific use-cases where the rear camera is not accessible or barcodes are hard to reach otherwise. See `SDCSparkScanView.cameraSwitchButtonVisible`.

- **Dynamic Item List in MatrixScan Find**: Added support for dynamically modifying a list of items to be found by calling `SDCBarcodeFind.setItemList:` during a scanning session in `SDCBarcodeFind`.

- **New Symbology Supports**:
  - Added support for `SDCSymbologyFrenchPost`, recognizing postal codes (code postal) used by the French Post.
  - Added support for decoding misprinted `SDCSymbologyAustralianPost` codes.

- **New APIs in BarcodePick View Highlight Styles**: New APIs to show a different highlight while waiting for an async pick/unpick action to complete. New setters & getters for selected brushes and/or icons are available in:
  - `SDCBarcodePickViewHighlightStyleRectangular`
  - `SDCBarcodePickViewHighlightStyleDot`
  - `SDCBarcodePickViewHighlightStyleRectangularWithIcons`
  - `SDCBarcodePickViewHighlightStyleDotWithIcons`

  Additionally, a selected brush and icon can be provided asynchronously with the new `SDCBarcodePickHighlightStyleResponse` constructor.

- **Programmatic Item Selection**: Added `SDCBarcodePick.selectItemWithData:completionHandler:` to programmatically select an item.

#### ID

- **Reject Voided IDs**: Added `SDCIdCaptureSettings.rejectVoidedIds`. When enabled, documents voided by authorities are rejected (`SDCIdCaptureListener.idCapture:didRejectInSession:frameData:`). This feature supports cut corners, holes punched in the document, and “VOID” perforations, currently only for US Driver’s Licenses. The `ScanditIdVoidedDetection` library must be included when activating this setting.

- **Rejection Reason**: Added `SDCRejectedId.rejectionReason` which contains the reason why the document was rejected.

- **Per State Thresholds in ID Verification**: Added support for per state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified how `SDCIdCaptureListener.idCapture:didTimeoutInSession:frameData:` is emitted. The callback is invoked whenever a document is localized for a period but could not be captured.

- **Newly Supported Documents**:
  - **MRZ Scanning**: Mexico: Matrícula Consular
  - **Front of Card/VIZ Scanning**:
    - USA: District of Columbia, Idaho, North Dakota, West Virginia, Wisconsin (2023 versions)
    - Mexico: Consular Voter ID

- **Additional Features**:
  - Added `SDCAAMVABarcodeResult.rawData`.
  - Fixed truncated surnames in US driver’s licenses using magnetic stripe format.
  - Added `SDCCapturedId.secondaryLastName` containing the common name (“nom d’usage”) on French passports.

#### Parser

- **GS1 Digital Link**: The parser now supports uncompressed GS1 Digital Link. For complete documentation, refer to the official website.

### Behavioral Changes

#### Barcode

- **Battery Saving Mode in SparkScan**: Changed from `SDCBatterySavingModeOff` to `SDCBatterySavingModeAuto`. The option can be changed via `SDCSparkScanSettings.batterySaving`.

### Performance Improvements

#### ID

- **VIZ/Front of Card Scanning**: Significantly improved performance in low-light conditions.
- **US Driver’s License Barcodes**: Improved capture performance for PDF417 barcodes with printing defects, particularly from Ohio, Louisiana, and Florida.

### Bug Fixes

#### Barcode

- Fixed the “Tap to Focus” animation when the view size changes.

#### ID

- Fixed a crash when scanning a passport MRZ then a non-passport VIZ.
- Fixed an issue where the century of birth dates, issue dates, and expiry dates was returned incorrectly when scanning the VIZ of European IDs, Swiss driver’s licenses, and UAE IDs.
- Fixed incorrect information extraction from British Columbia PDF417.

## 6.23.4

**Released**: July 23, 2024

No updates for this framework in this release.

## 6.23.3

**Released**: May 10, 2024

### Bug Fixes

#### Core

- Fix an additional issue that prevented the SIGILL fix introduced on 6.23.2 to work on certain Samsung Galaxy S9 devices.

## 6.23.2

**Released**: April 30, 2024

- Fixed crash (SIGILL) on Exynos 9810-based Galaxy S9 and Galaxy S9+ devices.
- Removed unused code and updated the privacy manifest to conform to [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.23.1

**Released**: April 24, 2024

- Added support for Mexican Matrícula Consular MRZ codes.
- Improved ID scanning performance in low-light conditions.
- Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

## 6.23.0

### New Features

- **Privacy Manifests**: Updated privacy manifests with the description of data collected by the frameworks.

#### Barcode

##### SparkScan Improvements

- **Target Mode**: Improved performance with faster selection of barcodes, a more consistent workflow, and a better UI (new aimer and icon).
- **Preview Size Control**: Now independent from scanning mode or scanning precision parameters. Controlled by a dedicated control added to the preview. Use `SDCSparkScanView.previewSizeControlVisible` to define if preview size control should be displayed.
- **Accuracy Workflow**: Streamlined into a more consistent and performant workflow.
- **Preview Behavior**: Developers can set `SDCSparkScanPreviewBehavior` to specify the preview behavior type of the `SDCSparkScanView`. When `previewBehavior` is `SDCSparkScanPreviewBehaviorPersistent`, after the scan, the preview does not disappear but stays obscured and running for easier aiming.
- **Toast Messages**: Displayed on top of the preview rather than the scan button, with additional messages for better guidance.
- **Zoom Functionality**: Now independent from scanning mode and available in both default and target modes.
- **Feedback Emission System**: Improved to implicitly emit a success feedback on scan.
- **New APIs**:
  - `SDCSparkScanScanningModeTarget.previewBehavior`
  - `SDCSparkScanScanningModeDefault.previewBehavior`
  - `SDCSparkScanViewSettings.zoomFactorOut`
  - `SDCSparkScanViewSettings.zoomFactorIn`
  - `SDCSparkScanBarcodeFeedback`
  - `SDCSparkScanFeedbackDelegate`
  - `SDCSparkScanView.feedbackDelegate`
  - `SDCSparkScanViewSettings.inactiveStateTimeout`
  - `withSparkScan` SwiftUI view modifier

##### Barcode Pick

- **New Feature in 6.23**:
  - `SDCBarcodePickStatusIconStyle`
  - `SDCBarcodePickViewHighlightStyle`
  - `SDCBarcodePickListener`

##### New Symbology Supports

- **SDCSymbologyAustralianPost**: Added support with options to enforce decoding with specific tables and returning error-corrected customer information bars.

##### Swift-Friendly API Updates

- **Properties Exposed as Set(Symbology)**:
  - `BarcodeCaptureLicenseInfo.licensedSymbologies`
  - `BarcodeCaptureSettings.enabledSymbologies`
  - `BarcodeCountSettings.enabledSymbologies`
  - `BarcodeFilterSettings.excludedSymbologies`
  - `BarcodeFindSettings.enabledSymbologies`
  - `BarcodePickSettings.enabledSymbologies`
  - `BarcodeSelectionLicenseInfo.licensedSymbologies`
  - `BarcodeSelectionSettings.enabledSymbologies`
  - `BarcodeTrackingLicenseInfo.licensedSymbologies`
  - `BarcodeTrackingSettings.enabledSymbologies`
  - `CompositeTypeDescription.symbologies`
  - `SparkScanLicenseInfo.licensedSymbologies`
  - `SparkScanSettings.enabledSymbologies`

- **Methods Accepting Set(Symbology)**:
  - `BarcodeCaptureSettings.enableSymbologies(_:)`
  - `BarcodeCountSettings.enableSymbologies(_:)`
  - `BarcodeFindSettings.enableSymbologies(_:)`
  - `BarcodePickSettings.enableSymbologies(_:)`
  - `BarcodeSelectionSettings.enableSymbologies(_:)`
  - `BarcodeTrackingSettings.enableSymbologies(_:)`
  - `SparkScanSettings.enableSymbologies(_:)`

- **Exposed as Dictionary**:
  - `BarcodeCountSession.recognizedBarcodes`
  - `BarcodeFilterSettings.excludedSymbolCounts`
  - `BarcodeTrackingSession.removedTrackedBarcodes`
  - `BarcodeTrackingSession.trackedBarcodes`

- **Symbology Conforms to CaseIterable**: `SDCAllSymbologies` is not available anymore in Swift.
- **Exposed as Set(Int)**: `SymbologySettings.activeSymbolCounts`
- **WaveFormVibration Properties**:
  - `WaveFormVibration.timings`
  - `WaveFormVibration.amplitudes`

### Performance Improvements

#### Barcode

- Improved tracking robustness for low-end devices in MatrixScan Count.

### Bug Fixes

#### Barcode

- Fixed flickering of guidances in `SDCBarcodeSelection`.

#### ID

- Fixed issues with scanning AAMVA documents with non-English characters.
- Fixed licensing issue for scanning the back side of UK driver’s license.
- Fixed a crash when scanning a passport MRZ then a non-passport VIZ.

#### Core

- Fixed the radius selection for cases where the `SDCDataCaptureView`’s aspect ratio is considerably different from the camera frames.

### Deprecations

#### Barcode

- **Deprecated APIs**:
  - `SDCSparkScanScanningPrecision` replaced by `SDCSparkScanPreviewBehavior`.
  - `SDCSparkScanScanningModeTarget` and `SDCSparkScanScanningModeDefault` initializers accepting `SDCSparkScanScanningPrecision` replaced by initializers accepting `SDCSparkScanPreviewBehavior`.
  - `SDCSparkScanView.shouldShowTargetModeHint` and `SDCSparkScanView.targetModeHintText`.
  - `barcode.spark.ui.SparkScanToastSettings.CameraTimeoutMessage`.
  - `SDCSparkScanViewSettings.targetZoomFactorOut` and `SDCSparkScanViewSettings.targetZoomFactorIn` replaced by `SDCSparkScanViewSettings.zoomFactorOut` and `SDCSparkScanViewSettings.zoomFactorIn`.
  - `SDCSparkScanViewSettings.continuousCaptureTimeout` replaced by `SDCSparkScanViewSettings.inactiveStateTimeout`.
  - `SDCSparkScanViewFeedback`, `SDCSparkScanFeedback`, `SDCSparkScanView.brush`, and `SDCSparkScanView.emitFeedback` replaced by `SDCSparkScanBarcodeFeedback` and `SDCSparkScanView.feedbackDelegate`.

## 6.22.2

**Released**: April 30, 2024

* Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.22.1

**Released**: March 13, 2024

* Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.

## 6.22.0

**Released**: February 16, 2024

### New Features

#### Barcode

- **IATA Bar Coded Boarding Pass (BCBP) Support**: The Parser now supports `SDCParserDataFormatIataBcbp` according to the latest specifications from the 2023-2024 Passenger Services Conference Resolution Manual (PSCRM). For complete documentation, refer to the official website.
  
- **SparkScan UI Improvements**:
  - Redesigned minimized trigger button to occupy less space when the scanner is stopped.
  - Slightly decreased size of the expanded trigger button to leave more space for the underlying application.
  - Setting toolbar now shows fewer options by default (Target Mode and Torch), offering a less crowded and more efficient user experience. Icon visibility can still be personalized in `SDCSparkScanView`.
  
- **New Features and Improvements**:
  - Added `SDCBarcodeGenerator.upcaBarcodeGeneratorBuilderWithContext:` to generate UPCA barcodes.
  - Added QR symbology extension called `strict` to suppress rare QR reader false positives, reducing the scan robustness of damaged codes.
  - Introduced smart battery management to lower energy consumption and increase device uptime, with up to 15% improvement in battery life during tests. This option is disabled by default but can be enabled via `SDCBarcodeCaptureSettings.batterySavingMode`.

#### ID

- **New Features and Improvements**:
  - Added `SDCAAMVAVizBarcodeComparisonResult.frontMismatchImage` to visualize document data printed on the front side that differs from the barcode. Contact [Scandit Support](mailto:support@scandit.com) to use this feature.
  - Improved the accuracy of `SDCAAMVAVizBarcodeComparisonVerifier`.
  - Improved the accuracy of `SDCVizMrzComparisonVerifier`.
  - Added `SDCIdCaptureOverlay.textHintPosition` to set the position of textual hints.
  - Added `SDCIdCaptureOverlay.showTextHints` for showing/hiding text hints.
  - Replay the flip document animation when the user keeps scanning the wrong side of the document.
  - Added `SDCAAMVAVizBarcodeComparisonResult.frontMismatchImage` to highlight suspicious fields (currently in beta).

### Performance Improvements

#### Barcode

- Improved QR code scan performance for codes occluded by glare.
- Improved scan performance for 1D barcodes with missing or damaged quiet zones.

### Bug Fixes

#### Barcode

- Fixed incorrect EAN13/UPCA checksum computation when generating barcodes with `SDCBarcodeGenerator`.
- Fixed a bug in handling active symbol counts for Codabar.

#### ID

- Fixed an issue where US Border Crossing Cards were not recognized.

### Deprecations

#### Barcode

- Deprecated `SDCSparkScanViewSettings.ignoreDragLimits`. There is no drag limit anymore; the button can be repositioned from the bottom to the top of the screen.

## 6.21.2

**Released**: January 19, 2024

* Fixed a rare issue where error 33794 is reported in the data capture view.
* Latin name from the back side is now returned when scanning Oman IDs in SDCSupportedSidesFrontAndBack.
* Fixed an issue where US Border Crossing Cards were not recognized.

## 6.21.0

**Released**: December 8, 2023

### New Features

#### Barcode

- Added `SDCBarcodeFind.setBarcodeTransformer` method to `SDCBarcodeFind`, to allow the addition of an intermediate barcode transformer to the `BarcodeFind` instance.
- Added support for landscape orientation in `SDCBarcodeCountView`.
- Added `SDCBarcodeGenerator` class for generating Code 39, Code 128, EAN13, ITF, QR, and DataMatrix codes.
- Added support for QR model 1 codes (legacy format).
- Added support for UPU 4-State codes with fluorescent orange ink (`fluorescent_orange_ink` extension, see also Symbology Properties).

#### ID

- Added `SDCIdCaptureFeedback.JSONString`.
- Added `SDCAAMVABarcodeResult.firstNameWithoutMiddleName`.

#### Label

- Added a new way to initialize `SDCLabelCaptureSettings` using `SDCLabelDefinition`. Creating Label Capture Settings using `SDCLabelCaptureSettings.settingsFromString:error:` is now deprecated.

### Performance Improvements

#### Barcode

- Improved the responsiveness of MatrixScan Count on low-end devices.
- Improved QR code scan performance of codes occluded by glare.

### Bug Fixes

#### Barcode

- Fixed a rare crash during the destruction of tracking-based capture modes.

#### ID

- Fixed issues with scanning `SDCIdDocumentTypeAAMVABarcode` documents that had some special characters in its content.

### API Changes

#### Barcode

- In Swift, the `BarcodeCount.add(_:)` and `BarcodeCount.remove(_:)` methods have been renamed to `BarcodeCount.addListener(_:)` and `BarcodeCount.removeListener(_:)`.

## 6.20.1

**Released**: November 28, 2023

* Fixed an issue affecting devices running iOS 17 and supporting macro mode, which prevented the camera from switching between wide and ultra-wide cameras.

## 6.20.0

**Released**: November 7, 2023

### New Features

#### Barcode

SparkScan has been expanded with a range of new features and improvements:

- Introduced a smart battery management to lower the energy consumption and increase the up-time of the device. In our tests (repeatedly scanning a sequence of 5 different labels mimicking the user movement), this led to an improvement of up to 15% in battery life. This option is enabled by default, but it is possible to control it via battery saving mode, deciding whether it’s automatic (default), always on, or always off.
- Added `SDCSparkScanViewUIDelegate.sparkScanView:didChangeScanningMode:` and `SDCSparkScanView.scanningMode` for getting information when the `SparkScanScanningMode` changes and to get the currently used `SDCSparkScanScanningMode`. This is useful, for example, to apply different settings when the Target Mode (or the Continuous Mode) is enabled/disabled.
- Added a gesture to collapse the trigger button with a swipe from the setting toolbar to the edge of the screen.
- The setting toolbar icons have been slightly redesigned and grouped into categories.
- Added contextual messages within the trigger button, called toasts, to guide the user while interacting with the UI. SparkScan offers a series of built-in messages, but custom messages can be shown by using the method `SDCSparkScanView.showToast:`. For more information, check `SDCSparkScanToastSettings`.
- Added support for `SDCSymbologyUPU4State`.
- Added `SDCBarcodeFindView.shouldShowTorchControl` and `SDCBarcodeFindView.torchControlPosition` to allow displaying and positioning a button to turn the device’s torch on and off in BarcodeFind.

#### ID

- `SDCAAMVABarcodeVerifier` now performs document verification entirely on-device. However, to use it, an additional artifact is now required. Check documentation for details.
- For ID cards issued by the United Arab Emirates, data parsed from the Machine Readable Zone (MRZ) is now returned automatically when `SDCIdDocumentTypeIdCardVIZ` and `SDCSupportedSidesFrontAndBack` are selected.

### Behavioral Changes

#### Barcode

- Changed the default value of `SDCSparkScanToastSettings.toastEnabled` to true.