---
description: "In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:                                                                              "

sidebar_position: 2
framework: capacitor
keywords:
  - capacitor
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:

- Barcode Pick: The data capture mode that is used for scan and pick functionality.
- A Barcode Pick View: The pre-built UI elements used to highlight items to be picked.

The general steps are:

- Initializing the Data Capture Context
- Configuring the Barcode Pick Mode
- Setup the Barcode Pick View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the Data Capture Context with a valid Scandit Data Capture SDK license key.

```js
DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode Pick Mode

The main entry point for the Barcode Pick Mode is the `BarcodePick` object. You can configure the supported Symbologies through its [`BarcodePickSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/barcode-pick-settings.html), and set up the list of items that you want MatrixScan Pick to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```js
const settings = new BarcodePickSettings();
settings.enableSymbology(Symbology.EAN13UPCA, true);
```

Then you have to create the list of items that will be picked and quantity to be picked for each item.

```js
const items = [
    new BarcodePickProduct(new BarcodePickProductIdentifier("9783598215438"), new BarcodePickProductQuantityToPick(3)),
    new BarcodePickProduct(new BarcodePickProductIdentifier("9783598215414"), new BarcodePickProductQuantityToPick(3)),
];
```

Create the mode with the previously created settings:

```js
const mode = new BarcodePick(settings);
```

## Setup the `BarcodePickView`

MatrixScan Pick’s built-in AR user interface includes buttons and overlays that guide the user through the scan and pick process. By adding a [`BarcodePickView`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView), the scanning interface is added automatically to your application.

The `BarcodePickView` appearance can be customized through [`BarcodePickViewSettings`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings) to match your application’s look and feel. The following settings can be customized:

* Colors of dots in augmented reality overlay
* Enable sound and haptic alerts
* Guidelines text
* Showing hints
* Finish button
* Pause button
* Zoom button
* Loading Dialog

```js
const viewSettings = new BarcodePickViewSettings();
// ...
```

Construct a new `BarcodePickView`. The `BarcodePickView` will be attached to the HTMLElement provided in the ConnectToElement function.

```js
const barcodePickView = new BarcodePickView({ context: DataCaptureContext.sharedInstance, barcodePick: mode, settings: viewSettings });
// Connect the view to the HTML element, so it can fill up its size and follow its position.
barcodePickView.connectToElement(document.getElementById('html-element-id'));
```

## Register the Listener

The `BarcodePickView` displays a **Finish** button next to its shutter button. 

Register a [BarcodePickViewUiListener](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-pick-view.html#interface-scandit.datacapture.barcode.pick.ui.IBarcodePickViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```js
barcodePickView.uiListener = {
    didTapFinishButton(foundItems) {
        // This method is called when the user presses the finish button.
        // It returns the list of all items that were found during the session.
    },
};
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `BarcodePickView.start()`.

```js
barcodePickView.start();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
