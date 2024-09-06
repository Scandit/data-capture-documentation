---
sidebar_position: 3
pagination_next: null
framework: web
keywords:
  - web
---

# Advanced Configurations

The are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.

## Capture Front and Back of Document

By default, when [IdDocumentType.DLVIZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardVIZ](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) are selected, _Id Capture_ scans only the front side of documents. Sometimes however, you may be interested in extracting combined information from both the front and the back side.

Currently the combined result contains the following information: \* AAMVA-compliant documents (for example US Driver’s Licenses): the human-readable front side of the document and the data encoded in the PDF417 barcode in the back; \* European IDs: the human-readable sections of the front and the back side, and the data encoded in the Machine Readable Zone (MRZ); \* Other documents: the human-readable section of the front and the back side (if present).

First, enable scanning of both sides of documents in [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings):

```js
settings.supportedDocuments = [
	SDCId.IdDocumentType.IdCardVIZ,
	SDCId.IdDocumentType.DLVIZ,
];
settings.supportedSides = SDCId.SupportedSides.FrontAndBack;
```

Start by scanning the front side of a document. After you receive the result in [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener), inspect [VIZResult.isBackSideCaptureSupported](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.IsBackSideCaptureSupported). If scanning of the back side of your document is supported, flip the document and capture the back side as well. The next result that you receive is a combined result that contains the
information from both sides. You may verify this by checking [VIZResult.capturedSides](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/viz-result.html#property-scandit.datacapture.id.VizResult.CapturedSides). After both sides of the document are scanned, you may proceed with another document.

Sometimes, you may not be interested in scanning the back side of a document, after you completed the front scan. For example, your user may decide to cancel the process. Internally, _Id Capture_ maintains the state of the scan, that helps it to provide better combined results. To abandon capturing the back of a document, reset this state by calling:

```js
await idCapture.reset();
```

Otherwise, _Id Capture_ may assume that the front side of a new document is actually the back side of an old one, and provide you with nonsensical results.

## Detect Fake IDs

_ID Validate_ is a fake ID detection software. It currently supports documents that follow the Driver License/Identification Card specification by the American Association of Motor Vehicle Administrators (AAMVA).

The following two verifiers are available:

- [AamvaVizBarcodeComparisonVerifier](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/aamva-viz-barcode-comparison-verifier.html#class-scandit.datacapture.id.AamvaVizBarcodeComparisonVerifier): Validates the authenticity of the document by comparing the data from the VIZ and from the barcode on the back.
- [AamvaBarcodeVerifier](https://docs.scandit.com/data-capture-sdk/web/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by scanning the barcode on the back.

To enable ID Validate for your subscription, please reach out to [Scandit Support](mailto:support@scandit.com).
