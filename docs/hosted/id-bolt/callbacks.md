---
description: "ID Bolt provides callbacks to handle session completion and cancellation, allowing your application to respond appropriately to user actions and scan results.                                                                              "

sidebar_label: "Callbacks"
title: "Callbacks"
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
      console.log("Document type:", result.capturedId.documentType);
      console.log("Full name:", result.capturedId.fullName);
      console.log("Document number:", result.capturedId.documentNumber);
      // Process the scanned ID data
    }
  },
});
```

### CompletionResult Object

The `onCompletion` callback receives a `CompletionResult` object containing:

| Property     | Type         | Description                                                                                      | Since |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------ | ----- |
| `capturedId` | `CapturedId` | The scanned document data. Will be `null` if no data was returned based on the `returnDataMode`. | 1.0   |

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
  },
});
```

### CancellationReason Enum

The `onCancellation` callback receives a `CancellationReason` enum value:

| Value                                    | Description                                                               | Since |
| ---------------------------------------- | ------------------------------------------------------------------------- | ----- |
| `CancellationReason.UserClosed`          | The user closed the ID Bolt pop-up before completing the scanning process | 1.1   |
| `CancellationReason.ServiceStartFailure` | The ID Bolt service failed to start                                       | 1.1   |

## Captured ID Data

The `CapturedId` object contains the extracted data from the scanned document. The available data depends on the document type and quality of the scan.

### CapturedId Properties

| Property                   | Type                    | Description                                                                                                                                         | Since |
| -------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `firstName`                | `string`                | First name of the document holder                                                                                                                   | 1.0   |
| `lastName`                 | `string`                | Last name of the document holder                                                                                                                    | 1.0   |
| `fullName`                 | `string`                | Full name of the document holder                                                                                                                    | 1.0   |
| `sex`                      | `string`                | Sex/gender of the document holder                                                                                                                   | 1.0   |
| `nationality`              | `string`                | Nationality of the document holder                                                                                                                  | 1.0   |
| `address`                  | `string`                | Address of the document holder                                                                                                                      | 1.0   |
| `issuingCountry`           | `Region`                | The ISO (Alpha-3 code) abbreviation of the issuing country                                                                                          | 1.0   |
| `documentNumber`           | `string`                | Unique identifier assigned to the document                                                                                                          | 1.0   |
| `documentAdditionalNumber` | `string`                | Secondary identification number if present                                                                                                          | 1.0   |
| `personalIdNumber`         | `string`                | Personal identification number of the document holder                                                                                               | 1.3   |
| `dateOfBirth`              | `DateResult`            | Date of birth of the document holder                                                                                                                | 1.0   |
| `age`                      | `number`                | Calculated age based on date of birth                                                                                                               | 1.0   |
| `dateOfExpiry`             | `DateResult`            | Expiration date of the document                                                                                                                     | 1.0   |
| `isExpired`                | `boolean`               | Whether the document is expired                                                                                                                     | 1.0   |
| `dateOfIssue`              | `DateResult`            | Date when the document was issued                                                                                                                   | 1.0   |
| `documentType`             | `DocumentType`          | Type of document (e.g. `"Passport"`, `"IdCard"`, `"DriverLicense"`, `"VisaIcao"`, `"ResidencePermit"`, `"HealthInsuranceCard"`, `"RegionSpecific"`) | 1.0   |
| `documentSubtype`          | `string \| null`        | Subtype of the document, if applicable                                                                                                              | 2.1   |
| `capturedResultTypes`      | `string[]`              | Types of data that were captured                                                                                                                    | 1.0   |
| `nationalityISO`           | `string \| null`        | ISO code of the nationality                                                                                                                         | 2.1   |
| `isCitizenPassport`        | `boolean`               | Whether the document is a citizen passport                                                                                                          | 2.1   |
| `images`                   | `object \| null`        | Object containing base64 encoded images (if requested)                                                                                              | 1.0   |
| `mrzResult`                | `MrzResult \| null`     | Raw extracted data from Machine Readable Zone (MRZ)                                                                                                 | 1.6   |
| `vizResult`                | `VizResult \| null`     | Raw extracted data from Visual Inspection Zone (VIZ)                                                                                                | 1.11  |
| `barcodeResult`            | `BarcodeResult \| null` | Raw extracted data from barcode                                                                                                                     | 2.1   |
| `anonymizedFields`         | `IdFieldType[]`         | List of fields that were anonymized for this document                                                                                               | 2.2   |

### DateResult Object

Date values are represented as `DateResult` objects:

| Property | Type     | Description             | Since |
| -------- | -------- | ----------------------- | ----- |
| `day`    | `number` | Day of the month (1-31) | 1.0   |
| `month`  | `number` | Month (1-12)            | 1.0   |
| `year`   | `number` | Four-digit year         | 1.0   |

### Images Object

If you've used `ReturnDataMode.FullWithImages`, the `images` property will contain front and back image sets:

```ts
images: {
  front: ImageSet;
  back: ImageSet;
} | null
```

Each `ImageSet` contains:

| Property          | Type             | Description                                                                                               | Since |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| `face`            | `string \| null` | Cropped face image extracted from the document (base64 encoded)                                           | 2.0   |
| `croppedDocument` | `string \| null` | Cropped image of the document, only available when the visual inspection zone is scanned (base64 encoded) | 2.0   |
| `frame`           | `string \| null` | Full frame image of the captured document (base64 encoded)                                                | 2.0   |

In version 1.x, `images` has a different structure:

| Property    | Type       | Description                                                                                   | Since |
| ----------- | ---------- | --------------------------------------------------------------------------------------------- | ----- |
| `cropped`   | `string[]` | Cropped images of the ID in the order they were captured (only available when VIZ is scanned) | 1.0   |
| `fullFrame` | `string[]` | Full frame images in the order they were captured                                             | 1.0   |

## Example: Complete Callback Usage

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  licenseKey: LICENSE_KEY,
  documentSelection: DocumentSelection.create({
    accepted: [new Passport(Region.Any)],
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
  },
});
```
