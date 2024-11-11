---
sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

# Configure Barcode Symbologies

In this guide you will learn how to configure a barcode based capture mode ([`SDCBarcodeCapture`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) and [`SDCBarcodeBatch`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch)) to read the barcodes that you need it to read.

## Enable the Symbologies You Want to Read

The type of a barcode is referred to as its symbology, for example a QR Code or Code 128. To enable scanning of a particular barcode, its symbology must be enabled. This is done through calling [`SDCBarcodeCaptureSettings.setSymbology:enabled:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#method-scandit.datacapture.barcode.BarcodeCaptureSettings.EnableSymbology) on the [`SDCBarcodeCaptureSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and then applying the settings to the [barcode capture](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance. 

Similarly, for barcode tracking (MatrixScan), the barcode’s symbology must be enabled by calling [`SDCBarcodeBatchSettings.setSymbology:enabled:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-batch-settings.html#method-scandit.datacapture.barcode.batch.BarcodeBatchSettings.EnableSymbology) on the [`SDCBarcodeBatchSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) and then applying the settings to the [barcode tracking](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance.

The following code shows you how to enable scanning Code 128 codes for barcode capture:

```swift
let settings = BarcodeCaptureSettings()
settings.set(symbology: .code128, enabled: true)
```

## Configure the Active Symbol Count

Barcode symbologies such as Code 128, Code 39, Code 93 or Interleaved Two of Five can store variable-length data. As an example, Code 39 can be used to store a string anywhere from 1 to 40-50 symbols. There is no fixed upper limit, though there are practical limitations to the code’s length for it to still be conveniently readable by barcode scanners.

For performance reasons, the Scandit Data Capture SDK limits the [possible symbol range](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.ActiveSymbolCounts) for variable-length symbologies. If you want to read codes that are shorter/longer than the specified default range or you want to tailor your app to only read codes of a certain length, you need to change the active symbol count of the symbology to accommodate the data length you want to use in your application.

The below code shows how to change the active symbol count for Code 128 to read codes with 6, 7 and 8 symbols.

```swift
let settings = BarcodeCaptureSettings()
let symbologySettings = settings.settings(for: .code128)
symbologySettings.activeSymbolCounts = Set(6...8)
```

### How to Calculate the Active Symbol Count

Calculating the active symbol count is symbology-specific as each symbology has a different symbol definition. To understand what a symbology’s default active symbol count range is and to learn how to compute the active symbol count for a particular symbology, consult the documentation on [symbology properties](../../../symbology-properties.md). As an alternative, you can also use the Scandit Demo App in the [iOS App Store](https://itunes.apple.com/us/app/scandit-barcode-scanner-demo/id453880584) or [Android Play Store](https://play.google.com/store/apps/details?id=com.scandit.demoapp). After you have installed the app, select the “Any Code” mode and scan the codes you are interested in. The active symbol count will appear on the result screen.

## Read Bright-on-Dark Barcodes

Most barcodes are printed using dark ink on a bright background. Some symbologies allow the colors to be inverted and can also be printed using bright ink on a dark background. This is not possible for all symbologies as it could lead to false reads when the symbology is not designed for this use case. Which symbologies allow color inversion can be seen in the documentation on symbology properties.

When you enable a symbology as described above, only dark-on-bright codes are enabled (see [`SDCSymbologySettings.enabled`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsEnabled)). When you also want to read bright-on-dark codes, color-inverted reading for that symbology must also be enabled (see [`SDCSymbologySettings.colorInvertedEnabled:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsColorInvertedEnabled)).

The following code shows how to enable color-inverted reading for Code 128:

```swift
let settings = BarcodeCaptureSettings()
let symbologySettings = settings.settings(for: .code128)
symbologySettings.isColorInvertedEnabled = true
```

## Enforce Checksums

Some symbologies have a mandatory checksum that will always be enforced while others only have optional checksums. Enforcing an optional checksum will reduce false positives as an additional check can be performed. When enabling a checksum you have to make sure that the data of your codes contains the calculated checksum otherwise the codes will be discarded as the checksum doesn’t match. All available checksums per symbology can be found in the documentation on symbology properties.

You can enforce a specific checksum by setting it through [`SDCSymbologySettings.checksums`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.Checksums):

```swift
let settings = BarcodeCaptureSettings()
let symbologySettings = settings.settings(for: .code39)
symbologySettings.checksums = [.mod43]
```

## Enable Symbology-Specific Extensions

Some symbologies allow further configuration. These configuration options are available as symbology extensions that can be enabled/disabled for each symbology individually. Some of the extensions affect how the data in the code is formatted, others allow to enable more relaxed recognition modes that are disabled by default to eliminate false reads. All available extensions per symbology and a description of what they do can be found in the documentation on symbology properties.

To enable/disable a symbology extension, use [`SDCSymbologySettings.setExtension:enabled:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/symbology-settings.html#method-scandit.datacapture.barcode.SymbologySettings.SetExtensionEnabled).

The following code shows how to enable the full ASCII extension for Code 39. This extension allows Code 39 to encode all 128 ASCII characters instead of only the 43 characters defined in the standard. The extension is disabled by default as it can lead to false reads when enabled.

```swift
let settings = BarcodeCaptureSettings()
let symbologySettings = settings.settings(for: .code39)
symbologySettings.set(extension: "full_ascii", enabled: true)
```
