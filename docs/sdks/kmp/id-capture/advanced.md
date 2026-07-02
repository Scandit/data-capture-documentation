---
description: "There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.                                                                              "

sidebar_position: 4
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Advanced Configurations

There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.

## Decode EU Driver Licenses

By default, ID Capture doesn't extract data from the table on the back of European Driver Licenses. If you are interested in this data, you may enable the extraction by calling:

```kotlin
settings.decodeBackOfEuropeanDrivingLicense = true
```

:::warning
To use this feature, you will need to include the `id-europe-driving-license` module in your project. See the [module overview](/sdks/kmp/id-capture/get-started.md#module-overview) for details.
:::

## Configure Data Anonymization

By default, data extracted from documents is anonymized according to local regulations. See [Anonymized Documents](/sdks/kmp/id-capture/supported-documents.md#anonymized-documents) for more information.

That means certain data from certain fields won't be returned, even if it's present on a document. You control the anonymization level with the following setting:

```kotlin
import com.kmp.datacapture.id.scanner.IdAnonymizationMode

// Default value:
settings.anonymizationMode = IdAnonymizationMode.FIELDS_ONLY

// Sensitive data is additionally covered with black boxes on returned images:
settings.anonymizationMode = IdAnonymizationMode.FIELDS_AND_IMAGES

// Only images are anonymized:
settings.anonymizationMode = IdAnonymizationMode.IMAGES_ONLY

// No anonymization:
settings.anonymizationMode = IdAnonymizationMode.NONE
```

## Document Capture Zones

By default, `IdCaptureSettings.idCaptureSettings()` creates a single-sided scanner type with no accepted or rejected documents.

To change this, assign `scannerType` to either `SingleSideScanner` or `FullDocumentScanner`.

`FullDocumentScanner` extracts all document information by default. If using `SingleSideScanner`, you can specify the document zones to extract via its constructor parameters:

```kotlin
import com.kmp.datacapture.id.scanner.SingleSideScanner

// To extract data from barcodes on IDs:
settings.scannerType = SingleSideScanner(barcode = true, machineReadableZone = false, visualInspectionZone = false)
// To extract data from the visual inspection zone (VIZ) on IDs:
settings.scannerType = SingleSideScanner(barcode = false, machineReadableZone = false, visualInspectionZone = true)
// To extract data from the machine-readable zone (MRZ) on IDs:
settings.scannerType = SingleSideScanner(barcode = false, machineReadableZone = true, visualInspectionZone = false)
```

## Configure Accepted and Rejected Documents

To configure the documents that should be accepted and/or rejected, assign the `acceptedDocuments` and `rejectedDocuments` properties on `IdCaptureSettings`.

These are used in conjunction with the `IdCaptureDocument` implementations (`IdCard`, `DriverLicense`, `Passport`, `ResidencePermit`, `VisaIcao`, `VisaLetter`, `HealthInsuranceCard`, `RegionSpecific`) and the `IdCaptureRegion` enum to enable highly flexible document filtering as may be desired in your application.

For example, to accept only US Driver Licenses:

```kotlin
import com.kmp.datacapture.id.data.DriverLicense
import com.kmp.datacapture.id.data.IdCaptureRegion

settings.acceptedDocuments = listOf(DriverLicense(IdCaptureRegion.US))
```

Or to accept all Passports *except* those from the US:

```kotlin
import com.kmp.datacapture.id.data.IdCaptureRegion
import com.kmp.datacapture.id.data.Passport

settings.acceptedDocuments = listOf(Passport(IdCaptureRegion.ANY))
settings.rejectedDocuments = listOf(Passport(IdCaptureRegion.US))
```

## ID Images

Your use case may require that you capture and extract images of the ID document. Use the `IdImageType` enum (`FACE`, `CROPPED_DOCUMENT`, `FRAME`) to specify the images you want to extract into the `CapturedId.images` object.

For the full frame of the document, or any other image type, call `setShouldPassImageTypeToResult` on the `IdCaptureSettings` object before creating the mode. This will pass the image type to the result, which you can then access on the `CapturedId` object.

```kotlin
import com.kmp.datacapture.id.data.IdImageType

// Holder's picture as printed on a document:
settings.setShouldPassImageTypeToResult(IdImageType.FACE, true)

// Cropped image of a document:
settings.setShouldPassImageTypeToResult(IdImageType.CROPPED_DOCUMENT, true)

// Full camera frame that contains the document:
settings.setShouldPassImageTypeToResult(IdImageType.FRAME, true)
```

## Callbacks and Scanning Workflows

The `IdCaptureListener` provides two callbacks: `onIdCaptured` and `onIdRejected`. `onIdCaptured` is called when an acceptable document is successfully captured, while `onIdRejected` is called when a document is captured but rejected.

For a successful capture, `onIdCaptured` provides a `CapturedId` object that contains the extracted information from the document. This object is specific to the type of document scanned. For example, a `CapturedId` for a US Driver License will contain different fields than a `CapturedId` for a Passport.

For a rejected document, a `RejectionReason` is provided in `onIdRejected` to help you understand why the document was rejected and to take appropriate action. These are:

* `NOT_ACCEPTED_DOCUMENT_TYPE`: The document is not in the list of accepted documents. In this scenario, you could direct the user to scan a different document.
* `INVALID_FORMAT`: The document is in the list of accepted documents, but the format is invalid. In this scenario, you could direct the user to scan the document again.
* `DOCUMENT_VOIDED`: The document is in the list of accepted documents, but the document is voided. In this scenario, you could direct the user to scan a different document.
* `TIMEOUT`: The document was not scanned within the specified time. In this scenario, you could direct the user to scan the document again.
* `SINGLE_IMAGE_NOT_RECOGNIZED`: A single-frame capture (e.g. mobile ID) could not be recognized.
* `DOCUMENT_EXPIRED`: The document has expired.
* `DOCUMENT_EXPIRES_SOON`: The document expires within the window configured by `rejectIdsExpiringIn`.
* `NOT_REAL_ID_COMPLIANT`: The document is not REAL ID compliant, when `rejectNotRealIdCompliant` is enabled.
* `HOLDER_UNDERAGE`: The holder is below the age configured by `rejectHolderBelowAge`.
* `FORGED_AAMVA_BARCODE`, `INCONSISTENT_DATA`: See [Detect Fake IDs](#detect-fake-ids) below.
* `BLUETOOTH_COMMUNICATION_ERROR`, `BLUETOOTH_UNAVAILABLE`, `CLOUD_REQUEST_FAILED`: Transport-level failures for mobile ID / cloud-backed workflows.

### Consuming results as a Flow

As a Kotlin-idiomatic alternative to registering an `IdCaptureListener`, `IdCapture` also exposes a cold `Flow` of successful captures from `commonMain` code:

```kotlin
import com.kmp.datacapture.id.capture.capturedIds
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

idCapture.capturedIds
    .onEach { capturedId -> /* handle the capture */ }
    .launchIn(coroutineScope)
```

Collecting the flow registers a listener under the hood; cancelling the collection removes it. Rejections are not surfaced on this Flow — use `IdCaptureListener.onIdRejected` for those.

## Detect Fake IDs

*ID Validate* is a fake ID detection software. It currently supports documents that follow the Driver License/Identification Card specification by the American Association of Motor Vehicle Administrators (AAMVA).

Fake ID detection can be performed automatically using the following settings:

* `IdCaptureSettings.rejectForgedAamvaBarcodes`: Automatically rejects documents whose AAMVA barcode fails authenticity validation. Requires the `id-aamva-barcode-verification` module.
* `IdCaptureSettings.rejectInconsistentData`: Automatically rejects documents whose human‑readable data does not match the data encoded in the barcode or MRZ.

To enable ID validation for your subscription, please reach out to [Scandit Support](mailto:support@scandit.com).
