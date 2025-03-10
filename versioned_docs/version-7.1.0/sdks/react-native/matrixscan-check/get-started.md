---
sidebar_position: 2
framework: react
keywords:
  - react
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Check to your application. Implementing MatrixScan Check involves two primary elements:

- Barcode Check: The data capture mode that is used for scan and check functionality.
- A Barcode Check View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Check Mode
- Setup the Barcode Check View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Configure the Barcode Check Mode

The main entry point for the Barcode Check Mode is the `BarcodeCheck` object. You can configure the supported Symbologies through its [`BarcodeCheckSettings`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-check-settings.html), and set up the list of items that you want MatrixScan Check to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```js
const settings = BarcodeCheckSettings();
settings.enableSymbology(Symbology.ean13Upca, true);
```

The create the mode with the previously created settings:

```js
const mode = new BarcodeCheck(settings);
```

## Setup the `BarcodeCheckView`

MatrixScan Check’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeCheckView`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckView), the scanning interface is added automatically to your application.

The `BarcodeCheckView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeCheckView` appearance can be customized through [`BarcodeCheckViewSettings`](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```js
const viewSettings = new BarcodeCheckViewSettings();
```

Next, create a `BarcodeCheckView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeCheckView` is automatically added to the provided parent view.

```js
let barcodeCheck;
<BarcodeCheckView
	barcodeCheck={barcodeCheck}
	context={dataCaptureContext}
	viewSettings={viewSettings}
	ref={(view) => {
		barcodeCheckView = view;
		// Handle the view as needed, for example
		barcodeCheckView.startSearching();
	}}
></BarcodeCheckView>;
```

## Register the Listener

The `BarcodeCheckView` displays a **Finish** button next to its shutter button. 

Register a [BarcodeCheckViewUiListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeCheckViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```js
barcodeCheckView.barcodeCheckViewUiListener = {
	didTapFinishButton(foundItems: BarcodeCheckItem[]) {
	},
};
```

## Start searching

As soon as everything is set up, control the [BarcodeCheckView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-check-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckView) to start the search.

```js
barcodeCheckView.start();
```
