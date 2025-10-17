---
description: "This page will guide you through the process of adding ID Capture to your Web application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.                                                     "

sidebar_position: 2
framework: web
keywords:
  - web
---

# Get Started

This page will guide you through the process of adding ID Capture to your Web application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Create a [DataCaptureContext](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).
- Access a [Camera](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera).
- Use [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scan process.
- Implement an [IdCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) to receive scan results.
- Set up [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and [IdCaptureOverlay](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to see the camera feed and the scan UI.
- Begin the scanning by adding an [IdCapture](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) to [DataCaptureContext](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and starting a camera.

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/web/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

### Module Overview

import IdModuleOverview from '../../../partials/get-started/_id-module-overview-no-eu-dl.mdx';

<IdModuleOverview/>

### Configure and Initialize the Library

In addition to the configuration detailed in the [installation guide](/sdks/web/add-sdk.md#configure-the-library), there are some additional steps required for ID Capture.

For ID Capture, the result of [idCaptureLoader()](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture.html#method-scandit.datacapture.id.IdCaptureLoader) must be passed to the [ConfigureOptions.moduleLoaders](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.ModuleLoaders) option.

In this example, we will scan VIZ documents, so we also need to set [IdCaptureLoaderOptions.enableVIZDocuments](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture.html#property-scandit.datacapture.id.IIdCaptureLoaderOptions.EnableVIZDocuments) to `true`:

```ts
import { configure } from "@scandit/web-datacapture-core";
import { idCaptureLoader } from "@scandit/web-datacapture-id";

await configure({
	licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --",
	libraryLocation: "/self-hosted-sdc-lib/",
	moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
});
```

:::tip
Avoid enabling VIZ documents if you only scan MRZs or barcodes, as it slows down the scanning initialization because more data must be downloaded.
:::

:::warning
You must await the returned promise as shown to be able to continue.
:::

## Create the View

When the scanning process is requested, it is good practice to keep the user informed about what is happening. The SDK may still be loading so you should display a view to the user as soon as possible.

To do that, start by adding a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and attach it to an HTML element in the page. For example, let's display a progress bar while the SDK is loading:

```ts
import { DataCaptureView } from "@scandit/web-datacapture-core";

const view = new DataCaptureView();
view.connectToElement(htmlElement);
view.showProgressBar();
```

:::tip
You may not need to do this so early if your application loads the SDK in the background (e.g. on startup) and the view is already available when the user requests scanning.
:::

## Context

The main conductor to add capture capabilities to your application is the [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). Create an instance of it.

```js
import { DataCaptureContext } from "@scandit/web-datacapture-core"

// the license key used in configure() will be used
const context = await DataCaptureContext.create();

// if you already have a view, attach the new context to it
view.setContext(context);
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/7.6/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera 'Camera class'):

```ts
import { Camera } from "@scandit/web-datacapture-core";
import { IdCapture } from "@scandit/web-datacapture-id";


const camera = Camera.default;
await context.setFrameSource(camera);

const cameraSettings = IdCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

await camera.applySettings(cameraSettings);
```

## Create ID Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type to use and the documents that should be accepted and/or rejected.

Check [IdCaptureDocumentType](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all available options.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

```ts
import {
	IdCapture,
	IdCaptureSettings,
	IdCard,
	Region,
	RegionSpecific,
	Passport,
	SingleSideScanner,
	FullDocumentScanner
} from "@scandit/web-datacapture-id";

const settings = new IdCaptureSettings();

// Documents from any region:
settings.acceptedDocuments.push(new IdCard(Region.AnyRegion));
// Only documents issued by a specific country:
settings.acceptedDocuments.push(new IdCard(Region.Germany));
// Regional documents:
settings.acceptedDocuments.push(new RegionSpecific.ApecBusinessTravelCard());
// Reject passports from certain regions:
settings.rejectedDocuments.push(new Passport(Region.Cuba));

// To scan only one-sided documents and a given zone:
// Signature: SingleSideScanner(barcode: boolean, machineReadableZone boolean, visualInspectionZone: boolean)
settings.scannerType = new SingleSideScanner(true, false, false);
// or
settings.scannerType = new SingleSideScanner(false, true, false);
// or
settings.scannerType = new SingleSideScanner(false, false, true);

// To scan both sides of the document:
settings.scannerType = new FullDocumentScanner();
```

Create a new ID Capture mode with the chosen settings:

```ts
const idCapture = await IdCapture.forContext(context, settings);
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). The listener provides two important callbacks: `didCaptureId` and `didRejectId`.

```ts
import { type CapturedId, RejectionReason } from "@scandit/web-datacapture-id";

idCapture.addListener({
	didCaptureId: (capturedId: CapturedId) => {
		// Success! Handle extracted data here.
	},
	didRejectId: (capturedId: CapturedId, reason: RejectionReason) => {
		// Something went wrong. Inspect the reason to determine the follow-up action.
	}
});
```

### Handling Success

Captured results are delivered as a [CapturedId](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

Note that if you scan boths sides of a document using the [FullDocumentScanner](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-scanner.html#full-document-scanner), this callback will only be executed once both sides have been successfully captured. If the document is known to have only one side, the callback will execute immediately after a successful scan of the first side.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

On a successful scan you may read the extracted data from `capturedId`:

```ts
didCaptureId: async (capturedId: CapturedId) => {
	// stop processing new frames, we have a result
	await idCapture.setEnabled(false);

	const fullName = capturedId.fullName;
	const dateOfBirth = capturedId.dateOfBirth;
	const dateOfExpiry = capturedId.dateOfExpiry;
	const documentNumber = capturedId.documentNumber;

	// Process data:
	processData(fullName, dateOfBirth, dateOfExpiry, documentNumber);
}
```

:::tip
All data fields are optional, so it's important to verify whether the required information is present if some of the accepted documents may not contain certain data.
:::

### Handling Rejection

The ID scanning process may fail for various reasons. Start from inspecting [RejectionReason](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) to understand the cause.

Note that some data may still have been captured, you will find them in the first `capturedId` parameter of the callback.

You may wish to implement the follow-up action based on the reason of failure:

```ts
onIdRejected: (capturedId: CapturedId, reason: RejectionReason) => {
	if (reason === RejectionReason.Timeout) {
		// Ask the user to retry, or offer alternative input method.
	} else if (reason === RejectionReason.DocumentExpired) {
		// Ask the user to provide alternative document.
	} else if (reason === RejectionReason.NotAcceptedDocumentType) {
		// Inform the user which documents are accepted.
	}
}
```

## Add an Overlay

The overlay informs and guides the user during the scanning process. Create an instance of [IdCaptureOverlay](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) for the existing view like so:

```ts
import { IdCaptureOverlay } from "@scandit/web-datacapture-id";

const overlay = await IdCaptureOverlay.withIdCaptureForView(
	idCapture,
	dataCaptureView
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```ts
import { FrameSourceState } from "@scandit/web-datacapture-core";

// ...

await camera.switchToDesiredState(FrameSourceState.On);
```

You can also enable or disable IdCapture by using [setEnabled](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/id-capture.html#method-scandit.datacapture.id.IdCapture.SetEnabled) whenever you need to.
