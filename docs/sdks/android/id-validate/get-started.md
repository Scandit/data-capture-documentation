---
sidebar_position: 2
pagination_next: null
framework: android
keywords:
  - android
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`AAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences, as detailed in the following sections.

## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
AamvaBarcodeVerifier verifier = AamvaBarcodeVerifier.create(dataCaptureContext);
```

Then initialize the desired scanning mode:

```java
// Single-sided scanning mode
IdCaptureSettings settings = new IdCaptureSettings();
settings.setSupportedDocuments(IdDocumentType.AAMVA_BARCODE);

IdCapture idCapture = IdCapture.create(dataCaptureContext, settings);

// Front and back scanning mode
IdCaptureSettings settings = new IdCaptureSettings();
settings.setSupportedDocuments(IdDocumentType.DL_VIZ);
settings.setSupportedSides(SupportedSides.FRONT_AND_BACK);

IdCapture idCapture = IdCapture.create(dataCaptureContext, settings);
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```java
@Override
void didCaptureId(IdCapture idCapture, IdCaptureSession session) {
    CapturedId capturedId = session.getNewlyCapturedId();
    AamvaBarcodeResult barcode = capturedId.getAamvaBarcode();

    if (barcode != null) {
        // Trigger the verification. This process is asynchronous, so you may want to store the task and to reconnect the callback if your Activity is recreated.
        AamvaBarcodeVerificationTask task = verifier.verify(capturedId)
          .doOnVerificationResult { result ->
              if (result.allChecksPassed()) {
                  // Nothing suspicious was detected.
              } else {
                  // Document may be fraudulent or tampered with - proceed with caution.
              }
          }
          .doOnConnectionFailure { throwable ->
              // Error occurred during verification
          }
    }
}
```