---
sidebar_position: 2
pagination_next: null
framework: netAndroid
keywords:
  - netAndroid
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`AAMVAVizBarcodeComparisonVerifier`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonVerifier): Validates the authenticity of the document by comparing the data from the VIZ and from the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences based on the verifier you choose, as detailed in the following sections.

## VIZ Barcode Comparison Verifier

This verifier compares the data from the VIZ (the machine-readable zone) and the barcode on the back of the document and requires the front and back scanning mode.

Create the verifier and initialize [`IdCapture`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) with the following settings:

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");

AamvaVizBarcodeComparisonVerifier verifier = AamvaVizBarcodeComparisonVerifier.Create();
IdCaptureSettings settings = new IdCaptureSettings();
settings.SupportedDocuments = IdDocumentType.DlViz;
settings.SupportedSides = SupportedSides.FrontAndBack;

IdCapture idCapture = IdCapture.Create(context, settings);
```

Then proceed to capture the front and back sides of a document as usual. After you capture the back side and receive the combined result for both sides, you may run the verifier as follows:

```csharp
public void OnIdCaptured(IdCapture capture, IdCaptureSession session, IFrameData frameData)
{
    CapturedId capturedId = session.NewlyCapturedId;
    VizResult viz = captureId.Viz;

    if (viz != null && capturedId.Viz.CapturedSides == SupportedSides.FrontAndBack)
    {
        AamvaVizBarcodeComparisonResult result = verifier.Verify(capturedId);

        if (result.ChecksPassed)
        {
            // Nothing suspicious was detected.
        }
        else
        {
            // You may inspect the results of individual checks, if you wish:
            if (result.DatesOfBirthMatch.CheckResult == ComparisonCheckResult.Failed)
            {
                // The holder's date of birth from the front side does not match the one encoded in the barcode.
            }
        }
    }
}
```

The return value allows you to query both the overall result of the verification and the results of individual checks. See [`AAMVAVizBarcodeComparisonResult`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonResult) for details.

<!--
## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```csharp
const barcodeVerifier = await AamvaBarcodeVerifier.create(dataCaptureContext)
```

Then initialize the desired scanning mode:

```csharp
// Single-sided scanning mode
const settings = new IdCaptureSettings();
settings.supportedDocuments = [IdDocumentType.AAMVABarcode];

const idCapture = await IdCapture.forContext(context, settings);

// Front and back scanning mode
const settings = new IdCaptureSettings();
settings.supportedDocuments = [IdDocumentType.DLVIZ]
settings.supportedSides = SupportedSides.FrontAndBack;

const idCapture = await IdCapture.forContext(dataCaptureContext, settings)
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```csharp
didCaptureId: async (idCaptureInstance, session) => {
  const capturedId = session.newlyCapturedId;

  const barcodeVerifier = await SDCId.AamvaBarcodeVerifier.create(dataCaptureContext);
  const result = await barcodeVerifier.verify(capturedId);
  if (result.error) {
    // May happen if the license key does not permit barcode verification.
  } else if (result.allChecksPassed) {
    // Nothing suspicious was detected.
  } else {
    // Document may be fraudulent or tampered with - proceed with caution.
  }
}
```
-->