---
description: "In this guide you will learn step-by-step how to add Barcode Capture to your application."
sidebar_position: 2
pagination_prev: null
framework: web
keywords:
  - web
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any. See the [Installation guide](../add-sdk.md) for details.
- Create a new [data capture context](#create-the-data-capture-context) instance, initialized with your license key.
- Create a [barcode capture settings](#configure-the-barcode-scanning-behavior) and enable the [barcode symbologies](../../../barcode-symbologies) you want to read in your application.
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

## Create the Data Capture Context

To initialize the library and create a data capture context, see the [Installation guide](../add-sdk.md#configure-the-library) for detailed information about configuration options, hosting the `sdc-lib` files, and loading status handling.

For barcode capture, create the context like this:

```ts
import { DataCaptureContext } from '@scandit/web-datacapture-core';
import { barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';

const context = await DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --', {
 libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
 moduleLoaders: [barcodeCaptureLoader()],
});
```

:::note
You must _await_ the returned promise as shown to be able to continue. For information about showing loading status and handling server-side rendering, see the [Installation guide](../add-sdk.md).
:::

## Configure the Barcode Scanning Behavior

Barcode scanning is orchestrated by the [BarcodeCapture](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) [data capture mode](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called symbologies. The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```ts
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

```ts
import { BarcodeCapture } from '@scandit/web-datacapture-barcode';

const barcodeCapture = await BarcodeCapture.forContext(
 context,
 settings
);
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [BarcodeCapture.addListener()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) interface. For example:

```ts
import type { BarcodeCaptureListener, BarcodeCapture, BarcodeCaptureSession, Barcode } from '@scandit/web-datacapture-barcode';

const listener: BarcodeCaptureListener = {
 didScan: (barcodeCapture: BarcodeCapture, session: BarcodeCaptureSession) => {
  const recognizedBarcode: Barcode = session.newlyRecognizedBarcode;
  // Do something with the barcode
 },
};

barcodeCapture.addListener(listener);
```

### Rejecting Barcodes

To prevent scanning unwanted codes, you can reject them by adding the desired logic to the `didScan` callback. This will prevent the barcode from being processed further.

The example below will only scan barcodes beginning with the digits `09` and ignore all others, using a transparent brush to distinguish a rejected barcode from a recognized one:

```ts
import { Brush } from '@scandit/web-datacapture-core';

// ...
if (!barcode.data || !barcode.data.startsWith('09:')) {
    overlay.brush = Brush.transparent;
    return;
}
// ...
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

When using the built-in camera, there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```ts
import { Camera } from '@scandit/web-datacapture-core';
import { BarcodeCapture } from '@scandit/web-datacapture-barcode';

const cameraSettings = BarcodeCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

const camera = Camera.pickBestGuess();
await camera.applySettings(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```ts
await context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```ts
import { FrameSourceState } from '@scandit/web-datacapture-core';

await context.frameSource.switchToDesiredState(FrameSourceState.On);
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frameSource, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```ts
import { DataCaptureView } from '@scandit/web-datacapture-core';

const view = await DataCaptureView.forContext(context);
view.connectToElement(document.querySelector("#the-element-where-to-attach-the-view"));
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```ts
import { BarcodeCaptureOverlay } from '@scandit/web-datacapture-barcode';

const overlay = await BarcodeCaptureOverlay.withBarcodeCaptureForView(
  barcodeCapture,
  view
);
```

## Disabling Barcode Capture

```ts
await barcodeCapture.setEnabled(false);
```

To disable barcode capture, for instance, as a consequence of a barcode
being recognized call [BarcodeCapture.setEnabled()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.SetEnabled) passing false.

The effect is immediate: no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
