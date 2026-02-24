---
description: "In this guide you will learn step by step how to add barcode selection to your application. The general step are:                                                                               "

sidebar_position: 2
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Get Started

:::warning
We recommend using **SparkScan** or **Barcode Capture API** instead of Barcode Selection. With the new [AI-powered features](/sdks/cordova/ai-powered-barcode-scanning), barcode selection in crowded environments is done without the need of a dedicated API. This API will be deprecated.
:::

In this guide you will learn step by step how to add barcode selection to your application. The general step are:

- Initialize the [data capture context](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) with your license key.
- Create a [barcode selection settings](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and choose the right configuration.
- Create a new [barcode selection mode](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) instance and initialize it with the settings created above.
- Register a [barcode selection listener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [camera](https://docs.scandit.com/data-capture-sdk/cordova/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [data capture view](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).
- If displaying a preview, optionally create a new [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-selection-basic-overlay.html#class-scandit.datacapture.barcode.selection.ui.BarcodeSelectionBasicOverlay) and add it to [data capture view](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for a better visual feedback.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the [data capture context](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) with a valid Scandit Data Capture SDK license key.

```js
await DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode Selection Behavior

_Symbologies_

Barcode selection is orchestrated by the [BarcodeSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) [data capture mode](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). It is configured through [BarcodeSelectionSettings](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) that will get informed whenever new codes have been selected.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called [symbologies](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```js
const settings = new Scandit.BarcodeSelectionSettings();
settings.enableSymbologies([
	Scandit.Symbology.Code128,
	Scandit.Symbology.EAN8,
	Scandit.Symbology.UPCE,
	Scandit.Symbology.EAN13UPCA,
]);
```

_Selection Types_

The behavior of Barcode Selection can be changed by using a different [selection
type](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-type.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionType). This defines the method used by [BarcodeSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) to select codes. Currently there are two types.

If you want the user to select barcodes with a tap, then use
[BarcodeSelectionTapSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection). This selection type can automatically freeze the camera preview to make the selection easier. You can configure the freezing behavior via [BarcodeSelectionTapSelection.freezeBehavior](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.FreezeBehavior). With
[BarcodeSelectionTapSelection.tapBehavior](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.TapBehavior) you can decide if a second tap on a barcode means that the barcode is unselected or if it is selected another time (increasing the counter).

:::note
Using [BarcodeSelectionTapSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection) requires the MatrixScan add-on.
:::

If you want the selection to happen automatically based on where the user points the camera, then use [BarcodeSelectionAimerSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-aimer-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAimerSelection). It is possible to choose between two different [selection strategies](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-strategy.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionStrategy). Use [BarcodeSelectionAutoSelectionStrategy](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAutoSelectionStrategy) if you want the barcodes to be selected automatically when aiming at them as soon as the intention is understood by our internal algorithms. Use [BarcodeSelectionManualSelectionStrategy](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionManualSelectionStrategy) if you want the barcodes to be selected when aiming at them and tapping anywhere on the screen.

_Single Barcode Auto Detection_

If you want to automatically select a barcode when it is the only one on screen, turn on [BarcodeSelectionSettings.singleBarcodeAutoDetection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-settings.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionSettings.SingleBarcodeAutoDetection).

_Creating the mode_

Next, create a [BarcodeSelection](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) instance with the settings initialized in the previous step:

```js
const barcodeSelection = new Scandit.BarcodeSelection(settings);
DataCaptureContext.sharedInstance.addMode(barcodeSelection);
```

## Register the Barcode Selection Listener

To get informed whenever a new code has been recognized, add a [BarcodeSelectionListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) through [BarcodeSelection.addListener()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#method-scandit.datacapture.barcode.selection.BarcodeSelection.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeSelectionListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) interface. For example:

```js
const listener = {
	didUpdateSelection: (barcodeSelection, session) => {
		const newlySelectedBarcodes = session.newlySelectedBarcodes;
		// Do something with the barcodes
	},
};
```

Then add the listener:

```js
barcodeSelection.addListener(listener);
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

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the
recommended settings and create the camera from it:

```js
const cameraSettings = Scandit.BarcodeSelection.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.

const camera = Scandit.Camera.default;

if (camera) {
	camera.applySettings(cameraSettings);
}
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to
[DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```js
DataCaptureContext.sharedInstance.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of
[FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

## Disabling Barcode Selection

To disable barcode selection, for instance when the selection is complete, set [BarcodeSelection.isEnabled](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelection.IsEnabled) to _false_. The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
