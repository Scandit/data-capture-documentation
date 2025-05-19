---
sidebar_position: 2
toc_max_heading_level: 4
sidebar_label: 'Samples'
pagination_next: null
framework: netIos
keywords:
  - netIos
---

# .NET iOS SDK Samples

This page provides a list of samples available for the Scandit Data Capture SDK for .NET iOS. Each sample demonstrates a specific feature or use case of the SDK.

The repository with all the samples can be found [here](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios), and each individual sample is linked below.

:::tip
The samples here are also available for [MAUI](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/maui).
:::

## Barcode Scanning

### Single Scanning

#### SparkScan

![SparkScan List Building](/img/samples/sparkscan_list_building.png)

##### [List Building](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/01_Single_Scanning_Samples/01_Barcode_Scanning_with_Pre_Built_UI/ListBuildingSample)

Use SparkScan to populate a list of scanned barcodes.

#### Barcode Capture

##### [Single Scan](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low_Level_API/BarcodeCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/bc-simple.mp4" />

Simple sample showing how to use the Barcode Capture mode to scan a single barcode.

### Batch Scanning

#### MatrixScan Batch

Examples utilizing the low-level `BarcodeBatch` API.

##### [Simple Highlight](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-simple.mp4" />

Simple sample showing how to use MatrixScan to highlight barcodes in a frame.

##### [Rejection](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/03_Advanced_Batch_Scanning_Samples/01_Batch_Scanning_and_AR_Info_Lookup/MatrixScanRejectSample)

<ReactPlayer playing controls url="/img/samples/ms-reject.mp4" />

Use custom conditions to highlight and scan only the barcodes that meet the specified criteria.

#### MatrixScan Count

![MatrixScan Count](/img/samples/ms_count.png)

##### [Batch Scanning](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/03_Advanced_Batch_Scanning_Samples/02_Counting_and_Receiving/MatrixScanCountSimpleSample)

<ReactPlayer playing controls url="/img/samples/ms-count-simple.mp4" />

Use MatrixScan to batch scan and count the number of barcodes in a frame.

#### MatrixScan Find

![MatrixScan Find](/img/samples/ms_find_android.png)

##### [Search and Find](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/03_Advanced_Batch_Scanning_Samples/03_Search_and_Find/SearchAndFindSample)

<ReactPlayer playing controls url="/img/samples/ms-find.mp4" />

Use barcode capture to define search criteria by scanning items, and MatrixScan Find can then be launched to find the pre-defined item.

## ID Scanning

![ID Scanning](/img/samples/id_scanning.png)

### ID Capture

#### [Simple ID Capture](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/02_ID_Scanning_Samples/IdCaptureSimpleSample)

<ReactPlayer playing controls url="/img/samples/id-simple.mp4" />

Simple sample showing how to use the ID Capture mode to scan an ID card.

#### [Extended ID Capture](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/ios/02_ID_Scanning_Samples/IdCaptureExtendedSample)

<ReactPlayer playing controls url="/img/samples/id-extended.mp4" />

Sample showing how to use the ID Capture mode to scan an ID card with additional fields.

### ID Verification

#### [US Driver's License](https://github.com/Scandit/datacapture-dotnet-samples/tree/master/maui/02_ID_Scanning_Samples/USDLVerificationSample)

<ReactPlayer playing controls url="/img/samples/id-usdl.mp4" />

Sample showing how to use the ID Capture mode to verify a US driver's license.
