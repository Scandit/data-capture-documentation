---
displayed_sidebar: flutterSidebar
pagination_prev: null
pagination_next: null
---

# Barcode Generator

The Barcode Generator is a simple tool to generate barcodes directly from the Scandit SDK. In this guide, we will show you how to use the Barcode Generator to generate barcodes and QR codes. 

The Barcode Generator supports the following formats:

* Code 39
* Code 128
* EAN 13
* UPCA
* ITF
* QR
* DataMatrix

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/flutter/add-sdk).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Generating Barcodes

To generate barcodes, you need to create a [`DataCaptureContext`](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`BarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.BarcodeGeneratorBuilder), and use the method of [`BarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) for the symbology you are interested in, in this example Code 128.

You can configure the colors used in the resulting image:

```dart
class DataCaptureContext {
  final String licenseKey;

  DataCaptureContext.forLicenseKey(this.licenseKey);
}

class BarcodeGeneratorBuilder {
  final DataCaptureContext context;
  final Color backgroundColor;
  final Color foregroundColor;

  BarcodeGeneratorBuilder._(this.context, this.backgroundColor, this.foregroundColor);

  factory BarcodeGeneratorBuilder.code128BarcodeGeneratorBuilder(
      DataCaptureContext context) {
    return BarcodeGeneratorBuilder._(context, Colors.white, Colors.black);
  }

  BarcodeGeneratorBuilder withBackgroundColor(Color color) {
    return BarcodeGeneratorBuilder._(context, color, foregroundColor);
  }

  BarcodeGeneratorBuilder withForegroundColor(Color color) {
    return BarcodeGeneratorBuilder._(context, backgroundColor, color);
  }
}
```

When the builder is configured get the `BarcodeGenerator` and try to generate the image:

```dart
try {
    var generator = BarcodeGeneratorBuilder.build();
    var image = generator.generateFromData(dataString, 200);
    // Use the image
} catch (e) {
    debugPrint("Error generating barcode: $e");
    return Center(child: Text("Failed to generate barcode"));
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator.html) for more information.

## Generating QR Codes

To generate barcodes, you need to create a [`DataCaptureContext`](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`QRCodeBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder) using the method of [`BarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) specific for QR codes.

You can configure the colors used in the resulting image, and the two settings that can be configured for QR codes: [`QRCodeBarcodeGeneratorBuilder.errorCorrectionLevel`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithErrorCorrectionLevel) and [`QRCodeBarcodeGeneratorBuilder.versionNumber`](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithVersionNumber).

When the builder is configured get the `BarcodeGenerator` and try to generate the image:

```dart
try {
    var generator = BarcodeGeneratorBuilder.build();
    var image = generator.generateFromData(dataString, 200);
    // Use the image
} catch (e) {
    debugPrint("Error generating barcode: $e");
    return Center(child: Text("Failed to generate barcode"));
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api/barcode-generator.html) for more information.
