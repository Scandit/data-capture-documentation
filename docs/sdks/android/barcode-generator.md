---
description: "The Barcode Generator is a simple tool to generate barcodes directly from the Scandit SDK. In this guide, we will show you how to use the Barcode Generator to generate barcodes and QR codes.                                                                  "

sidebar_label: Get Started
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
* PDF417 (SDK version >= 8.2)

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Generating Barcodes

To generate barcodes, you need to create a [`DataCaptureContext`](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`BarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.BarcodeGeneratorBuilder), and use the method of [`BarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) for the symbology you are interested in, in this example Code 128.

You can configure the colors used in the resulting image:

```kotlin
# import android.graphics.Color
# import com.scandit.datacapture.barcode.generator.BarcodeGenerator
# import com.scandit.datacapture.core.capture.DataCaptureContext
# val licenseKey = "licenceKey"
val dataCaptureContext = DataCaptureContext.forLicenseKey(licenseKey)
val builder = BarcodeGenerator.code128BarcodeGeneratorBuilder(dataCaptureContext)
    .withBackgroundColor(Color.WHITE)
    .withForegroundColor(Color.BLACK)
```

When the builder is configured get the `BarcodeGenerator` and try to generate the image:

```kotlin
# import com.scandit.datacapture.barcode.generator.BarcodeGenerator
# lateinit var builder: BarcodeGenerator.Code128BarcodeGeneratorBuilder
# val dataString = "data"
try {
    val generator = builder.build()
    val image = generator.generate(dataString, 200)
    // Use the image
} catch (exception: Exception) {
    // Handle the error
    exception.printStackTrace()
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator.html) for more information.

## Generating QR Codes

To generate barcodes, you need to create a [`DataCaptureContext`](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). 

With the context you can then instantiate a [`QRCodeBarcodeGeneratorBuilder`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator-builder.html#class-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder) using the method of [`BarcodeGenerator`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator.html#class-scandit.datacapture.barcode.generator.BarcodeGenerator) specific for QR codes.

You can configure the colors used in the resulting image, and the two settings that can be configured for QR codes: [`QRCodeBarcodeGeneratorBuilder.errorCorrectionLevel`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithErrorCorrectionLevel) and [`QRCodeBarcodeGeneratorBuilder.versionNumber`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator-builder.html#method-scandit.datacapture.barcode.generator.QrCodeBarcodeGeneratorBuilder.WithVersionNumber).

```kotlin
# import android.graphics.Color
# import com.scandit.datacapture.barcode.generator.BarcodeGenerator
# import com.scandit.datacapture.barcode.generator.QrCodeErrorCorrectionLevel
# import com.scandit.datacapture.core.capture.DataCaptureContext
# val licenseKey = "licenseKey"
val dataCaptureContext = DataCaptureContext.forLicenseKey(licenseKey)
val builder = BarcodeGenerator.qrCodeBarcodeGeneratorBuilder(dataCaptureContext)
    .withBackgroundColor(Color.WHITE)
    .withForegroundColor(Color.BLACK)
    .withErrorCorrectionLevel(QrCodeErrorCorrectionLevel.MEDIUM)
    .withVersionNumber(4)
```

When the builder is configured get the `BarcodeGenerator` and try to generate the image:

```kotlin
# import com.scandit.datacapture.barcode.generator.BarcodeGenerator
# lateinit var builder: BarcodeGenerator.QrCodeBarcodeGeneratorBuilder
# val dataString = "data"
try {
    val generator = builder.build()
    val image = generator.generate(dataString, 200)
    // Use the image
} catch (exception: Exception) {
    // Handle the error
    exception.printStackTrace()
}
```

See the complete [API reference](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-generator.html) for more information.
