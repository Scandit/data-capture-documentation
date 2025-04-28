---
sidebar_position: 2
pagination_next: null
framework: web
keywords:
  - web
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

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new Data Capture Context. Sdk must be configured first with a valid Scandit Data Capture SDK license key.

```typescript
    await configure({
      licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --",
      libraryLocation: new URL("library/engine/", document.baseURI).toString(),
      moduleLoaders: [barcodeCaptureLoader({ highEndBlurryRecognition: false })],
    });
    const context = await DataCaptureContext.create();

    const dataCaptureView = new DataCaptureView();
    // #root element should be present in .html document
    dataCaptureView.connectToElement(document.getElementById("root"));

    await dataCaptureView.setContext(context);
```

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-ar-settings.html), and set up the list of items that you want MatrixScan AR to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```typescript
    const settings = new BarcodeArSettings();
    settings.enableSymbologies([Symbology.EAN13_UPCA]);
    const barcodeAr = await BarcodeAr.forSettings(settings);
```

## Setup the `BarcodeArView`

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```typescript
const soundEnabled = true;
const hapticEnabled = true;

const viewSettings = new BarcodeArViewSettings(soundEnabled, hapticEnabled);
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```typescript
let barcodeArView = await BarcodeArView.createWithSettings(dataCaptureView, context, barcodeAr, viewSettings);

// OR just create to use the default view settings and camera settings

let barcodeArView = await BarcodeArView.create(dataCaptureView, context, barcodeAr);
```

## Register The Listener

The `BarcodeArView` displays a **Finish** button next to its shutter button. 

Register a [BarcodeArViewUiListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener) to be notified what items have been found once the finish button is pressed.

```typescript
barcodeArView.setListener({
    didTapFinishButton: (foundItems: BarcodeArItem[]) => {
        // Handle the scanned items
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeArView.start()`.

```typescript
barcodeArView.start();
```
