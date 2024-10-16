---
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

More data formats will be added in future releases. Please contact us if the data format you are using is not yet supported, or you want to use the parser on a currently unsupported platform.


## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

First of all, include the ScanditParser library and its dependencies to your project, if any.

### Internal dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module                        | Dependencies                  |
|-------------------------------|-------------------------------|
| @scandit/web-datacapture-core | No dependencies               |
| @scandit/datacapture-barcode  | @scandit/web-datacapture-core |

## Installation

Install from npm it by running:

```sh
npm install --save @scandit/web-datacapture-core @scandit/web-datacapture-barcode @scandit/web-datacapture-parser
```

Or consume it in your `.html` page through a CDN like [JSdelivr](https://www.jsdelivr.com/?query=%40scandit%2Fweb-datacapture-):

```html
<script type="importmap">
    {
      "imports": {
        "@scandit/web-datacapture-core": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.0.0/build/js/index.js",
        "@scandit/web-datacapture-barcode": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.0.0/build/js/index.js",

        "@scandit/web-datacapture-barcode/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.0.0/",
        "@scandit/web-datacapture-core/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.0.0/",
        
        "@scandit/web-datacapture-parser": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@7.0.0/build/js/index.js",
        "@scandit/web-datacapture-parser/": "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@7.0.0/",
        
      }
    }
</script>
<link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-core@7.0.0/build/js/index.js" />
<link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.0.0/build/js/index.js" />
<link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-parser@7.0.0/build/js/index.js" />

<!-- Check the latest version here https://github.com/guybedford/es-module-shims/releases -->
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js"></script>
<script type="module">
    import { configure, DataCaptureContext } from '@scandit/web-datacapture-core';
    import { barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';
    import { parserLoader, Parser, ParserDataFormat } from "@scandit/web-datacapture-parser";
    // ...
</script>
```

## Basic Sample

```ts
import { configure, DataCaptureContext } from '@scandit/web-datacapture-core';
import { barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';
import { parserLoader, Parser, ParserDataFormat } from "@scandit/web-datacapture-parser";

await configure({
	licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
	libraryLocation: new URL('library/engine/', document.baseURI).toString(),
	moduleLoaders: [barcodeCaptureLoader(), parserLoader()],
});

const context: DataCaptureContext = await DataCaptureContext.create();

const parserIata = await Parser.forFormat(context, ParserDataFormat.IATA_BCBP);

const encodedData =
    "M1BLEAH/ZZZZZZ        EU3TAVO LCAZRHCY 0350 259Y009A0131 348>5180      BCY              2A07824010159820 CY                        N";

const parsed = await parserIata.parseStringToJson(encodedData);
```