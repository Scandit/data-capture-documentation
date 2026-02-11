---
description: "The Parser parses data strings (as found in barcodes) into a set of key-value mappings. These data formats are supported:                                                                                "

sidebar_position: 2
pagination_prev: null
pagination_next: null
framework: web
keywords:
  - web
---

# Get Started

The Parser parses data strings (as found in barcodes) into a set of key-value mappings. These data formats are supported:

- [Health Industry Bar Code (HIBC)](https://docs.scandit.com/data-capture-sdk/web/parser/hibc.html)
- [GS1 Application Identifier system](https://docs.scandit.com/data-capture-sdk/web/parser/gs1ai.html)
- [Swiss QR Codes](https://docs.scandit.com/data-capture-sdk/web/parser/swissqr.html)
- [VIN Vehicle Identification Number](https://docs.scandit.com/data-capture-sdk/web/parser/vin.html)
- [IATA Bar Coded Boarding Pass (BCBP)](https://docs.scandit.com/data-capture-sdk/web/parser/iata-bcbp.html)
- [Electronic Product Code (EPC)](/sdks/web/parser/epc)

More data formats will be added in future releases. Please contact us if the data format you are using is not yet supported, or you want to use the parser on a currently unsupported platform.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

First of all, include the ScanditParser library and its dependencies to your project, if any.

### Internal dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

## Installation

### Install via package manager

To add the packages via your preferred package manager, run the following command from your project's root folder:

<Tabs groupId="packageManager">

<TabItem value="npm" label="npm">

```sh
npm install --save @scandit/web-datacapture-core @scandit/web-datacapture-barcode @scandit/web-datacapture-parser
```

</TabItem>

<TabItem value="yarn" label="yarn">

```sh
yarn add @scandit/web-datacapture-core @scandit/web-datacapture-barcode @scandit/web-datacapture-parser
```

</TabItem>

<TabItem value="pnpm" label="pnpm">

```sh
pnpm add @scandit/web-datacapture-core @scandit/web-datacapture-barcode @scandit/web-datacapture-parser
```

</TabItem>

<TabItem value="bun" label="bun">

```sh
bun add @scandit/web-datacapture-core @scandit/web-datacapture-barcode @scandit/web-datacapture-parser
```

</TabItem>

<TabItem value="deno" label="deno">

```sh
deno add npm:@scandit/web-datacapture-core npm:@scandit/web-datacapture-barcode npm:@scandit/web-datacapture-parser
```

</TabItem>

</Tabs>

:::note
You can also specify a version @`<version>`.
:::

### Install via CDN

You can consume the packages through a CDN like [JSDelivr](https://www.jsdelivr.com/?query=%40scandit%2Fweb-datacapture-).

:::warning Important considerations when using CDNs
For important information about CDN risks and recommendations for production environments, see [Install via CDN](/sdks/web/add-sdk/#install-via-cdn).
:::

## Basic CDN Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Scandit Parser CDN Sample</title>
    <script type="importmap">
      {
        "imports": {
          "@scandit/web-datacapture-core": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@8.0.0/build/js/index.js",
          "@scandit/web-datacapture-barcode": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/build/js/index.js",
          "@scandit/web-datacapture-parser": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@8.0.0/build/js/index.js",

          "@scandit/web-datacapture-barcode/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/",
          "@scandit/web-datacapture-core/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@8.0.0/",
          "@scandit/web-datacapture-parser/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@8.0.0/"
        }
      }
    </script>
    <link
      rel="modulepreload"
      href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@8.0.0/build/js/index.js"
    />
    <link
      rel="modulepreload"
      href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/build/js/index.js"
    />
    <link
      rel="modulepreload"
      href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@8.0.0/build/js/index.js"
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
      #resultDialog {
        max-width: 600px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      #resultDialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
      }
      #resultDialog pre {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 16px;
        overflow-x: auto;
        max-height: 400px;
        font-size: 12px;
        margin: 0;
      }
      #resultDialog h2 {
        margin-top: 0;
      }
      #resultDialog button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 16px;
      }
      #resultDialog button:hover {
        background-color: #0056b3;
      }
    </style>
    <!-- Check the latest version here https://github.com/guybedford/es-module-shims/releases -->
    <script
      async
      src="https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js"
    ></script>
    <script type="module">
     import { DataCaptureContext, Logger } from '@scandit/web-datacapture-core';
     import { barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';
     import { parserLoader, Parser, ParserDataFormat } from "@scandit/web-datacapture-parser";

     const context = await DataCaptureContext.forLicenseKey('-- ENTER LICENSE KEY HERE --', {
      libraryLocation: "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/sdc-lib/",
      moduleLoaders: [
        barcodeCaptureLoader({ libraryLocation: "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/sdc-lib/" }),
        parserLoader({ libraryLocation: "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@8.0.0/sdc-lib/" })],
      logLevel: Logger.Level.Quiet,
     });

     const parserIata = await Parser.forFormat(context, ParserDataFormat.IATA_BCBP);

     const encodedData =
         "M1BLEAH/ZZZZZZ        EU3TAVO LCAZRHCY 0350 259Y009A0131 348>5180      BCY              2A07824010159820 CY                        N";

     const parsed = await parserIata.parseStringToJson(encodedData);
     console.log("the parsed data", parsed);

     // Display the parsed data in a dialog
     const dialog = document.getElementById('resultDialog');
     const resultsContent = document.getElementById('resultsContent');
     resultsContent.textContent = JSON.stringify(parsed, null, 2);
     dialog.showModal();

    </script>
  </head>
  <body>
    <div id="app"></div>
    <dialog id="resultDialog">
      <h2>Parsed Data</h2>
      <pre id="resultsContent"></pre>
      <button onclick="document.getElementById('resultDialog').close()">Close</button>
    </dialog>
  </body>
</html>
```
