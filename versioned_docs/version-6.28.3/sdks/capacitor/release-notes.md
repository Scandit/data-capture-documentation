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

## 6.28.3

**Released**: December 23, 2024

### Bug Fixes

#### Core

* Resolved a rare issue where a race condition during the deconstruction of MatrixScan Data Capture views could lead to invalid memory access.

## 6.28.2

**Released**: December 12, 2024

### Bug Fixes

* Fixed an issue with the frame retrieval when calling `getFrameData` in various callbacks.

## 6.28.1

**Released**: October 29, 2024

No updates for this framework in this release.

## 6.28.0

**Released**: October 8, 2024

### New Features

#### Barcode

* Added [`barcode.pick.ui.RectangularWithIcons.StatusIconSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#property-scandit.datacapture.barcode.pick.ui.RectangularWithIcons.StatusIconSettings) property to apply a `barcode.pick.ui.BarcodePickStatusIconSettings` object and customize the status icons appearances.
* Added ability to customize the minimum width and height of the highlights in the [`scandit.datacapture.barcode.pick.ui.Rectangular`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular.html) and [`scandit.datacapture.barcode.pick.ui.RectangularWithIcons`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html) highlight styles.
* On Barcode Capture and SparkScan, we optimized the frame processing time in 4k-UHD resolution with dynamic resolution selection, resulting in up to 35% reduction on high-end devices and consistent performance improvements across all supported devices.
platforms.

#### ID

* ID Capture now supports scanning:
  * Visual Inspection Zone (VIZ) of New York City IDs.
  * Florida Medical Marijuana IDs.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.
* Fixed an issue where filter settings were not functioning properly in MatrixScan Count.

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

- The [`BarcodeTrackingAdvancedOverlay.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode) and [`BarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) methods no longer support rendering any kind of images. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

### Behavioral Changes

#### Core

- The camera permission dialog is now delayed until the moment when camera is switching state. This change is intended to improve the user experience by showing the permission dialog only when the camera is actually needed.

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### Barcode

* Added torch control to BarcodeCount with [`BarcodeCountView.shouldShowTorchControl`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowTorchControl) and [`BarcodeCountView.torchControlPosition`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.TorchControlPosition) to control visibility and position in [`BarcodeCountView`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView).

#### ID

* Added [`AamvaVizBarcodeComparisonResult.frontMismatchImage`](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.FrontMismatchImage) that highlights data fields on the front side of the document differing from the data encoded in the barcode. Please contact [Scandit Support](mailto:support@scandit.com) if you want to use this feature.

#### Parser

* The [Parser](./parser/get-started.md) has been expanded to support the IATA Bar Coded Boarding Pass (BCBP). [`ParserDataFormat.IataBcbp`](https://docs.scandit.com/data-capture-sdk/capacitor/parser/api/parser-data-format.html#value-scandit.datacapture.parser.ParserDataFormat.IataBcbp) supports the latest specifications from the 2023-2024 Passenger Services Conference Resolution Manual (PSCRM). For the complete documentation of the standard please refer to [`the official website`](https://www.iata.org/en/programs/passenger/common-use/).
* SwissQR parser: parsing issues are now reported as error code and message pairs, see [`ParserIssue`](https://docs.scandit.com/data-capture-sdk/capacitor/parser/api/parser-issue.html#class-scandit.datacapture.parser.ParserIssue). [`ParsedField.warnings`](https://docs.scandit.com/data-capture-sdk/capacitor/parser/api/parsed-field.html#property-scandit.datacapture.parser.ParsedField.Warnings) contains all the issues for a given field. Query all the fields with issues by calling [`ParsedData.fieldsWithIssues`](https://docs.scandit.com/data-capture-sdk/capacitor/parser/api/parsed-data.html#property-scandit.datacapture.parser.ParsedData.FieldsWithIssues).

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

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

* Fixed an error 255 that would prevent capturing MRZ for some license keys, for which this feature was enabled.

#### Core

* Fixed an issue where having no camera available resulted in failure to return from the `switchCameraToState` call.

### Deprecations

* Deprecated [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) in favor of [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving).
* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/data-capture-sdk/capacitor/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).

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

- Fixed an issue where having no frame source available resulted in failure to return from the `core.IFrameSource.SwitchToDesiredStateAsync` call.

## 6.25.0

**Released:** July 5, 2024

### New Features

#### Barcode

* Added the ability to hide the progress bar when counting against a list with BarcodeCount: [`BarcodeCountView.shouldShowListProgressBar`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowListProgressBar).

#### ID

* Added the following properties to [`SDCVizResult`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#viz-result):
  - `SDCVizResult.bloodType` to represent the blood type of the document owner.
  - `SDCVizResult.sponsor` to represent the sponsor of the document owner.
  - `SDCVizResult.mothersName` to represent the mother’s name of the document owner.
  - `SDCVizResult.fathersName` to represent the father’s name of the document owner.
* Added [`IdCaptureSettings.rejectVoidedIds`](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectVoidedIds). When enabled, documents voided by authorities are rejected.
  :::warning
  This feature currently supports 3 kinds of invalidation: Cut corners, holes punched in the document, and “VOID” perforations. Additionally, this feature currently supports only US Driver’s Licenses, and has no effect when scanning other document types.
  :::
* Added [`RejectedId.rejectionReason`](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/rejected-id.html#property-scandit.datacapture.id.RejectedId.RejectionReason) which contains the reason the document was rejected.
* Improved the extraction of the document number from UK driver’s licenses.
* Added _scandit-capacitor-datacapture-id-voided-detection_ library that must be included when activating `IdCaptureSettings.rejectVoidedIds`.

### Performance Improvements

#### Barcode

* Improved recognition rate for Composite A and Composite B barcodes, thanks to an increased robustness for small and low resolution MicroPDF417.
* Improved recognition rate of long, thin linear 1d codes, such as those found on electronic shelf labels (ESLs).
* Improved recognition rate of linear codes which are partially affected by damage or glare, with a particular focus on codabar barcodes.

#### ID

* Improved the accuracy of the AAMVA Barcode Verification.

## 6.24.1

**Released:** June 7, 2024

### Bug Fixes

#### ID

* Fixed an issue where the back document image was at times returned in place of the front one for UK driver’s licenses.

## 6.24.0

**Released**: May 8, 2024

### New Features

#### Barcode

- **Smart Scan Intention**: Introduced a new algorithm that intelligently identifies and scans the barcode that the user intends to capture, reducing errors. Enabled by default in SparkScan (`SparkScanSettings.scanIntention`) and can be manually set in Barcode Capture (`BarcodeCaptureSettings.scanIntention`).

- **Improved Scanning Range**: Enhanced scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels by 30-40% in both Full HD and 4K without compromising scanning speed. This improvement provides the fastest and most ergonomic scanning experience for tiny barcodes and ESLs, particularly those placed on top or bottom shelves.

- **Smart Battery Management**: Introduced smart battery management to lower energy consumption and increase the device's up-time. Tests showed up to a 15% improvement in battery life. This option is disabled by default but can be enabled via `BarcodeCaptureSettings.batterySavingMode`, with settings for automatic, always on, or always off (default).

- **User-Facing Camera**: SparkScan now allows switching to the user-facing camera for scanning, useful in scenarios where the rear camera is not accessible or barcodes are hard to reach. See `SparkScanView.cameraSwitchButtonVisible`.

- **New Symbology Supports**:
  - **Symbology.FrenchPost**: Allows the recognition of postal codes (code postal) used by the French Post.
  - **Symbology.AustralianPost**: Added support for decoding misprinted Australian Post codes.

#### ID

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IdCaptureListener.didTimeoutInSession()` to be invoked whenever a document is localized for a period but could not be captured.

- **Fixed Surnames in US Driver’s Licenses**: Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

- **Newly Supported Documents for MRZ Scanning**:
  - Mexico: Matrícula Consular

- **Newly Supported Documents for Front of Card/VIZ Scanning**:
  - USA:
    - District of Columbia - Driver License & ID Card (2023 version)
    - Idaho - Driver License & ID Card (2023 version)
    - North Dakota - Driver License & ID Card (2023 version)
    - West Virginia - Driver License & ID Card (2023 version)
    - Wisconsin - Driver License & ID Card (2023 version)
  - Mexico: Consular Voter ID

### Behavioral Changes

#### Barcode

- **Battery Saving Mode**: Changed from `BatterySavingMode.Off` to `BatterySavingMode.Auto`. This can be changed via `SparkScanSettings.batterySaving`.

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

### API Changes

#### Barcode

- **Renamed Methods in BarcodePickView**:
  - **Start/Stop Scanning**:
    - `BarcodePickView.start()`: Starts the scanning flow and can be manually stopped by calling `BarcodePickView.stop()`.
    - `BarcodePickView.stop()`: Stops the scanning flow and can be manually started by calling `BarcodePickView.start()`.

## 6.23.4

**Released**: July 23, 2024

No updates for this framework in this release.

## 6.23.3

**Released**: July 23, 2024

### Bug Fixes

#### Core

* Fix an additional issue that prevented the SIGILL fix introduced on 6.23.2 to work on certain Samsung Galaxy S9 devices.

## 6.23.2

**Released**: April 30, 2024

### Bug Fixes

#### Core

* Fixed crash (SIGILL) on Exynos 9810-based Galaxy S9 and Galaxy S9+ devices that advertise support for FP16 arithmetics. A previous fix in 6.21.0 only partially resolved the issue.
* Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.23.1

**Released**: April 24, 2024

### New Features

#### ID

* Added support for Mexican Matrícula Consular MRZ codes.

### Performance Improvements

#### ID

* Improved ID scanning performance in low-light conditions.

### Bug Fixes

#### ID

* Fixed truncated surnames in US driver's licenses using magnetic stripe format.

## 6.23.0

**Released**: March 22, 2024

### New Features

#### Core

* Added support to set control images through a resource name.

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
- Barcode Pick is an API that implements MatrixScan Pick. MatrixScan Pick is an out-of-the-box scan solution that uses real-time inventory data and augmented reality to assign precise, item-specific tasks, guaranteeing pinpoint accuracy in restocking, inventory audits, and parcel delivery. Barcode Pick is no longer in beta and several new features have been added in 6.23:
  - Added the possibility to customize icons in `scandit.datacapture.barcode.pick.ui.RectangularWithIcons`. See `scandit.datacapture.barcode.pick.ui.RectangularWithIcons.SetIconForState`.
- Added support for `Symbology.AUSTRALIANPOST`. By default, customer information is decoded with Table N, and Table C is used as a fallback. To set a specific decoding table for the customer information, use the symbology extensions: `force_table_c` or `force_table_n` to enforce decoding with either C or N tables respectively. The symbology extension `decode_bar_states` returns the error-corrected customer information bars as a string of the bar states: A for ascending, D for descending, T for tracker, and F for full.
- Added support for `Symbology.Upu4State`.

#### ID

* Added `id.ui.IdCaptureOverlay.TextHintPosition` that allows setting of text hints position.
* Added `id.ui.IdCaptureOverlay.ShowTextHints` for showing/hiding text hints.
* It is now possible to run basic authenticity checks on VIZ & MRZ documents by comparing the data from the VIZ with the data decoded from the MRZ. Check `id.VizMrzComparisonVerifier` for details. This feature is currently in beta, and may still change significantly in the next releases.

### Performance Improvements

#### Barcode

- Improved tracking robustness for low-end devices in MatrixScan Count.

### Bug Fixes

#### Barcode

- Fixed flickering of guidances in `BarcodeSelection`.

#### ID

- Fixed issues with scanning AAMVA documents (barcode part) that contain characters from non-English alphabets.
- Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.
- Fixed a crash when scanning a passport MRZ then a non-passport VIZ.

#### Core

- Fixed the radius of the radius location selection for cases where the `DataCaptureView`'s aspect ratio is considerably different from the aspect ratio of the camera frames.

### Deprecations

#### Barcode

* Deprecated `barcode.spark.ui.SparkScanView.ShouldShowTargetModeHint` and `barcode.spark.ui.SparkScanView.TargetModeHintText`. This hint is not displayed anymore due to changes in `barcode.spark.ui.SparkScanScanningModeTarget` scanning mode.
* Deprecated `barcode.spark.ui.SparkScanToastSettings.CameraTimeoutMessage` because toast with this message is not displayed anymore due to changes in the SparkScan toast system.
* Deprecated `barcode.spark.ui.SparkScanViewSettings.TargetZoomFactorOut` and `barcode.spark.ui.SparkScanViewSettings.TargetZoomFactorIn`. Replaced by `barcode.spark.ui.SparkScanViewSettings.ZoomFactorOut` and `barcode.spark.ui.SparkScanViewSettings.ZoomFactorIn`.
* Deprecated `barcode.spark.ui.SparkScanViewSettings.ContinuousCaptureTimeout`. Replaced by `barcode.spark.ui.SparkScanViewSettings.InactiveStateTimeout`.
* Deprecated `barcode.spark.ui.SparkScanViewFeedback`, `barcode.spark.SparkScanFeedback`, `barcode.spark.ui.SparkScanView.Brush` and `barcode.spark.ui.SparkScanView.emitFeedback`. These classes and methods are not used anymore. Use `barcode.spark.feedback.SparkScanBarcodeFeedback` and `barcode.spark.ui.SparkScanView.FeedbackDelegate`.

## 6.22.2

**Released**: April 30, 2024

### Bug Fixes

#### Core

* Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.22.1

**Released**: March 13, 2024

### Bug Fixes

#### ID

- Fixed a licensing issue where a Barcode Scanner license was wrongly required when scanning the back side of a UK driver’s license.

## 6.22.0

**Released**: February 16, 2024

### New Features

#### Barcode

- [SparkScan](/sdks/capacitor/sparkscan/intro.md) is a camera-based solution for high-speed single scanning and scan-intensive workflows. It includes an out-of-the-box user interface optimized for efficiency and a frictionless worker experience.
- Added QR symbology extension called `strict` to suppress rare QR reader false positives. `strict` reduces the scan robustness of damaged codes.

#### ID

- Improved the accuracy of `AamvaVizBarcodeComparisonVerifier`.
- Added `id.ui.IdCaptureOverlay.SetFrontSideTextHint` that allows to set custom text for textual hint displayed when scanning the front of document.
- Added `id.ui.IdCaptureOverlay.SetBackSideTextHint` that allows to set custom text for textual hint displayed when scanning the back of document.
- Replay the flip document animation when the user keeps scanning the wrong side of the document.

### Performance Improvements

#### Barcode

- Further improved QR code scan performance of codes occluded by glare.
- Improved scan performance for 1D barcodes with missing or damaged quiet zones.

### Behavioral Changes

#### Core

- Removed OkHttp dependency for API requests in favor of the Scandit internal client.

### Bug Fixes

#### Barcode

- Fixed a bug in handling of active symbol counts for Codabar.

#### ID

- Fixed an issue where US Border Crossing Cards were not recognized.

## 6.21.3

**Released**: March 5, 2024

No updates for this framework in this release.

## 6.21.2

**Released**: January 19, 2024

### Bug Fixes

#### ID

- Fixed an issue where US Border Crossing Cards were not recognized.
Fixed Id Verification Zone Comparison reported erroneously as not included in a license for some licenses that, in fact, include it.

## 6.21.1

**Released**: December 22, 2023

No updates for this framework in this release.

## 6.21.0

**Released**: December 8, 2023

### New Features

#### Barcode

- Added support for QR model 1 codes (legacy format).
- Added support for UPU 4-State codes with fluorescent orange ink (`fluorescent_orange_ink` extension, see also Symbology Properties).

#### ID

- Added `id.DateResult.LocalDate` and `id.DateResult.UtcDate` which convert the date result to `System.DateTime` using device’s local time zone or the UTC time zone respectively. They replace `id.DateResult.Date`, which is now deprecated.
- `id.IdCapture` now supports capturing the information from the PDF417 barcode of a US Common Access Card (CAC).
- Added support for `id.IdDocumentType.PassportViz`.
- Added `id.CapturedId.DocumentAdditionalNumber` which represents the additional number of the document.
- Added support for `id.ColombiaDlBarcodeResult`.
- Added `id.IdCaptureFeedback`. ID Capture allows to configure sound and vibration feedback to emit when a document is captured, rejected or the timeout occurs. By default the feedback is emitted when a document is captured.
- Added `id.AamvaBarcodeResult.FirstNameWithoutMiddleName`.

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


## 6.20.3

**Released**: January 18, 2024

No updates for this framework in this release.

## 6.20.2

**Released**: December 14, 2023

### Bug Fixes

* Fixed a crash (SIGILL) on Samsung Galaxy S9 (Exynos 9810 based) with Android version 8.

## 6.20.1

**Released**: November 28, 2023

### Bug Fixes

* Fixed a crash when scanning AAMVA driver's license barcodes that contain non-ASCII characters.
* Fixed an issue with scanning United Arab Emirates Resident IDs when `id.IdDocumentType.IdCardViz` and `id.SupportedSides.FrontAndBack` are selected.

## 6.20.0

**Released**: November 7, 2023

### New Features

#### ID

- For ID cards issued by the United Arab Emirates data parsed from the Machine Readable Zone (MRZ) is now returned automatically when `id.IdDocumentType.IdCardViz` and `id.SupportedSides.FrontAndBack` are selected.

### Bug Fixes

#### Core

- Fixed data races in `core.ui.DataCaptureView` that have a low probability of resulting in crashes.

## 6.19.8

**Released**: November 22, 2023

No updates for this framework in this release.

## 6.19.7

**Released**: November 15, 2023

### Bug Fixes

#### Core

- Fixed an issue affecting the iPhone 15 Pro/Pro Max where, after using the camera with 4k resolution and 4:3 aspect ratio, using another camera with a different resolution/aspect ratio would not work.
- Fixed an issue affecting devices running iOS 17 and supporting macro mode, which prevented the camera from switching between wide and ultra-wide cameras.

#### ID

- Fixed a crash when scanning AAMVA driver's license barcodes that contain non-ASCII characters.

## 6.19.6

**Released**: November 10, 2023

No updates for this framework in this release.

## 6.19.5

**Released**: November 3, 2023

No updates for this framework in this release.

## 6.19.4

**Released**: November 1, 2023

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

### Bug Fixes

#### Barcode

- Adjusted the recommended camera settings for all capture modes to improve their performance.

## 6.19.0

**Released**: September 19, 2023

### New Features

#### ID

- Added support for extracting information in Arabic script for several documents.

### Performance Improvements

#### Barcode

- Improved performance when a lot of symbologies are enabled when using `barcode.BarcodeCapture`.
- Added support for Code128 with damaged end patterns (missing, fused or covered bars). This support is automatically disabled if “strict mode” is selected.
- Improved QR code reader robustness for medium to large codes with small local deformations (e.g. crumpling, bending) or damage.
- Improved responsiveness of AR overlays in MatrixScan and Barcode Selection.

### Bug Fixes

#### ID

- Fixed an issue where it was not possible to scan certain Vietnamese passports.
- Fixed an issue where it was sometimes not possible to scan a barcode from a Pennsylvania driver’s license.
- Fixed an issue that caused a failure of the `id.AamvaVizBarcodeComparisonVerifier` for valid IDs.
- Fixed an issue where scanning MRZ documents in ID Capture incorrectly displayed dates for year 2000.

## 6.18.3

**Released**: November 14, 2023

No updates for this framework in this release.

## 6.18.2

**Released**: August 3, 2023

No updates for this framework in this release.

## 6.18.1

**Released**: July 12, 2023

No updates for this framework in this release.

## 6.18.0

**Released**: June 30, 2023

### Performance Improvements

#### Barcode

- Improved Aztec code scan performance for bent and crumpled codes which is especially important for Railway tickets.
- Improved scan performance of up-side-down codes for 1D fixed-length symbologies (e.g. EAN/UPC).
- Improved scan performance for long rectangular MicroQR (rMQR) codes with perspective distortion.
- Reduced CPU usage when data-matrix is enabled by a factor of 3 in many situations.

### Bug Fixes

- Fixed an issue causing internal plugin event emitters to have improper cleanup, which could in turn affect API listeners.

#### Barcode

- Fixed a `barcode.selection.BarcodeSelection` issue where the “toggle selection” setting was ignored and the scanner was acting as in “repeat selection” mode when `BarcodeSelectionSettings.SingleBarcodeAutoDetection` was enabled.

### Deprecations

#### Barcode

- :`barcode.tracking.TrackedBarcode.ShouldAnimateFromPreviousToNextState` has been deprecated. :prop:`barcode.tracking.TrackedBarcode.Location` returns a continuously interpolated location so animating between locations is no longer needed.

## 6.17.3

**Released**: December 6, 2023

No updates for this framework in this release.

## 6.17.2

**Released**: May 23, 2023

### Behavioral Changes

#### ID

- Further improved requirements for document number comparison checks in `id.AamvaVizBarcodeComparisonVerifier`.

## 6.17.1

**Released**: April 28, 2023

### Bug Fixes

#### ID

- Fixed an issue with license error being shown when scanning driver licenses in ID Capture without barcode feature.

### Behavioral Changes

#### ID

- Improved requirements for expiration date, issue date and document number comparison checks in `id.AamvaVizBarcodeComparisonVerifier`.

## 6.17.0

**Released**: April 26, 2023

### New Features

#### Barcode

- Added support for damaged QR and Micro QR finder patterns up to two borders can be missing/damaged.
- Added `core.IFrameData` getters to: 
  - `barcode.IBarcodeCaptureListener.OnBarcodeScanned`
  - `barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated`
  - `barcode.selection.IBarcodeSelectionListener.OnSessionUpdated`
  - `barcode.selection.IBarcodeSelectionListener.OnSelectionUpdated`
  - `text.ITextCaptureListener.OnTextCaptured`

#### ID

- For ID documents issued by European Union countries data parsed from the Machine Readable Zone (MRZ) is now returned automatically when `id.IdDocumentType.DlViz` and `id.SupportedSides.FrontAndBack` are selected.
- Improved support for parsing barcode data of mobile driver’s licenses (mDL) issued by the US state of Colorado.
- Added `core.IFrameData` getters to `text.ITextCaptureListener.OnTextCaptured`.

### Bug Fixes

#### Barcode

- Fixed an issue that prevented certain color-inverted Aztec codes from decoding.
- Fixed a rare crash in the Aztec code reader.
- Fixed a failure in the MicroPDF417 error correction when missing rows at the bottom of a code.

#### Core

- Updated the camera behavior to overcome the scanning challenges found on the iPhone 13 Pro (Max) and iPhone 14 Pro (Max) when using the built-in camera for barcode scanning. Our testing showed that barcodes that are less than 2 cm or ~1 inch in size (and usually have such small features) were impacted.

#### ID

- Fixed an issue with license error being shown when scanning driver licenses in ID Capture without barcode feature.

### Deprecations

#### ID

- Deprecated `id.ui.IdCaptureOverlay.SetIdLayout`.