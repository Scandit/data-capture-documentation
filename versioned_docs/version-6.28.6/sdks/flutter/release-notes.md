---
toc_max_heading_level: 3
displayed_sidebar: flutterSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: flutter
keywords:
  - flutter
---

## 6.28.6

**Released**: July 24, 2025

### Bug Fixes

#### ID

* Fixed an issue where preexisting OTA models on the device, if any, would be loaded instead of the latest model for the SDK version, leading to errors.

## 6.28.5

**Released**: April 4, 2025

No updates for this framework in this release.

## 6.28.4

**Released**: February 14, 2025

### Bug Fixes

#### Core

* Fixed an issue which reduced scans for low-resolution and blurry codes affected by distortion or damage, when multiple symbologies were enabled.
* Fixed an issue where scanned blurry codes locations are sometimes flipped.

## 6.28.3

**Released**: December 23, 2024

### Bug Fixes

#### Core

* Fixed an issue causing the `SparkScanView` to not be rendered on top of the host application content.

## 6.28.2

**Released**: December 12, 2024

No updates for this framework in this release.

## 6.28.1

**Released**: October 29, 2024

### Bug Fixes

#### Barcode

* Fixed an issue where the camera was not being released when closing the `SparkScanView`.
* Fixed an issue with initialization of the Flutter plugins when used in combination with the Firebase plugin.

## 6.28.0

**Released**: October 8, 2024

### New Features

#### Barcode

* Added [`barcode.count.ui.BarcodeCountView.ShouldShowTorchControl`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowTorchControl) and [`barcode.count.ui.BarcodeCountView.TorchControlPosition`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.TorchControlPosition) to control a torch button and its position in `barcode.count.ui.BarcodeCountView`.
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

### Bug Fixes

#### Barcode

* Fixed an issue with the unsubscribe mechanism for the [`SparkScanView.FeedbackDelegate`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FeedbackDelegate).

## 6.27.1

**Released**: September 6, 2024

### API Changes

#### Barcode

- [`BarcodeTrackingAdvancedOverlay`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#) and [`BarcodeTrackingAdvancedOverlayListener`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#) have been re-added, with the following changes: 
  - The [`BarcodeTrackingAdvancedOverlay.ViewForTrackedBarcode()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode) and [`BarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) methods no longer support rendering any kind of images. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

## 6.27.0

**Released**: September 5, 2024

### API Changes

#### Barcode

- The `BarcodeTrackingAdvancedOverlay` and `BarcodeTrackingAdvancedOverlayListener` have been removed. For further details about this backwards incompatible change, contact [Scandit Support](mailto:support@scandit.com).

### Bug Fixes

#### Barcode

- Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when the camera was quickly changing direction with a single barcode in the scene.
- Fixed an issue where some updates to `SparkScanView` properties were not being propagated to the view.

## 6.26.0

**Released**: August 15, 2024

### New Features

#### ID

* Added [`AamvaVizBarcodeComparisonResult.frontMismatchImage`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/id-capture/api/aamva-viz-barcode-comparison-verifier.html#property-scandit.datacapture.id.AamvaVizBarcodeComparisonResult.FrontMismatchImage) that highlights data fields on the front side of the document differing from the data encoded in the barcode. Please contact [Scandit Support](mailto:support@scandit.com) if you want to use this feature.

#### Parser

* The [Parser](./parser/get-started.md) has been expanded to support the IATA Bar Coded Boarding Pass (BCBP). [`ParserDataFormat.IataBcbp`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/parser/api/parser-data-format.html#value-scandit.datacapture.parser.ParserDataFormat.IataBcbp) supports the latest specifications from the 2023-2024 Passenger Services Conference Resolution Manual (PSCRM). For the complete documentation of the standard please refer to [`the official website`](https://www.iata.org/en/programs/passenger/common-use/).
* SwissQR parser: parsing issues are now reported as error code and message pairs, see [`ParserIssue`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/parser/api/parser-issue.html#class-scandit.datacapture.parser.ParserIssue). [`ParsedField.warnings`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/parser/api/parsed-field.html#property-scandit.datacapture.parser.ParsedField.Warnings) contains all the issues for a given field. Query all the fields with issues by calling [`ParsedData.fieldsWithIssues`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/parser/api/parsed-data.html#property-scandit.datacapture.parser.ParsedData.FieldsWithIssues).

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

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

* Fixed an issue where the Flutter modules would not initialize correctly when integrating them into a native Android app.

### Deprecations

* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinderStyle`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/laserline-viewfinder.html#enum-scandit.datacapture.core.ui.LaserlineViewfinderStyle).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).

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

## 6.25.0

**Released:** July 5, 2024

### New Features

#### Barcode

* Added the possibility to scan barcodes that are using the structured append mode to encode data across multiple codes. Check [Barcode.structuredAppendData](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode.html#property-scandit.datacapture.barcode.Barcode.StructuredAppendData) for more information.
* Added the ability to hide the progress bar when counting against a list with BarcodeCount: [`BarcodeCountView.shouldShowListProgressBar`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowListProgressBar).

#### ID

* Added the following properties to [`SDCVizResult`](https://docs.scandit.com/6.28/data-capture-sdk/web/id-capture/api/viz-result.html#viz-result):
  - `SDCVizResult.bloodType` to represent the blood type of the document owner.
  - `SDCVizResult.sponsor` to represent the sponsor of the document owner.
  - `SDCVizResult.mothersName` to represent the mother’s name of the document owner.
  - `SDCVizResult.fathersName` to represent the father’s name of the document owner.
* Added [`IdCaptureSettings.rejectVoidedIds`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectVoidedIds). When enabled, documents voided by authorities are rejected.
  :::warning
  This feature currently supports 3 kinds of invalidation: Cut corners, holes punched in the document, and “VOID” perforations. Additionally, this feature currently supports only US Driver’s Licenses, and has no effect when scanning other document types.
  :::
* Added [`RejectedId.rejectionReason`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/id-capture/api/rejected-id.html#property-scandit.datacapture.id.RejectedId.RejectionReason) which contains the reason the document was rejected.
* Improved the extraction of the document number from UK driver’s licenses.
* Added _scandit-flutter-datacapture-id-voided-detection_ library that must be included when activating `IdCaptureSettings.rejectVoidedIds`.

### Performance Improvements

#### Barcode

* Improved recognition rate for Composite A and Composite B barcodes, thanks to an increased robustness for small and low resolution MicroPDF417.
* Improved recognition rate of long, thin linear 1d codes, such as those found on electronic shelf labels (ESLs).
* Improved recognition rate of linear codes which are partially affected by damage or glare, with a particular focus on codabar barcodes.

#### ID

* Improved the accuracy of the AAMVA Barcode Verification.

### Bug Fixesq

* Fixed a compatibility issue with Flutter version >= 3.22.0. Because of this [breaking change](https://github.com/flutter/flutter/pull/140165) we were forced to increase our minimum supported Flutter version to 3.22.0.

#### Barcode

* Fixed the update of the barcode capture success feedback.

## 6.24.0

**Released**: May 8, 2024

### New Features

#### Barcode

- **Smart Scan Intention**: Introduced a new algorithm that intelligently identifies and scans the barcode that the user intends to capture, reducing errors. Enabled by default in SparkScan (`SparkScanSettings.scanIntention`) and can be manually set in Barcode Capture (`BarcodeCaptureSettings.scanIntention`).

- **Improved Scanning Range**: Enhanced scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels by 30-40% in both Full HD and 4K without compromising scanning speed. This improvement enables the fastest and most ergonomic scanning experience for tiny barcodes and ESLs, particularly those placed on top or bottom shelves.

- **Smart Battery Management**: Introduced smart battery management to lower energy consumption and increase the up-time of the device. Tests show up to a 15% improvement in battery life. This option is disabled by default but can be enabled via `BarcodeCaptureSettings.batterySavingMode`, with settings for automatic, always on, or always off (default).

- **User-Facing Camera**: SparkScan now allows switching to the user-facing camera for scanning, useful in scenarios where the rear camera is not accessible or barcodes are hard to reach. See `SparkScanView.cameraSwitchButtonVisible`.

- **New Symbology Supports**:
  - **Symbology.frenchPost**: Allows the recognition of postal codes (code postal) used by the French Post.
  - **Symbology.australianPost**: Added support for decoding misprinted Australian Post codes.

#### ID

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IdCaptureListener.didTimedOut()` to be invoked whenever a document is localized for a period of time but could not be captured.

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

- **Battery Saving Mode**: Changed from `BatterySavingMode.off` to `BatterySavingMode.auto`. This can be changed via `SparkScanSettings.batterySaving`.

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
    - When a widget is shown or when `AppLifecycleState` is `AppLifecycleState.resumed`, `BarcodePickView.resume()` should be called.
    - When you navigate to a new widget, hide the widget, or `AppLifecycleState` is not `AppLifecycleState.resumed`, `BarcodePickView.pause()` should be called.
  - **Start/Stop Scanning**:
    - `BarcodePickView.start()`: Starts the scanning flow and can be manually stopped by calling `BarcodePickView.stop()`. It will be stopped automatically when `BarcodePickView.pause()` is called and resumed with `BarcodePickView.resume()`.
    - `BarcodePickView.stop()`: Stops the scanning flow and can be manually started by calling `BarcodePickView.start()`.

:::note
Scanning is only possible when in resumed state, meaning `BarcodePickView.start()` won’t start the scanning flow if `BarcodePickView.resume()` isn’t called before or afterwards.
:::