---
sidebar_position: 2
toc_max_heading_level: 5
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

#### Barcode Capture


##### [Single Scan](https://github.com/Scandit/datacapture-web-samples/tree/master/BarcodeCaptureSimpleSample)

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

:::tip
This sample is also available [here](https://github.com/Scandit/datacapture-web-samples/tree/master/BarcodeCaptureReactSample) for React, and for Progressive Web Apps (PWAs) [here](https://github.com/Scandit/datacapture-web-samples/tree/master/BarcodeCaptureSimplePwaSample).
:::

##### [Capture Views](https://github.com/Scandit/datacapture-web-samples/tree/master/BarcodeCaptureViewsSample)

Demonstrates the various ways to best integrate the scanner into the UI of your app.

##### [Capture Settings](https://github.com/Scandit/datacapture-web-samples/tree/master/BarcodeCaptureSettingsSample)

Demonstrates how you can adapt the barcode capture settings best to your needs and experiment with all the options.

#### Pre-built Workflows

##### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

###### [List Building](https://github.com/Scandit/datacapture-web-samples/tree/master/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

### Multi-Scanning

#### MatrixScan AR

Examples utilizing the low-level `BarcodeTracking` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-web-samples/tree/master/MatrixScanSimpleSample)

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [AR Bubbles](https://github.com/Scandit/datacapture-web-samples/tree/master/MatrixScanBubblesSample)

Demonstrates more advanced use of MatrixScan by showing AR bubbles above the barcodes with the barcode data.

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_web.png)

##### [Search and Find](https://github.com/Scandit/datacapture-web-samples/tree/master/SearchAndFindSample)

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-web-samples/tree/master/IdCaptureSimpleSample)

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-web-samples/tree/master/IdCaptureExtendedSample)

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.

#### [Settings](https://github.com/Scandit/datacapture-web-samples/tree/master/IdCaptureSettingsSample)

Demonstrates how you can adapt the ID capture settings best to your needs and experiment with all the options.

### ID Verification

#### [US Driver's License](https://github.com/Scandit/datacapture-web-samples/tree/master/USDLVerificationSample)

Sample showing how to use the ID Capture mode to verify a US driver's license.