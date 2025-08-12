---
description: "import Intro from '../../../partials/configure-symbologies/_intro.mdx'                                                                                                "

sidebar_position: 3
pagination_next: null
framework: titanium
keywords:
  - titanium
---

# Configure Barcode Symbologies

import Intro from '../../../partials/configure-symbologies/_intro.mdx'

<Intro/>

## Enable the Symbologies You Want to Read

import EnableSymbologies from '../../../partials/configure-symbologies/_enable-symbologies.mdx'

<EnableSymbologies/>

The following lines of code show you how to enable scanning Code 128 codes for barcode capture:

```js
const settings = new ScanditBarcode.BarcodeCaptureSettings();
settings.enableSymbology(ScanditBarcode.Symbology.Code128, true);
```

import CapturePresents from '../../../partials/configure-symbologies/_capture-presents.mdx'

<CapturePresents/>

## Configure the Active Symbol Count

Barcode symbologies (such as Code 128, Code 39, Code 93, or Interleaved Two of Five) can store variable-length data. For example, Code 39 can be used to store a string from 1 to 40-50 symbols. There is no fixed upper limit, though there are practical limitations to the code’s length for it to still be conveniently readable by barcode scanners.

For performance reasons, the Scandit Data Capture SDK limits the [possible symbol range](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.ActiveSymbolCounts) for variable-length symbologies.

If you want to read codes that are shorter/longer than the specified default range or you want to tailor your app to only read codes of a certain length, you need to change the active symbol count of the symbology to accommodate the data length you want to use in your application.

The below lines of code show how to change the active symbol count for Code 128 to read codes with 6, 7 and 8 symbols.

```js
const settings = new ScanditBarcode.BarcodeCaptureSettings();
const symbologySettings = settings.settingsForSymbology(
	ScanditBarcode.Symbology.Code128
);
symbologySettings.activeSymbolCounts = [6, 7, 8];

const settings = new ScanditBarcode.BarcodeCaptureSettings();
const symbologySettings = settings.settingsForSymbology(
	ScanditBarcode.Symbology.Code128
);
symbologySettings.activeSymbolCounts = [6, 7, 8];
```

import CalculateSymbolCount from '../../../partials/configure-symbologies/_calculate-symbol-count.mdx'

<CalculateSymbolCount/>

## Read Bright-on-Dark Barcodes

Most barcodes are printed using dark ink on a bright background. Some symbologies allow the colors to be inverted and can also be printed using bright ink on a dark background.

This is not possible for all symbologies as it could lead to false reads when the symbology is not designed for this use case. See [symbology properties](/symbology-properties.md) to learn which symbologies allow color inversion.

When you enable a symbology as described above, only dark-on-bright codes are enabled (see [SymbologySettings.isEnabled](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsEnabled 'SymbologySettings.isEnabled property')). When you also want to read bright-on-dark codes, color-inverted reading for that symbology must also be enabled (see [SymbologySettings.isColorInvertedEnabled](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsColorInvertedEnabled)):

```js
const settings = new ScanditBarcode.BarcodeCaptureSettings();
const symbologySettings = settings.settingsForSymbology(
	ScanditBarcode.Symbology.Code128
);
symbologySettings.isColorInvertedEnabled = true;
```

## Enforce Checksums

Some symbologies have a mandatory checksum that will always be enforced while others only have optional [checksums](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/checksum.html#enum-scandit.datacapture.barcode.Checksum). Enforcing an optional checksum will reduce false positives as an additional check can be performed.

When enabling a checksum you have to make sure that the data of your codes contains the calculated checksum otherwise the codes will be discarded as they checksum doesn’t match. All available checksums per symbology can be found in the documentation on [symbology properties](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/symbology-properties.html).

You can enforce a specific checksum by setting it through
[SymbologySettings.checksums](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.Checksums):

```js
const settings = new ScanditBarcode.BarcodeCaptureSettings();
const symbologySettings = settings.settingsForSymbology(
	ScanditBarcode.Symbology.Code39
);
symbologySettings.checksums = [ScanditBarcode.Checksum.Mod43];
```

## Enable Symbology-Specific Extensions

Some symbologies allow further configuration. These configuration options are available as symbology extensions that can be enabled/disabled for each symbology individually.

Some extensions affect how the data in the code is formatted, others allow for more relaxed recognition modes that are disabled by default to eliminate false reads. All available extensions per symbology and a description of what they do can be found in the documentation on [symbology properties](/symbology-properties.md).

To enable/disable a symbology extension, use [SymbologySettings.setExtensionEnabled()](https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api/symbology-settings.html#method-scandit.datacapture.barcode.SymbologySettings.SetExtensionEnabled).

The following code shows how to enable the full ASCII extension for Code 39.

```js
const settings = new ScanditBarcode.BarcodeCaptureSettings();
const symbologySettings = settings.settingsForSymbology(
	ScanditBarcode.Symbology.Code39
);
symbologySettings.setExtensionEnabled('full_ascii', true);
```

This extension allows Code 39 to encode all 128 ASCII characters instead of only the 43 characters defined in the standard. The extension is disabled by default as it can lead to false reads when enabled.