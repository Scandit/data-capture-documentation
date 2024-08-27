---
sidebar_position: 2
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- Create a new [data capture context](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext), initialized with your license key.
- Create a [barcode tracking settings](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-settings.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings) instance where you enable the [barcode symbologies](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read in your application.
- Create a new [barcode tracking](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) object and initialize it with the settings created above.
- Obtain a [camera](https://docs.scandit.com/data-capture-sdk/cordova/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context previously created.
- Create a new [data capture view](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and add a [basic overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay) instance to it for visual feedback.
- Register an [overlay listener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener) and implement [BrushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.BrushForTrackedBarcode), which is called whenever a new tracked barcode appears.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Internal dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module                              | Dependencies                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| scandit-cordova-datacapture-core    | No dependencies                                                                  |
| scandit-cordova-datacapture-barcode | scandit-cordova-datacapture-core                                                 |
| scandit-cordova-datacapture-parser  | scandit-cordova-datacapture-core                                                 |
| scandit-cordova-datacapture-text    | scandit-cordova-datacapture-core                                                 |
| scandit-cordova-datacapture-id      | scandit-cordova-datacapture-core scandit-cordova-datacapture-text(VIZ documents) |

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```js
const context = Scandit.DataCaptureContext.forLicenseKey(
	'-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
);
```

## Configure the Barcode Tracking Mode

The main entry point for the Barcode Tracking Mode is the [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) object. It is configured through [BarcodeTrackingSettings](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-settings.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) that will get informed whenever a new frame has been processed.

Most of the times, you will not need to implement a [BarcodeTrackingListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener), instead you will add a [BarcodeTrackingBasicOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay) and implement a [BarcodeTrackingBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener).

For this tutorial, we will setup Barcode Tracking for tracking QR codes.

```js
const settings = new Scandit.BarcodeTrackingSettings();
settings.enableSymbology(Scandit.Symbology.QR, true);
```

Next, create a [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) instance with the data capture context and the settings initialized in the previous steps:

```js
const barcodeTracking = Scandit.BarcodeTracking.forContext(context, settings);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

:::important
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [NSCameraUsageDescription](https://developer.apple.com/documentation/bundleresources/information%5Fproperty%5Flist/nscamerausagedescription)
key in your app’s Info.plist file.
:::

:::important
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the AndroidManifest.xml file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the android.permission.CAMERA permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```js
const cameraSettings = Scandit.BarcodeTracking.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

const camera = Scandit.Camera.default;
if (camera != null) {
	camera.applySettings(cameraSettings);
}
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```js
context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

There is a separate guide for [more advanced camera functionality](./advanced).

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
const view = Scandit.DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

To visualize the results of Barcode Tracking, first you need to add the following [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay):

```js
const overlay = Scandit.BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(
	barcodeTracking,
	view
);
```

Once the overlay has been added, you should implement the [BarcodeTrackingBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener) interface. The method
[BarcodeTrackingBasicOverlayListener.brushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a [brush](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/brush.html#class-scandit.datacapture.core.ui.Brush) that will be used to highlight that specific barcode in the [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay).

```js
overlay.listener = {
	brushForTrackedBarcode: (overlay, trackedBarcode) => {
		// Return a custom Brush based on the tracked barcode.
	},
};
```

If you would like to make the highlights tappable, you need to implement the [BarcodeTrackingBasicOverlayListener.didTapTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.OnTrackedBarcodeTapped) method.

```js
overlay.listener = {
	didTapTrackedBarcode: (overlay, trackedBarcode) => {
		// A tracked barcode was tapped.
	},
};
```

## Get Barcode Tracking Feedback

Barcode Tracking, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [BarcodeTrackingListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) to provide a similar experience. Below, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/cordova/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it
with your own sound or vibration if you want.

```js
const feedback = Scandit.Feedback.defaultFeedback;
```

Next, use this [feedback](https://docs.scandit.com/data-capture-sdk/cordova/core/api/feedback.html#class-scandit.datacapture.core.Feedback) in a [BarcodeTrackingListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener):

```js
const feedbackListener = {
	didUpdateSession: (barcodeTracking, session) => {
		if (session.addedTrackedBarcodes.length > 0) {
			feedback.emit();
		}
	},
};
```

[BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) is invoked for every processed frame. The [session](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession) parameter contains information about the currently tracked barcodes, in particular, the newly recognized ones. We check if there are any and if so, we emit the feedback.

As the last step, register the listener responsible for emitting the feedback with the [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) instance.

```js
barcodeTracking.addListener(feedbackListener);
```

## Disabling Barcode Tracking

To disable barcode tracking set [BarcodeTracking.isEnabled](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking.html#property-scandit.datacapture.barcode.tracking.BarcodeTracking.IsEnabled) to _false_. The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [SwitchToDesiredState](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [StandBy](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.Standby).

