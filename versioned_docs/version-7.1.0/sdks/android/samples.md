---
sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: android
keywords:
  - android
---

# Android SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for Android. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-android-samples/tree/master), and each individual sample is linked below.

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-android-samples/tree/master/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

##### [Receiving](https://github.com/Scandit/datacapture-android-samples/tree/master/ReceivingSample)

<ReactPlayer playing controls url="/img/samples/ms-receiving.mp4" />

Use a combination of SparkScan and [MatrixScan Count](#matrixscan-count) for a receiving use case.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-android-samples/tree/master/BarcodeCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/bc-simple.mp4" />

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

##### [Rejection](https://github.com/Scandit/datacapture-android-samples/tree/master/BarcodeCaptureRejectSample)

Sample that uses the camera to read a single QR code that starts with “09:” but ignores/rejects all other codes.

### Batch Scanning

#### MatrixScan Batch

Examples utilizing the low-level [`BarcodeBatch`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-batch.html) API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-android-samples/tree/master/MatrixScanSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-simple.mp4" />

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-android-samples/tree/master/MatrixScanRejectSample)

<ReactPlayer playing controls url="/img/samples/ms-reject.mp4" />

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

##### [Batch Scanning](https://github.com/Scandit/datacapture-android-samples/tree/master/MatrixScanCountSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-count-simple.mp4" />

Use MatrixScan to batch scan and count the number of barcodes in a frame.

##### [Receiving](https://github.com/Scandit/datacapture-android-samples/tree/master/ReceivingSample)

<ReactPlayer playing controls url="/img/samples/ms-receiving.mp4" />

Use a combination of [SparkScan](#sparkscan) and MatrixScan Count for a receiving use case.

##### [Expiry Management](https://github.com/Scandit/datacapture-android-samples/tree/master/ExpiryManagementSample)

<ReactPlayer playing controls url="/img/samples/ss-expiry.mp4" />

Share scan data between MatrixScan Count and Spark Scan to show the expiration status of scanned items.

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_android.png)

##### [Search and Find](https://github.com/Scandit/datacapture-android-samples/tree/master/SearchAndFindSample)

<ReactPlayer playing controls url="/img/samples/ms-find.mp4" />

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

#### Smart Label Capture

![Smart Label Capture](/img/batch-scanning/SLC-smart-devices.jpg)

##### [Price and Weight Label Capture](https://github.com/Scandit/datacapture-android-samples/tree/master/PriceWeightLabelCaptureSample)

Use Smart Label Capture to scan labels and extract price and weight information simultaneously.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-android-samples/tree/master/IdCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/id-simple.mp4" />

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-android-samples/tree/master/IdCaptureExtendedSample)

<ReactPlayer playing controls url="/img/samples/id-extended.mp4" />

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.

#### [Settings](https://github.com/Scandit/datacapture-android-samples/tree/master/IdCaptureSettingsSample)

<ReactPlayer playing controls url="/img/samples/id-settings.mp4" />

Demonstrates how you can adapt the ID capture settings best to your needs and experiment with all the options.

### ID Verification

#### [Age Verification](https://github.com/Scandit/datacapture-android-samples/tree/master/AgeVerifiedDeliverySample)

<ReactPlayer playing controls url="/img/samples/id-avd.mp4" />

Sample showing how to use the ID Capture mode to verify age for a delivery.

#### [US Driver's License](https://github.com/Scandit/datacapture-android-samples/tree/master/USDLVerificationSample)

<ReactPlayer playing controls url="/img/samples/id-usdl.mp4" />

Sample showing how to use the ID Capture mode to verify a US driver's license.
