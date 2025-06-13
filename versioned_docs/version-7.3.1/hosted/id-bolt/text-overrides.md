---
sidebar_label: 'Text Overrides'
title: 'Text Overrides'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
keywords:
  - bolt
  - customization
  - text
  - localization
---

# Text Overrides

ID Bolt allows you to customize the text displayed in the user interface to better match your application's tone, branding, or to provide more specific instructions to users.

## Using Text Overrides

Text overrides are specified using the `textOverrides` option when creating an ID Bolt session:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  textOverrides: {
    "titles.SCANNER_HEADER": "Scan your ID for verification",
    "texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF": "Please use a valid passport or driver's license"
  }
});
```

## Available Text Override Keys

The following text keys can be overridden:


| Key | Default | Description |
|-----|---------|-------------|
| `titles.SCANNER_HEADER` | "Scan document" | The header of the scan screen on mobile |
| `titles.LOCAL_SCAN_HEADER` | "Scan document" | The header of the scan screen on desktop |
| `texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST` | "Please scan a valid document. The following documents are accepted: [list of documents]" | The list of documents that are accepted, as displayed in the help screen |
| `texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF` | "Please scan a valid document of type  [list of documents]" | A brief description of the documents that are accepted, as displayed in the main screen |
| `texts.HELP_SUPPORTED_DOCUMENTS_EXCLUDE_LIST` | "The following documents are not accepted: [list of documents]" | The list of documents that are excluded, as displayed in the help screen. Only shown if there are excluded documents |

## Examples

### Customizing for Specific Use Cases

#### Example: Travel Documentation

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  textOverrides: {
    "titles.SCANNER_HEADER": "Scan travel document",
    "titles.LOCAL_SCAN_HEADER": "Scan travel document",
    "texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF": "Scan passport or international ID",
  }
});
```


### Combining with Localization

Text overrides should be adapted depending on the provided `locale` option to provide a fully localized experience:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // Set the base language
  locale: "fr-FR",
  
  // Override specific text in that language
  textOverrides: {
    "texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF": "Veuillez utiliser un passeport ou une carte d'identité valide"
  },
  
  // other options...
});
``` 