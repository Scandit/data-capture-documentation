---
toc_max_heading_level: 4
displayed_sidebar: xamarinAndroidSidebar
hide_title: true
title: Release Notes
pagination_prev: null
---

## 6.27.0

**Released**: September 19, 2024

### New Features

#### ID

* ID Capture supports scanning the Visual Inspection Zone (VIZ) of New York City IDs.

### Bug Fixes

#### Barcode

* Fixed result data encoding classification for raw byte data in 2d barcodes, in particular for Shift-JIS encoding.
* Resolved cases in which Smart Scan Intention was possibly reporting the wrong barcode when when the camera was quickly changing direction with a single barcode in the scene.
* Fixed an issue where it was not possible to scan non-fluorescent French-Post barcodes without the extension `fluorescent_orange_ink`.

## 6.26.0

**Released**: August 15, 2024

### Behavioral Changes

#### Barcode

* Default value of [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) (deprecated) and [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving) has been changed from [`BatterySavingMode.OFF`](https://docs.scandit.com/data-capture-sdk/xamarin.android/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Off) to [`BatterySavingMode.AUTO`](https://docs.scandit.com/data-capture-sdk/xamarin.android/core/api/battery-saving.html#value-scandit.datacapture.core.BatterySavingMode.Auto).

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

### Deprecations

* Deprecated [`SparkScanSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcodes), prefer [`SparkScanSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSession.newlyRecognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcodes), prefer [`BarcodeCaptureSession.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-session.html#property-scandit.datacapture.barcode.BarcodeCaptureSession.NewlyRecognizedBarcode).
* Deprecated [`BarcodeCaptureSettings.batterySavingMode`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode) in favor of [`BarcodeCaptureSettings.batterySaving`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySaving).
* Deprecated [`BarcodeTrackingScenario`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-tracking-scenario.html#enum-scandit.datacapture.barcode.tracking.BarcodeTrackingScenario) and [`BarcodeTrackingSettings.forScenario()`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.ForScenario). Setting a scenario is no longer recommended, [`BarcodeTrackingSettings.BarcodeTrackingSettings()`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.BarcodeTrackingSettings) should be used instead.
* Deprecated [`TextCapture`](https://docs.scandit.com/data-capture-sdk/xamarin.android/text-capture/api/text-capture.html#class-scandit.datacapture.text.TextCapture).
* Deprecated [`SparkScanView.shouldShowScanAreaGuides`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.ShouldShowScanAreaGuides), [`SparkScanView.soundModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.SoundModeButtonVisible), [`SparkScanView.hapticModeButtonVisible`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.HapticModeButtonVisible) and [`SparkScanView.fastFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FastFindButtonVisible) (renamed [`SparkScanView.barcodeFindButtonVisible`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.BarcodeFindButtonVisible)). Also deprecated [`SparkScanViewUiListener.onFastFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnFastFindButtonTap) (renamed [`SparkScanViewUiListener.onBarcodeFindButtonTap()`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.ISparkScanViewUiListener.OnBarcodeFindButtonTap)).
* Deprecated [`LaserlineViewfinder`](https://docs.scandit.com/data-capture-sdk/xamarin.android/core/api/laserline-viewfinder.html#class-scandit.datacapture.core.ui.LaserlineViewfinder).
* Deprecated Legacy value of the [`RectangularViewfinder`](https://docs.scandit.com/data-capture-sdk/xamarin.android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder).
* Deprecated Legacy value of the [`BarcodeCaptureOverlayStyle`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-capture-overlay.html#enum-scandit.datacapture.barcode.ui.BarcodeCaptureOverlayStyle).
* Deprecated Legacy value of the [`BarcodeTrackingBasicOverlayStyle`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#enum-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlayStyle).

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

* Added the ability to hide the progress bar when counting against a list with BarcodeCount: [`BarcodeCountView.shouldShowListProgressBar`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-count-view.html#property-scandit.datacapture.barcode.count.ui.BarcodeCountView.ShouldShowListProgressBar).
* Introduced smart battery management to lower the energy consumption and increase the up-time of the device. In our tests of repeatedly scanning a sequence of 5 different labels mimicking the user movement, this led to an improvement of up to 15% in battery life.
  - This option is disabled by default, but can be enabled via [`BarcodeCaptureSettings.BatterySavingMode`](https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.BatterySavingMode), deciding whether it’s automatic, always on or always off (default).

#### ID

* Improved the extraction of the document number from UK driver’s licenses.
* Added [`AamvaBarcodeResult.FirstNameWithoutMiddleName`](https://docs.scandit.com/data-capture-sdk/xamarin.android/id-capture/api/aamva-barcode-result.html#property-scandit.datacapture.id.AamvaBarcodeResult.FirstNameWithoutMiddleName).
* Added the following properties to [`IdCaptureOverlay`](https://docs.scandit.com/data-capture-sdk/xamarin.android/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay):
  - `IdCaptureOverlay.TextHintPosition` that allows setting of textual hint position.
  - `IdCaptureOverlay.ShowTextHints` for showing/hiding text hints.
  - `IdCaptureOverlay.SetFrontSideTextHint()` that allows to set custom text for textual hint displayed when scanning the front of document.
  - `IdCaptureOverlay.SetBackSideTextHint()` that allows to set custom text for textual hint displayed when scanning the back of document.

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

- **Smart Scan Intention**: Introduced a new algorithm that intelligently identifies and scans the intended barcode, reducing errors. Enabled by default in SparkScan (`SparkScanSettings.ScanIntention`) and can be manually set in Barcode Capture (`BarcodeCaptureSettings.ScanIntention`).

- **Improved Scanning Range**: Enhanced scanning range for 1D barcodes on Electronic Shelf Labels (ESL) and paper shelf labels by 30-40% in both Full HD and 4K without compromising scanning speed. This improvement benefits scanning tiny barcodes and ESLs, especially those on top or bottom shelves.

- **User-Facing Camera**: SparkScan now allows switching to the user-facing camera for scanning, useful in scenarios where the rear camera is not accessible or barcodes are hard to reach. See `SparkScanView.CameraSwitchButtonVisible`.

- **New Symbology Support**:
  - **Symbology.AustralianPost**: Added support for decoding misprinted Australian Post codes.

#### ID

- **State-Specific Thresholds in ID Verification**: Added support for per-state thresholds and removed the hardcoded number of features. This is a breaking change; old verification models will not work.

- **Timeout Callback Modification**: Modified `IIdCaptureListener.OnIdCaptureTimedOut()` to be invoked whenever a document is localized for a period but not captured.

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

- **Battery Saving Mode**: Changed from `BatterySavingMode.Off` to `BatterySavingMode.Auto`. This can be changed via `SparkScanSettings.BatterySaving`.

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