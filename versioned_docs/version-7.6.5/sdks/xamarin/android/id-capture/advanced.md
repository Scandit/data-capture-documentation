---
sidebar_position: 4
pagination_next: null
framework: xamarinAndroid
keywords:
  - xamarinAndroid
title: Advanced Configurations
---

import DeprecationNotice from '/versioned_docs/version-7.6.5/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>


# Advanced Configurations

There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.

## Configure Data Anonymization

By default, data extracted from documents is anonymized according to local regulations. See [Anonymized Documents](/sdks/xamarin/android/id-capture/supported-documents.md#anonymized-documents) for more information.

That means certain data from certain fields won’t be returned, even if it’s present on a document. You control the anonymization level with the following setting:

```csharp
// Default value:
settings.setAnyonymizationMode(IdAnonymizationMode.FIELDS_ONLY);

// Sensitive data is additionally covered with black boxes on returned images:
settings.setAnyonymizationMode(IdAnonymizationMode.FIELDS_AND_IMAGES);

// Only images are anonymized:
settings.setAnyonymizationMode(IdAnonymizationMode.IMAGES_ONLY);

// No anonymization:
settings.setAnyonymizationMode(IdAnonymizationMode.NONE);
```

## Document Capture Zones

By default, a new instance of [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) creates a single-sided scanner type with no accepted or rejected documents. 

To change this, use the `scannerType` method to set the scanner type to either [SingleSideScanner](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-scanner.html#single-side-scanner) or [FullDocumentScanner](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-scanner.html#full-document-scanner).


The `FullDocumentScanner` extracts all document information by default. If using the `SingleSideScanner`, you can specify the document zones to extract:

```csharp
// To extract data from barcodes on IDs
SingleSideScanner.barcode(true);
// To extract data from the visual inspection zone (VIZ) on IDs
SingleSideScanner.visualInspectionZone(true);
// To extract data from the machine-readable zone (MRZ) on IDs
SingleSideScanner.machineReadableZone(true);
```

## Configure Accepted and Rejected Documents

To configure the documents that should be accepted and/or rejected, use the `acceptedDocuments` and `rejectedDocuments` methods in `IdCaptureSettings`.

These methods are used in conjunction with the [IdCaptureDocumentType](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) and [IdCaptureRegion](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-region.html#enum-scandit.datacapture.id.IdCaptureRegion) enums to enable highly flexible document filtering as may be desired in your application.

For example, to accept only US Driver Licenses:

```csharp
settings.AcceptedDocuments = IdDocumentType.DriverLicense | IdDocumentType.Region.US;
```

Or to accept all Passports *except* those from the US:

```csharp
settings.AcceptedDocuments = IdDocumentType.Passport;
settings.RejectedDocuments = IdDocumentType.Region.US;
```

## ID Images

Your use can may require that you capture and extract images of the ID document. Use the [IdImageType](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-image-type.html#enum-scandit.datacapture.id.IdImageType) enum to specify the images you want to extract from the `CapturedId` object

For the full frame of the document, you can use [`setShouldPassImageTypeToResult`](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/id-capture-settings.html#method-scandit.datacapture.id.IdCaptureSettings.SetShouldPassImageTypeToResult) when creating the `IdCaptureSettings` object. This will pass the image type to the result, which you can then access in the `CapturedId` object.

## Callbacks and Scanning Workflows

The ID Capture Listener provides two callbacks: `onIdCaptured` and `onIdRejected`. The `onIdCaptured` callback is called when an acceptable document is successfully captured, while the `onIdRejected` callback is called when a document is captured but rejected.

For a successful capture, the `onIdCaptured` callback provides a `CapturedId` object that contains the extracted information from the document. This object is specific to the type of document scanned. For example, a `CapturedId` object for a US Driver License will contain different fields than a `CapturedId` object for a Passport.

For a rejected document, a [RejectionReason](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) is provided in the `onIdRejected` callback to help you understand why the document was rejected and to take appropriate action. These are:

* NOT_ACCEPTED_DOCUMENT_TYPE: The document is not in the list of accepted documents. In this scenario, you could direct the user to scan a different document.
* INVALID_FORMAT: The document is in the list of accepted documents, but the format is invalid. In this scenario, you could direct the user to scan the document again.
* DOCUMENT_VOIDED: The document is in the list of accepted documents, but the document is voided. In this scenario, you could direct the user to scan a different document.
* TIMEOUT: The document was not scanned within the specified time. In this scenario, you could direct the user to scan the document again.

## Detect Fake IDs

*ID Validate* is a fake ID detection software. It currently supports documents that follow the Driver License/Identification Card specification by the American Association of Motor Vehicle Administrators (AAMVA).

The following verifier is available:

* [AAMVABarcodeVerifier](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by scanning the barcode on the back.

To enable ID validation for your subscription, please reach out to [Scandit Support](mailto:support@scandit.com).
