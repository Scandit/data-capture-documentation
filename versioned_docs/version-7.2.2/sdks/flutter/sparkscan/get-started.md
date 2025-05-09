---
sidebar_position: 2
framework: flutter
keywords:
  - flutter
---

# Get Started

This page describes the step-by-step instructions that helps you to add SparkScan to your application:

- Create a new Data Capture Context instance
- Configure the Spark Scan Mode
- Create the SparkScanView with the desired settings and bind it to the application’s lifecycle
- Register the listener to be informed when new barcodes are scanned and update your data whenever this event occurs

## Prerequisites

- The latest stable version of the [Flutter SDK](https://pub.dev/publishers/scandit.com/packages).
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.md) for information on how to add the Scandit Data Capture SDK to your project

:::note
Devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create a New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the SparkScan Mode

The SparkScan Mode is configured through SparkScanSettings and allows you to register one or more listeners that are informed whenever a new barcode is scanned.

For this tutorial, we set up SparkScan for scanning EAN13 codes. You can change this to the correct symbologies for your use case (for instance, Code 128, Code 39…).

```dart
var settings = SparkScanSettings();
settings.enableSymbologies({ Symbology.ean13Upca });
```

Next, create a SparkScan instance with the settings initialized in the previous step:

```dart
var viewSettings = SparkScanViewSettings();
// setup the desired appearance settings by updating the fields in the object above
```

## Create the SparkScan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements. These guide the user through the scanning process.

The [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) appearance can be customized through [SparkScanViewSettings](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view-settings.html).

```dart
SparkScanViewSettings viewSettings = new SparkScanViewSettings();
// setup the desired appearance settings by updating the fields in the object above
```

See the [SparkScan Workflow Options](./intro.md#workflow-options) section for more information.

By adding a [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView), the scanning interface (camera preview and scanning UI elements) gets added automatically to your application.

You can add a [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) to your view hierarchy:

```dart
var sparkScanView = SparkScanView.forContext(YOUR_WIDGET_TREE_BODY, widget.dataCaptureContext, sparkScan, null);
```

Additionally, make sure to call [`SparkScanView.onPause()`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.OnPause) in your app state handling logic. You have to call this for the correct functioning of the [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView).

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
  if (state != AppLifecycleState.resumed) {
    sparkScanView.onPause()
  }
}
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [SparkScanListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) interface and register the listener to the SparkScan mode.

```dart
// Register self as a listener to monitor the spark scan session.
sparkScan.addListener(this);
```

[SparkScanListener.didScan()](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) is called when a new barcode has been scanned. This result can be retrieved from the first object in the provided barcodes list: [SparkScanSession.newlyRecognizedBarcode](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).

:::note
Note that this list only contains one barcode entry.
:::

```dart
@override
void didScan(SparkScan sparkScan, SparkScanSession session, Future<FrameData?> getFrameData()) {
  if (session.newlyRecognizedBarcode.isEmpty) return;

  // Gather the recognized barcode
  var barcode = session.newlyRecognizedBarcode[0];

  // Do something with the recognized barcode
}
```

## Scan Some Barcodes

Now that you’re up and running, go find some barcodes to scan. Don’t feel like getting up from your desk? Here’s a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can
print out.
