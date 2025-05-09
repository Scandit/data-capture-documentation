---
sidebar_position: 2
framework: capacitor
keywords:
  - capacitor
---

# Get Started

In this guide you will learn step-by-step how to add SparkScan to your application. The general steps are:

1. Create a new Data Capture Context instance.
2. Configure the Spark Scan Mode.
3. Create the SparkScanView with the desired settings and bind it to the application’s lifecycle.
4. Register the listener to be informed when new barcodes are scanned and update your data whenever this event occurs.

## Prerequisites

- The latest stable version of [Node.js and npm](https://nodejs.org/en/download/) (required only if including and building the SDK as part of an app, instead of just including it as an external resource from a CDN in HTML).
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.md) for information on how to add the Scandit Data Capture SDK to your project

:::note
Devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create a New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```sh
const context = Scandit.DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the SparkScan Mode

The SparkScan Mode is configured through [`SparkScanSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-settings.html#class-scandit.datacapture.barcode.spark.SparkScanSettings) and allows you to register one or more listeners that are informed whenever a new barcode is scanned.

For this tutorial, we will set up SparkScan for scanning EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```js
const settings = new Scandit.SparkScanSettings();
settings.enableSymbologies([Symbology.EAN13UPCA]);
```

Next, create a SparkScan instance with the settings initialized in the previous step:

```js
const sparkScan = Scandit.SparkScan.forSettings(settings);
```

## Setup the Spark Scan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements. These guide the user through the scanning process.

The [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-settings.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) appearance can be customized through [`SparkScanViewSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-settings.html#class-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings).

```js
const viewSettings = new Scandit.SparkScanViewSettings();
// setup the desired appearance settings by updating the fields in the object above
```

See the [SparkScan Workflow Options](./intro.md#workflow-options) section for more information.

By adding a `SparkScanView`, the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a `SparkScanView` to your view hierarchy. Construct a new SparkScan view. The `SparkScan` view is automatically added to the provided parentView:

```js
const sparkScanComponent = (
	<SparkScanView
		context={context}
		sparkScan={sparkScan}
		sparkScanViewSettings={viewSettings}
	/>
);
```

Additionally, make sure to call [SparkScanView.stopScanning()](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.StopScanning) in your app state handling logic. You have to call this for the correct functioning of the
[SparkScanView](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView).

```js
componentWillUnmount() {
sparkScanComponent.stopScanning();
}

handleAppStateChange = async (nextAppState) => {
if (nextAppState.match(/inactive|background/)) {
sparkScanComponent.stopScanning();
}
}
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the
[SparkScanListener](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) interface and register the listener to the SparkScan mode.

```js
// Register a listener object to monitor the spark scan session.

const listener = {
	didScan: (sparkScan, session, getFrameData) => {
		// Gather the recognized barcode
		const barcode = session.newlyRecognizedBarcode[0];

		// Handle the barcode
	},
};

sparkScan.addListener(listener);
```

[SparkScanListener.didScan()](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) is called when a new barcode has been scanned. This result can be retrieved from the first object in the provided barcodes list:
[SparkScanSession.newlyRecognizedBarcode](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode). Please note that this list only contains one barcode entry.

## Scan Some Barcodes

Now that you’re up and running, go find some barcodes to scan. Don’t feel like getting up from your desk? Here’s a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can
print out.
