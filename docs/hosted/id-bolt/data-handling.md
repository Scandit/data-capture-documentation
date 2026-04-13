---
description: "ID Bolt provides options to control what data is returned from scanned documents and how sensitive information is handled, allowing you to balance functionality with privacy requirements.                                                                         "

sidebar_label: "Data Handling"
title: "Data Handling"
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
  returnDataMode: ReturnDataMode.Full,
});
```

### Available Modes

| Value                           | Description                                                        | Since |
| ------------------------------- | ------------------------------------------------------------------ | ----- |
| `ReturnDataMode.Full`           | All extracted data is returned, but images are excluded            | 1.0   |
| `ReturnDataMode.FullWithImages` | All extracted data is returned, including images of the scanned ID | 1.0   |

### Choosing the Right Mode

- Use `ReturnDataMode.Full` when you need the extracted data but don't require images
- Use `ReturnDataMode.FullWithImages` when you need visual verification or need to store images for compliance purposes

When using `FullWithImages`, be aware that the response will be larger due to the base64-encoded image data.

## Anonymization Mode

Available since version `1.3`.

Some countries have specific requirements for the anonymization of documents. ID Bolt can be configured to protect sensitive fields and obscure them in result images:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  anonymizationMode: AnonymizationMode.FieldsOnly,
});
```

### Available Modes

| Value                               | Description                           | Since |
| ----------------------------------- | ------------------------------------- | ----- |
| `AnonymizationMode.None`            | No anonymization is applied (default) | 1.3   |
| `AnonymizationMode.FieldsOnly`      | Only fields (data) are anonymized     | 1.3   |
| `AnonymizationMode.ImagesOnly`      | Only images are anonymized            | 1.3   |
| `AnonymizationMode.FieldsAndImages` | Both fields and images are anonymized | 1.3   |

### Effects of Anonymization

- **Fields Anonymization**: Sensitive fields are not extracted from documents
- **Image Anonymization**: Black boxes cover sensitive data in result images

When image anonymization is enabled (`ImagesOnly` or `FieldsAndImages`), and `ReturnDataMode.FullWithImages` is used, full-frame images will not be returned. Cropped images will still be available but with sensitive areas obscured.

## Anonymized Fields

Available since version `2.2`.

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
        fields: [IdFieldType.DocumentNumber, IdFieldType.DateOfBirth],
      },
    ],
  },
});
```

### Configuration

The `anonymizedFields` option accepts an object with two properties:

| Property        | Type                     | Description                                                                         | Since |
| --------------- | ------------------------ | ----------------------------------------------------------------------------------- | ----- |
| `defaultFields` | `boolean`                | When `true`, the default set of sensitive fields is anonymized.                     | 2.2   |
| `extraFields`   | `AnonymizedFieldEntry[]` | Additional fields to anonymize for specific document types, on top of the defaults. | 2.2   |

Each `AnonymizedFieldEntry` specifies a document type and the fields to anonymize for that document:

| Property   | Type                | Description                                                                                     | Since |
| ---------- | ------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| `document` | `IdCaptureDocument` | The document type this entry applies to (e.g. `new Passport(Region.Any)`, `new IdCard("USA")`). | 2.2   |
| `fields`   | `IdFieldType[]`     | The fields to anonymize for this document type.                                                 | 2.2   |

### Available Field Types

The `IdFieldType` enum defines the fields that can be anonymized:

| Value                                      | Description                    | Since |
| ------------------------------------------ | ------------------------------ | ----- |
| `IdFieldType.FirstName`                    | First name                     | 2.2   |
| `IdFieldType.LastName`                     | Last name                      | 2.2   |
| `IdFieldType.FullName`                     | Full name                      | 2.2   |
| `IdFieldType.Sex`                          | Sex/gender                     | 2.2   |
| `IdFieldType.Nationality`                  | Nationality                    | 2.2   |
| `IdFieldType.Address`                      | Address                        | 2.2   |
| `IdFieldType.AdditionalAddressInformation` | Additional address information | 2.2   |
| `IdFieldType.AdditionalNameInformation`    | Additional name information    | 2.2   |
| `IdFieldType.Age`                          | Age                            | 2.2   |
| `IdFieldType.DateOfBirth`                  | Date of birth                  | 2.2   |
| `IdFieldType.DateOfExpiry`                 | Date of expiry                 | 2.2   |
| `IdFieldType.DateOfIssue`                  | Date of issue                  | 2.2   |
| `IdFieldType.DocumentNumber`               | Document number                | 2.2   |
| `IdFieldType.DocumentAdditionalNumber`     | Document additional number     | 2.2   |
| `IdFieldType.PersonalIdNumber`             | Personal ID number             | 2.2   |
| `IdFieldType.IssuingAuthority`             | Issuing authority              | 2.2   |
| `IdFieldType.PlaceOfBirth`                 | Place of birth                 | 2.2   |
| `IdFieldType.Profession`                   | Profession                     | 2.2   |
| `IdFieldType.Employer`                     | Employer                       | 2.2   |
| `IdFieldType.MaritalStatus`                | Marital status                 | 2.2   |
| `IdFieldType.FathersName`                  | Father's name                  | 2.2   |
| `IdFieldType.MothersName`                  | Mother's name                  | 2.2   |
| `IdFieldType.Race`                         | Race                           | 2.2   |
| `IdFieldType.Religion`                     | Religion                       | 2.2   |
| `IdFieldType.BloodType`                    | Blood type                     | 2.2   |
| `IdFieldType.ResidentialStatus`            | Residential status             | 2.2   |
| `IdFieldType.MrzOptionalDataInLine1`       | MRZ optional data in line 1    | 2.2   |
| `IdFieldType.MrzOptionalDataInLine2`       | MRZ optional data in line 2    | 2.2   |
| `IdFieldType.BarcodeDictionary`            | Barcode dictionary             | 2.2   |

### Result

The `CapturedId` object returned in the `onCompletion` callback includes an `anonymizedFields` property — an array of `IdFieldType` values indicating which fields were actually anonymized for the scanned document.
