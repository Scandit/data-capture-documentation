---
sidebar_position: 3
pagination_next: null
framework: netIos
keywords:
  - netIos
---

# Configure Barcode Symbologies

In this guide you will learn how to configure a barcode based capture mode (`BarcodeCapture` and `BarcodeTracking`) to read the barcodes that you need it to read.

## Enable the Symbologies You Want to Read

The type of a barcode is referred to as its symbology, e.g [QR Code](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.Qr) or [Code 128](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.Code128). To enable scanning of a particular barcode, its symbology must be enabled. This is done through calling [BarcodeCaptureSettings.EnableSymbology()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-capture-settings.html#method-scandit.datacapture.barcode.BarcodeCaptureSettings.EnableSymbology) on the [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and then applying the settings to the [barcode capture](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance. Similarly, for barcode tracking (MatrixScan), the barcode’s symbology must be enabled by calling [BarcodeTrackingSettings.EnableSymbology()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-tracking-settings.html#method-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings.EnableSymbology) on the [BarcodeTrackingSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-tracking-settings.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings) and then applying the settings to the [barcode tracking](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) instance.

If you already know the names of the symbologies you want to scan/read, take a look at the list of [symbologies supported](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) by the Scandit Data Capture SDK. If you are unsure what the symbology of your barcode is, use the Scandit Demo App available in the [iOS App Store](https://itunes.apple.com/us/app/scandit-barcode-scanner-demo/id453880584) or [Android Play Store](https://play.google.com/store/apps/details?id=com.scandit.demoapp). After you have installed the app, select the “Any Code” mode and scan the codes you are interested in. The name of the symbology will appear on the result screen.

The following lines of code show you how to enable scanning Code 128 codes for barcode capture:

```csharp
BarcodeCaptureSettings settings = BarcodeCaptureSettings.Create();
settings.EnableSymbology(Symbology.Code128, true);
```

## Configure the Active Symbol Count

Barcode symbologies such as [Code 128](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.Code128), [Code 39](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.Code39), [Code 93](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.Code93) or [Interleaved Two of Five](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology.html#value-scandit.datacapture.barcode.Symbology.InterleavedTwoOfFive) can store variable-length data. As an example, Code 39 can be used to store a string anywhere from 1 up to around 40-50 symbols. There is no fixed upper limit, though there are practical limitations to the code’s length for it to still be conveniently readable by barcode scanners. For performance reasons, the Scandit Data Capture SDK limits the [possible symbol range](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.ActiveSymbolCounts) for variable-length symbologies. If you want to read codes that are shorter/longer than the specified default range or you want to tailor your app to only read codes of a certain length, you need to change the active symbol count of the symbology to accommodate the data length you want to use in your application.

The below lines of code show how to change the active symbol count for Code 128 to read codes with 6, 7 and 8 symbols.

```csharp
BarcodeCaptureSettings settings = BarcodeCaptureSettings.Create();
SymbologySettings symbologySettings = settings.GetSymbologySettings(Symbology.Code128);
HashSet<short> activeSymbolCounts = new HashSet<short>(new short[] { 6, 7, 8 });
symbologySettings.ActiveSymbolCounts = activeSymbolCounts;
```

### How to Calculate the Active Symbol Count

Calculating the active symbol count is symbology-specific as each symbology has a different symbol definition. To understand what a symbology’s default active symbol count range is and to learn how to compute the active symbol count for a particular symbology, consult the documentation on [symbology properties](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/symbology-properties.html). As an alternative, you can also use the Scandit Demo App in the [iOS App Store](https://itunes.apple.com/us/app/scandit-barcode-scanner-demo/id453880584), or [Android Play Store](https://play.google.com/store/apps/details?id=com.scandit.demoapp). After you have installed the app, select the “Any Code” mode and scan the codes you are interested in. The active symbol count will appear on the result screen.

## Read Bright-on-Dark Barcodes

Most barcodes are printed using dark ink on a bright background. Some symbologies allow the colors to be inverted and can also be printed using bright ink on a dark background. This is not possible for all symbologies as it could lead to false reads when the symbology is not designed for this use case. Which symbologies allow color inversion can be seen in the documentation on [symbology properties](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/symbology-properties.html). When you enable a symbology as described above, only dark-on-bright codes are enabled (see [SymbologySettings.Enabled](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsEnabled)). When you also want to read bright-on-dark codes, color-inverted reading for that symbology must also be enabled (see [SymbologySettings.ColorInvertedEnabled](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.IsColorInvertedEnabled)):

```csharp
BarcodeCaptureSettings settings = BarcodeCaptureSettings.Create();
SymbologySettings symbologySettings = settings.GetSymbologySettings(Symbology.Code128);
symbologySettings.ColorInvertedEnabled = true;
```

## Enforce Checksums

Some symbologies have a mandatory checksum that will always be enforced while others only have optional [checksums](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/checksum.html#enum-scandit.datacapture.barcode.Checksum). Enforcing an optional checksum will reduce false positives as an additional check can be performed. When enabling a checksum you have to make sure that the data of your codes contains the calculated checksum otherwise the codes will be discarded as they checksum doesn’t match. All available checksums per symbology can be found in the documentation on [symbology properties](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/symbology-properties.html). You can enforce a specific checksum by setting it through [SymbologySettings.Checksums](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology-settings.html#property-scandit.datacapture.barcode.SymbologySettings.Checksums):

```csharp
BarcodeCaptureSettings settings = BarcodeCaptureSettings.Create();
SymbologySettings symbologySettings = settings.GetSymbologySettings(Symbology.Code39);
symbologySettings.Checksums = Checksum.Mod43;
```

## Enable Symbology-Specific Extensions

Some symbologies allow further configuration. These configuration options are available as symbology extensions that can be enabled/disabled for each symbology individually. Some of the extensions affect how the data in the code is formatted, others allow to enable more relaxed recognition modes that are disabled by default to eliminate false reads. All available extensions per symbology and a description of what they do can be found in the documentation on [symbology properties](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/symbology-properties.html).

To enable/disable a symbology extension, use [SymbologySettings.SetExtensionEnabled()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/symbology-settings.html#method-scandit.datacapture.barcode.SymbologySettings.SetExtensionEnabled).

```csharp
BarcodeCaptureSettings settings = BarcodeCaptureSettings.Create();
SymbologySettings symbologySettings = settings.GetSymbologySettings(Symbology.Code39);
symbologySettings.SetExtensionEnabled("full_ascii", true);
```
