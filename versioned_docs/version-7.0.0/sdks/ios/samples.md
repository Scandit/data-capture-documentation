---
sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: ios
keywords:
  - ios
---

# iOS SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for iOS. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-ios-samples/tree/master), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-ios-samples/tree/master/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

##### [Receiving](https://github.com/Scandit/datacapture-ios-samples/tree/master/ReceivingSample)

Use a combination of SparkScan and [MatrixScan Count](#matrixscan-count) for a receiving use case.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-ios-samples/tree/master/BarcodeCaptureSimpleSampleSwift)

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

:::tip
This sample is written in Swift. If you prefer Objective-C, you can find the equivalent sample [here](https://github.com/Scandit/datacapture-ios-samples/tree/master/BarcodeCaptureSimpleSampleObjC).
:::

##### [Capture Settings](https://github.com/Scandit/datacapture-ios-samples/tree/master/BarcodeCaptureSettingsSample)

Demonstrates how you can adapt the barcode capture settings best to your needs and experiment with all the options.

##### [Rejection](https://github.com/Scandit/datacapture-ios-samples/tree/master/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

### Multi-Scanning

#### MatrixScan AR

Examples utilizing the low-level [`BarcodeTracking`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html) API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-ios-samples/tree/master/MatrixScanSimpleSample)

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-ios-samples/tree/master/MatrixScanRejectSample)

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

##### [Batch Scanning](https://github.com/Scandit/datacapture-ios-samples/tree/master/MatrixScanCountSimpleSample)

Use MatrixScan to batch scan and count the number of barcodes in a frame.

##### [Receiving](https://github.com/Scandit/datacapture-ios-samples/tree/master/ReceivingSample)

Use a combination of [SparkScan](#sparkscan) and MatrixScan Count for a receiving use case.

##### [Expiry Management](https://github.com/Scandit/datacapture-ios-samples/tree/master/ExpiryManagementSample)

Share scan data between MatrixScan Count and Spark Scan to show the expiration status of scanned items.

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_ios.png)

##### [Search and Find](https://github.com/Scandit/datacapture-ios-samples/tree/master/SearchAndFindSample)

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-ios-samples/tree/master/IdCaptureSimpleSample)

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-ios-samples/tree/master/IdCaptureExtendedSample)

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.

#### [Settings](https://github.com/Scandit/datacapture-ios-samples/tree/master/IdCaptureSettingsSample)

Demonstrates how you can adapt the ID capture settings best to your needs and experiment with all the options.

### ID Verification

#### [Age Verification](https://github.com/Scandit/datacapture-ios-samples/tree/master/AgeVerifiedDeliverySample)

Sample showing how to use the ID Capture mode to verify age for a delivery.

#### [US Driver's License](https://github.com/Scandit/datacapture-ios-samples/tree/master/USDLVerificationSample)

Sample showing how to use the ID Capture mode to verify a US driver's license.