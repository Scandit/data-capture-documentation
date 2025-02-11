---
sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- Barcode Find: The data capture mode that is used for search and find functionality.
- A Barcode Find View: The pre-built UI elements used to highlight found items.

:::note
MatrixScan Count is implemented via [`BarcodeFind`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind).
:::

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Find Mode
- Setup the Barcode Find View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextAndroid from '../../../partials/get-started/_create-data-capture-context-android.mdx';

<DataCaptureContextAndroid/>

## Configure the Barcode Find Mode

The main entry point for the Barcode Find Mode is the `BarcodeFind` object. You can configure the supported Symbologies through its [`BarcodeFindSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-settings.html#class-scandit.datacapture.barcode.find.BarcodeFindSettings), and set up the list of items that you want MatrixScan Find to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```java
BarcodeFindSettings settings = new BarcodeFindSettings();
settings.setSymbologyEnabled(Symbology.EAN13_UPCA, true);
```

Next, create the list of items that will be actively searched for. We will also attach some optional information to the first item that can be used by the `BarcodeFindView` to display extra information:

```java
Set<BarcodeFindItem> items = new HashSet<>();
items.add(
        new BarcodeFindItem(
                new BarcodeFindItemSearchOptions("9783598215438"),
                new BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null)
        )
);
items.add(
        new BarcodeFindItem(
                new BarcodeFindItemSearchOptions("9783598215414"),
                null // Item information is optional, used for display only
        )
);
```

Finally, create a `BarcodeFind` instance with the Data Capture Context and the settings initialized in the previous step:

```java
BarcodeFind mode = new BarcodeFind(settings);
mode.setItemList(items);
```

## Setup the `BarcodeFindView`

MatrixScan Find’s built-in AR user interface includes buttons and overlays that guide the user through the searching process. By adding a [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView), the scanning interface is added automatically to your application.

The `BarcodeFindView` appearance can be customized through [`BarcodeFindViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view-settings.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindViewSettings) to match your application’s look and feel. For example, you can change the color of the dots that are overlaid on top of the items that are found and enable sound and haptic alerts.

```java
BarcodeFindViewSettings viewSettings = new BarcodeFindViewSettings();
viewSettings.inListItemColor = .green
viewSettings.notInListItemColor = .red
viewSettings.soundEnabled = true
viewSettings.hapticEnabled = true
```

Next, create a `BarcodeFindView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeFindView` is automatically added to the provided parent view.

```java
BarcodeFindView barcodeFindView = BarcodeFindView.newInstance(parentView, dataCaptureContext, mode, viewSettings);
```

Connect the `BarcodeFindView` to the Android lifecycle. The view is dependent on calling `BarcodeFindView.onPause()` and `BarcodeFindView.onResume()` to set up the camera and its overlays properly.

```java
@Override
public void onResume() {
    super.onResume();
    barcodeFindView.onResume();
}

@Override
public void onPause() {
    super.onPause();
    barcodeFindView.onPause();
}
```

## Register the Listener

The `BarcodeFindView` displays a **Finish** button next to its shutter button. 

Register a [BarcodeFindViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-find-view.html#interface-scandit.datacapture.barcode.find.ui.IBarcodeFindViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```java
barcodeFindView.setListener(new BarcodeFindViewUiListener() {
    @Override
    public void onFinishButtonTapped(@NonNull Set<BarcodeFindItem> foundItems) {
        requireActivity().onBackPressed();
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeFindView.startSearching()`.

```java
barcodeFindView.startSearching();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
