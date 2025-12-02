---
description: "This page provides a list of samples available for the Scandit Data Capture SDK for Cordova. Each sample demonstrates a specific feature or use case of the SDK.                                                                        "

sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Cordova SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Cordova. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-cordova-samples/tree/master), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-cordova-samples/tree/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low_Level_API/BarcodeCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/bc-simple.mp4" />

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

### Batch Scanning

#### MatrixScan Batch

Examples utilizing the low-level `BarcodeBatch` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-cordova-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-simple.mp4" />

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-cordova-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanRejectSample)

<ReactPlayer playing controls url="/img/samples/ms-reject.mp4" />

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-cordova-samples/tree/master/02_ID_Scanning_Samples/IdCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/id-simple.mp4" />

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-cordova-samples/tree/master/02_ID_Scanning_Samples/IdCaptureExtendedSample)

<ReactPlayer playing controls url="/img/samples/id-extended.mp4" />

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.
