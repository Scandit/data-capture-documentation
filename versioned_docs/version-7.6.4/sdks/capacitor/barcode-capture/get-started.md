---
description: "In this guide you will learn step-by-step how to add Barcode Capture to your application.                                                                                     "

sidebar_position: 2
pagination_prev: null
framework: capacitor
keywords:
  - capacitor
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- Create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) instance, initialized with your license key.
- Create a [barcode capture settings](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and enable the [barcode symbologies](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read in your application.
- Create a new [barcode capture mode](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance and initialize it with the settings created above.
- Register a [barcode capture listener](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [camera](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [data capture view](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).
- If displaying a preview, optionally create a new [overlay](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) and add it to [data capture view](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for a better visual feedback.

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```js
const context = Scandit.DataCaptureContext.forLicenseKey(
	'-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
);
```

## Configure the Barcode Scanning Behavior

Barcode scanning is orchestrated by the [BarcodeCapture](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) [data capture mode](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [BarcodeCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows to register one or more [listeners](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called [symbologies](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```js
const settings = new Scandit.BarcodeCaptureSettings();
settings.enableSymbologies([
	Scandit.Symbology.Code128,
	Scandit.Symbology.Code39,
	Scandit.Symbology.QR,
	Scandit.Symbology.EAN8,
	Scandit.Symbology.UPCE,
	Scandit.Symbology.EAN13UPCA,
]);
```

If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [BarcodeCaptureSettings.codeDuplicateFilter](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around 500 or even \-1 if you do not want codes to be scanned more than once.

Next, create a [BarcodeCapture](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance with the settings initialized in the previous step:

```js
const barcodeCapture = Scandit.BarcodeCapture.forContext(context, settings);
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [BarcodeCapture.addListener()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) interface. For example:

```js
const listener = {
	didScan: (barcodeCapture, session) => {
		const recognizedBarcodes = session.newlyRecognizedBarcode;
		// Do something with the barcodes
	},
};
```

Then add the listener:

```js
barcodeCapture.addListener(listener);
```

### Rejecting Barcodes

To prevent scanning unwanted codes, you can reject them by adding the desired logic to the `onBarcodeScanned` method. This will prevent the barcode from being added to the session and will not trigger the `onSessionUpdated` method.

The example below will only scan barcodes beginning with the digits `09` and ignore all others, using a transparent brush to distinguish a rejected barcode from a recognized one:

```js
...
if (!barcode.data || !barcode.data.startsWith('09:')) {
	window.overlay.brush = Scandit.Brush.transparent;
    return;
}
...
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

```js
const cameraSettings = Scandit.BarcodeCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

const camera = Scandit.Camera.default;

if (camera) {
	camera.applySettings(cameraSettings);
}
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```js
context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
const view = Scandit.DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```js
const overlay = Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(
	barcodeCapture,
	view
);
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set [BarcodeCapture.isEnabled](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/barcode-capture.html#property-scandit.datacapture.barcode.BarcodeCapture.IsEnabled) to _false_.

The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
