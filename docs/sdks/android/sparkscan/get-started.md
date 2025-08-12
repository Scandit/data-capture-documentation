---
description: "This page describes the step-by-step instructions that helps you to add SparkScan to your application:                                                                                     "

sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

This page describes the step-by-step instructions that helps you to add SparkScan to your application:

- Create a new Data Capture Context instance
- Configure the Spark Scan Mode
- Create the SparkScanView with the desired settings and bind it to the application’s lifecycle
- Register the listener to be informed when new barcodes are scanned and update your data whenever this event occurs

:::note
If you’re looking to integrate SparkScan into a Compose view hierarchy, there are additional steps you need to follow:

Create an `AndroidView` to wrap the `SparkScanView` instance, initialized as described in the rest of this section.

Monitor the view lifecycle so you can call the view lifecycle methods in `SparkScanView` when necessary. This can be done using a combination of `DisposableEffect` and the `onRelease` callback of `AndroidView`.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### External Dependencies

import ExternalDependencies from '../../../partials/get-started/_external-deps-android.mdx';

<ExternalDependencies/>

### Internal Dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

## Create a New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the SparkScan Mode

The SparkScan Mode is configured through SparkScanSettings and allows you to register one or more listeners that are informed whenever a new barcode is scanned.

For this tutorial, we set up SparkScan for scanning EAN13 codes. You can change this to the correct symbologies for your use case (for instance, Code 128, Code 39…).

```java
SparkScanSettings settings = new SparkScanSettings();
HashSet<Symbology> symbologies = new HashSet<>();
symbologies.add(Symbology.EAN13_UPCA);
settings.enableSymbologies(symbologies);
```

Next, create a SparkScan instance with the settings initialized in the previous step:

```java
SparkScan sparkScan = new SparkScan(settings);
```

## Create the SparkScan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements. These guide the user through the scanning process.

The [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view.html) appearance can be customized through [`SparkScanViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/spark-scan-view-settings.html).

```java
SparkScanViewSettings viewSettings = new SparkScanViewSettings();
// setup the desired appearance settings by updating the fields in the object above
```

By adding a `SparkScanView`, the scanning interface (camera preview and scanning UI elements) gets added automatically to your application.

Construct a new SparkScan view. The SparkScan view is automatically added to the provided parentView:

```java
SparkScanView sparkScanView = SparkScanView.newInstance(parentView, dataCaptureContext, sparkScan, viewSettings);
```

See the [SparkScan Workflow Options](./intro.md#workflow-options) section for more information.

Additionally, make sure to call `sparkScanView.onPause()` and `sparkScanView.onResume()` in your Fragment/Activity `onPause` and `onResume` callbacks. You have to call these for the correct functioning of the `SparkScanView`.

```java
@Override
protected void onPause() {
    sparkScanView.onPause();
    super.onPause();
}

@Override
protected void onResume() {
    sparkScanView.onResume();
    super.onResume();
}
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [SparkScanListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) interface and register the listener to the SparkScan mode.

```java
// Register self as a listener to monitor the spark scan session.
sparkScan.addListener(this);
```

[SparkScanListener.onBarcodeScanned()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) is called when a new barcode has been scanned. This result can be retrieved from the first object in the provided barcodes list: [SparkScanSession.newlyRecognizedBarcode](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).

:::note
Note that this list only contains one barcode entry.
:::

```java
@Override
public void onBarcodeScanned(
    @NonNull SparkScan sparkScan, @NonNull SparkScanSession session, @Nullable FrameData data
) {
    // Gather the recognized barcode
    Barcode barcode = session.getNewlyRecognizedBarcode().get(0);

    // This method is invoked from a recognition internal thread.
    // Run the specified action in the UI thread to update the internal barcode list.
    runOnUiThread(() -> {
        // Update the internal list and the UI with the barcode retrieved above
        this.latestBarcode = barcode
    });
  }
```

## Scan Some Barcodes

Now that you’re up and running, go find some barcodes to scan. Don’t feel like getting up from your desk? Here’s a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can
print out.
