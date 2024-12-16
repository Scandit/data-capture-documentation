---
toc_max_heading_level: 3
displayed_sidebar: androidSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: android
keywords:
  - android
---

## 7.0.1

**Released**: December 18, 2024

No updates for this framework in this release.

## 7.0.0

**Released**: November 29, 2024

### New Features

Scandit's Smart Data Capture SDK v7.0 addresses the industry's toughest scanning challenges with innovative solutions at every layer. Our enhanced scanning engine is context-aware, understanding both the environment and user needs. This results in smoother integrations, a richer user experience, and improved scanning performance without compromising flexibility.

Version 7.0 also offers increased versatility by supporting multiple input formats including text and barcodes.

SparkScan, our flagship barcode scanning product, embodies the full potential of v7.0 with its versatile user interface coupled with a robust, out-of-the-box scanning engine. SparkScan's success is a testament to our commitment to delivering seamless, high-performance camera-based scanning solutions.

#### Barcode

* SparkScan introduces a completely redesigned user interface, enhancing ergonomics with a simplified API and in-demand customization options. These updates make SparkScan even more versatile, seamlessly integrating with various use cases and blending smoothly into any existing workflow and UI. See the [migration guide](/migrate-6-to-7.md#sparkscan) for more details.
* Added the `remove_delimiter_data` extension to the CODABAR symbology.
* MatrixScan Find now uses a 4:3 aspect ratio, providing a significantly larger field of view for enhanced scanning accuracy and coverage.
* MatrixScan Count users can now further classify the "not in list" barcodes when scanning against a list. Tapping on them will show a popup where the barcodes can be accepted or rejected. Check `barcode.count.ui.BarcodeCountView.BarcodeNotInListActionSettings` to enable and customize the functionality. The classified barcodes will be added to `barcode.count.BarcodeCountCaptureListSession.AcceptedBarcodes` or `barcode.count.BarcodeCountCaptureListSession.RejectedBarcodes`.
* SparkScan now provides the ability to switch between SparkScan and Smart Label Capture via a button in the toolbar. See `SparkScanView::labelCaptureButtonVisible` for more information.
* The `BarcodePickView` API now includes a Reset function for restarting the workflow, where calling it clears all picked items and restores the initial state.
* For `BarcodeCountView`, the `SetBrushForBarcode` methods now allow setting a null brush, using a transparent brush when so set.
* Added the following property to `BarcodeBatchSettings`: `expectsOnlyUniqueBarcodes`.
* Added the following function to `BarcodePickAsyncMapperProductProvider`: `UpdateProductList`. This function is used to change the product database and restart picking.

#### Core

* Added the following API for fetching all Open Source Software (OSS) license text and attributions for all OSS used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo()`

#### Smart Label Capture

* A new [sample application](/sdks/android/samples.md) has been created to demonstrate Smart Label Capture functionality.

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
* Improved decoding of blurry 1D barcodes on new Android devices.

### Breaking Changes

#### Barcode

* The MatrixScan API (`BarcodeTracking`) has been renamed to `BarcodeBatch`. All classes have been renamed accordingly (e.g. `BarcodeTrackingListener` → `BarcodeBatchListener`).

### Behavioral Changes

#### Barcode

* Smart Scan Intention is now enabled by default.
* Updated `BarcodeCountSession` to now expose a `Barcode` list.

### Bug Fixes

* Fixed an issue where calling `applySettings` would not update the Camera API.
* Fixed a rare crash affecting the camera.
* Fixed a sporadic crash in `BarcodePickView` caused by negative view sizing when opening the keyboard.
* Fixed a MatrixScan Count issue where the tap-to-uncount hints did not correctly show the number of uncounted items.

### Deprecations

In 7.0, we removed all APIs that were deprecated during the lifetime of 6.0. Before [migrating to 7.0](/migrate-6-to-7.md), we suggest upgrading to 6.28.1, fixing all deprecation warnings and then upgrading to 7.0.

#### Barcode

* The following SparkScan APIs have been deprecated:
  * `SparkScanViewHandMode`
  * `SparkScanView.HandModeButtonVisible`
  * `SparkScanViewSettings.DefaultHandMode`
  * `SparkScanView.TorchButtonVisible`
  * `SparkScanView.StopCapturingText`
  * `SparkScanView.StartCapturingText`
  * `SparkScanView.ResumeCapturingText`
  * `SparkScanView.ScanningCapturingText`
  * `SparkScanView.CaptureButtonBackgroundColor`
  * `SparkScanView.CaptureButtonActiveBackgroundColor`
  * `SparkScanView.CaptureButtonTintColor`


#### Text Capture

Text Capture functionality has been deprecated in 7.0. If your use case requires text recognition, we recommend using Smart Label Capture instead.

#### ID

The legacy ID Capture UI has been removed in 7.0. If you are using the legacy UI, you must migrate to the new ID Capture API.