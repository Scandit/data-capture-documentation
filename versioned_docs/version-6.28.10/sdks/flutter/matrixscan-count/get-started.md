---
sidebar_position: 2
framework: flutter
keywords:
  - flutter
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Count to your application.

The general steps are:

1. Create a new Data Capture Context instance
2. Configure the Barcode Count Mode
3. Obtain camera instance and set frame source used
4. Register the listener to be informed when scanned phase is over
5. Set capture view and AR overlays
6. Set up the camera so that it switches on when you are in scanning view
7. Store and retrieve scanned barcodes
8. Reset Barcode Count mode
9. List and Exit callbacks

## Create A New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
```

## Configure The Barcode Count Mode

The main entry point for the Barcode Count Mode is the [BarcodeCount](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) object. It is configured through [BarcodeCountSettings](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-settings.html#class-scandit.datacapture.barcode.count.BarcodeCountSettings) and allows you to register one or more listeners that are informed whenever a scan phase has finished.

For this tutorial, we will set up Barcode Count for tracking EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```dart
var settings = BarcodeCountSettings();
settings.enableSymbology(Symbology.ean13Upca, true);
```

If you are sure that your environment will only have unique barcodes (i.e. no duplicated values), you can also enable [BarcodeCountSettings.expectsOnlyUniqueBarcodes](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-settings.html#property-scandit.datacapture.barcode.count.BarcodeCountSettings.ExpectsOnlyUniqueBarcodes). This option improves scanning performance as long as you are sure that no duplicates will be present. Next, create a
[BarcodeCount](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) instance with the [Data Capture Context](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and the settings initialized in the previous step:

```dart
var barcodeCount = BarcodeCount.forContext(dataCaptureContext, settings);
```

## Obtain Camera Instance And Set Frame Source Used

Our recommended camera settings should be used to achieve the best performance and user experience. The following couple of lines show how to get the recommended settings for MatrixScan Count and create the camera from it:

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```dart
dataCaptureContext.setFrameSource(camera);
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [BarcodeCountListener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface and register the listener.

```dart
barcodeCount.addListener(this);
```

[BarcodeCountListener.didScan()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan) is called when the scan phase has finished and results can be retrieved from [BarcodeCountSession](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession).

## Set Capture View And AR Overlays

MatrixScan Count’s built-in AR user interface includes buttons and overlays that guide the user through the capturing process. By adding a [BarcodeCountView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a [BarcodeCountView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) to your view hierarchy:

```dart
var barcodeCountView = BarcodeCountView.forContextWithMode(dataCaptureContext, barcodeCount);
```

## Set Up The Camera So That It Switches On When You Are In Scanning View

The camera is not automatically turned on when you are in a scanning view. You need to set up the camera so that it switches on when needed and it switches off when not needed anymore. Similarly [BarcodeCount](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) should also be enabled and disabled. For instance, you should switch off the camera when the [BarcodeCountView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is not visible anymore (including when the app goes in the background), similarly you want to switch on the camera when the [BarcodeCountView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is visible (including when the app goes to the foreground). One way to achieve this is the following:

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
if (state == AppLifecycleState.resumed) {
camera.switchToDesiredState(FrameSourceState.on);
} else if (state == AppLifecycleState.paused) {
camera.switchToDesiredState(FrameSourceState.off);
}
}
```

## Store And Retrieve Scanned Barcodes

The values captured as part of the scanning process are part of the [session](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession), and the session is not accessible outside [BarcodeCountListener.didScan()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan). Therefore, we recommend that you store the values to present a list, for example when the user taps the list icon. To do this, make a copy of [BarcodeCountSession.recognizedBarcodes](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count-session.html#property-scandit.datacapture.barcode.count.BarcodeCountSession.RecognizedBarcodes):

```dart
@override
Future<void> didScan(BarcodeCount barcodeCount, BarcodeCountSession session, Future<FrameData> Function() getFrameData) async {
	allRecognizedBarcodes = session.recognizedBarcodes;
}
```

## Reset Barcode Count Mode

When the scanning process is over, you need to reset the mode to make it ready for the next process. This clears the list of barcodes scanned and all the AR overlays.

To reset Barcode Count’s scanning process, you need to call the [BarcodeCount.reset()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-count.html#method-scandit.datacapture.barcode.count.BarcodeCount.Reset) method.

```dart
barcodeCount.reset();
```

## List And Exit Callbacks

The UI includes two icons (buttons) named “List” and “Exit”. The SDK provides the callbacks so you can add the desired action when those icons are tapped by the user.

```dart
@override
void didTapListButton(BarcodeCountView view) {
// Show the current progress but the order is not completed
}

@override
void didTapExitButton(BarcodeCountView view) {
// The order is completed
}
```
