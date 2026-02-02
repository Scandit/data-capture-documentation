---
description: "ID Bolt provides callbacks to handle session completion and cancellation, allowing your application to respond appropriately to user actions and scan results.                                                                              "

sidebar_label: 'Callbacks'
title: 'Callbacks'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
keywords:
  - bolt
  - callbacks
  - events
---

# Callbacks

ID Bolt provides callbacks to handle session completion and cancellation, allowing your application to respond appropriately to user actions and scan results.

## Completion Callback

The `onCompletion` callback is invoked when the user has successfully scanned their ID and passed all validations. This is where you'll receive the extracted data.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  onCompletion: (result) => {
    if (result.capturedId) {
      console.log('Document type:', result.capturedId.documentType);
      console.log('Full name:', result.capturedId.fullName);
      console.log('Document number:', result.capturedId.documentNumber);
      // Process the scanned ID data
    }
  }
});
```

### CompletionResult Object

The `onCompletion` callback receives a `CompletionResult` object containing:

| Property | Type | Description |
|----------|------|-------------|
| `capturedId` | `CapturedId` | The scanned document data. Will be `null` if no data was returned based on the `returnDataMode`. |

## Cancellation Callback

The `onCancellation` callback is invoked when the user closes the ID Bolt pop-up without completing the scanning process or when the service fails to start.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  onCancellation: (reason) => {
    switch (reason) {
      case CancellationReason.UserClosed:
        console.log("User closed the scanning window");
        // Handle user cancellation
        break;
      case CancellationReason.ServiceStartFailure:
        console.log("ID Bolt service failed to start");
        // Handle service failure
        break;
    }
  }
});
```

### CancellationReason Enum

The `onCancellation` callback receives a `CancellationReason` enum value:

| Value | Description |
|-------|-------------|
| `CancellationReason.UserClosed` | The user closed the ID Bolt pop-up before completing the scanning process |
| `CancellationReason.ServiceStartFailure` | The ID Bolt service failed to start |

## Captured ID Data

The `CapturedId` object contains the extracted data from the scanned document. The available data depends on the document type and quality of the scan.

### CapturedId Properties

| Property | Type | Description |
|----------|------|-------------|
| `firstName` | `string` | First name of the document holder |
| `lastName` | `string` | Last name of the document holder |
| `fullName` | `string` | Full name of the document holder |
| `sex` | `string` | Sex/gender of the document holder |
| `nationality` | `string` | Nationality of the document holder |
| `address` | `string` | Address of the document holder |
| `issuingCountry` | `Region` | The ISO (Alpha-3 code) abbreviation of the issuing country |
| `documentNumber` | `string` | Unique identifier assigned to the document |
| `documentAdditionalNumber` | `string` | Secondary identification number if present |
| `personalIdNumber` | `string` | Personal identification number of the document holder |
| `dateOfBirth` | `DateResult` | Date of birth of the document holder |
| `age` | `number` | Calculated age based on date of birth |
| `dateOfExpiry` | `DateResult` | Expiration date of the document |
| `isExpired` | `boolean` | Whether the document is expired |
| `dateOfIssue` | `DateResult` | Date when the document was issued |
| `documentType` | `DocumentType` | Type of document (e.g. `"Passport"`, `"IdCard"`, `"DriverLicense"`, `"VisaIcao"`, `"ResidencePermit"`, `"HealthInsuranceCard"`, `"RegionSpecific"`) |
| `documentSubtype` | `string \| null` | Subtype of the document, if applicable |
| `capturedResultTypes` | `string[]` | Types of data that were captured |
| `nationalityISO` | `string \| null` | ISO code of the nationality |
| `isCitizenPassport` | `boolean` | Whether the document is a citizen passport |
| `images` | `object \| null` | Object containing base64 encoded images (if requested) |
| `mrzResult` | `MrzResult \| null` | Raw extracted data from Machine Readable Zone (MRZ) |
| `vizResult` | `VizResult \| null` | Raw extracted data from Visual Inspection Zone (VIZ) |
| `barcodeResult` | `BarcodeResult \| null` | Raw extracted data from barcode |

### DateResult Object

Date values are represented as `DateResult` objects:

| Property | Type | Description |
|----------|------|-------------|
| `day` | `number` | Day of the month (1-31) |
| `month` | `number` | Month (1-12) |
| `year` | `number` | Four-digit year |

### Images Object

If you've used `ReturnDataMode.FullWithImages`, the `images` property will contain front and back image sets:

```ts
images: {
  front: ImageSet;
  back: ImageSet;
} | null
```

Each `ImageSet` contains:

| Property | Type | Description |
|----------|------|-------------|
| `face` | `string \| null` | Cropped face image extracted from the document (base64 encoded) |
| `croppedDocument` | `string \| null` | Cropped image of the document, only available when the visual inspection zone is scanned (base64 encoded) |
| `frame` | `string \| null` | Full frame image of the captured document (base64 encoded) |

## Example: Complete Callback Usage

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  licenseKey: LICENSE_KEY,
  documentSelection: DocumentSelection.create({
    accepted: [new Passport(Region.Any)]
  }),
  returnDataMode: ReturnDataMode.FullWithImages,
  onCompletion: (result) => {
    if (result.capturedId) {
      // Extract basic information
      const { fullName, documentNumber, documentType, issuingCountry } = result.capturedId;
      console.log("Full Name:", fullName);
      console.log("Document Number:", documentNumber);
      console.log("Document Type:", documentType);
      console.log("Issuing Country:", issuingCountry);
    }
  },
  onCancellation: (reason) => {
    switch (reason) {
      case CancellationReason.UserClosed: {
        console.log("User cancelled the scanning process");
        // Show alternative flow
        return;
      }
      case CancellationReason.ServiceStartFailure: {
        console.log("Service failed to start");
        // Show alternative flow
        return;
      }
      default: {
        console.log("Other cancellation reason");
        // Reserved for future cancellation reasons
      }
    }
  }
});
```