---
sidebar_position: 2
framework: web
keywords:
  - web
---

# Get Started

This page will guide you through the process of adding ID Capture to your Web application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Create a [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).
- Access a [Camera](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera).
- Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scan process.
- Implement an [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) to receive scan results.
- Set up [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to see the camera feed and the scan UI.
- Begin the scanning by adding an [IdCapture](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) to [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and starting a camera.

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/web/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

### Internal Dependencies

import InternalDependencies from '../../../partials/_id-internal-deps.mdx';

<InternalDependencies/>

### Configure and Initialize the Library

In addition to the configuration detailed in the [installation guide](/sdks/web/add-sdk.md#configure-the-library), there are some additional steps required for ID Capture.

For ID Capture, the result of [idCaptureLoader()](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#method-scandit.datacapture.id.IdCaptureLoader) must be passed to the [ConfigureOptions.moduleLoaders](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.ModuleLoaders) option.

In this example, we will scan VIZ documents, so we also need to set [IdCaptureLoaderOptions.enableVIZDocuments](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#property-scandit.datacapture.id.IIdCaptureLoaderOptions.EnableVIZDocuments) to true:

```ts
import { configure } from '@scandit/web-datacapture-core';
import { idCaptureLoader } from '@scandit/web-datacapture-id';

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: '/sdc-lib/',
	moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
});
```

:::warning
You must await the returned promise as shown to be able to continue.
:::

### Server Side Rendering and Server Side Generation

If you use a web framework that renders also on the server (SSR or SSG) it’s recommended to execute the library only on the client turning off the rendering on the server.

For more information:

- [GatsbyJS - Using client side only packages](https://www.gatsbyjs.com/docs/using-client-side-only-packages/).
- [NextJS - Lazy Loading with no ssr](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr).

## Show loading status with default UI

To show some feedback to the user about the loading status you have two options: use the default UI provided with the SDK or subscribe to the loading status and update your own custom UI. Let’s see how we you can show the default UI first:

```ts
import { configure, DataCaptureView, DataCaptureContext } from "@scandit/web-datacapture-core"
const view = new DataCaptureView();

view.connectToElement(document.getElementById('data-capture-view'));
view.showProgressBar();
view.setProgressBarMessage('Loading ...');

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: '/engine/',
	moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
});

view.hideProgressBar();

const context: DataCaptureContext = await DataCaptureContext.create();
await view.setContext(context);
```

## Show loading status with custom UI

You can also just subscribe for the [loading status](https://docs.scandit.com/data-capture-sdk/web/core/api/web/loading-status.html) of the library by simply attaching a listener like this:

```ts
import { configure, loadingStatus } from "@scandit/web-datacapture-core"
loadingStatus.subscribe((info) => {
	// updateUI(info.percentage, info.loadedBytes)
});

await configure({
	licenseKey: 'SCANDIT_LICENSE_KEY',
	libraryLocation: '/engine',
	moduleLoaders: [barcodeCaptureLoader()],
});
```

:::note
We suggest serving the library files with the proper headers `Content-Length` and `Content-Encoding` if any compression is present. 
In case of totally missing information, we show an estimated progress.
:::

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).

```js
import { DataCaptureContext } from "@scandit/web-datacapture-core"

// the license key used in configure() will be used
const context = await DataCaptureContext.create();
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera 'Camera class'):

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

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type to use and the documents that should be accepted and/or rejected.

Check [IdDocumentType](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all available options.

```ts
import { IdCaptureSettings, IdDocumentType } from "@scandit/web-datacapture-id";

const settings = new IdCaptureSettings();
settings.scannerType(
    SingleSideScanner // To scan only one-sided documents
    // or
    FullDocumentScanner // To scan both sides of the document
);

settings.acceptedDocuments(PASSPORT, DRIVER_LICENSE);
settings.rejectedDocuments(ID_CARD);
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). 

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

```ts
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

```ts
import { IdCapture } from "@scandit/web-datacapture-id";

// ...

const idCapture = await IdCapture.forContext(context, settings);
idCapture.addListener(listener);
```

## Set up Capture View and Overlay

When using the built-in camera as [frameSource](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#interface-scandit.datacapture.core.IFrameSource), you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```ts
const view = await DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```ts
import { IdCaptureOverlay } from "@scandit/web-datacapture-id";

// ...

let overlay = await IdCaptureOverlay.withIdCaptureForView(
	idCapture,
	dataCaptureView
);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```ts
import { FrameSourceState } from "@scandit/web-datacapture-core";

// ...

await camera.switchToDesiredState(FrameSourceState.On);
```