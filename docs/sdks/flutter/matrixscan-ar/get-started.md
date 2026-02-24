---
description: "In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:                                                                              "

sidebar_position: 2
framework: flutter
keywords:
  - flutter
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

The first step to add find capabilities to your application is to create a new [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-ar-settings.html), and set up the list of items that you want MatrixScan AR to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```dart
var settings = BarcodeArSettings();
settings.enableSymbology(Symbology.ean13Upca, true);
```

The create the mode with the previously created settings:

```dart
var mode = BarcodeAr(settings);
```

## Setup the BarcodeArView

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```dart
var viewSettings = BarcodeArViewSettings(
// ...
);
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```dart
var barcodeArView = BarcodeArView.forModeWithViewSettings(dataCaptureContext, barcodeAr, viewSettings);
```

Connect the `BarcodeArView` to the Widget lifecycle. The widget is dependent on calling `widgetPaused` and `widgetResumed` to set up the camera and its overlays properly.

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
if (state == AppLifecycleState.resumed) {
// Resume scanning by calling the BarcodeArView widgetResumed function.
// Under the hood, it re-enables the BarcodeAr mode and makes sure the view is properly
// setup.
barcodeArView.widgetResumed();
} else {
// Pause scanning by calling the BarcodeArView widgetPaused function.
// Under the hood, it will disable the mode and free resources that are not needed in a
// paused state.
barcodeArView.widgetPaused();
}
}
```

## Register the Listener

Register a [BarcodeArViewUiListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the session.

```dart
barcodeArView.uiListener = this

@override
void didTapFinishButton(Set<BarcodeArItem> foundItems) {
}
```

## Start searching

As soon as everything is set up, control the [BarcodeArView](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView) to start the search.

```dart
barcodeArView.start();
```
