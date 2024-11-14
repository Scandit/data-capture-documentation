---
sidebar_position: 1
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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Generating Barcodes

To generate barcodes, you need to create a [`SDCDataCaptureContext`](https://docs.scandit.com/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`SDCBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.BarcodeGeneratorBuilder), and use the method of [`SDCBarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) for the symbology you are interested in, in this example Code 128.

```swift
let context = DataCaptureContext(licenseKey: licenseKey)
let builder = BarcodeGenerator.code128BarcodeGeneratorBuilder(with: context)
```

You can configure the colors used in the resulting image:

```swift
builder.foregroundColor = .black
builder.backgroundColor = .white
```

When the builder is configured get the `SDCBarcodeGenerator` and try to generate the image:

```swift
do {
    let generator = try builder.build()
    let image = try generator.generate(with: dataString, imageWidth: 200.0)
    // Use the image
} catch {
    // Handle the error
    print(error)
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator.html) for more information.

## Generating QR Codes

To generate barcodes, you need to create a [`SDCDataCaptureContext`](https://docs.scandit.com/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`SDCQRCodeBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder) using the method of [`SDCBarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) specific for QR codes.

```swift
let context = DataCaptureContext(licenseKey: licenseKey)
let builder = BarcodeGenerator.qrCodeBarcodeGeneratorBuilder(with: context)
```

You can configure the colors used in the resulting image:

```swift
builder.foregroundColor = .black
builder.backgroundColor = .white
```

There are two settings that can be configured for QR codes: [`SDCQRCodeBarcodeGeneratorBuilder.errorCorrectionLevel`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithErrorCorrectionLevel) and [`SDCQRCodeBarcodeGeneratorBuilder.versionNumber`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithVersionNumber).

```swift
builder.errorCorrectionLevel = .medium
builder.versionNumber = 4
```

When the builder is configured get the `SDCBarcodeGenerator` and try to generate the image:

```swift
do {
    let generator = try builder.build()
    let image = try generator.generate(with: dataString, imageWidth: 200.0)
    // Use the image
} catch {
    // Handle the error
    print(error)
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-generator.html) for more information.