---
description: "In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:                                                                              "

sidebar_position: 2
framework: react
keywords:
  - react
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:

- Barcode AR: The data capture mode that is used for scan and check functionality.
- A Barcode AR View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode AR Mode
- Setup the Barcode AR View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/barcode-ar-settings.html), and set up the list of items that you want MatrixScan AR to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```js
const settings = BarcodeArSettings();
settings.enableSymbology(Symbology.ean13Upca, true);
```

The create the mode with the previously created settings:

```js
const mode = new BarcodeAr(settings);
```

## Setup the `BarcodeArView`

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```js
const viewSettings = new BarcodeArViewSettings();
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```js
let barcodeAr;
<BarcodeArView
	barcodeAr={barcodeAr}
	context={dataCaptureContext}
	viewSettings={viewSettings}
	ref={(view) => {
		barcodeArView = view;
		// Handle the view as needed, for example
		barcodeArView.startSearching();
	}}
></BarcodeArView>;
```

## Register the Listener

The `BarcodeArView` displays a **Finish** button next to its shutter button. 

Register a [BarcodeArViewUiListener](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```js
barcodeArView.barcodeArViewUiListener = {
	didTapFinishButton(foundItems: BarcodeArItem[]) {
	},
};
```

## Start searching

As soon as everything is set up, control the [BarcodeArView](https://docs.scandit.com/7.6/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView) to start the search.

```js
barcodeArView.start();
```
