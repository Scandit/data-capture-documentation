---
description: "In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:                                                                              "

displayed_sidebar: capacitorSidebar
sidebar_position: 2
framework: capacitor
keywords:
  - capacitor
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:

- Barcode AR: The data capture mode that is used for scan and check functionality.
- A Barcode AR View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Initializing the Data Capture Context
- Configuring the Barcode AR Mode
- Setup the Barcode AR View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the [data capture context](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) with a valid Scandit Data Capture SDK license key.

```js
await DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-ar-settings.html), and set up the list of items that you want MatrixScan AR to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```js
const settings = new BarcodeArSettings();
settings.enableSymbology(Symbology.EAN13UPCA, true);
```

The create the mode with the previously created settings:

```js
const mode = new BarcodeAr(settings);
```

## Setup the `BarcodeArView`

MatrixScan AR's built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application's look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```js
const viewSettings = new BarcodeArViewSettings();
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. Then connect it to an HTML element in your view hierarchy.

```js
const barcodeArView = new BarcodeArView({
	context: DataCaptureContext.sharedInstance,
	barcodeAr: mode,
	settings: viewSettings,
});

barcodeArView.connectToElement(htmlElement);
```

## Register the Listener

Register a [BarcodeArViewUiListener](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener) to be notified when a highlighted barcode is tapped.

```js
barcodeArView.uiListener = {
	didTapHighlightForBarcode(barcodeAr, barcode, highlight) {
		// Handle the tapped barcode.
	},
};
```

## Start Searching

As soon as everything is set up, control the [BarcodeArView](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView) to start the search.

```js
barcodeArView.start();
```
