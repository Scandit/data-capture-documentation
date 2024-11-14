---
sidebar_position: 2
framework: capacitor
keywords:
  - capacitor
---

# Get Started

In this guide you will learn step-by-step how to add ID Capture to your application.

:::note
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and
that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```js
const context = Scandit.DataCaptureContext.forLicenseKey(
	'-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
);
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/camera.html#class-scandit.datacapture.core.Camera):

```js
const camera = Scandit.Camera.default;
context.setFrameSource(camera);

const cameraSettings = Scandit.IdCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

if (camera != null) {
	camera.applySettings(cameraSettings);
}
```

## Create ID Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the types of documents that you’d like to scan. Check [IdDocumentType](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all the available options.

:::warning
Using [IdDocumentType.DLVIZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardVIZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) together with any MRZ document ([IdDocumentType.IdCardMRZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardMrz), [IdDocumentType.VisaMRZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.VisaMrz), [IdDocumentType.PassportMRZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.PassportMrz), [IdDocumentType.SwissDLMRZ](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.SwissDlMrz)) while [SupportedSides.FrontAndBack](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-supported-document-sides.html#value-scandit.datacapture.id.SupportedSides.FrontAndBack) is enabled is currently not supported.
:::

```js
const settings = new Scandit.IdCaptureSettings();
settings.supportedDocuments = [
	Scandit.IdDocumentType.IdCardVIZ,
	Scandit.IdDocumentType.AAMVABarcode,
	Scandit.IdDocumentType.DLVIZ,
];
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). A result is delivered as [CapturedId](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents. For more specific information use its non-_null_ result properties (for example [CapturedId.aamvaBarcodeResult](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.AamvaBarcode)).

```js
const listener = {
	didCaptureId: (idCapture, session) => {
		if (session.newlyCapturedId.aamvaBarcodeResult != null) {
			// Handle the information extracted.
		}
	},
	didFailWithError: (idCapture, error, session) => {
		// Handle the error.
	},
};
```

Create a new ID Capture mode with the chosen settings. Then register the listener:

```js
const idCapture = Scandit.IdCapture.forContext(context, settings);
idCapture.addListener(listener);
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
const view = Scandit.DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```js
let overlay = Scandit.IdCaptureOverlay.withTextCaptureForView(
	idCapture,
	dataCaptureView
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

## Turn on the Camera

Finally, turn on the camera to start scanning:

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

And this is it. You can now scan documents.
