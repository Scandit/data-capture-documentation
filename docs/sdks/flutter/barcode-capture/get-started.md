---
description: "In this guide you will learn step-by-step how to add Barcode Capture to your application.                                                                                     "

sidebar_position: 2
pagination_prev: null
framework: flutter
keywords:
  - flutter
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- Initialize the [Data Capture Context](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) with a valid Scandit Data Capture SDK license key.
- Create a [barcode capture settings](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and enable the [barcode symbologies](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read in your application.
- Create a new [barcode capture mode](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance and initialize it with the settings created above.
- Register a [barcode capture listener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [camera](https://docs.scandit.com/data-capture-sdk/flutter/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [data capture view](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).
- If displaying a preview, optionally create a new [overlay](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) and add it to [data capture view](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for a better visual feedback.

## Initialize the barcode plugin

:::warning
Without initializing the barcode plugin, runtime crashes will occur. However, you don’t have to initialize the core plugin, as initializing the barcode plugin already does that for you, as presented in the snippet below.
:::

Before accessing anything of the Scandit Data Capture SDK functionality. You have to initialize the barcode plugin.

```dart
void main() async {
WidgetsFlutterBinding.ensureInitialized();
await ScanditFlutterDataCaptureBarcode.initialize();
runApp(MyApp());
}
```

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the [data capture context](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) with a valid Scandit Data Capture SDK license key.

```dart
await DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode Scanning Behavior

Barcode scanning is orchestrated by the [BarcodeCapture](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) [data capture mode](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called [symbologies](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```dart
var settings = BarcodeCaptureSettings()
..enableSymbologies({
Symbology.code128,
Symbology.code39,
Symbology.qr,
Symbology.ean8,
Symbology.upce,
Symbology.ean13Upca
});
```

If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [BarcodeCaptureSettings.codeDuplicateFilter](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around 500 or even \-1 if you do not want codes to be scanned more than once.

Next, create a [BarcodeCapture](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance with the settings initialized in the previous step:

```dart
var barcodeCapture = BarcodeCapture(settings);
DataCaptureContext.sharedInstance.addMode(barcodeCapture);
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [BarcodeCapture.addListener()](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) interface. For example:

```dart
@override
void didScan(BarcodeCapture barcodeCapture, BarcodeCaptureSession session) {
var recognizedBarcodes = session.newlyRecognizedBarcode;
// Do something with the barcodes.
}
```

Then add the listener:

```dart
barcodeCapture.addListener(this);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

:::important
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [NSCameraUsageDescription](https://developer.apple.com/documentation/bundleresources/information%5Fproperty%5Flist/nscamerausagedescription) key in your app’s Info.plist file.
:::

:::important
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the AndroidManifest.xml file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the android.permission.CAMERA permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```dart
var cameraSettings = BarcodeCapture.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.

var camera = Camera.defaultCamera?..applySettings(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```dart
DataCaptureContext.sharedInstance.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.on](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```dart
camera.switchToDesiredState(FrameSourceState.on);
```



## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```dart
var dataCaptureView = DataCaptureView.forContext(DataCaptureContext.sharedInstance);
// Add the dataCaptureView to your widget tree
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```dart
var overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, dataCaptureView);
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set [BarcodeCapture.isEnabled](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#property-scandit.datacapture.barcode.BarcodeCapture.IsEnabled) to _false_.

The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
