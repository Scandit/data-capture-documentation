---
sidebar_position: 2
pagination_next: null
framework: ios
tags: [ios]
keywords:
  - ios
---

# Get Started

This guide will help you get started with Scandit ID Validate for iOS. There are two verifiers available:

* [`SDCAAMVAVizBarcodeComparisonVerifier`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonVerifier): Validates the authenticity of the document by comparing the data from the VIZ and from the barcode on the back.
* [`SDCAAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences based on the verifier you choose, as detailed in the following sections.

## VIZ Barcode Comparison Verifier

This verifier compares the data from the VIZ (the machine-readable zone) and the barcode on the back of the document and requires the front and back scanning mode.

Create the verifier and initialize [`SDCIdCapture`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture.html#class-scandit.datacapture.id.IdCapture) with the following settings:

```swift
DataCaptureContext dataCaptureContext = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")

AAMVAVizBarcodeComparisonVerifier verifier = AAMVAVizBarcodeComparisonVerifier()

IdCaptureSettings settings = IdCaptureSettings()
settings.supportedDocuments = [ .dlVIZ ]
settings.supportedSides = .frontAndBack

IdCapture idCapture = IdCapture(context: dataCaptureContext, settings: idCaptureSettings)
```

Then proceed to capture the front and back sides of a document as usual. After you capture the back side and receive the combined result for both sides, you may run the verifier as follows:

```swift
func idCapture(_ idCapture: IdCapture, didCaptureIn session: IdCaptureSession, frameData: FrameData) {
    guard let capturedId = session.newlyCapturedId,
        let vizResult = capturedId.vizResult,
        vizResult.capturedSides == .frontAndBack
    else { return }

    let result = verifier.verify(capturedId)

    if result.checksPassed {
        // Nothing suspicious was detected.
    } else {
        // You may inspect the results of individual checks, if you wish:
        if (result.datesOfBirthMatch.checkResult == .failed) {
          // The holder’s date of birth from the front side does not match the one encoded in the barcode.
        }
    }
}
```

The return value allows you to query both the overall result of the verification and the results of individual checks. See [`SDCAAMVAVizBarcodeComparisonResult`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonResult) for details.

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