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
