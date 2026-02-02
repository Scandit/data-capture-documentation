---
description: "This page will guide you through the process of adding ID Capture to your React Native application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.                                                    "

sidebar_position: 2
framework: react
keywords:
  - react
---

# Get Started

This page will guide you through the process of adding ID Capture to your React Native application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Create a new Data Capture Context instance
- Access a Camera
- Configure the Capture Settings
- Implement a Listener to Receive Scan Results
- Set-up the Capture View and Overlay
- Start the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with your integration, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. See the [installation guide](/sdks/react-native/add-sdk.md) for details.

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import IdModuleOverview from '../../../partials/get-started/_id-module-overview-no-eu-dl.mdx';

<IdModuleOverview/>

## Create the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html#class-scandit.datacapture.core.Camera):

```js
const camera = Camera.default;
context.setFrameSource(camera);

const cameraSettings = IdCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

if (camera != null) {
	camera.applySettings(cameraSettings);
}
```

## Configure the Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type to use and the documents that should be accepted and/or rejected.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all the available options.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

```js
const settings = new IdCaptureSettings();
settings.scannerType = SingleSideScanner(); // To scan only one-sided documents
// settings.scannerType = FullDocumentScanner(); // To scan both sides of the document

settings.acceptedDocuments.push(
	new DriverLicense(IdCaptureRegion.Any),
	new Passport(IdCaptureRegion.Any)
);
settings.rejectedDocuments.push(
	new IdCard(IdCaptureRegion.Any)
);
```

## Implement the Listener

To receive scan results, implement and [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener).

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

```js
const listener = {
	didCaptureId: (idCapture, session) => {
		if (session.newlyCapturedId.isPassport() = true) {
			// Handle the information extracted.
		} else if (session.newlyCapturedId.isDriverLicense() = true) {
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
const idCapture = new IdCapture(settings);
context.addMode(idCapture);
idCapture.addListener(listener);
```

## Set up Capture View and Overlay

When using the built-in camera as frame source, you may typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
<DataCaptureView context={this.dataCaptureContext} ref={this.viewRef}>
```

Then, add an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to the view:

```js
let overlay = IdCaptureOverlay.withIdCaptureForView(
	idCapture,
	this.viewRef.current
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```js
camera.switchToDesiredState(FrameSourceState.On);
```
