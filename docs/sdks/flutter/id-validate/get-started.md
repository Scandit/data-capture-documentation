---
sidebar_position: 2
pagination_next: null
framework: flutter
keywords:
  - flutter
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`AAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences, as detailed in the following sections.

## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
var barcodeVerifier = await AamvaBarcodeVerifier.create(dataCaptureContext);
```

Then initialize the desired scanning mode:

```dart
// Single-sided scanning mode
var settings = IdCaptureSettings();
settings.supportedDocuments.add(IdDocumentType.aamvaBarcode);

var idCapture = IdCapture.forContext(dataCaptureContext, settings);

const idCapture = await IdCapture.forContext(context, settings);

// Front and back scanning mode
var settings = IdCaptureSettings();
settings.supportedDocuments.add(IdDocumentType.dlViz);
settings.supportedSides = SupportedSides.frontAndBack;

var idCapture = IdCapture.forContext(dataCaptureContext, settings);
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```dart
@override
void didCaptureId(IdCapture idCapture, IdCaptureSession session) async {
  if (session.newlyCapturedId == null) {
    return;
  }
  CapturedId capturedId = session.newlyCapturedId!;
  var barcode = capturedId.aamvaBarcode;
  if (barcode != null) {
    barcodeVerifier.verify(capturedId).then((result) {
      if (result.allChecksPassed) {
        // Nothing suspicious was detected.
      } else {
        // Document may be fraudulent or tampered with - proceed with caution.
      }
    }, onError: (error) {
        // Error occurred during verification
    });
  }
}
```