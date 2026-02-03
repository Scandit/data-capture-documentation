---
description: "In this guide you will learn step-by-step how to add MatrixScan to your application.                                                                                      "

sidebar_position: 2
framework: flutter
keywords:
  - flutter
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the MatrixScan mode
- Using the built-in camera
- Visualizing the scan process
- Providing feedback
- Disabling barcode tracking

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var context = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Batch Mode

The main entry point for the Barcode Batch Mode is the [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) object. It is configured through [BarcodeBatchSettings](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) that will get informed whenever a new frame has been processed.

Most of the times, you will not need to implement a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener), instead you will add a [BarcodeBatchBasicOverlay](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay) and implement a [BarcodeBatchBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener).

For this tutorial, we will setup Barcode Batch for tracking QR codes.

```dart
var settings = BarcodeBatchSettings()
..enableSymbology(Symbology.qr, true);
```

Next, create a [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance with the data capture context and the settings initialized in the previous steps:

```dart
var barcodeBatch = BarcodeBatch(settings);
dataCaptureContext.addMode(barcodeBatch);
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
var cameraSettings = BarcodeBatch.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

var camera = Camera.defaultCamera..applySettings(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```dart
context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.on](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```dart
camera.switchToDesiredState(FrameSourceState.on);
```



## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```dart
var dataCaptureView = DataCaptureView.forContext(dataCaptureContext);
// Add the dataCaptureView to your widget tree
```

To visualize the results of Barcode Batch, first you need to add the following [overlay](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay):

```dart
var overlay = BarcodeBatchBasicOverlay.withBarcodeBatchForView(barcodeBatch, dataCaptureView);
```

Once the overlay has been added, you should implement the [BarcodeBatchBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener) interface. The method [BarcodeBatchBasicOverlayListener.brushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a [brush](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/brush.html#class-scandit.datacapture.core.ui.Brush) that will be used to highlight that specific barcode in the [overlay](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay).

```dart
@override
Brush brushForTrackedBarcode(BarcodeBatchBasicOverlay overlay, TrackedBarcode trackedBarcode) {// Return a custom
Brush based on the tracked barcode.
// Return a custom Brush based on the tracked barcode.
}
```

If you would like to make the highlights tappable, you need to implement the [BarcodeBatchBasicOverlayListener.didTapTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.OnTrackedBarcodeTapped) method.

```dart
@override
void didTapTrackedBarcode(BarcodeBatchBasicOverlay overlay, TrackedBarcode trackedBarcode) {
// A tracked barcode was tapped.
}
```

## Get Barcode Batch Feedback

Barcode Batch, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) to provide a similar experience. Below, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/flutter/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration if you want.

Next, use this [feedback](https://docs.scandit.com/data-capture-sdk/flutter/core/api/feedback.html#class-scandit.datacapture.core.Feedback) in a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener):

```dart
class FeedbackListener implements BarcodeBatchListener {
@override
void didUpdateSession(BarcodeBatch barcodeBatch, BarcodeBatchSession session) {
if (session.addedTrackedBarcodes.isNotEmpty) {
feedback.emit();
}
}
}
```

[BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) is invoked for every processed frame. The [session](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession) parameter contains information about the currently tracked barcodes, in particular, the newly recognized ones. We check if there are any and if so, we emit the feedback.

As the last step, register the listener responsible for emitting the feedback with the [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance.

```dart
barcodeBatch.addListener(feedbackListener);
```

## Disabling Barcode Batch

To disable barcode tracking set [BarcodeBatch.isEnabled](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-batch.html#property-scandit.datacapture.barcode.batch.BarcodeBatch.IsEnabled) to _false_. The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [SwitchToDesiredState](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of
[StandBy](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.Standby).
