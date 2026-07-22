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

## Raw Result Data

The `mrzResult`, `vizResult`, and `barcodeResult` properties on `CapturedId` expose the raw data extracted from the Machine Readable Zone (MRZ), the Visual Inspection Zone (VIZ), and the barcode respectively. Each is `null` when the corresponding zone was not scanned or contained no data. Which of these results is populated depends on the document type and which sides were captured.

All three result objects share a set of common fields, described below, and then add fields specific to their source.

### Common Result Fields

The following fields are common to `MrzResult`, `VizResult`, and `BarcodeResult`:

| Property         | Type                | Description                                       | Since |
| ---------------- | ------------------- | ------------------------------------------------- | ----- |
| `firstName`      | `string \| null`    | First name of the document holder                 | 1.6   |
| `lastName`       | `string \| null`    | Last name of the document holder                  | 1.6   |
| `fullName`       | `string \| null`    | Full name of the document holder                  | 1.6   |
| `sex`            | `string \| null`    | Sex/gender of the document holder                 | 1.6   |
| `nationality`    | `string \| null`    | Nationality of the document holder                | 1.6   |
| `address`        | `string \| null`    | Address of the document holder                    | 1.6   |
| `documentNumber` | `string \| null`    | Unique identifier assigned to the document        | 1.6   |
| `dateOfBirth`    | `DateResult \| null`| Date of birth of the document holder              | 1.6   |
| `dateOfExpiry`   | `DateResult \| null`| Expiration date of the document                   | 1.6   |
| `dateOfIssue`    | `DateResult \| null`| Date when the document was issued                 | 1.6   |

### MrzResult Object

Raw data extracted from the Machine Readable Zone (MRZ). In addition to the [common fields](#common-result-fields), it contains:

| Property                         | Type                 | Description                                                          | Since |
| -------------------------------- | -------------------- | ------------------------------------------------------------------- | ----- |
| `capturedMrz`                    | `string \| null`     | The raw MRZ text as read from the document                          | 1.6   |
| `documentCode`                   | `string \| null`     | Document code from the MRZ                                           | 1.6   |
| `fullNameSimplifiedChinese`      | `string \| null`     | Full name in simplified Chinese, when present                       | 1.6   |
| `issuingAuthorityCode`           | `string \| null`     | Code of the authority that issued the document                      | 1.6   |
| `namesAreTruncated`              | `boolean \| null`    | Whether the names in the MRZ were truncated                         | 1.6   |
| `omittedCharacterCountInGbkName` | `number \| null`     | Number of characters omitted from the GBK-encoded name              | 1.6   |
| `omittedNameCount`               | `number \| null`     | Number of names omitted                                             | 1.6   |
| `optionalDataInLine1`            | `string \| null`     | Optional data contained in the first MRZ line                       | 1.6   |
| `optionalDataInLine2`            | `string \| null`     | Optional data contained in the second MRZ line                      | 1.6   |
| `passportDateOfExpiry`           | `DateResult \| null` | Expiration date of the passport (for documents attached to one)     | 1.6   |
| `passportIssuerIso`              | `string \| null`     | ISO code of the passport issuer                                     | 1.6   |
| `passportNumber`                 | `string \| null`     | Passport number                                                     | 1.6   |
| `personalIdNumber`               | `string \| null`     | Personal identification number of the document holder               | 1.6   |
| `renewalTimes`                   | `number \| null`     | Number of times the document has been renewed                       | 1.6   |

### VizResult Object

Raw data extracted from the Visual Inspection Zone (VIZ). In addition to the [common fields](#common-result-fields), it contains:

| Property                       | Type                            | Description                                                     | Since |
| ------------------------------ | ------------------------------- | -------------------------------------------------------------- | ----- |
| `additionalAddressInformation` | `string \| null`                | Additional address information                                 | 1.11  |
| `additionalNameInformation`    | `string \| null`                | Additional name information                                    | 1.11  |
| `bloodType`                    | `string \| null`                | Blood type of the document holder                              | 1.11  |
| `capturedSides`                | `string \| null`                | Which sides of the document were captured                      | 1.11  |
| `documentAdditionalNumber`     | `string \| null`                | Secondary identification number if present                     | 1.11  |
| `drivingLicenseDetails`        | `DrivingLicenseDetails \| null` | Driving license details, when applicable                       | 1.11  |
| `employer`                     | `string \| null`                | Employer of the document holder                                | 1.11  |
| `fathersName`                  | `string \| null`                | Father's name of the document holder                           | 1.11  |
| `isBackSideCaptureSupported`   | `boolean \| null`               | Whether the back side of the document supports capture         | 1.11  |
| `issuingAuthority`             | `string \| null`                | Authority that issued the document                             | 1.11  |
| `issuingJurisdiction`          | `string \| null`                | Jurisdiction that issued the document                          | 1.11  |
| `issuingJurisdictionIso`       | `string \| null`                | ISO code of the issuing jurisdiction                           | 1.11  |
| `maritalStatus`                | `string \| null`                | Marital status of the document holder                          | 1.11  |
| `mothersName`                  | `string \| null`                | Mother's name of the document holder                           | 1.11  |
| `passportNumber`               | `string \| null`                | Passport number                                                | 1.11  |
| `personalIdNumber`             | `string \| null`                | Personal identification number of the document holder          | 1.11  |
| `placeOfBirth`                 | `string \| null`                | Place of birth of the document holder                          | 1.11  |
| `profession`                   | `string \| null`                | Profession of the document holder                              | 1.11  |
| `race`                         | `string \| null`                | Race of the document holder                                    | 1.11  |
| `religion`                     | `string \| null`                | Religion of the document holder                                | 1.11  |
| `residentialStatus`            | `string \| null`                | Residential status of the document holder                      | 1.11  |
| `sponsor`                      | `string \| null`                | Sponsor of the document holder                                 | 1.11  |
| `usRealIdStatus`               | `string \| null`                | US Real ID compliance status                                   | 1.11  |
| `vehicleOwner`                 | `string \| null`                | Vehicle owner information                                      | 1.11  |
| `visaNumber`                   | `string \| null`                | Visa number                                                    | 1.11  |
| `visaDetails`                  | `VisaDetails \| null`           | Visa details, when applicable                                  | 1.11  |

#### DrivingLicenseDetails Object

| Property                   | Type                        | Description                                     | Since |
| -------------------------- | --------------------------- | ----------------------------------------------- | ----- |
| `drivingLicenseCategories` | `DrivingLicenseCategory[]`  | List of driving license categories              | 1.11  |
| `restrictions`             | `string \| null`            | Driving restrictions                            | 1.11  |
| `endorsements`             | `string \| null`            | Driving endorsements                            | 1.11  |

#### DrivingLicenseCategory Object

| Property       | Type                 | Description                              | Since |
| -------------- | -------------------- | ---------------------------------------- | ----- |
| `code`         | `string`             | Category code                            | 1.11  |
| `dateOfIssue`  | `DateResult \| null` | Date the category was issued             | 1.11  |
| `dateOfExpiry` | `DateResult \| null` | Date the category expires                | 1.11  |

#### VisaDetails Object

| Property             | Type                 | Description                                  | Since |
| -------------------- | -------------------- | -------------------------------------------- | ----- |
| `fullName`           | `string \| null`     | Full name on the visa                        | 1.11  |
| `applicationStatus`  | `string \| null`     | Application status of the visa               | 1.11  |
| `dateOfIssue`        | `DateResult \| null` | Date the visa was issued                     | 1.11  |
| `durationInDays`     | `number \| null`     | Validity duration in days                    | 1.11  |
| `geographicValidity` | `string \| null`     | Geographic validity of the visa             | 1.11  |
| `issuingCountryIso`  | `string \| null`     | ISO code of the issuing country              | 1.11  |
| `issuingAuthority`   | `string \| null`     | Authority that issued the visa               | 1.11  |
| `multipleEntries`    | `boolean`            | Whether the visa allows multiple entries     | 1.11  |
| `numberOfEntries`    | `number \| null`     | Number of allowed entries                    | 1.11  |
| `passportNumber`     | `string \| null`     | Passport number associated with the visa     | 1.11  |
| `visaNumber`         | `string \| null`     | Visa number                                  | 1.11  |
| `validFrom`          | `DateResult \| null` | Date from which the visa is valid            | 1.11  |
| `validUntil`         | `DateResult \| null` | Date until which the visa is valid           | 1.11  |
| `visaType`           | `string \| null`     | Type of visa                                 | 1.11  |

### BarcodeResult Object

Raw data extracted from the barcode (for example, the PDF417 barcode on the back of US driver licenses). In addition to the [common fields](#common-result-fields), it contains:

| Property                            | Type                             | Description                                                    | Since |
| ----------------------------------- | -------------------------------- | -------------------------------------------------------------- | ----- |
| `aamvaVersion`                      | `number \| null`                 | AAMVA specification version of the barcode                     | 2.1   |
| `aliasFamilyName`                   | `string \| null`                 | Alias family name                                              | 2.1   |
| `aliasGivenName`                    | `string \| null`                 | Alias given name                                               | 2.1   |
| `aliasSuffixName`                   | `string \| null`                 | Alias suffix name                                              | 2.1   |
| `barcodeDataElements`               | `Record<string, string>`         | Raw barcode data elements keyed by element identifier          | 2.1   |
| `barcodeMetadata`                   | `BarcodeMetadata \| null`        | Metadata about the barcode itself                              | 2.1   |
| `bloodType`                         | `string \| null`                 | Blood type of the document holder                              | 2.1   |
| `branchOfService`                   | `string \| null`                 | Branch of service (military documents)                         | 2.1   |
| `cardInstanceIdentifier`            | `string \| null`                 | Card instance identifier                                       | 2.1   |
| `cardRevisionDate`                  | `DateResult \| null`             | Card revision date                                             | 2.1   |
| `categories`                        | `string[]`                       | Document categories                                            | 2.1   |
| `champusEffectiveDate`              | `DateResult \| null`             | CHAMPUS effective date                                         | 2.1   |
| `champusExpiryDate`                 | `DateResult \| null`             | CHAMPUS expiry date                                            | 2.1   |
| `citizenshipStatus`                 | `string \| null`                 | Citizenship status                                             | 2.1   |
| `civilianHealthCareFlagCode`        | `string \| null`                 | Civilian health care flag code                                 | 2.1   |
| `civilianHealthCareFlagDescription` | `string \| null`                 | Civilian health care flag description                          | 2.1   |
| `commissaryFlagCode`                | `string \| null`                 | Commissary flag code                                           | 2.1   |
| `commissaryFlagDescription`         | `string \| null`                 | Commissary flag description                                    | 2.1   |
| `countryOfBirth`                    | `string \| null`                 | Country of birth                                               | 2.1   |
| `countryOfBirthIso`                 | `string \| null`                 | ISO code of the country of birth                               | 2.1   |
| `deersDependentSuffixCode`          | `number \| null`                 | DEERS dependent suffix code                                    | 2.1   |
| `deersDependentSuffixDescription`   | `string \| null`                 | DEERS dependent suffix description                             | 2.1   |
| `directCareFlagCode`                | `string \| null`                 | Direct care flag code                                          | 2.1   |
| `directCareFlagDescription`         | `string \| null`                 | Direct care flag description                                   | 2.1   |
| `documentCopy`                      | `string \| null`                 | Document copy indicator                                        | 2.1   |
| `documentDiscriminatorNumber`       | `string \| null`                 | Document discriminator number                                  | 2.1   |
| `driverNamePrefix`                  | `string \| null`                 | Driver name prefix                                             | 2.1   |
| `driverNameSuffix`                  | `string \| null`                 | Driver name suffix                                             | 2.1   |
| `driverRestrictionCodes`            | `number[]`                       | Driver restriction codes                                       | 2.1   |
| `ediPersonIdentifier`               | `string \| null`                 | EDI person identifier                                          | 2.1   |
| `endorsementsCode`                  | `string \| null`                 | Endorsements code                                              | 2.1   |
| `exchangeFlagCode`                  | `string \| null`                 | Exchange flag code                                             | 2.1   |
| `exchangeFlagDescription`           | `string \| null`                 | Exchange flag description                                      | 2.1   |
| `eyeColor`                          | `string \| null`                 | Eye color of the document holder                               | 2.1   |
| `familySequenceNumber`              | `number \| null`                 | Family sequence number                                         | 2.1   |
| `firstNameTruncation`               | `string \| null`                 | First name truncation indicator                                | 2.1   |
| `firstNameWithoutMiddleName`        | `string \| null`                 | First name without the middle name                            | 2.1   |
| `formNumber`                        | `string \| null`                 | Form number                                                    | 2.1   |
| `genevaConventionCategory`          | `string \| null`                 | Geneva Convention category                                     | 2.1   |
| `hairColor`                         | `string \| null`                 | Hair color of the document holder                              | 2.1   |
| `heightCm`                          | `number \| null`                 | Height in centimeters                                          | 2.1   |
| `heightInch`                        | `number \| null`                 | Height in inches                                               | 2.1   |
| `iin`                               | `string \| null`                 | Issuer identification number                                   | 2.1   |
| `identificationType`                | `string \| null`                 | Identification type                                            | 2.1   |
| `isRealId`                          | `boolean \| null`                | Whether the document is a US Real ID                           | 2.1   |
| `issuingJurisdiction`               | `string \| null`                 | Jurisdiction that issued the document                          | 2.1   |
| `issuingJurisdictionIso`            | `string \| null`                 | ISO code of the issuing jurisdiction                           | 2.1   |
| `jpegData`                          | `string \| null`                 | JPEG image data embedded in the barcode                        | 2.1   |
| `jurisdictionVersion`               | `number \| null`                 | Jurisdiction version                                           | 2.1   |
| `lastNameTruncation`                | `string \| null`                 | Last name truncation indicator                                 | 2.1   |
| `licenseCountryOfIssue`             | `string \| null`                 | Country of issue of the license                                | 2.1   |
| `middleName`                        | `string \| null`                 | Middle name of the document holder                             | 2.1   |
| `middleNameTruncation`              | `string \| null`                 | Middle name truncation indicator                               | 2.1   |
| `mwrFlagCode`                       | `string \| null`                 | MWR flag code                                                  | 2.1   |
| `mwrFlagDescription`                | `string \| null`                 | MWR flag description                                           | 2.1   |
| `payGrade`                          | `string \| null`                 | Pay grade                                                      | 2.1   |
| `payPlanCode`                       | `string \| null`                 | Pay plan code                                                  | 2.1   |
| `payPlanGradeCode`                  | `string \| null`                 | Pay plan grade code                                            | 2.1   |
| `personDesignatorDocument`          | `number \| null`                 | Person designator document                                     | 2.1   |
| `personDesignatorTypeCode`          | `string \| null`                 | Person designator type code                                    | 2.1   |
| `personMiddleInitial`               | `string \| null`                 | Person middle initial                                          | 2.1   |
| `personalIdNumber`                  | `string \| null`                 | Personal identification number of the document holder          | 2.1   |
| `personalIdNumberType`              | `string \| null`                 | Type of personal identification number                         | 2.1   |
| `personnelCategoryCode`             | `string \| null`                 | Personnel category code                                        | 2.1   |
| `personnelEntitlementConditionType` | `string \| null`                 | Personnel entitlement condition type                           | 2.1   |
| `placeOfBirth`                      | `string \| null`                 | Place of birth of the document holder                          | 2.1   |
| `professionalDrivingPermit`         | `ProfessionalDrivingPermit \| null` | Professional driving permit details                         | 2.1   |
| `race`                              | `string \| null`                 | Race of the document holder                                    | 2.1   |
| `rank`                              | `string \| null`                 | Rank (military documents)                                      | 2.1   |
| `relationshipCode`                  | `string \| null`                 | Relationship code                                              | 2.1   |
| `relationshipDescription`           | `string \| null`                 | Relationship description                                       | 2.1   |
| `restrictionsCode`                  | `string \| null`                 | Restrictions code                                              | 2.1   |
| `securityCode`                      | `string \| null`                 | Security code                                                  | 2.1   |
| `serviceCode`                       | `string \| null`                 | Service code                                                   | 2.1   |
| `sponsorFlag`                       | `string \| null`                 | Sponsor flag                                                   | 2.1   |
| `sponsorName`                       | `string \| null`                 | Sponsor name                                                   | 2.1   |
| `sponsorPersonDesignatorIdentifier` | `number \| null`                 | Sponsor person designator identifier                           | 2.1   |
| `statusCode`                        | `string \| null`                 | Status code                                                    | 2.1   |
| `statusCodeDescription`             | `string \| null`                 | Status code description                                        | 2.1   |
| `vehicleClass`                      | `string \| null`                 | Vehicle class                                                  | 2.1   |
| `vehicleRestrictions`               | `VehicleRestriction[]`           | Vehicle restrictions                                           | 2.1   |
| `version`                           | `string \| null`                 | Barcode version                                                | 2.1   |
| `weightKg`                          | `number \| null`                 | Weight in kilograms                                            | 2.1   |
| `weightLbs`                         | `number \| null`                 | Weight in pounds                                               | 2.1   |

#### BarcodeMetadata Object

| Property          | Type             | Description                          | Since |
| ----------------- | ---------------- | ------------------------------------ | ----- |
| `errorCorrection` | `number \| null` | Barcode error correction level       | 2.1   |
| `moduleCountX`    | `number \| null` | Number of barcode modules on the X axis | 2.1 |
| `moduleCountY`    | `number \| null` | Number of barcode modules on the Y axis | 2.1 |

#### ProfessionalDrivingPermit Object

| Property       | Type                 | Description                          | Since |
| -------------- | -------------------- | ------------------------------------ | ----- |
| `codes`        | `string[]`           | Professional driving permit codes    | 2.1   |
| `dateOfExpiry` | `DateResult \| null` | Expiry date of the permit            | 2.1   |

#### VehicleRestriction Object

| Property             | Type                 | Description                          | Since |
| -------------------- | -------------------- | ------------------------------------ | ----- |
| `vehicleCode`        | `string`             | Vehicle code                         | 2.1   |
| `vehicleRestriction` | `string`             | Vehicle restriction                  | 2.1   |
| `dateOfIssue`        | `DateResult \| null` | Date the restriction was issued      | 2.1   |

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
