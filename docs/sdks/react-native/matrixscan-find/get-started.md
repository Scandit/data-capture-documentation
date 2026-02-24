---
description: "In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:                                                                              "

sidebar_position: 2
framework: react
keywords:
  - react
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- Barcode Find: The data capture mode that is used for search and find functionality.
- A Barcode Find View: The pre-built UI elements used to highlight found items.

The general steps are:

1. Create a new Data Capture Context instance.
2. Configure the Barcode Find Mode.
3. Setup the BarcodeFindView.
4. Register a listener to be notified with found items
5. Start searching

## Create the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Configure the Barcode Find Mode

The main entry point for the Barcode Find Mode is the [BarcodeFind](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind) object. You can configure the supported Symbologies through its [BarcodeFindSettings](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-find-settings.html#class-scandit.datacapture.barcode.find.BarcodeFindSettings), and set up the list of items that you want MatrixScan Find to highlight (e.g. a list of products).

For this tutorial, we will set up Barcode Find for tracking EAN13 codes. Change this to the correct symbologies for your use case (e.g. Code 128, Code 39…).

First create the settings:

```js
const settings = new BarcodeFindSettings();
settings.enableSymbology(Symbology.EAN13UPCA, true);
```

Then you have to create the list of items that will be actively searched for.

In this tutorial, let’s look up two items based on their EAN13 codes. We will attach to the first item some optional information that can be used by the BarcodeFindView to display extra information.

```js
const items = [
new BarcodeFindItem(new BarcodeFindItemSearchOptions("9783598215438"),
new BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null)),
new BarcodeFindItem(new BarcodeFindItemSearchOptions("9783598215414"), null) // Item information is optional, used for display only
]
```

Create the mode with the previously created settings and set the items:

```js
const mode = new BarcodeFind(settings);
mode.setItemList(items);
```

## Setup the BarcodeFindView

MatrixScan Find’s built-in AR user interface includes buttons and overlays that guide the user through the searching process. By adding a [BarcodeFindView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView), the scanning interface (camera preview and searching UI elements) will be added automatically to your application.

The BarcodeFindView appearance can be customized through [BarcodeFindViewSettings](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-find-view-settings.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindViewSettings):

- Colors of dots in augmented reality overlay
- Enable sound and haptic alerts

```js
const viewSettings = new BarcodeFindViewSettings();
```

Construct a new BarcodeFindView. The BarcodeFindView is automatically added to the provided parent view.

```js
let barcodeFindView;
<BarcodeFindView
	barcodeFind={mode}
	context={dataCaptureContext}
	viewSettings={viewSettings}
	ref={(view) => {
		barcodeFindView = view;
		// Handle the view as needed, for example
		barcodeFindView.startSearching();
	}}
></BarcodeFindView>;
```

## Register a listener to be notified with found items

The BarcodeFindView displays next to its shutter button a handy “finish” button. Register a [BarcodeFindViewUiListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-find-view.html#interface-scandit.datacapture.barcode.find.ui.IBarcodeFindViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```js
barcodeFindView.barcodeFindViewUiListener = {
	didTapFinishButton(foundItems) {
		// This method is called when the user presses the
		// finish button. It returns the list of all items that were found during
		// the session.
	},
};
```

## Start searching

As soon as everything is set up, control the [BarcodeFindView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) to start the search.

```js
barcodeFindView.startSearching();
```

This is the equivalent of pressing the “Play” button programmatically. It will start the search process, turn on the camera and hide the item carousel.
