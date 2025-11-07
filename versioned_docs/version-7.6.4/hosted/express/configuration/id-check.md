---
description: 'Configuration options for the ID Check workflow in Scandit Express.'
sidebar_label: 'ID Check'
displayed_sidebar: expressSidebar
tags: [express]
keywords:
  - express
---

# ID Check

The **ID Check** feature in Scandit Express enables scanning and verification of identity documents directly from the Scandit Express home screen. It is designed for use cases where verifying the **age** or **validity** of an ID is required, such as retail, hospitality, and regulated goods sales.

This mode combines **ID validation**, **age verification**, and **export of scanned IDs** into a streamlined workflow that runs fully on-device.

## Getting Started

From the Scandit Express **Home Screen**, select **ID Check** to launch the workflow.

- The camera opens immediately in **ID Capture mode**.  
- Users scan the front of the ID document (back of document scanning is optional depending on configuration).  
- Validation and age verification checks are performed automatically.  
- A result screen confirms whether the ID passed or failed the configured checks.  
- The user can scan additional IDs or finish the session at any time.  

:::tip
The camera stream pauses automatically after 30 seconds of inactivity to save battery.
:::

## Features

- **ID Validation**: Detects whether an ID is valid, expired, or forged.  
- **Age Verification**: Compares the document’s date of birth against a configurable age limit.
- **Configurable Document Types**: Supports a wide range of IDs (Driver Licenses, Passports, National IDs, Military IDs, etc.). See [Supported Documents](/docs/sdks/android/id-capture/supported-documents.md).
- **Persistence**: Optionally keep scanned IDs available across app sessions until cleared or exported.
- **Export to CSV**: Scanned IDs can be exported as a CSV file with customizable columns.

## Configuration

:::tip
For configuration of the ID Check functionality, contact [Scandit Support](mailto:support@scandit.com).
:::

ID Check is configured via the **Advanced** section of the Scandit Express settings. Configuration options include:

| Configuration Key | Values   | Behavior   |
|-----------------|-----------------|----------|
| **enabled**  | `true`, `false`   | Whether ID Check is enabled and selected from the main menu or not. |
| **idScanningMode** | `front and back`, `MRZ`, `PDF417`, `VIZ` | Specifies the scanning mode to use for ID documents and the area(s) of the documents to focus on. |
| **supportedDocuments** | See [Supported Documents](/docs/sdks/android/id-capture/supported-documents.md). | List of supported documents which can be scanned. By default all documents are enabled. |
| **scanToFile** | See [Captured ID](https://docs.scandit.com/7.6/data-capture-sdk/web/id-capture/api/captured-id.html) for a full list of all the possible fields. | | If this field is present it will be used to customize the output of this mode, i.e. `tableType` can be `custom` (choose which columns to export) or `full` (returns all fields). |
| **enabledRejections** | See [ID Capture Settings](https://docs.scandit.com/7.6/data-capture-sdk/android/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectedDocuments) for more information. | Specifies any documents that should be automatically rejected, for example enforcing age limits or regional restrictions. |
| **scannedBarcodePersistenceEnabled** | `true`, `false` |  If true, save scanned ID(s) when exiting the mode. Next time the user is shown a dialog asking whether to continue with persisted IDs or start fresh. Clear persisted data after every successful export or when the app is closed. |

### Example Configuration

```json
"idCheck": {
    "enabled": true,
    "idScanningMode": "front and back" | "MRZ" | "PDF417" | "VIZ", // defaults to "front and back"
    "supportedDocuments": [ // list of supported documents, default to all documents
        {
            "type": "ID_CARD",
            "region": "ITALY"
        },
        {
            "type": "DRIVER_LICENSE",
            "region": "TRINIDAD_AND_TOBAGO"
        }
        ...
    ],
    "scanToFile": { // if not specified, the default is the full export
		"format": "csv", // optional, default csv
		"tableType": "full", // optional, default full. Values: full, custom
		"timestampOptions": { // Default date format for all dates, optional
				"format": "yyyy-MM-dd'T'HH:mm:ss'Z'" // default value
		}, 
    "enabledRejections": { // if not specified, the default is "rejectExpiredIds": true
        "rejectExpiredIds": true,
        "rejectHolderBelowAge": 21,
        "rejectForgedAamvaBarcodes": true,
        "rejectIdsExpiringIn": {
          "days": 2,
          "months": 3,
          "years": 0
        }
    },
    "scannedBarcodePersistenceEnabled": true // default is false 
}
```
