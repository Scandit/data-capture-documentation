---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
---

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your web project. You can add the Scandit Data Capture SDK Web packages in two ways: as an external resource from a CDN in HTML, or as a package dependency via npm.

Scandit Data Capture SDKs are distributed as [npm packages](https://www.npmjs.com/search?q=scandit-web-datacapture-*).

You need to add the `scandit-web-datacapture-core` package, which contains the shared functionality used by the other data capture packages.

If you’re using `barcodecapture`-related functionalities, make sure to also add the `scandit-web-datacapture-barcode` package. In addition you need a add `scandit-web-datacapture-id` - the [ScanditIdCapture API](https://docs.scandit.com/data-capture-sdk/web/id-capture/overview.html) - if you want to scan personal identification documents, such as identity cards, passports or visas.

:::note
You can safely remove _barcode_ or _id_ dependencies if you are not going to use their features.
:::

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

- The latest stable version of Node.js and npm (required only if including and building the SDK as part of an app, instead of just including it as an external resource from a CDN in HTML).
- Valid Scandit Data Capture SDK license, sign up for a [free trial](https://www.scandit.com/trial/) if you don't already have a license key

:::warning
Devices running the Scandit Data Capture SDK need to have a GPU and run a browser capable of making it available (requires [WebGL - current support?](https://caniuse.com/#feat=webgl) and [OffscreenCanvas - current support?](https://caniuse.com/#feat=offscreencanvas)) or the performance will drastically decrease.
:::

## CDN

You can use the [jsDelivr](https://jsdelivr.com/) or [UNPKG](https://unpkg.com/) CDN to specify a certain version (range) and include and import from our library as follows (example for barcode capture):

```html
<!-- polyfill browsers not supporting import maps. use the latest version from here https://github.com/guybedford/es-module-shims -->
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js"></script>
<script type="importmap">
    {
      "imports": {
        "scandit-web-datacapture-core": "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-core@[version]/build/js/index.js",
        "scandit-web-datacapture-barcode": "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@[version]/build/js/index.js",
        "scandit-web-datacapture-barcode/": "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@[version]/",
        "scandit-web-datacapture-core/": "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-core@[version]/"
      }
    }
</script>

<script type="module">
 // Import only needed items
 import { DataCaptureContext, Camera } from 'scandit-web-datacapture-core';
 import { BarcodeCapture } from 'scandit-web-datacapture-barcode';
 
 // OR import everything
 import * as SDCCore from 'scandit-web-datacapture-core';
 import * as SDCBarcode from 'scandit-web-datacapture-barcode'; 

 // Insert your code here
</script>
```

:::note
The alternative link(s) for UNPKG are be [here](https://unpkg.com/scandit-web-datacapture-core@6.x) for Core and [here](https://unpkg.com/scandit-web-datacapture-barcode@6.x) for Barcode.
:::

Alternatively, you can also put the same JavaScript/TypeScript code in a separate file via:

```html
<script type="module" src="script.js"></script>
```

## npm

To add the packages via npm, you run the following command from your project’s root folder:

```sh
npm install --save scandit-web-datacapture-core scandit-web-datacapture-barcode
```

:::note
You can also specify a version @`<version>`.
:::

Then import the package in your JavaScript/TypeScript code by using:

```js
// Import everything
import * as SDCCore from 'scandit-web-datacapture-core';
import * as SDCBarcode from 'scandit-web-datacapture-barcode';

// And/or import only needed items (examples)
import { DataCaptureContext, Camera } from 'scandit-web-datacapture-core';
import { BarcodeCapture } from 'scandit-web-datacapture-barcode';

// Insert your code here
```

# Additional Information

:::note
When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. The camera permissions are handled by the browser, can only be granted if a secure context is used and have to be accepted by the user explicitly when needed.
:::

## For Progressive Web App(PWA)

You can easily configure the scanner to work offline making the web app progressive (Progressive Web App). There are some settings to consider though. If you use workbox , or you’re using a tool that use workbox under the hood like Vite PWA , you must consider to set these options:

```js
{
  globPatterns: ["**/*.{css,html,ico,png,svg,woff2}", "**/*.{wasm,js}"], // Be sure to add also .wasm
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // Increase size cache up to 6mb
  ignoreURLParametersMatching: [/^v/], // Ignore ?v=x.x.x query string param when using importScripts
}
```

With these settings in place and the service worker correctly configured, you will be able to have a full offline scanning experience.

:::warning
On iOS there’s a [persisting issue](https://bugs.webkit.org/show_bug.cgi?id=252465) while accessing the video stream inside a progressive web app.
:::

## Electron

You can easily configure the web sdk to work into an Electron app. There are some extra steps though. The register method must be called inside the main.ts file passing down some dependencies and the publicKey. The publicKey will be used to decrypt the encrypted license key file that must be placed into the [`ConfigureOptions.licenseDataPath`](https://docs.scandit.com/data-capture-sdk/web/core/api/web/configure.html#property-scandit.datacapture.core.IConfigureOptions.LicenseDataPath) option:

```ts
// electron main.ts
import { register, unregister } from 'scandit-web-datacapture-core/build/electron/main';
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
import { ipcRenderer } from 'electron';
import { preloadBindings } from 'scandit-web-datacapture-core/build/electron/preload';
preloadBindings(ipcRenderer);
```

```ts
// renderer.ts
await configure({
  // in Electron context the license will be decrypted internally.
  // The path of the encrypted file is path.join(app.getAppPath(), licenseDataPath)
  licenseDataPath: './out/renderer/data/sdc-license.data',
  libraryLocation: new URL('library/engine/', document.baseURI).toString(),
  moduleLoaders: [barcodeCaptureLoader()]
});
```

You can easily encrypt your license key with this small nodejs script. Then you should copy the sdc-license.data file in the licenseDataPath in order to be correctly read at runtime in the configure phase. You can also check the related [sample](https://github.com/Scandit/datacapture-web-samples/tree/master/ElectronBarcodeCaptureSimpleSample).

```js
const crypto = require('node:crypto')
const fs = require('node:fs/promises')

;(async function createLicenseAndPublicKey() {

  const data = process.env.SDC_LICENSE_KEY
  if (data == null || data === '') {
    throw new Error('could not encrypt empty or null string')
  }

  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const keyAndIV = `${key.toString('base64')}:${iv.toString('base64')}`

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encryptedText = cipher.update(text, 'utf8', 'hex')
  encryptedText += cipher.final('hex')

  await fs.writeFile('sdc-license.data', Buffer.from(encryptedText), 'utf8')
  // Save the key to a file
  await fs.writeFile(
    'sdc-public-key',
    keyAndIV,
    'utf8'
  )
})();
```

:::warning
It is recommended to NOT store the public key locally. We also recommended you enable [source code protection](https://electron-vite.org/guide/source-code-protection) with [bytenode](https://github.com/bytenode/bytenode).
:::
