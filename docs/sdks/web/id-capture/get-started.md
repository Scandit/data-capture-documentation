---
sidebar_position: 2
framework: web
keywords:
  - web
---

# Get Started With ID Capture

## Quick overview

_ID Capture_ provides the capability to scan personal identification documents, such as identity cards, passports or visas. In this guide you will learn step by step how to add ID Capture to your application. The general step are:

:::note
Using ID Capture at the same time as other modes (e.g. Barcode Capture or Text Capture) is currently not supported.
:::

- Create a [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).
- Access a [Camera](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera).
- Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scan process.
- Implement an [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) to receive scan results.
- Set up [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to see the camera feed and the scan UI.
- Begin the scanning by adding an [IdCapture](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) to [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and starting a camera.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and
that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

### Configure and Initialize the Library

The library needs to be configured and initialized before it can be used, this is done via the [configure](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html) function.

The configuration expects a valid Scandit Data Capture SDK license key as part of the options.

The [ConfigureOptions.libraryLocation](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.LibraryLocation 'ConfigureOptions.libraryLocation property') configuration option must be provided and point to the location of the Scandit Data Capture library/engine location (external WebAssembly files): scandit-datacapture-sdk\*.min.js and
scandit-datacapture-sdk\*.wasm. WebAssembly requires these separate files which are loaded by our main library at runtime. They can be found inside the engine folder in the library you either added and installed via npm or access via
a CDN; if you added and installed the library, these files should be put in a path that’s accessible to be downloaded by the running library script. The configuration option that you provide should then point to the folder containing these files, either as a path of your website or an absolute URL (like the CDN one). By default the library will look at the root of your website. If you use a CDN to access the library, you will want to set this to the following values depending on the data capture mode you are using:

- for barcode capture: https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.0.0/sdc-lib/, https://unpkg.com/browse/@scandit/web-datacapture-barcode@7.0.0/sdc-lib/, or similar.
- for ID capture: https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-id@7.0.0/sdc-lib/, https://unpkg.com/browse/@scandit/web-datacapture-id@7.0.0/sdc-lib/, or similar.

Please ensure that the library version of the imported library corresponds to the version of the external Scandit Data Capture library/engine files retrieved via the libraryLocation option, either by ensuring the served files are up-to-date or the path/URL specifies a specific version. In case a common CDN is used here (jsDelivr or UNPKG) the library will automatically internally set up the correct URLs pointing directly at the files needed for the matching library version. It is highly recommended to handle the serving of these files yourself on your website/server, ensuring optimal compression, correct wasm files MIME type, no request redirections and correct caching headers usage; thus
resulting in faster loading.

We recommended to call [configure](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html) as soon as possible in your application so that the files are already downloaded and initialized when the capture process is started.

For ID Capture, the result of [idCaptureLoader()](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#method-scandit.datacapture.id.IdCaptureLoader) must be passed to the [ConfigureOptions.moduleLoaders](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.ModuleLoaders) option. In this example, we will scan VIZ documents, so we also need to set [IdCaptureLoaderOptions.enableVIZDocuments](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture.html#property-scandit.datacapture.id.IIdCaptureLoaderOptions.EnableVIZDocuments) to true:

```ts
import { configure } from '@scandit/web-datacapture-core';
import { idCaptureLoader } from '@scandit/web-datacapture-id';

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: '/engine/',
	moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
});
```

:::note
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

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the types of documents that you’d like to scan. Check [IdDocumentType](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all the available options.

:::warning
Using [IdDocumentType.DLVIZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardVIZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) together with any MRZ document [IdDocumentType.IdCardMRZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardMrz),[IdDocumentType.VisaMRZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.VisaMrz), [IdDocumentType.PassportMRZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.PassportMrz), [IdDocumentType.SwissDLMRZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.SwissDlMrz)) while [SupportedSides.FrontAndBack](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-supported-document-sides.html#value-scandit.datacapture.id.SupportedSides.FrontAndBack) is enabled is currently not supported.
:::

```ts
import { IdCaptureSettings, IdDocumentType } from "@scandit/web-datacapture-id";

const settings = new IdCaptureSettings();
settings.supportedDocuments = [
	IdDocumentType.IdCardVIZ,
	IdDocumentType.AAMVABarcode,
	IdDocumentType.DLVIZ,
];
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). A result is delivered as [CapturedId](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents. For more specific information use its non-_null_ result properties (for example [CapturedId.aamvaBarcodeResult](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.AamvaBarcode)).

```ts
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

```ts
import { IdCapture } from "@scandit/web-datacapture-id";

// ...

const idCapture = await IdCapture.forContext(context, settings);
idCapture.addListener(listener);
```

## Use a Capture View to Visualize the Scan Process

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

## Turn on the Camera

Finally, turn on the camera to start scanning:

```ts
import { FrameSourceState } from "@scandit/web-datacapture-core";

// ...

await camera.switchToDesiredState(FrameSourceState.On);
```