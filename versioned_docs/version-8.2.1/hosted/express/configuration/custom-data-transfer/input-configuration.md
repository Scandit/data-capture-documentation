---
description: "Learn how to configure input data for the Custom Data Transfer feature in Scandit Express, enabling you to collect and manage data efficiently during scanning tasks."
framework: express
sidebar_label: Input Configuration
keywords:
  - express
---

# Configuring Input Data

This guide explains how to configure input data for the **Custom Data Transfer** feature. Input data determines the type and format of the information to be collected by the user during scanning.

## Types of Input Data

There are three types of input data you must configure:

| Input Type        | Description |
|-------------------|-------------|
| **Standard Input** | Predefined or fixed input fields configured in advance. |
| **User Session Input** | Data provided by the user once at the beginning of a scanning session. |
| **User Scan Input** | Data provided by the user for each scanned barcode. |


## Standard Input

Standard inputs are fixed values or predefined fields. They are useful when you need to always attach the same kind of information (e.g., device ID, operator ID).

| Field | Description |
|-------|-------------|
| `type` | Always set to `standardInput` for this input type. |
| `target` | Either of `picker`, `googleSheets`, or `share`. This defines where the data will be sent. Additional fields may be required depending on the target. |
| `fields` | An array of **InputField** objects that define the data to be included. |

### Target

| Target | Description | Additional Fields |
|--------|-------------|-------------------|
| `picker` | Data will be included in a CSV. | `format: 'csv'` |
| `googleSheets` | Data will be sent to a Google Sheet. | `spreadSheetsId` (string)<br></br> `sheetId` (Int) |
| `share` | Data will be shared via Android's share functionality as a CSV file. | `format: 'csv'` |

### InputField

| Field | Description |
|-------|-------------|
| `Type` | Defines the field type (`barcodeData`, `symbology`, `quantity`, `info`, `additionalInfo`, `generic`). |
| `Key` | Identifier used for both display (label) and as the key in the output. |

## Example Configuration

```json
{
  "type": "standard",
  "target": {
    "type": "googleSheets",
    "spreadSheetId": "My ID",
    "sheetId": 0
  },
  "fields": [
    {
      "type": "barcodeData",
      "key": "name-of-barcode-column"
    },
    {
      "type": "quantity",
      "key": "name-of-barcode-quantity"
    },
    {
      "type": "generic",
      "key": "name-of-a-generic-column"
    }
  ]
},
{
  "type": "userSession",
  "fields": [
    {
      "type": "generic",
      "key": "STORE_NAME_1"
    },
    {
      "type": "generic",
      "key": "STORE_NAME_2"
    }
  ]
},
{
  "type": "userScanInput",
  "fields": [
    {
      "type": "generic",
      "key": "SHELF_LOCATION"
    },
    {
      "type": "quantity",
      "key": "QUANTITY_SCANNED"
    }
  ]
}
```
