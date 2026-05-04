---
description: "There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.                                                                              "

sidebar_position: 4
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.

## Decode EU Driver Licenses

By default, ID Capture doesn’t extract data from the table on the back of European Driver Licenses. If you are interested in this data, you may enable the extraction by calling:

```kotlin
settings.decodeBackOfEuropeanDrivingLicense = true
```

:::warning
To use this feature, you will need to include the `ScanditIdEuropeDrivingLicense` module in your project. See the [module overview](/sdks/android/id-capture/get-started.md#module-overview) for details.
:::

## Configure Data Anonymization

By default, data extracted from documents is anonymized according to local regulations. See [Anonymized Documents](/sdks/android/id-capture/supported-documents.md#anonymized-documents) for more information.

That means certain data from certain fields won’t be returned, even if it’s present on a document. You control the anonymization level with the following setting:

```kotlin
// Default value:
settings.anonymizationMode = IdAnonymizationMode.FIELDS_ONLY

// Sensitive data is additionally covered with black boxes on returned images:
settings.anonymizationMode = IdAnonymizationMode.FIELDS_AND_IMAGES

// Only images are anonymized:
settings.anonymizationMode = IdAnonymizationMode.IMAGES_ONLY

// No anonymization:
settings.anonymizationMode = IdAnonymizationMode.NONE
```

## ID Images

Your use can may require that you capture and extract images of the ID document. Use the [IdImageType](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-image-type.html#enum-scandit.datacapture.id.IdImageType) enum to specify the images you want to extract from the `CapturedId` object.

:::tip
Face and Cropped Document can be extracted only by either `SingleSideScanner` with `visualInspectionZone` enabled or by `FullDocumentScanner`.
In the case of `FullDocumentScanner`, if the front & the back side of a document are scanned, Cropped Document and Full Frame are returned for both sides.
:::

For the full frame of the document, you can use [`setShouldPassImageTypeToResult`](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-settings.html#method-scandit.datacapture.id.IdCaptureSettings.SetShouldPassImageTypeToResult) when creating the `IdCaptureSettings` object. This will pass the image type to the result, which you can then access in the `CapturedId` object.

```kotlin
// Holder's picture as printed on a document:
settings.setShouldPassImageTypeToResult(IdImageType.FACE, true)

// Cropped image of a document:
settings.setShouldPassImageTypeToResult(IdImageType.CROPPED_DOCUMENT, true)

// Full camera frame that contains the document:
settings.setShouldPassImageTypeToResult(IdImageType.FRAME, true)
```

## Callbacks and Scanning Workflows

The ID Capture Listener provides two callbacks: `onIdCaptured` and `onIdRejected`. The `onIdCaptured` callback is called when an acceptable document is successfully captured, while the `onIdRejected` callback is called when a document is captured but rejected.

For a successful capture, the `onIdCaptured` callback provides a `CapturedId` object that contains the extracted information from the document. This object is specific to the type of document scanned. For example, a `CapturedId` object for a US Driver License will contain different fields than a `CapturedId` object for a Passport.

For a rejected document, a [RejectionReason](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) is provided in the `onIdRejected` callback to help you understand why the document was rejected and to take appropriate action. These are:

* NOT_ACCEPTED_DOCUMENT_TYPE: The document is not in the list of accepted documents. In this scenario, you could direct the user to scan a different document.
* INVALID_FORMAT: The document is in the list of accepted documents, but the format is invalid. In this scenario, you could direct the user to scan the document again.
* DOCUMENT_VOIDED: The document is in the list of accepted documents, but the document is voided. In this scenario, you could direct the user to scan a different document.
* TIMEOUT: The document was not scanned within the specified time. In this scenario, you could direct the user to scan the document again.

## Detect Fake IDs

*ID Validate* is a fake ID detection software. It currently supports documents that follow the Driver License/Identification Card specification by the American Association of Motor Vehicle Administrators (AAMVA).

Fake ID detection can be performed automatically using the following settings:

* [IdCaptureSettings.rejectForgedAamvaBarcodes](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectForgedAamvaBarcodes): Automatically rejects documents whose AAMVA barcode fails authenticity validation.
* [IdCaptureSettings.rejectInconsistentData](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectInconsistentData): Automatically rejects documents whose human‑readable data does not match the data encoded in the barcode or MRZ.

To enable ID validation for your subscription, please reach out to [Scandit Support](mailto:support@scandit.com).
