---
description: "In this guide you will learn step-by-step how to add MatrixScan to your application.                                                                                      "

sidebar_position: 2
pagination_next: null
framework: web
keywords:
  - web
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- Create a new [data capture context](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext), initialized with your license key.
- Create a [barcode tracking settings](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) instance where you enable the [barcode symbologies](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read in your application.
- Create a new [barcode tracking](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) object and initialize it with the settings created above.
- Obtain a [camera](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context previously created.
- Create a new [data capture view](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) and add a [basic overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay) instance to it for visual feedback.
- Register an [overlay listener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener) and implement [BrushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode), which is called whenever a new tracked barcode appears.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Improve runtime performance by enabling browser multithreading

You can achieve better performance by enabling multithreading in any browser that supports it. Check the [Requirements Page](../../../system-requirements.md) to know the minimum versions that can take advantage of multithreading.

To enable multithreading you must set your site to be [crossOriginIsolated](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated/). This will enable the SDK to use multithreading and significantly boost performance. If the environment supports it the SDK will automatically use multithreading. You can programmatically check for multithreading support using [BrowserHelper.checkMultithreadingSupport()](https://docs.scandit.com/data-capture-sdk/web/core/api/web/browser-compatibility.html#method-scandit.datacapture.core.BrowserHelper.CheckMultithreadingSupport).

:::important
Multithreading is particularly critical for MatrixScan as it significantly improves frame processing speed and tracking accuracy. Be sure to configure it correctly following this [tutorial](https://web.dev/coop-coep/). You can also check this [guide to enable cross-origin isolation](https://web.dev/cross-origin-isolation-guide/) and [safely reviving shared memory](https://hacks.mozilla.org/2020/07/safely-reviving-shared-memory/).
:::

#### Verify multithreading is enabled

You can verify that multithreading is working correctly by checking the cross-origin isolation status:

```js
import { BrowserHelper } from "@scandit/web-datacapture-core";

// Whether or not the browser supports SharedArrayBuffer, the page is served to be crossOriginIsolated and has support for nested web workers.
const supportsMultithreading = await BrowserHelper.checkMultithreadingSupport();

if (supportsMultithreading) {
  console.log("Multithreading is enabled and working!");
} else {
  console.warn("Multithreading is not available. Check your cross-origin headers.");
}

```

#### Configure cross-origin headers

To enable cross-origin isolation, you need to set specific HTTP headers **on your HTML page** (not on the SDK files). The headers you need depend on whether you're self-hosting or using a CDN:

:::warning CDN vs Self-Hosting
If you're loading the SDK from a CDN (jsDelivr, UNPKG, etc.), you should use `Cross-Origin-Embedder-Policy: credentialless` instead of `require-corp` to avoid blocking cross-origin resources. Alternatively, **we strongly recommend self-hosting the SDK files** when using multithreading for better reliability and to avoid potential CDN CORS/CORP issues.
:::

**Choose the appropriate header configuration:**

- **If self-hosting the SDK**: Use `Cross-Origin-Embedder-Policy: require-corp`
- **If using a CDN**: Use `Cross-Origin-Embedder-Policy: credentialless` (requires modern browsers)

Below are examples for common server setups:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="cross-origin-headers">

<TabItem value="Nginx" label="Nginx">

Add these headers to your Nginx configuration file (usually in `/etc/nginx/sites-available/` or within a `server` block):

**For self-hosted SDK:**

```nginx
server {
    # ... other configuration ...

    location / {
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;

        # ... other directives ...
    }
}
```

**For CDN-hosted SDK:**

```nginx
server {
    # ... other configuration ...

    location / {
        add_header Cross-Origin-Embedder-Policy "credentialless" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;

        # ... other directives ...
    }
}
```

After making changes, reload Nginx:

```sh
sudo nginx -t && sudo nginx -s reload
```

</TabItem>

<TabItem value="Apache" label="Apache">

Add these headers to your `.htaccess` file or Apache configuration:

**For self-hosted SDK:**

```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

**For CDN-hosted SDK:**

```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "credentialless"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

Make sure `mod_headers` is enabled:

```sh
sudo a2enmod headers
sudo systemctl restart apache2
```

</TabItem>

<TabItem value="Express.js" label="Express.js">

For Express.js applications, add the headers using middleware:

**For self-hosted SDK:**

```javascript
const express = require("express");
const app = express();

// Add cross-origin isolation headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// ... rest of your app configuration ...

app.listen(3000);
```

**For CDN-hosted SDK:**

```javascript
const express = require("express");
const app = express();

// Add cross-origin isolation headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// ... rest of your app configuration ...

app.listen(3000);
```

</TabItem>

<TabItem value="Vite" label="Vite">

For Vite projects, create a custom plugin in your `vite.config.ts`:

**For self-hosted SDK:**

```typescript
import { defineConfig, type PluginOption } from 'vite';

function crossOriginIsolation(): PluginOption {
  return {
    name: 'vite-plugin-cross-origin-isolation',
    configureServer: (server) => {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        next();
      });
    },
    configurePreviewServer: (server) => {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [crossOriginIsolation()],
  // ... other config
});
```

**For CDN-hosted SDK:**

```typescript
import { defineConfig, type PluginOption } from 'vite';

function crossOriginIsolation(): PluginOption {
  return {
    name: 'vite-plugin-cross-origin-isolation',
    configureServer: (server) => {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        next();
      });
    },
    configurePreviewServer: (server) => {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [crossOriginIsolation()],
  // ... other config
});
```

This plugin configures headers for both `vite dev` (development) and `vite preview` (production preview) modes.

</TabItem>

<TabItem value="Netlify" label="Netlify">

Create a `_headers` file in your publish directory (usually `public/` or `dist/`):

**For self-hosted SDK:**

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

**For CDN-hosted SDK:**

```
/*
  Cross-Origin-Embedder-Policy: credentialless
  Cross-Origin-Opener-Policy: same-origin
```

</TabItem>

<TabItem value="Vercel" label="Vercel">

Add the headers to your `vercel.json` configuration file:

**For self-hosted SDK:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

**For CDN-hosted SDK:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "credentialless"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

</TabItem>

<TabItem value="ASP.NET Core" label="ASP.NET Core">

Add the headers in your `Program.cs` or `Startup.cs`:

**For self-hosted SDK:**

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
    context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
    await next();
});
```

**For CDN-hosted SDK:**

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "credentialless");
    context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
    await next();
});
```

Or use middleware in `Program.cs` (change the COEP value as needed):

```csharp
app.UseMiddleware<CrossOriginIsolationMiddleware>();

// Middleware class:
public class CrossOriginIsolationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _coepValue; // "require-corp" or "credentialless"

    public CrossOriginIsolationMiddleware(RequestDelegate next, string coepValue = "require-corp")
    {
        _next = next;
        _coepValue = coepValue;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers.Add("Cross-Origin-Embedder-Policy", _coepValue);
        context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
        await _next(context);
    }
}
```

</TabItem>

</Tabs>

:::note
**Important notes:**

- After configuring the headers, clear your browser cache and restart your development server to ensure the new headers take effect.
- `Cross-Origin-Embedder-Policy: credentialless` requires Chrome 96+, Edge 96+, or other Chromium-based browsers. For older browser support, self-hosting with `require-corp` is more reliable.
- Verify your configuration using `BrowserHelper.checkMultithreadingSupport()` - it should return `true` if multithreading is properly enabled (see [Verify multithreading is enabled](#verify-multithreading-is-enabled) above).
- If you see CORS errors after enabling these headers, verify that all external resources (fonts, analytics, etc.) either use CORS or are self-hosted.

:::

### Internal dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext).

```js
import { DataCaptureContext } from "@scandit/web-datacapture-core";
import { barcodeCaptureLoader } from "@scandit/web-datacapture-barcode";

const context = await DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --', {
 libraryLocation: new URL('library/engine/', document.baseURI).toString(),
 moduleLoaders: [barcodeCaptureLoader()],
});
```

## Configure the Barcode Batch Mode

The main entry point for the Barcode Batch Mode is the [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) object. It is configured through [BarcodeBatchSettings](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) that will get informed whenever a new frame has been processed.

Most of the time, you will not need to implement a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener), instead you will add a [BarcodeBatchBasicOverlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay) and implement a [BarcodeBatchBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener).

For this tutorial, we will setup Barcode Batch for tracking QR codes.

```js
import { BarcodeBatchSettings, Symbology } from "@scandit/web-datacapture-barcode";

const settings = new BarcodeBatchSettings();
settings.enableSymbologies([Symbology.QR]);
```

Next, create a [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance with the data capture context and the settings initialized in the previous steps:

```js
import { BarcodeBatch } from "@scandit/web-datacapture-barcode";

const barcodeBatch = await BarcodeBatch.forContext(context, settings);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume
that you use the built-in camera.

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```js
import { Camera } from "@scandit/web-datacapture-core";
import { BarcodeBatch } from "@scandit/web-datacapture-barcode";

const camera = Camera.pickBestGuess();

const cameraSettings = BarcodeBatch.recommendedCameraSettings;
await camera.applySettings(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```js
await context.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling
[FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of
[FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```js
await camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
import { DataCaptureView } from "@scandit/web-datacapture-core";

const view = await DataCaptureView.forContext(context);
view.connectToElement(htmlElement);
```

To visualize the results of Barcode Batch, first you need to add the following [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay):

```js
import { BarcodeBatchBasicOverlay } from "@scandit/web-datacapture-barcode";

const overlay =
 await BarcodeBatchBasicOverlay.withBarcodeBatchForView(
  barcodeBatch,
  view
 );
```

Once the overlay has been added, you should implement the [BarcodeBatchBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener) interface. The method [BarcodeBatchBasicOverlayListener.brushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a [brush](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/brush.html#class-scandit.datacapture.core.ui.Brush) that will be used to highlight that specific barcode in the [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay).

```js
overlay.listener = {
 brushForTrackedBarcode: (overlay, trackedBarcode) => {
  // Return a custom Brush based on the tracked barcode.
 },
};
```

If you would like to make the highlights tappable, you need to implement the [BarcodeBatchBasicOverlayListener.didTapTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.OnTrackedBarcodeTapped) method.

```js
overlay.listener = {
 didTapTrackedBarcode: (overlay, trackedBarcode) => {
  // A tracked barcode was tapped.
 },
};
```

## Get Barcode Batch Feedback

Barcode Batch, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) to provide a similar experience. Below, we use the default
[Feedback](https://docs.scandit.com/data-capture-sdk/web/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration if you want.

Next, use this [feedback](https://docs.scandit.com/data-capture-sdk/web/core/api/feedback.html#class-scandit.datacapture.core.Feedback) in a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener):

```js
const feedbackListener = {
 didUpdateSession: (barcodeBatch, session) => {
  if (session.addedTrackedBarcodes.length > 0) {
   feedback.emit();
  }
 },
};
```

[BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) is invoked for every processed frame. The [session](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession) parameter contains information about the currently tracked barcodes, in particular, the newly recognized ones. We check if there are any and if so, we emit the feedback.

As the last step, register the listener responsible for emitting the feedback with the [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance.

```js
barcodeBatch.addListener(feedbackListener);
```

## Disabling Barcode Batch

To disable barcode tracking call [BarcodeBatch.setEnabled()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#method-scandit.datacapture.barcode.batch.BarcodeBatch.SetEnabled) passing _false_. No more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or switched to standby by calling [SwitchToDesiredState](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [StandBy](https://docs.scandit.com/data-capture-sdk/web/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.Standby).

### Limitations[](#limitations 'Permalink to this headline')

MatrixScan does not support the following symbologies:

- DotCode
- MaxiCode
- All postal codes (KIX, RM4SCC)

:::important
Barcode Batch needs browser multithreading to run. Check the minimum browser support in the [Requirements Page](../../../system-requirements.md) and how to enable it in [Improve runtime performance by enabling browser multithreading](#improve-runtime-performance-by-enabling-browser-multithreading), above.
:::
