---
sidebar_position: 2
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Get Started

In this guide you will learn step-by-step how to add ID Capture to your application.

:::note
Using ID Capture at the same time as other modes (e.g. Barcode Capture or Text Capture) is not supported.
:::

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Internal dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module  | Dependencies     |
| ----------------------------------- | ------------------------- |
| scandit-cordova-datacapture-core    | No dependencies     |
| scandit-cordova-datacapture-barcode | scandit-cordova-datacapture-core          |
| scandit-cordova-datacapture-parser  | scandit-cordova-datacapture-core        |
| scandit-cordova-datacapture-id      | scandit-cordova-datacapture-core scandit-cordova-datacapture-text(VIZ documents) |

When adding `ScanditIdCapture` to a Cordova project, certain native dependencies need to be added manually to your project, depending on the documents you want to scan.

If you’re only scanning barcode based documents, you only need to add the `ScanditIdCapture` Cordova plugin.

If you’re also scanning VIZ documents, you also need to add the ScanditOCR and ScanditTextCaptureBase native dependencies through CocoaPods and Gradle references in your app’s config.xml file, as shown below, specifying the version you’re using:

```xml
<platform name="ios">
	<framework src="ScanditOCR" spec="= [version]" type="podspec" />
</platform>
<platform name="android">
	<framework src="com.scandit.datacapture:text-base:[version]" />
</platform>
```

If you’re also scanning MRZ documents, you also need the native ScanditTextCapture dependency, analogous to the approach before:

```xml
<platform name="ios">
	<framework src="ScanditTextCapture" spec="= [version]" type="podspec" />
</platform>
<platform name="android">
	<framework src="com.scandit.datacapture:text:[version]" />
</platform>
```

To learn more about specifying native dependencies on Cordova and the framework tag, take a look at the official [Cordova documentation](https://cordova.apache.org/docs/en/latest/plugin%5Fref/spec.html#framework).

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```js
const context = Scandit.DataCaptureContext.forLicenseKey(
	'-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
);
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/camera.html#class-scandit.datacapture.core.Camera):

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

Use [IdCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the types of documents that you’d like to scan. Check [IdDocumentType](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all the available options.

:::warning
Using [IdDocumentType.DLVIZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardVIZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) together with any MRZ document ([IdDocumentType.IdCardMRZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardMrz), [IdDocumentType.VisaMRZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.VisaMrz), [IdDocumentType.PassportMRZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.PassportMrz), [IdDocumentType.SwissDLMRZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.SwissDlMrz)) while [SupportedSides.FrontAndBack](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-supported-document-sides.html#value-scandit.datacapture.id.SupportedSides.FrontAndBack) is enabled is currently not supported.
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

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). A result is delivered as [CapturedId](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents. For more specific information use its non-_null_ result properties (for example [CapturedId.aamvaBarcodeResult](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.AamvaBarcode)).

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

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
const view = Scandit.DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```js
let overlay = Scandit.IdCaptureOverlay.withTextCaptureForView(
	idCapture,
	dataCaptureView
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

## Turn on the Camera

Finally, turn on the camera to start scanning:

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

And this is it. You can now scan documents.

## Capture both the front and the back side of documents

By default, when [IdDocumentType.DLVIZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardVIZ](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) are selected, _Id Capture_ scans only the front side of documents. Sometimes however, you may be interested in extracting combined information from both the front and the back side.

Currently the combined result contains the following information: \* AAMVA-compliant documents (for example US Driver’s Licenses): the human-readable front side of the document and the data encoded in the PDF417 barcode in the back; \* European IDs: the human-readable sections of the front and the back side, and the data encoded in the Machine Readable Zone (MRZ); \* Other documents: the human-readable section of the front and the back side (if present).

First, enable scanning of both sides of documents in [IdCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings):

```js
settings.supportedDocuments = [
	Scandit.IdDocumentType.IdCardVIZ,
	Scandit.IdDocumentType.DLVIZ,
];
settings.supportedSides = Scandit.SupportedSides.FrontAndBack;
```

Start by scanning the front side of a document. After you receive the result in [IdCaptureListener](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener), inspect [VIZResult.isBackSideCaptureSupported](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.IsBackSideCaptureSupported). If scanning of the back side of your document is supported, flip the document and capture the back side as well. The next result that you receive is a combined result that contains
the information from both sides. You may verify this by checking [VIZResult.capturedSides](https://docs.scandit.com/6.28/data-capture-sdk/cordova/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.CapturedSides). After both sides of the document are scanned, you may proceed with another document.

Sometimes, you may not be interested in scanning the back side of a document, after you completed the front scan. For example, your user may decide to cancel the process. Internally, _Id Capture_ maintains the state of the scan, that helps it to provide better combined results. To abandon capturing the back of a document, reset this state by calling:

```js
idCapture.reset();
```

Otherwise, _Id Capture_ may assume that the front side of a new document is actually the back side of an old one, and provide you with nonsensical results.
