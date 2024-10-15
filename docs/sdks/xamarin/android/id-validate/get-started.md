---
sidebar_position: 2
pagination_next: null
framework: xamarinAndroid
keywords:
  - xamarinAndroid
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`AAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/xamarin.android/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences, as detailed in the following sections.

## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
AamvaBarcodeVerifier barcodeVerifier = AamvaBarcodeVerifier.Create(dataCaptureContext);
```

Then initialize the desired scanning mode:

```csharp
// Single-sided scanning mode
IdCaptureSettings settings = new IdCaptureSettings();
settings.SupportedDocuments = IdDocumentType.AamvaBarcode;

IdCapture idCapture = IdCapture.Create(dataCaptureContext, settings);

// Front and back scanning mode
IdCaptureSettings settings = new IdCaptureSettings();
settings.SupportedDocuments = IdDocumentType.DlViz;
settings.SupportedSides = SupportedSides.FrontAndBack;

IdCapture idCapture = IdCapture.Create(dataCaptureContext, settings);
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```csharp
public void OnIdCaptured(IdCapture capture, IdCaptureSession session, IFrameData frameData)
{
    if (session.NewlyCapturedId == null)
    {
        return;
    }

    CapturedId capturedId = session.NewlyCapturedId;

    if (capturedId.AamvaBarcode != null)
    {
        barcodeVerifier.VerifyCapturedIdAsync(capturedId).ContinueWith((task) =>
        {
            if (task.IsFaulted || task.IsCanceled)
            {
                // Error occurred during verification
            }
            else
            {
                AamvaBarcodeVerificationResult result = task.Result;
                if (result.AllChecksPassed)
                {
                    // Nothing suspicious was detected.
                }
                else
                {
                    // Document may be fraudulent or tampered with - proceed with caution.
                }
            }
        });
    }
}
```