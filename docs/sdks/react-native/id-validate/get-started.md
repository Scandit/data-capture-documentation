---
sidebar_position: 2
pagination_next: null
framework: react
keywords:
  - react
---

# Get Started

This guide will help you get started with Scandit ID Validate. The following verifier is available:

* [`AAMVABarcodeVerifier`](https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by analyzing the barcode on the back.

Integrating ID Validate into your app follows the same general steps as [integrating ID Capture](../id-capture/get-started.md), with some minor differences, as detailed in the following sections.

## Barcode Verifier

This verifier analyzes the barcode on the back of the document and works with either single-sided or front and back scanning modes.

Start with creating a capture context and the verifier:

```javascript
const dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
const barcodeVerifier = await AamvaBarcodeVerifier.create(dataCaptureContext)
```

Then initialize the desired scanning mode:

```javascript
// Single-sided scanning mode
const settings = new IdCaptureSettings()
settings.supportedDocuments = [IdDocumentType.AAMVABarcode]

const idCapture = IdCapture.forContext(dataCaptureContext, settings)

// Front and back scanning mode
const settings = new IdCaptureSettings()
settings.supportedDocuments = [IdDocumentType.DLVIZ]
settings.supportedSides = SupportedSides.FrontAndBack

const idCapture = IdCapture.forContext(dataCaptureContext, settings)
```

Once the capture is complete, trigger the verification process. This process is asynchronous and the result will be delivered once the verification has been completed:

```javascript
const idCaptureListener = {
    didCaptureId: (_, session) => {
        const capturedId = session.newlyCapturedId
        const barcode = capturedId.aamvaBarcodeResult

        if (barcode) {
            barcodeVerifier
                .then(verifierInstance => {
                    verifierInstance
                        .verify(session.newlyCapturedId)
                        .then(result => {
                                if (result.allChecksPassed) {
                                    // Nothing suspicious was detected.
                                } else {
                                    // Document may be fraudulent or tampered with - proceed with caution.
                                }
                            }, (error) => {
                                // Error occurred during verification
                            }
                        })
                })
        }
    }
}
```