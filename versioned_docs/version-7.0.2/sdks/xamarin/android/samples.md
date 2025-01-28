---
sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: xamarinAndroid
keywords:
  - xamarinAndroid
---

# Xamarin Android SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Xamarin Android. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/bc-simple.mp4" />

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

##### [Rejection](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

### Batch Scanning

#### MatrixScan Batch

Examples utilizing the low-level `BarcodeBatch` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-simple.mp4" />

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanRejectSample)

<ReactPlayer playing controls url="/img/samples/ms-reject.mp4" />

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

##### [Batch Scanning](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanCountSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-count-simple.mp4" />

Use MatrixScan to batch scan and count the number of barcodes in a frame.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/IdCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/id-simple.mp4" />

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/IdCaptureExtendedSample)

<ReactPlayer playing controls url="/img/samples/id-extended.mp4" />

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.
