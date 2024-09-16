---
sidebar_position: 2
toc_max_heading_level: 5
sidebar_label: 'Samples'
pagination_next: null
framework: xamarinAndroid
tags: [xamarinAndroid]
keywords:
  - xamarinAndroid
---

# Xamarin Android SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Xamarin Android. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### Barcode Capture


##### [Single Scan](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureSimpleSample)

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

##### [Capture Views](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureViewsSample)

Demonstrates the various ways to best integrate the scanner into the UI of your app.

##### [Capture Settings](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureSettingsSample)

Demonstrates how you can adapt the barcode capture settings best to your needs and experiment with all the options.

##### [Rejection](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

#### Pre-built Workflows

##### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

###### [List Building](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

##### Barcode Selection

![Barcode Selection](/img/samples/barcode_selection.png)

###### [Simple Selection](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/BarcodeSelectionSimpleSample)

Simple sample showing how to use the Barcode Selection mode to select a barcode.

### Multi-Scanning

#### MatrixScan AR

Examples utilizing the low-level `BarcodeTracking` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanSimpleSample)

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanRejectSample)

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### Pre-built Workflows

##### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

###### [Batch Scanning](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/MatrixScanCountSimpleSample)

Use MatrixScan to batch scan and count the number of barcodes in a frame.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/IdCaptureSimpleSample)

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-xamarin-samples/tree/master/android/IdCaptureExtendedSample)

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.
