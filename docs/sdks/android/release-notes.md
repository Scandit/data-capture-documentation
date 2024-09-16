---
toc_max_heading_level: 3
displayed_sidebar: androidSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: android
tags: [android]
keywords:
  - android
---

## 6.28.0-beta-1

**Released**: September 10, 2024

### New Features

#### Barcode

* Our [Barode Generator](./barcode-generator/) now allows the generation of Aztec codes. See [`AztecBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.AztecBarcodeGeneratorBuilder).
* On Barcode Capture and SparkScan, we optimized the frame processing time in 4k-UHD resolution with dynamic resolution selection, resulting in up to 35% reduction on high-end devices and consistent performance improvements across all supported devices.
platforms.
* Added [`BarcodeFindView.ShouldShowZoomControl`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view.html#property-scandit.datacapture.barcode.find.ui.BarcodeFindView.ShouldShowZoomControl) which enables the display of a button that allows switching to ultra wide lenses on supported devices for scanning at close range in narrow environments.

#### ID

* ID Capture supports scanning the Visual Inspection Zone (VIZ) of New York City IDs.
* Added [`scandit.datacapture.id.CapturedId.UsRealIdStatus`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.UsRealIdStatus) to indicate whether a document is REAL ID compliant.

#### Label

* Added support for text fields that are identified only based on their data pattern. These do not need textual identifiers to be identified, and therefore no data type patterns (i.e., patterns for the textual identifiers) need to be specified for them.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.

## 6.27.1

**Released** September 6, 2024

No updates for this framework in this version.

## 6.27.0

**Released**: September 5, 2024

### API Changes

#### Barcode

- The [`BarcodeTrackingAdvancedOverlay.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode) and [`BarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) methods no longer support rendering any kind of images. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### Barcode

* Added torch control to BarcodeCount with [`BarcodeCountView.shouldShowTorchControl`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowTorchControl) and [`BarcodeCountView.torchControlPosition`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.TorchControlPosition) to control visibility and position in [`BarcodeCountView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView).

#### ID

* Added [`AamvaBarcodeVerificationResult.status`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.Status) which includes classification confidence as [`AamvaBarcodeVerificationStatus.FORGED`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#value-scandit.datacapture.id.AamvaBarcodeVerificationStatus.Forged) or [`AamvaBarcodeVerificationStatus.LIKELY_FORGED`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#value-scandit.datacapture.id.AamvaBarcodeVerificationStatus.LikelyForged).
* Added properties [`VizResult.firstName`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FirstName), [`VizResult.lastName`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.LastName), [`VizResult.secondaryLastName`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.SecondaryLastName), [`VizResult.fullName`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.FullName).
* Added [`DrivingLicenseDetails.restrictions`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Restrictions) and [`DrivingLicenseDetails.endorsements`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/driving-license-details.html#property-scandit.datacapture.id.DrivingLicenseDetails.Endorsements) which correspond to the restrictions to driving privileges and to the additional privileges granted to the driver license owner respectively.

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/data-capture-sdk/android/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/data-capture-sdk/android/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

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

* [`AamvaVizBarcodeComparisonResult.frontMismatchImage`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.FrontMismatchImage) now only returns an image when [`AamvaVizBarcodeComparisonResult.checksPassed`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.ChecksPassed) is false.
* Fixed an error 255 that would prevent capturing MRZ for some license keys, for which this feature was enabled.

### Deprecations

* Deprecated [`SparkScanSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcodes), prefer [`SparkScanSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcodes), prefer [`BarcodeCaptureSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) in favor of [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving).
* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/data-capture-sdk/android/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/data-capture-sdk/android/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/android/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).
* Deprecated [`AamvaBarcodeVerificationResult.allChecksPassed`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.AllChecksPassed). [`AamvaBarcodeVerificationResult.status`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#property-scandit.datacapture.id.AamvaBarcodeVerificationResult.Status) should be used instead.

## 6.25.3

**Released**: September 2, 2024

### Bug Fixes

- Concatenated ArUco codes are now comma-separated.

## 6.25.2

**Released**: August 2, 2024

### Bug Fixes

#### Core

- Fixed a rare reference table overflow by reducing the number of global refs created.

## 6.25.1

**Released**: August 1, 2024

### Bug Fixes

- Fixed crash (SIGILL) on Galaxy Note9 (SM-N960F & SM-N960X).

#### Barcode

- Fixed an issue in MatrixScan Count that was causing a reset after a rotation.

#### ID

- Fixed an error 255 that would prevent capturing MRZ for some licenses where this feature is supposed to be enabled.

#### Core

- Fixed a crash using camera API 2 where an `IllegalStateException` could be thrown in some edge cases.

## 6.25.0

**Released**: July 5, 2024

### New Features

#### Barcode

* Added torch control to BarcodePick with [`BarcodePickViewSettings.showTorchButton`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ShowTorchButton) to enable showing a torch button when using [`BarcodePickView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView). The torch button as well as the zoom button (shown with: [`BarcodePickViewSettings.showZoomButton`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ShowZoomButton)) can be repositioned with [`BarcodePickViewSettings.torchButtonPosition`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.TorchButtonPosition) and [`BarcodePickViewSettings.zoomButtonPosition`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#property-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings.ZoomButtonPosition).
* Added ability to customize the minimum width and height of the highlights in the following styles:
  - [`BarcodePickViewHighlightStyleRectangular`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular.html#class-scandit.datacapture.barcode.pick.ui.Rectangular)
  - [`BarcodePickViewHighlightStyleRectangularWithIcons`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#class-scandit.datacapture.barcode.pick.ui.RectangularWithIcons)
  - [`BarcodePickViewHighlightStyleCustomView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-highlight-style-custom-view.html#class-scandit.datacapture.barcode.pick.ui.CustomView)
* Added the following properties to apply a [`BarcodePickStatusIconSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-status-icon-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickStatusIconSettings) object and customize the status icons appearance:
  - [`BarcodePickViewHighlightStyleRectangularWithIcons.statusIconSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#property-scandit.datacapture.barcode.pick.ui.RectangularWithIcons.StatusIconSettings)
  - [`BarcodePickViewHighlightStyleCustomView.statusIconSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-highlight-style-custom-view.html#property-scandit.datacapture.barcode.pick.ui.CustomView.StatusIconSettings)

#### ID

* ID Capture now supports extracting information from the back side of European driver’s licenses.
* Added the following properties to [`VizResult`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/viz-result.html#viz-result):
  - `VizResult.bloodType` to represent the blood type of the document owner.
  - `VizResult.sponsor` to represent the sponsor of the document owner.
  - `VizResult.mothersName` to represent the mother’s name of the document owner.
  - `VizResult.fathersName` to represent the father’s name of the document owner.

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

- **Smart Scan Intention**: Introduced a new algorithm that intelligently identifies and scans the intended barcode, reducing errors. Enabled by default in SparkScan (`SparkScanSettings.scanIntention`) and can be manually set in Barcode Capture (`BarcodeCaptureSettings.scanIntention`).
  
- **Improved Scanning Range**: Enhanced the scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels by 30-40% in both Full HD and 4K, without compromising scanning speed. This improvement benefits scanning tiny barcodes and ESLs, especially those on top or bottom shelves.

- **User-Facing Camera**: SparkScan now allows switching to the user-facing camera for scanning. Useful in scenarios where the rear camera is not accessible or barcodes are hard to reach. See `SparkScanView.cameraSwitchButtonVisible`.

- **Dynamic Item List in MatrixScan Find**: Added support for dynamically modifying the list of items to be found by calling `BarcodeFind.setItemList()` during a scanning session.

- **New Symbology Supports**:
  - **Symbology.FRENCHPOST**: Recognizes postal codes used by the French Post.
  - **Symbology.AUSTRALIANPOST**: Decodes misprinted Australian Post codes.

- **BarcodePick View Highlight Styles**: Added new APIs to show different highlights while waiting for an async pick/unpick action. Setters & getters for selected brushes and/or icons are in `Rectangular`, `Dot`, `RectangularWithIcons`, and `DotWithIcons`. Asynchronous selection is available with the new `BarcodePickViewHighlightStyleResponse` constructor.

- **Programmatic Item Selection**: Added `BarcodePick.selectItemWithData()` to programmatically select an item.

- **Progress Bar in BarcodeCountView**: Added `BarcodeCountView.shouldShowListProgressBar` to enable showing/hiding the progress bar when a capture list is set.

#### ID

- **Reject Voided IDs**: Added `IdCaptureSettings.rejectVoidedIds` to reject documents voided by authorities. Supports cut corners, holes punched in the document, and “VOID” perforations. Currently supports only US Driver’s Licenses. Requires the `ScanditIdVoidedDetection` library.
  
- **Rejection Reason**: Added `RejectedId.rejectionReason` to provide the reason for document rejection.

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IdCaptureListener.onIdCaptureTimedOut()` to be invoked when a document is localized for a period but not captured.

- **Additional Features**:
  - Added `AamvaBarcodeResult.rawData`.
  - Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

- **Newly Supported Documents**:
  - **MRZ Scanning**: Mexico: Matrícula Consular
  - **Front of Card/VIZ Scanning**:
    - USA: District of Columbia, Idaho, North Dakota, West Virginia, Wisconsin (2023 versions)
    - Mexico: Consular Voter ID
  - Added `CapturedId.secondaryLastName` containing the common name (“nom d’usage”) on French passports.

#### Parser

- **GS1 Digital Link**: Expanded support to include uncompressed GS1 Digital Link. For complete documentation, refer to the official website.

### Behavioral Changes

#### Barcode

- **Battery Saving Mode**: Changed from `BatterySavingMode.OFF` to `BatterySavingMode.AUTO`. This can be changed via `SparkScanSettings.batterySaving`.

### Performance Improvements

#### ID

- Improved capture performance for US driver’s license PDF417 barcodes with printing defects, particularly from Ohio, Louisiana, and Florida.

### Bug Fixes

#### Barcode

- Fixed the “Tap to Focus” animation when the view size changes.

#### ID

- Fixed a crash when scanning a passport MRZ followed by a non-passport VIZ.
- Fixed incorrect date handling for European IDs, Swiss driver’s licenses, and UAE IDs.
- Fixed incorrect information extraction from British Columbia PDF417.

### API Changes

#### Barcode

- **Renamed Methods in BarcodePickView**:
  - **Lifecycle Methods**:
    - `Activity/Fragment onResume` should call `BarcodePickView.onResume()`.
    - `Activity/Fragment onPause` should call `BarcodePickView.onPause()`.
    - `Activity onDestroy` or `Fragment onDestroyView` should call `BarcodePickView.onDestroy()`.
  - **Start/Stop Scanning**:
    - `BarcodePickView.start()` starts the scanning flow and can be manually stopped by calling `BarcodePickView.stop()`. It will be stopped automatically when `BarcodePickView.onPause()` is called and resumed with `BarcodePickView.onResume()`.
    - `BarcodePickView.stop()` stops the scanning flow and can be manually started with `BarcodePickView.start()`.
  
:::note
Scanning is only possible when in resumed state. `BarcodePickView.start()` will not start scanning if `BarcodePickView.onResume()` is not called before or after.
:::

## 6.23.4

**Released**: July 23, 2024

### Bug Fixes

#### Core

- Fixed a crash using camera API 2 where an IllegalStateException could be thrown in some edge cases.

## 6.23.3

**Released**: May 10, 2024

### Bug Fixes

#### Core

- Fix an additional issue that prevented the SIGILL fix introduced on 6.23.2 to work on certain Samsung Galaxy S9 devices.

## 6.23.2

**Released**: April 30, 2024

* Fixed crash (SIGILL) on Exynos 9810-based Galaxy S9 and Galaxy S9+ devices that advertise support for FP16 arithmetics. A previous fix in 6.21.0 only partially resolved the issue.

## 6.23.1

**Released**: April 24, 2024

* Added support for Mexican Matrícula Consular MRZ codes.
* Improved ID scanning performance in low-light conditions.
* Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

## 6.23.0

**Released**: March 22, 2024

### New Features

#### Barcode

- SparkScan has received a number of updates and improvements:
  - The target mode has been improved with better performances (faster selection of barcodes), a more consistent workflow (the target mode will only show the aimer, without changing the preview size or the way barcodes are scanned), and a better UI (new aimer and new icon).
  - The preview size is now independent from scanning mode or scanning precision (deprecated) parameters. Instead, it is controlled by a dedicated control added to the preview. Use `SparkScanView.previewSizeControlVisible` to define if the preview size control should be displayed.
  - The "accuracy" workflow has been revisited and streamlined into a more consistent and performant workflow.
  - Developers can set `SparkScanPreviewBehavior` to specify the preview behavior type of the `SparkScanView`. When `previewBehavior` is `SparkScanPreviewBehavior.PERSISTENT`, after the scan the preview does not disappear, but stays obscured and running (but not scanning) for easier aiming.
  - Added `Target.previewBehavior` and `Default.previewBehavior` to specify preview behavior for scanning modes.
  - Added initializers for Target and Default that accept `SparkScanPreviewBehavior` instead of `SparkScanScanningPrecision`.
  - Toast messages are now displayed on top of the preview rather than the scan button. Additional toast messages have been added for better guidance.
  - Added `barcode.spark.ui.SparkScanToastSettings.TorchEnabledMessage` and `barcode.spark.ui.SparkScanToastSettings.TorchDisabledMessage` to specify toast messages when the torch is enabled or disabled.
  - The zoom functionality is now independent of scanning mode and is available in both default and target modes.
  - Added `SparkScanViewSettings.zoomFactorOut` and `SparkScanViewSettings.zoomFactorIn` to specify the default zoom factor in zoomed out and zoomed in states for both scanning modes, default and target.
  - The feedback emission system has been improved: for new implementation, there is no need to explicitly emit a success feedback on scan, as it became implicit.
  - Added `SparkScanBarcodeFeedback`, `SparkScanFeedbackDelegate`, and `SparkScanView.feedbackDelegate` to define and emit feedback that can be customized for every scanned barcode.
  - Added `SparkScanViewSettings.inactiveStateTimeout` to specify the timeout to automatically stop scanning across all modes.

- Barcode Pick is an API that implements MatrixScan Pick. MatrixScan Pick is an out-of-the-box scan solution; it uses real-time inventory data and augmented reality to assign precise, item-specific tasks, guaranteeing pinpoint accuracy in restocking, inventory audits, and parcel delivery. Barcode Pick is no longer in beta and a new feature has been added in 6.23:
  - Added `BarcodePickStatusIconStyle` to display additional information on top of the regular highlight.
  - Added `BarcodePickViewHighlightStyle` to visualize a custom view on top of the tracked barcodes.
  - Added `BarcodePickListener` to listen to `BarcodePickSession` to know the items currently on screen and the newly added items.
- Added support for `Symbology.AUSTRALIANPOST`. By default, customer information is decoded with Table N, and Table C is used as a fallback. To set a specific decoding table for the customer information, use the symbology extensions: `force_table_c` or `force_table_n` to enforce decoding with either C or N tables respectively. The symbology extension `decode_bar_states` returns the error-corrected customer information bars as a string of the bar states: A for ascending, D for descending, T for tracker, and F for full.
- Added getter and setter methods for hints shown when a barcode not in the expected list is scanned in `BarcodeCountView` (see `BarcodeCountView.getTextForBarcodesNotInListDetectedHint()` and `BarcodeCountView.setTextForBarcodesNotInListDetectedHint()`).

### Performance Improvements

#### Barcode

- Improved tracking robustness for low-end devices in MatrixScan Count.

### Bug Fixes

#### Barcode

- Fixed the placement of `BarcodeTrackingAdvancedOverlay` for right-to-left layout direction.
- Fixed flickering of guidances in `BarcodeSelection`.

#### ID

- Fixed a crash that happened when scanning an Argentina ID document that contained non-UTF-8 characters in the barcode.
- Fixed issues with scanning AAMVA documents (barcode part) that contain characters from non-English alphabets.
- Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.
- Fixed a crash when scanning a passport MRZ then a non-passport VIZ.

#### Core

- Fixed the radius of the radius location selection for cases where the `DataCaptureView`'s aspect ratio is considerably different from the aspect ratio of the camera frames.

#### Label

- Fixed the placement of `LabelCaptureAdvancedOverlay` for right-to-left layout direction.

### Deprecations

#### Barcode

SparkScan received a number of updates and improvements:

- New APIs have been added to SparkScan to deliver a number of updates and improvements. At the same time, some of the existing APIs have become irrelevant.
- Deprecated `SparkScanScanningPrecision`. Replaced by `SparkScanPreviewBehavior` because the "accurate" workflow has been simplified.
- Deprecated Target and Default initializers that accepted `SparkScanScanningPrecision`. Replaced by initializers that accept `SparkScanPreviewBehavior` instead.
- Deprecated `Target.scanningPrecision` and `Default.scanningPrecision`. Replaced with `Target.previewBehavior` and `Default.previewBehavior` to specify preview behavior for scanning modes.
- Deprecated `SparkScanView.shouldShowTargetModeHint` and `SparkScanView.targetModeHintText`. This hint is not displayed anymore due to changes in Target scanning mode.
- Deprecated `barcode.spark.ui.SparkScanToastSettings.CameraTimeoutMessage` because a toast with this message is not displayed anymore due to changes in the SparkScan toast system.
- Deprecated `SparkScanViewSettings.targetZoomFactorOut` and `SparkScanViewSettings.targetZoomFactorIn`. Replaced by `SparkScanViewSettings.zoomFactorOut` and `SparkScanViewSettings.zoomFactorIn`.
- Deprecated `SparkScanViewSettings.continuousCaptureTimeout`. Replaced by `SparkScanViewSettings.inactiveStateTimeout`.
- Deprecated `SparkScanViewFeedback`, `SparkScanFeedback`, `SparkScanView.brush`, and `SparkScanView.emitFeedback()`. These classes and methods are not used anymore. Use `SparkScanBarcodeFeedback` and `SparkScanView.feedbackDelegate`.

## 6.22.1

**Released**: March 13, 2024

* Improved ID scanning performance in low-light conditions.
* Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.

## 6.22.0

**Released**: February 16, 2024

### New Features

#### Barcode

- The Parser has been expanded to support the IATA bar Coded Boarding Pass (BCBP). `ParserDataFormat.IATA_BCBP` supports the latest specifications from the 2023-2024 Passenger Services Conference Resolution Manual (PSCRM). For the complete documentation of the standard, please refer to the official website.
- SparkScan has been updated with some UI improvements:
  - The minimized trigger button has been redesigned to occupy less space when the scanner is stopped.
  - The expanded trigger button has been slightly decreased in size, to leave more space for the underlying application.
  - The setting toolbar shows by default fewer options (Target Mode and Torch), to offer a less crowded and more efficient user experience. The visibility of all the icons can still be personalized in the `SparkScanView`.
- Added `BarcodeGenerator.upcaBarcodeGeneratorBuilder()` to generate UPCA barcodes.
- Added QR symbology extension called `strict` to suppress rare QR reader false positives. `strict` reduces the scan robustness of damaged codes.
- Introduced smart battery management to lower the energy consumption and increase the up-time of the device. In our tests (repeatedly scanning a sequence of 5 different labels mimicking the user movement), this led to an improvement of up to 15% in battery life. This option is disabled by default, but it can be enabled via `BarcodeCaptureSettings.batterySavingMode`, deciding whether it’s automatic, always on, or always off (default).

#### ID

- Added `AamvaVizBarcodeComparisonResult.frontMismatchImage` that visualizes the document data printed on the front side that differs from what is encoded in the barcode. Please contact [Scandit Support](mailto:support@scandit.com) if you want to use this feature.
- Improved the accuracy of `AamvaVizBarcodeComparisonVerifier`.
- Improved the accuracy of `VizMrzComparisonVerifier`.
- Added `IdCaptureOverlay.textHintPosition` that allows setting of the textual hint position.
- Added `IdCaptureOverlay.showTextHints` for showing/hiding text hints.
- Replay the flip document animation when the user keeps scanning the wrong side of the document.
- Added `AamvaVizBarcodeComparisonResult.frontMismatchImage` that highlights suspicious fields. This feature is currently in beta and may change significantly in future releases.

### Behavioral Changes

#### Core

- Removed OkHttp dependency for API requests in favor of the Scandit internal client.

### Performance Improvements

#### Barcode

- Further improved QR code scan performance of codes occluded by glare.
- Improved scan performance for 1D barcodes with missing or damaged quiet zones.

### Bug Fixes

#### Barcode

- Fixed layout of `BarcodeCountView` for devices with short screens.
- Fixed incorrect EAN13/UPCA checksum computation when generating barcodes with `BarcodeGenerator`.
- Fixed a bug in handling of active symbol counts for Codabar.

#### ID

- Fixed an issue where US Border Crossing Cards were not recognized.
- Latin name from the back side is now returned when scanning Oman IDs in `SupportedSides.FRONT_AND_BACK`.

### Deprecations

#### Barcode

- Deprecated `SparkScanViewSettings.ignoreDragLimits`. There is no drag limit anymore. The button can be repositioned all the way from the bottom to the top of the screen.

## 6.21.2

**Released**: January 19, 2024

* Latin name from the back side is now returned when scanning Oman IDs in SupportedSides.FRONT_AND_BACK.
* Fixed an issue where US Border Crossing Cards were not recognized.

## 6.21.0

**Released**: December 8, 2023

### New Features

#### Barcode

- Added `BarcodeFind.setTransformer()` method to `BarcodeFind`, to allow the addition of an intermediate barcode transformer to the `BarcodeFind` instance.
- Added support for landscape orientation in `BarcodeCountView`.
- Added `BarcodeGenerator` class for generating Code 39, Code 128, EAN13, ITF, QR, and DataMatrix codes.
- Added support for QR model 1 codes (legacy format).
- Added support for UPU 4-State codes with fluorescent orange ink (`fluorescent_orange_ink` extension, see also Symbology Properties).

#### ID

- Added `IdCaptureFeedback.toJson()`.
- Added `AamvaBarcodeResult.firstNameWithoutMiddleName`.

#### Label

- Added a new way to create `LabelCaptureSettings` using the Builder pattern. Creating Label Capture Settings using `LabelCaptureSettings.loadFromString()` is now deprecated.

### Performance Improvements

#### Barcode

- Improved the responsiveness of MatrixScan Count on low-end devices.
- Improved QR code scan performance of codes occluded by glare.

### Bug Fixes

#### Barcode

- Fixed an issue with decoding Code39 barcodes that are misprinted or have a large and/or variable wide:narrow bar width ratio.
- Fix a rare crash during destruction of tracking-based capture modes.

#### ID

- Fixed issues with scanning `IdDocumentType.AAMVA_BARCODE` documents that had some special characters in its content.

#### Core

- Fixed a crash (SIGILL) on Samsung Galaxy S9 (Exynos 9810 based) with Android version 8.

### Deprecations

#### Parser

- Deprecated `ParserDataFormat.US_USID`, `ParserDataFormat.DLID`, and `ParserDataFormat.MRTD`. You should use `IdCapture` instead.

## 6.20.2

**Released**: December 14, 2023

### Bug Fixes

* Fixed a crash (SIGILL) on Samsung Galaxy S9 (Exynos 9810 based) with Android version 8.

## 6.20.1

**Released**: November 28, 2023

### Bug Fixes

* Fixed a crash that happens after scanning ID documents without expiry date present in SupportedSides.FRONT_AND_BACK mode.
* Fixed an issue preventing DataCaptureContext from being mocked in local tests.

## 6.20.0

**Released**: November 7, 2023

### New Features

#### Barcode

SparkScan has been expanded with a range of new features and improvements:

- Introduced a smart battery management to lower the energy consumption and increase the up-time of the device. In our tests (repeatedly scanning a sequence of 5 different labels mimicking the user movement), this led to an improvement of up to 15% in battery life. This option is enabled by default, but it is possible to control it via battery saving mode, deciding whether it’s automatic (default), always on, or always off.
- Added `SparkScanViewUiListener.onScanningModeChange()` and `SparkScanView.getScanningMode()` for getting information when the `SparkScanScanningMode` changes and to get the currently used `SparkScanScanningMode`. This is useful, for example, to apply different settings when the Target Mode (or the Continuous Mode) is enabled/disabled.
- Added a gesture to collapse the trigger button with a swipe from the setting toolbar to the edge of the screen.
- The setting toolbar icons have been slightly redesigned and grouped in categories.
- Added contextual messages within the trigger button, called toasts, to guide the user while interacting with the UI. SparkScan offers a series of built-in messages, but custom messages can be shown by using the method `SparkScanView.showToast()`. For more information, check `SparkScanToastSettings`.
- Added support for `Symbology.UPU4STATE`.

#### ID

- `AamvaBarcodeVerifier` now performs document verification entirely on-device. However, to use it, an additional artifact is now required. Check documentation for details.
- For ID cards issued by the United Arab Emirates, data parsed from the Machine Readable Zone (MRZ) is now returned automatically when `IdDocumentType.ID_CARD_VIZ` and `SupportedSides.FRONT_AND_BACK` are selected.

### Behavioral Changes

#### Barcode

- Changed the default value of `SparkScanToastSettings.toastEnabled` to true.

## 6.19.8

**Released**: November 23, 2023

### Bug Fixes

#### Core

- Fixed an issue preventing DataCaptureContext from being mocked in local tests.

## 6.19.7

**Released**: November 15, 2023

No updates for this framework in this release.

## 6.19.6

**Released**: November 10, 2023

No updates for this framework in this release.

## 6.19.5

**Released**: November 3, 2023

No updates for this framework in this release.

## 6.19.4

**Released**: November 1, 2023

No updates for this framework in this release.

## 6.19.3

**Released**: October 20, 2023

### Bug Fixes

#### Barcode

- Fixed barcode scanning at angles when the restricted scan area is very small and certain sets of symbologies are enabled.

## 6.19.2

**Released**: October 12, 2023

### Bug Fixes

#### Core

- Fixed an error 18 that would appear for most license keys that are from 2018 or before.

## 6.19.1

**Released**: September 27, 2023

No updates for this framework in this release.

## 6.19.0

**Released**: September 19, 2023

### New Features

#### Barcode

- If you are not familiar with the symbologies that are relevant for your use case, you can now use our `capture presets <scandit.datacapture.barcode.CapturePreset>`, pre-defined groups of symbologies that are tailored for different verticals (e.g. retail, logistics, etc.). You can use them through the new constructors for `scandit.datacapture.barcode.spark.SparkScanSettings` and :type:`scandit.datacapture.barcode.BarcodeCaptureSettings`.
- Added support for the `scandit.datacapture.barcode.Symbology.ArUco` symbology.
- Added a new “accuracy” workflow in [SparkScan](./sparkscan/intro.md). This workflow is particularly useful when the use-cases implies lots of barcodes close together or in crowded scenarios, and requires the end-user the possibility to look through the preview at all times to better control the scan and aim precisely. See `SparkScanScanningPrecision`.
- [BarcodeFind](./matrixscan-find/intro.md) has been expanded with a range of new features:
  - Added `scandit.datacapture.barcode.find.ui.BarcodeFindView.ShouldShowTorchControl` and `scandit.datacapture.barcode.find.ui.BarcodeFindView.TorchControlPosition` to allow displaying and positioning a button to turn the device's torch on and off in BarcodeFind.
  - Added a constructor for `scandit.datacapture.barcode.find.ui.BarcodeFindView` using a provided :type:`core.ui.DataCaptureView`.
- Added `scandit.datacapture.barcode.BarcodeSpatialGrid.ToJson` that returns the JSON representation of the spatial grid.

#### ID

- Renamed `AamvaCloudVerifier` to `id.AamvaBarcodeVerifier`, which allows the verification of `id.CapturedId`.
-Added `id.IdCaptureFeedback`. ID Capture allows to configure sound & vibration feedback to emit when a document is captured, rejected or the timeout occurs. By default the feedback is emitted when a document is captured.
-- Added support for extracting information in Arabic script for several documents.

#### Core

- Added `datacapture.core.ui.IFocusGesture.ShowUIIndicator`, can be used to disable the default visual indicator that is shown when a focus gesture is triggered.

### Performance Improvements

#### Barcode

- Improved performance when a lot of symbologies are enabled when using `barcode.BarcodeCapture` or `barcode.spark.SparkScan`.
- Added support for Code128 with damaged end patterns (missing, fused or covered bars). This support is automatically disabled if “strict mode” is selected.
- Improved QR code reader robustness for medium to large codes with small local deformations (e.g. crumpling, bending) or damage.
- Improved responsiveness of AR overlays in MatrixScan and Barcode Selection.

### Bug Fixes

#### Core

- Fixed a rare crash on Kyocera devices when the camera becomes temporarily unavailable.

#### Barcode

- Fixed the issue where the overlay for SparkScan stayed visible when it shouldn't have.

#### ID

- Fixed multiple issues where it was sometimes not possible to scan barcodes from AAMVA driver's licenses.
- Fixed an issue where it was not possible to scan certain Vietnamese passports.
- Fixed an issue where it was sometimes not possible to scan a barcode from a Pennsylvania driver’s license.
- Fixed an issue where it was not possible to scan certain passports when the `id.IdDocumentType.PassportViz` option was selected.
- Fixed an issue that caused a failure of the :type:`id.AamvaVizBarcodeComparisonVerifier` for valid IDs.
- Fixed an issue where scanning MRZ documents in ID Capture incorrectly displayed dates for year 2000.

### Deprecations

#### Barcode

- - Property `SparkScanSettings.LocationSelection` is deprecated and its functionality was removed. With the introduction of smart configurations based on the scanning mode enabled by the users, the locationSelection property is not needed anymore.

### API Changes

#### ID

- The `ScanditTextCaptureBase` module has been removed. Use `ScanditIdCaptureBackend` if you need to capture the human readable part of ID documents, `ScanditTextCaptureBackend` if you use TextCapture, or both, if you need both capabilities.
- Added `id.DateResult.LocalDate` and `id.DateResult.UtcDate` which convert the date result to java.util.Date using device’s local time zone or the UTC time zone respectively. They replace `id.DateResult.ToDate`, which is now deprecated.
- Removed id.IdDocumentType.UsVisaViz, `id.IdDocumentType.VisaMrz` should be used instead.
- Added `id.CapturedId.DocumentAdditionalNumber` which represents the additional number of the document.

### Behavioral Changes

#### Barcode

- Changed the behavior of `barcode.spark.ui.SparkScanView` to always revert back to the `barcode.spark.ui.SparkScanViewSettings.DefaultScanningMode` and `barcode.spark.ui.SparkScanViewSettings.DefaultTorchState` when `barcode.spark.ui.SparkScanView` is closed.