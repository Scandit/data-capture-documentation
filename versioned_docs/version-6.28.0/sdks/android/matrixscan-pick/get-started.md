---
sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:

- Barcode Pick: The data capture mode that is used for scan and pick functionality.
- A Barcode Pick View: The pre-built UI elements used to highlight items to be picked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Pick Mode
- Setup the Barcode Pick View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Pick Mode

The main entry point for the Barcode Pick Mode is the `BarcodePick` object. You can configure the supported Symbologies through its [`BarcodePickSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-settings.html), and set up the list of items that you want MatrixScan Pick to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```java
BarcodePickSettings settings = new BarcodePickSettings();
settings.setSymbologyEnabled(Symbology.EAN13_UPCA, true);
```

Then you have to create the list of items that will be picked and quantity to be picked for each item.

```java
Set<BarcodePickProduct> items = new HashSet<>();
items.add(
        new BarcodePickProduct(
                new BarcodePickProductIdentifier("9783598215438"),
                new BarcodePickProductQuantityToPick(3)
        )
);
items.add(
        new BarcodePickProduct(
                new BarcodePickProductIdentifier("9783598215414"),
                new BarcodePickProductQuantityToPick(3)
        )
);
```

Create the mode with the previously created settings:

```java
BarcodePick mode = new BarcodePick(settings);
```

## Setup the `BarcodePickView`

MatrixScan Pick’s built-in AR user interface includes buttons and overlays that guide the user through the scan and pick process. By adding a [`BarcodePickView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView), the scanning interface is added automatically to your application.

The `BarcodePickView` appearance can be customized through [`BarcodePickViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings) to match your application’s look and feel. The following settings can be customized:

* Colors of dots in augmented reality overlay
* Enable sound and haptic alerts
* Guidelines text
* Showing hints
* Finish button
* Pause button
* Zoom button
* Loading Dialog

```java
BarcodePickViewSettings viewSettings = new BarcodePickViewSettings();
// ...
```

Next, create a `BarcodePickView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodePickView` is automatically added to the provided parent view.

```java
BarcodePickView barcodePickView = BarcodePickView.newInstance(parentView, dataCaptureContext, mode, viewSettings);
```

Connect the `BarcodePickView` to the Android lifecycle. The view is dependent on calling `BarcodePickView.onPause()` and `BarcodePickView.onResume()` to set up the camera and its overlays properly.

```java
@Override
public void onResume() {
    super.onResume();
    barcodePickView.onResume();
}

@Override
public void onPause() {
    super.onPause();
    barcodePickView.onPause();
}
```

## Register the Listener

The `BarcodePickView` displays a **Finish** button next to its shutter button button. 

Register a [BarcodePickViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view.html#interface-scandit.datacapture.barcode.pick.ui.IBarcodePickViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```java
barcodePickView.setListener(new BarcodePickViewUiListener() {
    @Override
    public void onFinishButtonTapped(@NonNull Set<BarcodePickItem> foundItems) {
        requireActivity().onBackPressed();
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodePickView.start()`.

```java
barcodePickView.start();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.