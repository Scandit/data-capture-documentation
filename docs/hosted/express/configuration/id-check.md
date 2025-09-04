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
- **Configurable Document Types**: Supports a wide range of IDs (Driver Licenses, Passports, National IDs, Military IDs, etc.). See [Supported Documents](docs/sdks/android/id-capture/supported-documents.md).
- **Persistence**: Optionally keep scanned IDs available across app sessions until cleared or exported.
- **Export to CSV**: Scanned IDs can be exported as a CSV file with customizable columns.

:::tip
For configuration of the ID Check functionality, contact [Scandit Support](mailto:support@scandit.com).
:::
