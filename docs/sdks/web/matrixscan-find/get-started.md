---
sidebar_position: 2
pagination_next: null
framework: web
keywords:
  - web
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- Barcode Find: The data capture mode that is used for search and find functionality.
- A Barcode Find View: The pre-built UI elements used to highlight found items.

:::note
MatrixScan Find is implemented via [`BarcodeFind`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind).
:::

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Find Mode
- Setup the Barcode Find View
- Registering the Listener to be notified about found items

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

## Configure the Barcode Find Mode

The main entry point for the Barcode Find Mode is the `BarcodeFind` object. You can configure the supported Symbologies through its [`BarcodeFindSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-settings.html#class-scandit.datacapture.barcode.find.BarcodeFindSettings), and set up the list of items that you want MatrixScan Find to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```typescript
    const settings = new BarcodeFindSettings();
    settings.enableSymbologies([Symbology.EAN13_UPCA]);
    const barcodeFind = await BarcodeFind.forSettings(settings);
```

Next, create the list of items that will be actively searched for. We will also attach some optional information to the first item that can be used by the `BarcodeFindView` to display extra information:

```typescript
    const items: BarcodeFindItem[] = []
    items.push(
        new BarcodeFindItem(
                new BarcodeFindItemSearchOptions("9783598215438"),
                new BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null)
        )
    );
    items.push(
        new BarcodeFindItem(
                new BarcodeFindItemSearchOptions("9783598215414"),
                null // Item information is optional, used for display only
        )
    );
```

## Setup the `BarcodeFindView`

MatrixScan Find’s built-in AR user interface includes buttons and overlays that guide the user through the searching process. By adding a [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView), the scanning interface is added automatically to your application.

The `BarcodeFindView` appearance can be customized through [`BarcodeFindViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view-settings.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindViewSettings) to match your application’s look and feel. For example, you can change the color of the dots that are overlaid on top of the items that are found and enable sound and haptic alerts.

```typescript
const inListItemColorGreen = Color.fromHex("#00FF00");
const notInListItemColorRed = Color.fromHex("#FF0000");
const soundEnabled = true;
const hapticEnabled = true;

const viewSettings = new BarcodeFindViewSettings(inListItemColorGreen, notInListItemColorRed, soundEnabled, hapticEnabled);
```

Next, create a `BarcodeFindView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeFindView` is automatically added to the provided parent view.

```typescript
let barcodeFindView = await BarcodeFindView.createWithSettings(dataCaptureView, context, barcodeFind, viewSettings);

// OR just create to use the default view settings and camera settings

let barcodeFindView = await BarcodeFindView.create(dataCaptureView, context, barcodeFind);

// finally set the item list to be searched
await barcodeFind.setItemList(items);
```

## Register The Listener

The `BarcodeFindView` displays a **Finish** button next to its shutter button button. 

Register a [BarcodeFindViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view.html#interface-scandit.datacapture.barcode.find.ui.IBarcodeFindViewUiListener) to be notified what items have been found once the finish button is pressed.

```typescript
barcodeFindView.setListener({
    didTapFinishButton: (foundItems: BarcodeFindItem[]) => {
        // do something with found items.
        // maybe relaunch the search
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeFindView.startSearching()`.

```typescript
barcodeFindView.startSearching();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
