---
toc_max_heading_level: 3
displayed_sidebar: reactnativeSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: react
keywords:
  - react
---

## 6.28.0-beta-1

**Released**: September 10, 2024

### New Features

#### Barcode

* Added [`barcode.pick.ui.RectangularWithIcons.StatusIconSettings`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html#property-scandit.datacapture.barcode.pick.ui.RectangularWithIcons.StatusIconSettings) property to apply a `barcode.pick.ui.BarcodePickStatusIconSettings` object and customize the status icons appearances.
* Added ability to customize the minimum width and height of the highlights in the [`scandit.datacapture.barcode.pick.ui.Rectangular`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular.html) and [`scandit.datacapture.barcode.pick.ui.RectangularWithIcons`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-pick-view-highlight-style-rectangular-with-icons.html) highlight styles.
* On Barcode Capture and SparkScan, we optimized the frame processing time in 4k-UHD resolution with dynamic resolution selection, resulting in up to 35% reduction on high-end devices and consistent performance improvements across all supported devices.
platforms.

#### ID

* ID Capture supports scanning the Visual Inspection Zone (VIZ) of New York City IDs.

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

**Released**: September 6, 2024

### API Changes

#### Barcode

- - [`BarcodeTrackingAdvancedOverlay`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#) and [`BarcodeTrackingAdvancedOverlayListener`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#) have been re-added, with the following changes:
  - The [`BarcodeTrackingAdvancedOverlay.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode) and [`BarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) methods no longer support rendering any kind of images. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

## 6.27.0

**Released**: September 5, 2024

### API Changes

#### Barcode

- The `BarcodeTrackingAdvancedOverlay` and `BarcodeTrackingAdvancedOverlayListener` have been removed. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### Barcode

* Added torch control to BarcodeCount with [`BarcodeCountView.shouldShowTorchControl`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowTorchControl) and [`BarcodeCountView.torchControlPosition`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.TorchControlPosition) to control visibility and position in [`BarcodeCountView`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView).

#### ID

* Added [`AamvaVizBarcodeComparisonResult.frontMismatchImage`](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.FrontMismatchImage) that highlights data fields on the front side of the document differing from the data encoded in the barcode. Please contact [Scandit Support](mailto:support@scandit.com) if you want to use this feature.

#### Parser

* The [Parser](./parser/get-started.md) has been expanded to support the IATA Bar Coded Boarding Pass (BCBP). [`ParserDataFormat.IataBcbp`](https://docs.scandit.com/data-capture-sdk/react-native/parser/api/parser-data-format.html#value-scandit.datacapture.parser.ParserDataFormat.IataBcbp) supports the latest specifications from the 2023-2024 Passenger Services Conference Resolution Manual (PSCRM). For the complete documentation of the standard please refer to [`the official website`](https://www.iata.org/en/programs/passenger/common-use/).
* SwissQR parser: parsing issues are now reported as error code and message pairs, see [`ParserIssue`](https://docs.scandit.com/data-capture-sdk/react-native/parser/api/parser-issue.html#class-scandit.datacapture.parser.ParserIssue). [`ParsedField.warnings`](https://docs.scandit.com/data-capture-sdk/react-native/parser/api/parsed-field.html#property-scandit.datacapture.parser.ParsedField.Warnings) contains all the issues for a given field. Query all the fields with issues by calling [`ParsedData.fieldsWithIssues`](https://docs.scandit.com/data-capture-sdk/react-native/parser/api/parsed-data.html#property-scandit.datacapture.parser.ParsedData.FieldsWithIssues).

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/data-capture-sdk/react-native/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/data-capture-sdk/react-native/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

### Performance Improvements

#### Barcode

* Improved ArUco scanning when color inverted codes are enabled.
* Improved tracking robustness on Barcode Count.
* Significantly lowered the rate of false positives (i.e., presumed unscanned barcodes) when using Barcode Count.
* Improved recognition rate for Composite Codes, with a particular focus on codes with small 2d components (e.g. PDF417).
* Improved recognition rate of linear codes which are partially affected by damage or covered in plastic wrap, with a particular focus on Codabar barcodes.
* Improved localization of postal codes, up to 25% faster.

### Bug Fixes

#### Barcode

* Fixed an issue where the Barcode Generator could throw an exception on iOS.

#### ID

* Fixed an error 255 that would prevent capturing MRZ for some license keys, for which this feature was enabled.

#### Core

* Fixed an issue where subsequent scans would fail due to improper context handling in React Native debug mode.
* Fixed an issue where having no camera available resulted in failure to return from the `switchCameraToState` call.

### Deprecations

* Deprecated [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) in favor of [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving).
* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/data-capture-sdk/react-native/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/data-capture-sdk/react-native/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/react-native/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/data-capture-sdk/react-native/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).

## 6.25.3

**Released**: September 2, 2024

### Bug Fixes

- Concatenated ArUco codes are now comma-separated.

## 6.25.2

**Released**: August 2, 2024

#### Core

- Fixed a rare reference table overflow by reducing the number of global refs created.

## 6.25.1

**Released**: August 1, 2024

### Bug Fixes

#### Barcode

- Fixed an issue in MatrixScan Count that was causing a reset after a rotation.
- Fixed an issue where the Barcode Generator could throw an exception on iOS.

#### ID

- Fixed an error 255 that would prevent capturing MRZ for some licenses where this feature is supposed to be enabled.

#### Core

- Fixed an issue where having no frame source available resulted in failure to return from the `core.IFrameSource.SwitchToDesiredStateAsync` call.
- Fixed an issue where subsequent scans would fail due to improper context handling in React Native debug mode.
- Fixed a crash using camera API 2 where an `IllegalStateException` could be thrown in some edge cases.

## 6.25.0

**Released:** July 5, 2024

### New Features

#### Barcode

* Added the ability to hide the progress bar when counting against a list with BarcodeCount: [`BarcodeCountView.shouldShowListProgressBar`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowListProgressBar).

#### ID

* Added the following properties to [`SDCVizResult`](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#viz-result):
  - `SDCVizResult.bloodType` to represent the blood type of the document owner.
  - `SDCVizResult.sponsor` to represent the sponsor of the document owner.
  - `SDCVizResult.mothersName` to represent the mother’s name of the document owner.
  - `SDCVizResult.fathersName` to represent the father’s name of the document owner.
* Added [`IdCaptureSettings.rejectVoidedIds`](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectVoidedIds). When enabled, documents voided by authorities are rejected.
  :::warning
  This feature currently supports 3 kinds of invalidation: Cut corners, holes punched in the document, and “VOID” perforations. Additionally, this feature currently supports only US Driver’s Licenses, and has no effect when scanning other document types.
  :::
* Added [`RejectedId.rejectionReason`](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/rejected-id.html#property-scandit.datacapture.id.RejectedId.RejectionReason) which contains the reason the document was rejected.
* Improved the extraction of the document number from UK driver’s licenses.
* Added _scandit-react-native-datacapture-id-voided-detection_ library that must be included when activating `IdCaptureSettings.rejectVoidedIds`.

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

- **Improved Scanning Range**: Enhanced scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels by 30-40% in both Full HD and 4K without compromising scanning speed. This improvement benefits scanning tiny barcodes and ESLs, especially those on top or bottom shelves.

- **Smart Battery Management**: Introduced smart battery management to lower energy consumption and increase device uptime. Tests show up to a 15% improvement in battery life. This option is disabled by default but can be enabled via `BarcodeCaptureSettings.batterySavingMode`.

- **User-Facing Camera**: SparkScan now allows switching to the user-facing camera for scanning, useful in scenarios where the rear camera is not accessible or barcodes are hard to reach. See `SparkScanView.cameraSwitchButtonVisible`.

- **Barcode Generation**: Added `BarcodeGenerator` class, allowing the generation of Code 39, Code 128, EAN13, ITF, QR, UPCA, and DataMatrix codes directly in the SDK.

- **New Symbology Supports**:
  - **Symbology.FrenchPost**: Recognizes postal codes used by the French Post.
  - **Symbology.AustralianPost**: Decodes misprinted Australian Post codes.

#### ID

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IdCaptureListener.didTimeoutInSession()` to be invoked whenever a document is localized for a period but not captured.

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
  - **Lifecycle Methods**:
    - When the AppState changes to active, `BarcodePickView.resume()` should be called.
    - When the AppState changes to inactive or background, `BarcodePickView.pause()` should be called.
  - **Start/Stop Scanning**:
    - `BarcodePickView.start()`: Starts the scanning flow and can be manually stopped by calling `BarcodePickView.stop()`. It will be stopped automatically when `BarcodePickView.pause()` is called and resumed with `BarcodePickView.resume()`.
    - `BarcodePickView.stop()`: Stops the scanning flow and can be manually started by calling `BarcodePickView.start()`.

:::note
Scanning is only possible when in resumed state, meaning `BarcodePickView.start()` won’t start the scanning flow if `BarcodePickView.resume()` isn’t called before or afterwards.
:::

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

- Fixed crash (SIGILL) on Exynos 9810-based Galaxy S9 and Galaxy S9+ devices that advertise support for FP16 arithmetics. A previous fix in 6.21.0 only partially resolved the issue.
- Removed unused code and updated the privacy manifest to conform to the [new privacy requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files).

## 6.23.1

**Released**: April 24, 2024

* Added support for Mexican Matrícula Consular MRZ codes.
* Improved ID scanning performance in low-light conditions.
* Fixed truncated surnames in US driver’s licenses using magnetic stripe format.

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
- Barcode Pick is an API that implements MatrixScan Pick. MatrixScan Pick is an out-of-the-box scan solution that uses real-time inventory data and augmented reality to assign precise, item-specific tasks, guaranteeing pinpoint accuracy in restocking, inventory audits, and parcel delivery. Barcode Pick is no longer in beta.
- Added support for `Symbology.AUSTRALIANPOST`. By default, customer information is decoded with Table N, and Table C is used as a fallback. To set a specific decoding table for the customer information, use the symbology extensions: `force_table_c` or `force_table_n` to enforce decoding with either C or N tables respectively. The symbology extension `decode_bar_states` returns the error-corrected customer information bars as a string of the bar states: A for ascending, D for descending, T for tracker, and F for full.
- Added support for `Symbology.Upu4State`.

#### ID

* Added `id.ui.IdCaptureOverlay.TextHintPosition` that allows setting of text hints position.
* Added `id.ui.IdCaptureOverlay.ShowTextHints` for showing/hiding text hints.
* It is now possible to run basic authenticity checks on VIZ & MRZ documents by comparing the data from the VIZ with the data decoded from the MRZ. Check `id.VizMrzComparisonVerifier` for details. This feature is currently in beta, and may still change significantly in the next releases.

### Performance Improvements

#### Barcode

- Improved tracking robustness for low-end devices in MatrixScan Count.

#### ID

- Improved ID scanning performance in low-light conditions.

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

* Deprecated `barcode.spark.ui.SparkScanScanningPrecision`. Replaced by `barcode.spark.ui.SparkScanPreviewBehavior` because the "accurate" workflow has been simplified.
* Deprecated `barcode.spark.ui.SparkScanScanningModeTarget` and `barcode.spark.ui.SparkScanScanningModeDefault` initializers that accepted `barcode.spark.ui.SparkScanScanningPrecision`. Replaced by initializers that accept `barcode.spark.ui.SparkScanPreviewBehavior` instead.
* Deprecated `barcode.spark.ui.SparkScanView.ShouldShowTargetModeHint` and `barcode.spark.ui.SparkScanView.TargetModeHintText`. This hint is not displayed anymore due to changes in `barcode.spark.ui.SparkScanScanningModeTarget` scanning mode.
* Deprecated 'barcode.spark.ui.SparkScanToastSettings.CameraTimeoutMessage' because toast with this message is not displayed anymore due to changes in the SparkScan toast system.
* Deprecated `barcode.spark.ui.SparkScanViewSettings.TargetZoomFactorOut` and `barcode.spark.ui.SparkScanViewSettings.TargetZoomFactorIn`. Replaced by `barcode.spark.ui.SparkScanViewSettings.ZoomFactorOut` and `barcode.spark.ui.SparkScanViewSettings.ZoomFactorIn`.
* Deprecated `barcode.spark.ui.SparkScanViewSettings.ContinuousCaptureTimeout`. Replaced by `barcode.spark.ui.SparkScanViewSettings.InactiveStateTimeout`.
* Deprecated `barcode.spark.ui.SparkScanViewFeedback`, `barcode.spark.SparkScanFeedback`, `barcode.spark.ui.SparkScanView.Brush` and `barcode.spark.ui.SparkScanView.emitFeedback`. These classes and methods are not used anymore. Use `barcode.spark.feedback.SparkScanBarcodeFeedback` and `barcode.spark.ui.SparkScanView.FeedbackDelegate`.