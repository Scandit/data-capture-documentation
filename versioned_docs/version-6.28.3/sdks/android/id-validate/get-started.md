---
sidebar_position: 2
pagination_next: null
framework: android
keywords:
  - android
---

# Get Started

This guide will help you get started with Scandit ID Validate for Android. There are two verifiers available:

* [`AAMVAVizBarcodeComparisonVerifier`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonVerifier): Validates the authenticity of the document by comparing the data from the VIZ and from the barcode on the back.
* [`AAMVABarcodeVerifier`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences based on the verifier you choose, as detailed in the following sections.

## VIZ Barcode Comparison Verifier

This verifier compares the data from the VIZ (the machine-readable zone) and the barcode on the back of the document and requires the front and back scanning mode.

Create the verifier and initialize [`IdCapture`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) with the following settings:

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");

AamvaVizBarcodeComparisonVerifier verifier = AamvaVizBarcodeComparisonVerifier.create();

IdCaptureSettings settings = new IdCaptureSettings();
settings.setSupportedDocuments(IdDocumentType.DL_VIZ);
settings.setSupportedSides(SupportedSides.FRONT_AND_BACK);

IdCapture idCapture = IdCapture.create(dataCaptureContext, settings);
```

Then proceed to capture the front and back sides of a document as usual. After you capture the back side and receive the combined result for both sides, you may run the verifier as follows:

```java
@override
void didCaptureId(IdCapture idCapture, IdCaptureSession session) {
    CapturedId capturedId = session.getNewlyCapturedId();
    VizResult viz = capturedId.getViz();

    if (viz != null && viz.getCapturedSides() == SupportedSides.FRONT_AND_BACK) {
        AamvaVizBarcodeComparisonResult result = verifier.verify(capturedId);

        if (result.checksPassed()) {
            // Nothing suspicious was detected.
        } else {
            // You may inspect the results of individual checks, if you wish:

            if (result.datesOfBirthMatch.checkResult == FAILED) {
                // The holder’s date of birth from the front side does not match the one encoded in the barcode.
            }
        }
    }
}
```

The return value allows you to query both the overall result of the verification and the results of individual checks. See [`AAMVAVizBarcodeComparisonResult`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonResult) for details.

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