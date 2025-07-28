---
sidebar_position: 2
pagination_prev: null
framework: web
keywords:
  - web
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- [Configure and initialize](#configure-and-initialize-the-library) the library.
- Create a new [data capture context](#create-the-data-capture-context) instance, initialized with your license key.
- Create a [barcode capture settings](#configure-the-barcode-scanning-behavior) and enable the [barcode symbologies](../../../barcode-symbologies.md) you want to read in your application.
- Create a new [barcode capture mode](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance and initialize it with the settings created above.
- Register a [barcode capture listener](#register-the-barcode-capture-listener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [camera](#use-the-built-in-camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [data capture view](#use-a-capture-view-to-visualize-the-scan-process).
- If displaying a preview, optionally create a new [`overlay`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) and add it to data capture view for a better visual feedback.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to your [Scandit account](https://ssl.scandit.com/dashboard/sign-in?p=test).
:::


### Internal dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

### Configure and Initialize the Library

The library needs to be configured and initialized before it can be used, this is done via the [configure](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html) function.

The configuration expects a valid Scandit Data Capture SDK license key as part of the options.

The [ConfigureOptions.libraryLocation](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.LibraryLocation) configuration option must be provided and point to the location of the Scandit Data Capture library/engine location (external WebAssembly files): _scandit-datacapture-sdk*.min.js_ and _scandit-datacapture-sdk*.wasm_.

WebAssembly requires these separate files which are loaded by our main library at runtime. They can be found inside the _sdc-lib_ folder in the library you either added and installed via npm or access via a CDN.

If you added and installed the library, these files should be put in a path that’s accessible to be downloaded by the running library script. The configuration option that you provide should then point to the folder containing these files, either as a path of your website or an absolute URL (like the CDN one).

By default, the library will look at the root of your website. 
If you use a CDN to access the library, you will want to set this to the following values depending on the data capture mode you are using:

- for barcode capture: https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.0.0/sdc-lib/, https://unpkg.com/browse/@scandit/web-datacapture-barcode@7.0.0/sdc-lib/, or similar.

- for ID capture: https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-id@7.0.0/sdc-lib/, https://unpkg.com/browse/@scandit/web-datacapture-id@7.0.0/sdc-lib/, or similar.

:::note
Please ensure that the library version of the imported library corresponds to the version of the external Scandit Data Capture library/engine files retrieved via the `libraryLocation` option, either by ensuring the served files are up-to-date or the path/URL specifies a specific version.

In case a common CDN is used here (jsDelivr or UNPKG) the library will automatically internally set up the correct URLs pointing directly at the files needed for the matching library version.

It is highly recommended to handle the serving of these files yourself on your website/server, ensuring optimal compression, correct wasm files MIME type, no request redirections and correct caching headers usage, thus resulting in faster loading.
:::

We recommended to call [configure](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html) as soon as possible in your application so that the files are already downloaded and initialized when the capture process is started.

```js
import { configure } from '@scandit/web-datacapture-core';
import { barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
	moduleLoaders: [barcodeCaptureLoader()],
});
```

:::note
You must _await_ the returned promise as shown to be able to continue.
:::


### Server side rendering and Server side generation

If you use a web framework that renders also on the server (SSR or SSG) it’s recommended to execute the library only on the client turning off the rendering on the server.

**For more information:**

- [GatsbyJS - Using client side only packages](https://www.gatsbyjs.com/docs/using-client-side-only-packages/).
- [NextJS - Lazy Loading with no ssr](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr).

## Show loading status with default UI

To show some feedback to the user about the loading status you have two options: use the default UI provided with the SDK or subscribe to the loading status and update your own custom UI. Let’s see how we you can show the default UI first:

```js
import { DataCaptureView, configure, DataCaptureContext } from '@scandit/web-datacapture-core';
const view = new DataCaptureView();

view.connectToElement(document.getElementById('data-capture-view'));
view.showProgressBar();
view.setProgressBarMessage('Loading ...');

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
	moduleLoaders: [barcodeCaptureLoader()],
});

view.hideProgressBar();

const context = await DataCaptureContext.create();
await view.setContext(context);
```

## Show loading status with custom UI

You can also just subscribe for the [loading status](https://docs.scandit.com/data-capture-sdk/web/core/api/web/loading-status.html) of the library by simply attaching a listener like this:

```js
import { loadingStatus, configure } from '@scandit/web-datacapture-core';

loadingStatus.subscribe((info) => {
	// updateUI(info.percentage, info.loadedBytes)
});

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: '/self-hosted-sdc-lib/',
	moduleLoaders: [barcodeCaptureLoader()],
});
```

:::note
We suggest serving the library files with the proper headers Content-Length and Content-Encoding if any compression is present.
In case of totally missing information, we show estimated progress.
:::

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).

```js
import { DataCaptureContext } from '@scandit/web-datacapture-core';

// the license key used in configure() will be used
const context = await DataCaptureContext.create();
```

## Configure the Barcode Scanning Behavior

Barcode scanning is orchestrated by the [BarcodeCapture](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) [data capture mode](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called symbologies. The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```js
import { BarcodeCaptureSettings, Symbology } from '@scandit/web-datacapture-barcode';

const settings = new BarcodeCaptureSettings();
settings.enableSymbologies([
	Symbology.Code128,
	Symbology.Code39,
	Symbology.QR,
	Symbology.EAN8,
	Symbology.UPCE,
	Symbology.EAN13UPCA,
]);
```

If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [BarcodeCaptureSettings.codeDuplicateFilter](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around 500 or even -1 if you do not want codes to be scanned more than once.

Next, create a [BarcodeCapture](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance with the settings initialized in the previous step:

```js
import { BarcodeCapture } from '@scandit/web-datacapture-barcode';

const barcodeCapture = await BarcodeCapture.forContext(
	context,
	settings
);
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [BarcodeCapture.addListener()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) interface. For example:

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

When using the built-in camera, there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```js
import { Camera } from '@scandit/web-datacapture-core';
import { BarcodeCapture } from '@scandit/web-datacapture-barcode';

const cameraSettings = BarcodeCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

const camera = Camera.default;
await camera.applySettings(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```js
await context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```js
await context.frameSource.switchToDesiredState(Scandit.FrameSourceState.On);
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frameSource, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
import { DataCaptureView } from '@scandit/web-datacapture-core';

const view = await DataCaptureView.forContext(context);
view.connectToElement(document.querySelector("#the-element-where-to-attach-the-view"));
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```js
import { BarcodeCaptureOverlay } from '@scandit/web-datacapture-barcode';

const overlay =
	await BarcodeCaptureOverlay.withBarcodeCaptureForView(
		barcodeCapture,
		view
	);
```

## Disabling Barcode Capture

```js
await barcodeCapture.setEnabled(false);
```

To disable barcode capture, for instance, as a consequence of a barcode 
being recognized call [BarcodeCapture.setEnabled()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.SetEnabled) passing false.

The effect is immediate: no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.