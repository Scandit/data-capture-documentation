---
description: "This page provides a list of samples available for the Scandit Data Capture SDK for Web. Each sample demonstrates a specific feature or use case of the SDK.                                                                        "

sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: web
keywords:
  - web
---

# Web SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Web. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-web-samples), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/01_Barcode_Scanning_with_Pre-built_UI/ListBuildingSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/01_Barcode_Scanning_with_Pre-built_UI/ListBuildingSample?file=index.ts)

Use SparkScan to populate a list of scanned barcodes.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimpleSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimpleSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/bc-simple.mp4" />

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

:::tip
This sample is also available [here](https://github.com/Scandit/datacapture-web-samples/tree/master/05_Framework_Integration_Samples/BarcodeCaptureReactSample) ([Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/05_Framework_Integration_Samples/BarcodeCaptureReactSample?file=src/sdk.tsx)) for React, and for Progressive Web Apps (PWAs) [here](https://github.com/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimplePwaSample) ([Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimplePwaSample?file=index.ts)).
:::

### Batch Scanning

#### MatrixScan AR

##### [Simple Sample](https://github.com/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanARSimpleSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanARSimpleSample?file=index.ts)

Example demonstrating how to highlight barcodes and display additional information over them using augmented reality (AR) with MatrixScan AR (`BarcodeAR` API).

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_web.png)

##### [Search and Find](https://github.com/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/03_Search_and_Find/SearchAndFindSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/03_Search_and_Find/SearchAndFindSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/ms-find.mp4" />

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

#### MatrixScan Batch

Examples utilizing the low-level `BarcodeBatch` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanSimpleSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanSimpleSample?file=index.html)

<ReactPlayer playing controls url="/img/samples/ms-simple.mp4" />

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureSimpleSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureSimpleSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/id-simple.mp4" />

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureExtendedSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureExtendedSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/id-extended.mp4" />

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.

#### [Settings](https://github.com/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureSettingsSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureSettingsSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/id-settings.mp4" />

Demonstrates how you can adapt the ID capture settings best to your needs and experiment with all the options.

### ID Verification

#### [US Driver's License](https://github.com/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureUSDLVerificationSample) | [Open in StackBlitz ↗](https://stackblitz.com/github/Scandit/datacapture-web-samples/tree/master/02_ID_Scanning_Samples/IdCaptureUSDLVerificationSample?file=index.ts)

<ReactPlayer playing controls url="/img/samples/id-usdl.mp4" />

Sample showing how to use the ID Capture mode to verify a US driver's license.
