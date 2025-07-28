---
sidebar_position: 1
toc_max_heading_level: 3
pagination_next: null
framework: web
keywords:
  - web
---

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your web project.
You can consume the Scandit Data Capture SDK Web packages in two ways:

- as an external resource from a CDN in HTML
- as package dependency via npm.

Scandit Data Capture SDKs [npm packages](https://www.npmjs.com/search?q=@scandit) are distributed under `@scandit/` scope.

You need to add the `@scandit/web-datacapture-core` package, which contains the shared functionality used by the other data capture packages.

If you're using `barcodecapture`-related functionalities,
make sure to also add the:

- `@scandit/web-datacapture-barcode` package, and/or
- `@scandit/web-datacapture-parser`

In addition, you need to add `@scandit/web-datacapture-id` if you want to scan personal identification documents, such as identity cards, passports or visas. See the [ID Capture documentation](/sdks/web/id-capture/get-started.md) to learn more.

:::tip
You can safely remove _barcode_ or _id_ dependencies if you are not going to use their features.
:::

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

- The latest stable version of Node.js and npm (required only if including and building the SDK as part of an app, instead of just including it as an external resource from a CDN in HTML).
- Valid Scandit Data Capture SDK license, sign up for a [free trial](https://www.scandit.com/trial/) if you don't already have a license key

:::warning
Devices running the Scandit Data Capture SDK need to have a GPU and run a browser capable of making it available (requires [WebGL - current support?](https://caniuse.com/#feat=webgl) and [OffscreenCanvas - current support?](https://caniuse.com/#feat=offscreencanvas)) or the performance will drastically decrease.
:::

## Install via CDN

:::warning Important considerations when using CDNs
CDNs offer a convenient way to get started but they introduce dependencies into your application. Your app's functionality becomes directly tied to the CDN's availability and performance. Any CDN outages or slowdowns will immediately affect your users' experience.

For production environments, we recommend:

1. **Self-hosting** the SDK files on your own infrastructure, where you are strongly encouraged to:

   - Configure optimal cache headers and compression settings
   - Set correct MIME types for .wasm, .js and .model files
   - Control Content-Length headers for accurate loading progress
   - Minimize request redirections and network latency
   - Implement your own fallback mechanisms

2. If self-hosting isn't feasible, use a **paid enterprise CDN service** that provides:
   - Guaranteed uptime and performance metrics
   - Enterprise-grade support
:::

You can use the [jsDelivr](https://jsdelivr.com/) or [UNPKG](https://unpkg.com/) CDN to specify a certain version (or range) and include and import from our library as follows. This example imports the core and barcode capture packages:

```html
<!-- 
You can optionally preload the modules. 
More info about this feature here https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload 
-->
<link
  rel="modulepreload"
  href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/build/js/index.js"
/>
<link
  rel="modulepreload"
  href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/build/js/index.js"
/>
<!-- polyfill browsers not supporting import maps. use the latest version from here https://github.com/guybedford/es-module-shims/releases -->
<script
  async
  src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js"
></script>
<script type="importmap">
  {
    "imports": {
      "@scandit/web-datacapture-core": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/build/js/index.js",
      "@scandit/web-datacapture-barcode": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/build/js/index.js",
      "@scandit/web-datacapture-barcode/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/",
      "@scandit/web-datacapture-core/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/"
    }
  }
</script>

<script type="module">
  // Import only the necessary items is recommended
  import {
    DataCaptureContext,
    Camera,
    configure,
  } from "@scandit/web-datacapture-core";
  import {
    BarcodeCapture,
    barcodeCaptureLoader,
  } from "@scandit/web-datacapture-barcode";

  // Insert your code here
</script>
OR
<script type="module">
  // OR import everything. Not recommended.
  import * as SDCCore from "@scandit/web-datacapture-core";
  import * as SDCBarcode from "@scandit/web-datacapture-barcode";

  // Insert your code here
</script>
```

:::note
The alternative link(s) for UNPKG are [here](https://unpkg.com/@scandit/web-datacapture-core@7.x) for Core and [here](https://unpkg.com/@scandit/web-datacapture-barcode@7.x) for Barcode.
:::

Alternatively, you can also put the same JavaScript/TypeScript code in a separate file via:

```html
<script type="module" src="script.js"></script>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Scandit CDN Simple sample</title>
    <script type="importmap">
      {
        "imports": {
          "@scandit/web-datacapture-core": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/build/js/index.js",
          "@scandit/web-datacapture-barcode": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/build/js/index.js",

          "@scandit/web-datacapture-barcode/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/",
          "@scandit/web-datacapture-core/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/"
        }
      }
    </script>
    <link
      rel="modulepreload"
      href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.3.0/build/js/index.js"
    />
    <link
      rel="modulepreload"
      href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/build/js/index.js"
    />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      #app {
        height: 100%;
      }
    </style>
    <!-- Check the latest version here https://github.com/guybedford/es-module-shims/releases -->
    <script
      async
      src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js"
    ></script>
    <script type="module">
      import {
        configure,
        DataCaptureView,
        Camera,
        DataCaptureContext,
        FrameSourceState,
      } from "@scandit/web-datacapture-core";

      import {
        barcodeCaptureLoader,
        BarcodeCaptureSettings,
        BarcodeCapture,
        Symbology,
      } from "@scandit/web-datacapture-barcode";

      let view = new DataCaptureView();
      view.connectToElement(document.getElementById("app"));
      view.showProgressBar();

      await configure({
        licenseKey: "-- ENTER LICENSE KEY HERE --",
        libraryLocation:
          "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/sdc-lib/",
        moduleLoaders: [barcodeCaptureLoader()],
      });
      view.hideProgressBar();

      const camera = Camera.default;

      // Depending on the use case further camera settings adjustments can be made here.
      const context = await DataCaptureContext.create();
      await view.setContext(context);

      const cameraSettings = BarcodeCapture.recommendedCameraSettings;
      await camera.applySettings(cameraSettings);

      await context.setFrameSource(camera);
      await context.frameSource.switchToDesiredState(FrameSourceState.On);

      const settings = new BarcodeCaptureSettings();
      settings.enableSymbologies([Symbology.Code128, Symbology.QR]);

      let barcodeCapture = await BarcodeCapture.forContext(context, settings);

      barcodeCapture.addListener({
        didScan: async (barcodeCaptureMode, session) => {
          const barcode = session.newlyRecognizedBarcode;
          if (!barcode) {
            return;
          }
          const symbology = new SymbologyDescription(barcode.symbology);
          alert(`Scanned: ${barcode.data ?? ""}\n(${symbology.readableName})`);
        },
      });

      await barcodeCapture.setEnabled(true);
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

## Install via npm

To add the packages via npm, you run the following command from your project's root folder:

```sh
npm install --save @scandit/web-datacapture-core @scandit/web-datacapture-barcode
```

:::note
You can also specify a version @`<version>`.
:::

Then import the package in your JavaScript/TypeScript code by using:

```js
// Import only the necessary items is recommended
import {
  DataCaptureContext,
  Camera,
  configure,
} from "@scandit/web-datacapture-core";
import {
  BarcodeCapture,
  barcodeCaptureLoader,
} from "@scandit/web-datacapture-barcode";

// Insert your code here
```

OR

```js
// Import everything
import * as SDCCore from "@scandit/web-datacapture-core";
import * as SDCBarcode from "@scandit/web-datacapture-barcode";

// Insert your code here
```

## Configure the Library

The library needs to be configured and initialized before it can be used, this is done via the [`configure`](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#) function.
Note that the configuration expects a valid license key as part of the options.

:::tip
We recommended to call [`configure`](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#) as soon as possible in your application so that the files are already downloaded and initialized when the capture process is started.
:::

The `LibraryLocation` configuration option must be provided and point to the location of the Scandit Data Capture `sdc-lib` location (external WebAssembly files): `scandit-datacapture-sdk\*.js` and `scandit-datacapture-sdk\*.wasm`.

WebAssembly requires these separate files which are loaded by our main library at runtime.
They can be found inside the `sdc-lib` folder in the library you either added and installed via npm or access via a CDN.
If you installed the library through npm, **these files should be copied and served correctly in a path that will be accessible by the sdk in the configure phase**.

The configuration option that you provide should then point to the folder containing these files, either as a path of your website or an absolute URL (like the CDN one). **By default the library will look at the root of your website**.

Please ensure that the library version of the imported library corresponds to the version of the external Scandit Data Capture library/engine files retrieved via the `libraryLocation` option,
either by ensuring the served files are up-to-date or the path/URL specifies a specific version.

In case a common CDN is used (jsDelivr or UNPKG) the library will automatically, internally set up the correct URLs pointing to the files needed for the matching library version.
**It is highly recommended to handle the serving of these files yourself on your website/server, ensuring optimal compression, correct WASM files MIME type, no request redirections, and correct caching headers usage.**
This will aid in faster loading.

## Hosting the `sdc-lib` files

We recommend serving the `sdc-lib` folder yourself.

When doing so, be sure to copy the entire folder and serve the files correctly by setting up the correct MIME type for the `.wasm`, `.model`, and `.js` files. Some common examples are provided below:

<Tabs groupId="selfhost">

<TabItem value="ASP.NET Core" label="ASP.NET Core">

```csharp
app.UseStaticFiles(new StaticFileOptions()
{
  ServeUnknownFileTypes = true,
  DefaultContentType = "application/octet-stream"
});
```

Or

```csharp
var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
provider.Mappings[".model"] = "application/octet-stream";
provider.Mappings[".js"] = "application/javascript";
provider.Mappings[".wasm"] = "application/wasm";
```

</TabItem>

<TabItem value="Apache" label="Apache">

Add these MIME types to your `.htaccess` file or Apache configuration:

```apache
AddType application/wasm .wasm
AddType application/octet-stream .model
AddType application/javascript .js
```

</TabItem>

<TabItem value="Nginx" label="Nginx">

Add these MIME types to your Nginx configuration file:

```nginx
types {
    application/wasm wasm;
    application/octet-stream model;
    application/javascript js;
}
```

</TabItem>

<TabItem value="Express.js" label="Express.js">

For Express.js, you can configure the MIME types like this:

```javascript
const express = require("express");
const app = express();

express.static.mime.define({ "application/wasm": ["wasm"] });
express.static.mime.define({ "application/octet-stream": ["model"] });
express.static.mime.define({ "application/javascript": ["js"] });
app.use(express.static("self-hosted-sdc-lib")); // Serve static files from 'public' directory
```

</TabItem>

<TabItem value="Python Flask" label="Python Flask">

For Flask, you can set the MIME types when serving the files:

```python
from flask import Flask, send_file

app = Flask(__name__)

@app.route('/self-hosted-sdc-lib/<path:filename>')
def serve_file(filename):
    mimetype = None
    if filename.endswith('.wasm'):
        mimetype = 'application/wasm'
    elif filename.endswith('.model'):
        mimetype = 'application/octet-stream'
    elif filename.endswith('.js'):
        mimetype = 'application/javascript'
    return send_file(
        f'/self-hosted-sdc-lib/{filename}',
        mimetype=mimetype
    )
```

</TabItem>

</Tabs>

## Show loading status with default UI

It could take a while the very first time to download the .wasm files.
To show some feedback to the user about the loading status you have two options:

- use the default UI provided with the SDK
- subscribe to the loading status and update your own custom UI.

Let's see how to do it with the default UI first:

```ts
import {
  configure,
  DataCaptureView,
  DataCaptureContext,
} from "@scandit/web-datacapture-core";

const view = new DataCaptureView();

view.connectToElement(document.getElementById("data-capture-view"));
view.showProgressBar();
view.setProgressBarMessage("Loading ...");

await configure({
  licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --",
  libraryLocation: "/self-hosted-sdc-lib/",
  moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
});

view.hideProgressBar();

const context: DataCaptureContext = await DataCaptureContext.create();
await view.setContext(context);
```

## Show loading status with custom UI

You can also subscribe for the [loading status](https://docs.scandit.com/data-capture-sdk/web/core/api/web/loading-status.html) of the library
by simply attaching a listener like this:

```ts
import { configure, loadingStatus } from "@scandit/web-datacapture-core";
loadingStatus.subscribe((info) => {
  // updateUI(info.percentage, info.loadedBytes)
});

await configure({
  licenseKey: "SCANDIT_LICENSE_KEY",
  libraryLocation: "/self-hosted-sdc-lib/",
  moduleLoaders: [barcodeCaptureLoader()],
});
```

:::note
We suggest serving the library files with the proper headers `Content-Length` and `Content-Encoding` if any compression is present.
In case of totally missing information, we show an estimated progress.
:::

## Additional Information

### Server Side Rendering and Server Side Generation

If you use a web framework that renders also on the server (SSR or SSG) it's recommended to execute the library only on the client turning off the rendering on the server.

For more information:

- [GatsbyJS - Using client side only packages](https://www.gatsbyjs.com/docs/using-client-side-only-packages/).
- [NextJS - Lazy Loading with no ssr](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr).

### Camera Permissions

When using the Scandit Data Capture SDK you will likely want to set the camera as the frame source for various capture modes.
The camera permissions are handled by the browser, and can only be granted if a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) is used and have been accepted by the user explicitly.

### Progressive Web App (PWA)

You can configure the scanner to work offline making the web app progressive (Progressive Web App). There are some settings to consider. If you use workbox a tool that uses workbox under the hood like [Vite PWA](https://vite-pwa-org.netlify.app/) plugin, you must set also these options:

```js
workbox: {
  globPatterns: ["**/*.{css,html,ico,png,svg,woff2}", "**/*.{wasm,js}"],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // up to 10mb because of wasm files
  // Don't ignore version parameters - let each version have its own cache entry
  runtimeCaching: [
    {
      urlPattern: /^.*\.wasm(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'wasm-version-cache',
        expiration: {
          maxEntries: 2, // Keep only 2 versions to manage storage
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        // This ensures the version parameter is part of the cache key
        matchOptions: {
          ignoreSearch: false, // Don't ignore search parameters (like ?v=)
        },
      },
    },
  ],
},
```

With these settings in place and the service worker correctly configured, you will be able to have a full offline scanning experience.

:::warning
On iOS there's an [issue](https://bugs.webkit.org/show_bug.cgi?id=252465) while accessing the video stream inside a progressive web app. The issue is flaky and gets reopened periodically.
Check the [webkit tracker](https://bugs.webkit.org/buglist.cgi?quicksearch=pwa%20getUserMedia)
if you experience similar issues.
:::

### Electron

You can configure the Scandit SDK to work into an Electron app. The register method must be called inside the `main.ts` file passing down some dependencies and the `publicKey`. The `publicKey` will be used to decrypt the encrypted license key file that must be placed into the [`ConfigureOptions.licenseDataPath`](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.LicenseDataPath) option:

```ts
// electron main.ts
import { register, unregister } from '@scandit/web-datacapture-core/build/electron/main';
import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

const mainWindow = new BrowserWindow({
    ...,
});

register({ fs, ipcMain, app, path, crypto }, publicKey);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    unregister()
  }
});
```

```ts
// preload.ts
import { ipcRenderer } from "electron";
import { preloadBindings } from "@scandit/web-datacapture-core/build/electron/preload";
preloadBindings(ipcRenderer);
```

```ts
// renderer.ts
await configure({
  // In Electron context the license will be decrypted internally.
  // The path of the encrypted file is path.join(app.getAppPath(), licenseDataPath)
  licenseDataPath: "./out/renderer/data/sdc-license.data",
  libraryLocation: new URL("self-hosted-sdc-lib", document.baseURI).toString(),
  moduleLoaders: [barcodeCaptureLoader()],
});
```

You can encrypt your license key with this small Node.js script. Then you should copy the `sdc-license.data` file in the `licenseDataPath` in order to be correctly read at runtime in the configure phase.

You can also check the related [sample](https://github.com/Scandit/datacapture-web-samples/tree/master/ElectronBarcodeCaptureSimpleSample).

```js
const crypto = require("node:crypto");
const fs = require("node:fs/promises");

(async function createLicenseAndPublicKey() {
  const data = process.env.SDC_LICENSE_KEY;
  if (data == null || data === "") {
    throw new Error("could not encrypt empty or null string");
  }

  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const keyAndIV = `${key.toString("base64")}:${iv.toString("base64")}`;

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedText = cipher.update(text, "utf8", "hex");
  encryptedText += cipher.final("hex");

  await fs.writeFile("sdc-license.data", Buffer.from(encryptedText), "utf8");
  // Save the key to a file
  await fs.writeFile("sdc-public-key", keyAndIV, "utf8");
})();
```

:::warning
It is recommended to NOT store the public key locally. We also recommend
you enable [source code protection](https://electron-vite.org/guide/source-code-protection) with [bytenode](https://github.com/bytenode/bytenode).
:::

import OSSLicense from '../../partials/\_third-party-licenses-js.mdx';

<OSSLicense/>
