---
description: "This page will guide you through the process of adding ID Capture to your Cordova application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.                                                     "

sidebar_position: 2
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Get Started

This page will guide you through the process of adding ID Capture to your Cordova application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/cordova/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import IdModuleOverview from '../../../partials/get-started/_id-module-overview-no-eu-dl.mdx';

<IdModuleOverview/>

To learn more about specifying native dependencies on Cordova and the framework tag, take a look at the official [Cordova documentation](https://cordova.apache.org/docs/en/latest/plugin%5Fref/spec.html#framework).

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```js
const context = Scandit.DataCaptureContext.forLicenseKey(
	'-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
);
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/cordova/core/api/camera.html#class-scandit.datacapture.core.Camera):

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

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type and the accepted and rejected documents.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all available options.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

```ts
const settings = new Scandit.IdCaptureSettings();

// Documents from any region:
settings.acceptedDocuments.push(new Scandit.IdCard(Scandit.Region.AnyRegion));
// Only documents issued by a specific country:
settings.acceptedDocuments.push(new Scandit.IdCard(Scandit.Region.Germany));
// Regional documents:
settings.acceptedDocuments.push(new Scandit.RegionSpecific.ApecBusinessTravelCard());
// Reject passports from certain regions:
settings.rejectedDocuments.push(new Scandit.Passport(Scandit.Region.Cuba));

// To scan only one-sided documents and a given zone:
settings.scannerType = new Scandit.SingleSideScanner({ barcode: true });
// or
settings.scannerType = new Scandit.SingleSideScanner({ machineReadableZone: true });
// or
settings.scannerType = new Scandit.SingleSideScanner({ visualInspectionZone: true });

// To scan both sides of the document:
settings.scannerType = new Scandit.FullDocumentScanner();
```

Create a new ID Capture mode with the chosen settings:

```ts
const idCapture = new Scandit.IdCapture(settings);
context.addMode(idCapture);
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). The listener provides two callbacks: `onIdCaptured` and `onIdRejected`.

```ts
idCapture.addListener({
	onIdCaptured: (data) => {
		// Success! Handle extracted data here.
	},
	onIdRejected: (data, reason) => {
		// Something went wrong. Inspect the reason to determine the follow-up action.
	}
});
```

### Handling Success

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

On a successful scan you may read the extracted data from `CapturedId`:

```ts
onIdCaptured: (data) => {
	const fullName = data.fullName;
	const dateOfBirth = data.dateOfBirth;
	const dateOfExpiry = data.dateOfExpiry;
	const documentNumber = data.documentNumber;

	// Process data:
	processData(fullName, dateOfBirth, dateOfExpiry, documentNumber);
}
```

:::tip
All data fields are optional, so it's important to verify whether the required information is present if some of the accepted documents may not contain certain data.
:::

### Handling Rejection

The ID scanning process may fail for various reasons. Start from inspecting [RejectionReason](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) to understand the cause.

You may wish to implement the follow-up action based on the reason of failure:

```ts
onIdRejected: (data, reason) => {
	if (reason === Scandit.RejectionReason.Timeout) {
		// Ask the user to retry, or offer alternative input method.
	} else if (reason === Scandit.RejectionReason.DocumentExpired) {
		// Ask the user to provide alternative document.
	} else if (reason === Scandit.RejectionReason.HolderUnderage) {
		// Reject the process.
	}
}
```

## Set up Capture View and Overlay

When using the built-in camera as [frameSource](https://docs.scandit.com/data-capture-sdk/cordova/core/api/frame-source.html#interface-scandit.datacapture.core.IFrameSource), you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
const view = Scandit.DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```js
let overlay = Scandit.IdCaptureOverlay.withTextCaptureForView(
	idCapture,
	dataCaptureView
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```js
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

And this is it. You can now scan documents.


