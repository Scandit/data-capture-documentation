---
sidebar_position: 2
toc_max_heading_level: 5
sidebar_label: 'Samples'
pagination_next: null
framework: cordova
tags: [cordova]
keywords:
  - cordova
---

# Cordova SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Cordova. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-cordova-samples/tree/master), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### Barcode Capture


##### [Single Scan](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeCaptureSimpleSample)

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

##### [Capture Views](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeCaptureViewsSample)

Demonstrates the various ways to best integrate the scanner into the UI of your app.

##### [Capture Settings](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeCaptureSettingsSample)

Demonstrates how you can adapt the barcode capture settings best to your needs and experiment with all the options.

##### [Rejection](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

#### Pre-built Workflows

##### Barcode Selection

![Barcode Selection](/img/samples/barcode_selection.png)

###### [Simple Selection](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeSelectionSimpleSample)

Simple sample showing how to use the Barcode Selection mode to select a barcode.

###### [Selection Settings](https://github.com/Scandit/datacapture-cordova-samples/tree/master/BarcodeSelectionSettingsSample)

Demonstrates how you can adapt the barcode selection settings best to your needs and experiment with all the options.

### Multi-Scanning

#### MatrixScan AR

Examples utilizing the low-level `BarcodeTracking` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-cordova-samples/tree/master/MatrixScanSimpleSample)

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-cordova-samples/tree/master/MatrixScanRejectSample)

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-cordova-samples/tree/master/IdCaptureSimpleSample)

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-cordova-samples/tree/master/IdCaptureExtendedSample)

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.
