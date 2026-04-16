---
description: "ID Bolt allows you to customize both the user interface flow and the scanning behavior to meet your specific requirements.                                                                                "

sidebar_label: "Workflow Options"
title: "Workflow & Scanner Options"
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
keywords:
  - bolt
  - workflow
  - scanner
---

# Workflow & Scanner Options

ID Bolt allows you to customize both the user interface flow and the scanning behavior to meet your specific requirements.

## Workflow Options

The `workflow` option allows you to customize the user interface flow:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  workflow: {
    showWelcomeScreenDesktop: false,
    showResultScreen: true,
  },
});
```

### Available Options

| Option                     | Type      | Default | Description                                                                                                                                                          | Since |
| -------------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `showWelcomeScreenDesktop` | `boolean` | `true`  | When disabled, skip the welcome screen and immediately opens the QR code page. Other scanning methods are reachable.                                                 | 2.3   |
| `showWelcomeScreenMobile`  | `boolean` | `true`  | When disabled: skip the welcome screen and immediately opens the scanner page. Note that the image upload will not be available on mobile if this option is `false`. | 2.3   |
| `showResultScreen`         | `boolean` | `true`  | Determines whether to show the result screen at the end of the workflow.                                                                                             | 1.3   |
| `allowImageUpload`         | `boolean` | `false` | When enabled, let the user the possibility to upload an image or a PDF file from their device to be scanned.                                                         | 2.3   |

### Deprecated options

| Option                  | Type      | Default | Description                                                                                                                      | Since |
| ----------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- | ----- |
| ~~`showWelcomeScreen`~~ | `boolean` | `true`  | **Deprecated since 2.3**. <br/> When `false`, equivalent to `showWelcomeScreenDesktop=true` and `showWelcomeScreenMobile=false`. | 1.3   |

### Image Upload

Available since version `2.3`.

When `allowImageUpload` is enabled, the user is offered an additional way of processing their document by uploading an image or a pdf from their device.

This option is also compatible with the `FullDocumentScanner` option (see scanner options below): when the front side has been scanned and depending on the type of document, the back side may be required and must also be uploaded. If one of the sides is not recognized, the flow is completely restarted and the user must start over with different images or PDF files.

### Example:

Do not show the result screen:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  workflow: {
    showResultScreen: false,
  },
});
```

## Scanner Options

Available since version `1.2`.

The scanner behavior can be customized using the `scanner` option. First, import the scanner classes:

```ts
import {
  IdBoltSession,
  SingleSideScanner,
  FullDocumentScanner,
} from "@scandit/web-id-bolt";
```

By default, ID Bolt uses a `SingleSideScanner` with all modalities enabled, but you can choose different scanner types and configure their behavior.

### Single Side Scanner

The `SingleSideScanner` extracts all data from a single side scan of the document. This is the default scanner type.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  scanner: new SingleSideScanner(
    true, // Enable reading of barcode ID-documents
    true, // Enable reading of machine readable zone (MRZ) documents
    true, // Enable reading of visual inspection zone (VIZ) documents
    {
      enforceVizForPassportScan: false, // Optional: require VIZ for passport acceptance
    },
  ),
});
```

#### Customizing Scanning Modalities

You can enable or disable specific scanning modalities:

```ts
// Only scan MRZ documents (like passports)
const mrzOnlyScanner = new SingleSideScanner(
  false, // Disable barcode reading
  true, // Enable MRZ reading
  false, // Disable VIZ reading
);

// Only scan barcode documents (like some driver licenses)
const barcodeOnlyScanner = new SingleSideScanner(
  true, // Enable barcode reading
  false, // Disable MRZ reading
  false, // Disable VIZ reading
);
```

#### Passport VIZ Enforcement

Available since version `1.17`.

By default, passports can be accepted when only the Machine Readable Zone (MRZ) has been successfully scanned. You can require both MRZ and Visual Inspection Zone (VIZ) to be scanned:

```ts
const strictPassportScanner = new SingleSideScanner(
  true, // Enable barcode reading
  true, // Enable MRZ reading
  true, // Enable VIZ reading
  {
    enforceVizForPassportScan: true, // Require both MRZ and VIZ for passports
  },
);
```

**Important:** Enabling `enforceVizForPassportScan` may reduce global passport support coverage, as it requires successful scanning of both zones. Use this option when you need higher data quality or additional fields from the VIZ.

### Full Document Scanner

The `FullDocumentScanner` forces the user to scan both the front and back sides of the document, which can provide more complete data extraction, especially for multi-sided documents like ID cards or driver licenses.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  scanner: new FullDocumentScanner(),
});
```

The `FullDocumentScanner` automatically enables all scanning modalities (barcode, MRZ, and VIZ).

## Complete Workflow Configuration Example

Here's an example that combines various workflow and scanner options:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  licenseKey: LICENSE_KEY,
  documentSelection: DocumentSelection.create({
    accepted: [new Passport(Region.Any), new IdCard(Region.Any)],
  }),
  returnDataMode: ReturnDataMode.Full,
  // Configure scanner to only use MRZ reading (good for e.g. passports)
  scanner: new SingleSideScanner(false, true, false),
  // skip result screen
  workflow: {
    showResultScreen: false,
    // also offer image upload possibility
    allowImageUpload: true,
  },
  onCompletion: (result) => {
    console.log("Successfully completed workflow", result);
  },
});

await idBoltSession.start();
```
