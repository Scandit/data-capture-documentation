---
description: "ID Bolt provides options to control what data is returned from scanned documents and how sensitive information is handled, allowing you to balance functionality with privacy requirements.                                                                         "

sidebar_label: 'Data Handling'
title: 'Data Handling'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
keywords:
  - bolt
  - data handling
  - anonymization
  - privacy
---

# Data Handling

ID Bolt provides options to control what data is returned from scanned documents and how sensitive information is handled, allowing you to balance functionality with privacy requirements.

## Return Data Mode

The `returnDataMode` option controls the extent of data returned by the `onCompletion()` callback:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  returnDataMode: ReturnDataMode.Full
});
```

### Available Modes

| Value | Description |
| ----- | ----------- |
| `ReturnDataMode.Full` | All extracted data is returned, but images are excluded |
| `ReturnDataMode.FullWithImages` | All extracted data is returned, including images of the scanned ID |

### Choosing the Right Mode

- Use `ReturnDataMode.Full` when you need the extracted data but don't require images
- Use `ReturnDataMode.FullWithImages` when you need visual verification or need to store images for compliance purposes

When using `FullWithImages`, be aware that the response will be larger due to the base64-encoded image data.

## Anonymization Mode

Some countries have specific requirements for the anonymization of documents. ID Bolt can be configured to protect sensitive fields and obscure them in result images:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  anonymizationMode: AnonymizationMode.FieldsOnly
});
```

### Available Modes

| Value | Description |
| ----- | ----------- |
| `AnonymizationMode.None` | No anonymization is applied (default) |
| `AnonymizationMode.FieldsOnly` | Only fields (data) are anonymized |
| `AnonymizationMode.ImagesOnly` | Only images are anonymized |
| `AnonymizationMode.FieldsAndImages` | Both fields and images are anonymized |

### Effects of Anonymization

- **Fields Anonymization**: Sensitive fields are not extracted from documents
- **Image Anonymization**: Black boxes cover sensitive data in result images

When image anonymization is enabled (`ImagesOnly` or `FieldsAndImages`), and `ReturnDataMode.FullWithImages` is used, full-frame images will not be returned. Cropped images will still be available but with sensitive areas obscured.

## Anonymized Fields

In addition to the anonymization mode, you can configure exactly which fields are anonymized using the `anonymizedFields` option. This gives you fine-grained control per document type.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  anonymizationMode: AnonymizationMode.FieldsOnly,
  anonymizedFields: {
    defaultFields: true,
    extraFields: [
      {
        document: new IdCard(Region.Any),
        fields: [IdFieldType.DocumentNumber, IdFieldType.DateOfBirth]
      }
    ]
  }
});
```

### Configuration

The `anonymizedFields` option accepts an object with two properties:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `defaultFields` | `boolean` | When `true`, the default set of sensitive fields is anonymized. |
| `extraFields` | `AnonymizedFieldEntry[]` | Additional fields to anonymize for specific document types, on top of the defaults. |

Each `AnonymizedFieldEntry` specifies a document type and the fields to anonymize for that document:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `document` | `IdCaptureDocument` | The document type this entry applies to (e.g. `new Passport(Region.Any)`, `new IdCard("USA")`). |
| `fields` | `IdFieldType[]` | The fields to anonymize for this document type. |

### Available Field Types

The `IdFieldType` enum defines the fields that can be anonymized:

| Value | Description |
| ----- | ----------- |
| `IdFieldType.FirstName` | First name |
| `IdFieldType.LastName` | Last name |
| `IdFieldType.FullName` | Full name |
| `IdFieldType.Sex` | Sex/gender |
| `IdFieldType.Nationality` | Nationality |
| `IdFieldType.Address` | Address |
| `IdFieldType.AdditionalAddressInformation` | Additional address information |
| `IdFieldType.AdditionalNameInformation` | Additional name information |
| `IdFieldType.Age` | Age |
| `IdFieldType.DateOfBirth` | Date of birth |
| `IdFieldType.DateOfExpiry` | Date of expiry |
| `IdFieldType.DateOfIssue` | Date of issue |
| `IdFieldType.DocumentNumber` | Document number |
| `IdFieldType.DocumentAdditionalNumber` | Document additional number |
| `IdFieldType.PersonalIdNumber` | Personal ID number |
| `IdFieldType.IssuingAuthority` | Issuing authority |
| `IdFieldType.PlaceOfBirth` | Place of birth |
| `IdFieldType.Profession` | Profession |
| `IdFieldType.Employer` | Employer |
| `IdFieldType.MaritalStatus` | Marital status |
| `IdFieldType.FathersName` | Father's name |
| `IdFieldType.MothersName` | Mother's name |
| `IdFieldType.Race` | Race |
| `IdFieldType.Religion` | Religion |
| `IdFieldType.BloodType` | Blood type |
| `IdFieldType.ResidentialStatus` | Residential status |
| `IdFieldType.MrzOptionalDataInLine1` | MRZ optional data in line 1 |
| `IdFieldType.MrzOptionalDataInLine2` | MRZ optional data in line 2 |
| `IdFieldType.BarcodeDictionary` | Barcode dictionary |

### Result

The `CapturedId` object returned in the `onCompletion` callback includes an `anonymizedFields` property — an array of `IdFieldType` values indicating which fields were actually anonymized for the scanned document.
