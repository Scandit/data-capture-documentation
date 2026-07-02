---
description: "The Barcode Generator is a simple tool to generate barcodes directly from the Scandit SDK. In this guide, we will show you how to use the Barcode Generator to generate barcodes and QR codes."

sidebar_position: 4
pagination_prev: null
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Barcode Generator

The Barcode Generator is a simple tool to generate barcodes directly from the Scandit SDK. In this guide, we will show you how to use the Barcode Generator to generate barcodes and QR codes.

The Barcode Generator supports the following formats:

- Code 39
- Code 128
- EAN13
- UPCA
- Interleaved Two of Five
- Data Matrix
- Aztec
- PDF417
- QR

## Prerequisites

Before starting, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](add-sdk.mdx).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Generating Barcodes

To generate barcodes, you need a `DataCaptureContext`. With the context you can then use the static factory method on `BarcodeGenerator` for the symbology you are interested in — in this example, Code 128 — to get a builder instance.

You can configure the colors used in the resulting image with `withBackgroundColor()`/`withForegroundColor()`, which take a packed ARGB `Long` value:

```kotlin
import com.kmp.datacapture.barcode.generator.BarcodeGenerator
import com.kmp.datacapture.core.capture.DataCaptureContext

val dataCaptureContext = DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")

val builder = BarcodeGenerator.code128BarcodeGeneratorBuilder(dataCaptureContext)
    .withBackgroundColor(0xFFFFFFFF)
    .withForegroundColor(0xFF000000)
val generator = builder.build()
```

When the builder is configured, call `build()` to get the `BarcodeGenerator` and generate the image with `generate()`, which returns a `CapturedImage`:

```kotlin
val image = generator.generate(data = "82348920", imageWidth = 200, imageHeight = 200)
// image.toRgbaBytes() gives you the raw RGBA8888 pixels.
// Or use the platform-specific accessor: CapturedImage.toBitmap() on Android,
// CapturedImage.toUIImage() on iOS.
```

Other supported symbologies follow the same builder pattern: `code39BarcodeGeneratorBuilder()`, `ean13BarcodeGeneratorBuilder()`, `upcaBarcodeGeneratorBuilder()`, `interleavedTwoOfFiveBarcodeGeneratorBuilder()`, `dataMatrixBarcodeGeneratorBuilder()`, and `aztecBarcodeGeneratorBuilder()`.

### Aztec-Specific Options

`AztecBarcodeGeneratorBuilder` additionally exposes `withMinimumErrorCorrectionPercent()` and `withLayers()`:

```kotlin
val builder = BarcodeGenerator.aztecBarcodeGeneratorBuilder(dataCaptureContext)
    .withMinimumErrorCorrectionPercent(25)
    .withLayers(4)
val generator = builder.build()
```

### PDF417-Specific Options

`Pdf417BarcodeGeneratorBuilder` additionally exposes `withErrorCorrectionLevel()`, `withCompact()`, `withCompactionMode()`, and `withDimensions()`:

```kotlin
import com.kmp.datacapture.barcode.generator.Pdf417CompactionMode
import com.kmp.datacapture.barcode.generator.Pdf417Dimensions

val builder = BarcodeGenerator.pdf417BarcodeGeneratorBuilder(dataCaptureContext)
    .withErrorCorrectionLevel(2)
    .withCompact(true)
    .withCompactionMode(Pdf417CompactionMode.TEXT)
    .withDimensions(Pdf417Dimensions(minCols = 5, maxCols = 20, minRows = 5, maxRows = 20))
val generator = builder.build()
```

## Generating QR Codes

To generate a QR code, instantiate a `QrCodeBarcodeGeneratorBuilder` using `BarcodeGenerator.qrCodeBarcodeGeneratorBuilder()`. You can configure the colors as above, plus `errorCorrectionLevel` and `versionNumber`:

```kotlin
import com.kmp.datacapture.barcode.generator.QrCodeErrorCorrectionLevel

val builder = BarcodeGenerator.qrCodeBarcodeGeneratorBuilder(dataCaptureContext)
    .withErrorCorrectionLevel(QrCodeErrorCorrectionLevel.HIGH)
    .withVersionNumber(4)
val generator = builder.build()
```

When the builder is configured, call `build()` to get the `BarcodeGenerator` and generate the image:

```kotlin
val image = generator.generate(data = "82348920", imageWidth = 200, imageHeight = 200)
```

:::note
`generate()` throws if the given data is invalid for the target symbology (for example, non-numeric data for EAN13/UPCA). Wrap calls in a `try`/`catch` in production code.
:::
