---
sidebar_position: 2
pagination_next: null
framework: ios
keywords:
  - ios
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`SDCAAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences, as detailed in the following sections.

## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```swift
let dataCaptureContext = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
let verifier = AamvaBarcodeVerifier(context: dataCaptureContext)
```

Then initialize the desired scanning mode:

```swift
// Single-sided scanning mode
let settings = IdCaptureSettings()
settings.supportedDocuments = [ .aamvaBarcode ]

// Front and back scanning mode
let idCapture = IdCapture(context: dataCaptureContext, settings: settings)
let = IdCaptureSettings()
idCaptureSettings.supportedDocuments = [ .dlVIZ ]
idCaptureSettings.supportedSides = .frontAndBack

let idCapture = IdCapture(context: dataCaptureContext, settings: settings)
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```swift
func idCapture(_ idCapture: IdCapture, didCaptureIn session: IdCaptureSession, frameData: FrameData) {
    guard let capturedId = session.newlyCapturedId,
        let barcode = capturedId.aamvaBarcodeResult
    else { return }

    // Trigger the verification. This process is asynchronous.
    verifier.verify(capturedId) { result, error in
        if let error = error {
            // Verification error
        } else if let result = result {
            if result.allChecksPassed {
                // Nothing suspicious was detected.
            } else {
                // Document may be fraudulent or tampered with - proceed with caution.
            }
        }
    }
}
```