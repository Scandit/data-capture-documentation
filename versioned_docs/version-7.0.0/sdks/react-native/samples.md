---
sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: react
keywords:
  - react
---

# React Native SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for React Native. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-react-native-samples/tree/master), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-react-native-samples/tree/master/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-react-native-samples/tree/master/BarcodeCaptureSimpleSample)

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

##### [Capture Settings](https://github.com/Scandit/datacapture-react-native-samples/tree/master/BarcodeCaptureSettingsSample)

Demonstrates how you can adapt the barcode capture settings best to your needs and experiment with all the options.

##### [Rejection](https://github.com/Scandit/datacapture-react-native-samples/tree/master/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

### Multi-Scanning

#### MatrixScan AR

Examples utilizing the low-level `BarcodeTracking` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-react-native-samples/tree/master/MatrixScanSimpleSample)

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-react-native-samples/tree/master/MatrixScanRejectSample)

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

##### [Batch Scanning](https://github.com/Scandit/datacapture-react-native-samples/tree/master/MatrixScanCountSimpleSample)

Use MatrixScan to batch scan and count the number of barcodes in a frame.

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_android.png)

##### [Search and Find](https://github.com/Scandit/datacapture-react-native-samples/tree/master/SearchAndFindSample)

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-react-native-samples/tree/master/IdCaptureSimpleSample)

Simple sample showing how to use the ID Capture mode to scan an ID card.

### ID Verification

#### [US Driver's License](https://github.com/Scandit/datacapture-react-native-samples/tree/master/USDLVerificationSample)

Sample showing how to use the ID Capture mode to verify a US driver's license.
