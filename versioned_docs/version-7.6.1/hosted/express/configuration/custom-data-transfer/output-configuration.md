---
description: "Learn how to configure output data for the Custom Data Transfer feature in Scandit Express, enabling you to collect and manage data efficiently during scanning tasks."
framework: express
tags: [express]
sidebar_label: Output Configuration
keywords:
  - express
---
# Configuring Output Data

This guide explains how to configure output data for the **Custom Data Transfer** feature. Output configuration determines how scanned data and additional inputs are structured, transformed, and exported to external systems.

## Core Configuration

| Field | Description |
|-------|-------------|
| `type` | Always set to `standard` for this configuration type. |
| `behavior` | Defines how new data is written. Options: <br></br> - `replace`: overwrite existing data <br></br> - `append`: add new rows or entries. |
| `target` | Defines the destination for the output (e.g., Google Sheets, CSV, API). |
| `parserOptions` | (Optional) Array of parser configuration objects. |
| `timestampOptions` | (Optional) Controls how timestamps are handled. |
| `grouped` | Boolean (default: `true`). If `false`, the same barcode will be repeated when quantity > 1. |
| `fields` | Array of **OutputField** objects that define which values should be exported. |

## OutputField Configuration

Each `OutputField` defines a single column or output entry.

| Field | Description |
|-------|-------------|
| `type` | Defines the source of the output value. Options: <br></br> - `barcodeValue` <br></br> - `inputValue` <br></br> - `labelValue` |
| `name` | String used as the column name in the output. |
| `barcodeValue` | Configuration object (only if `type=barcodeValue`). Defines which aspect of the barcode to output. |
| `inputValue` | String (only if `type=inputValue`). Refers to the key from an `InputField`. |
| `labelValue` | String (only if `type=labelValue`). Refers to a label field name from `labelCaptureSettings`. |

### BarcodeValue Types

When `type=barcodeValue`, the following `barcodeValue.type` options are available:

| Type | Description |
|------|-------------|
| `barcodeData` | Raw scanned barcode data. |
| `symbology` | Symbology type (e.g., QR, Code128). |
| `symbolCount` | Number of symbols in the barcode. |
| `quantity` | Quantity derived from scanning. |
| `timestamp` | Timestamp of the scan (see `timestampOptions`). |
| `parsed` | Parsed values based on `parserOptions`. |
| `found` | Whether the item was found (configurable labels: `foundValue`, `notFoundValue`). |
| `counted` | Counting status (configurable: `notInListValue`, `notInListAcceptedValue`, `notInListRejectedValue`, `receivedValue`, `notReceivedValue`). |

* `timestampOptions`: Default date format for all dates used is `"yyyy-MM-dd'T'HH:mm:ss'Z'"` (ISO 8601). You can customize this format using the `format` field.
* `parserOptions`: Supported parsers are `hibc`, `gs1AI`, `swissQR`, `vin`, and `iataBcbp`. Use the `options` object if you want to put extra options to parsers.


## Example Configuration

```json
{
  "type": "standard",
  "behavior": "append",
  "target": {
    "type": "googleSheets",
    "spreadSheetId": "My spreadSheetId",
    "sheetId": 0
  },
  "parserOptions": [
    {
      "parserType": "gs1AI",
      "options": {
        "strictMode": false,
        "allowMachineReadableCodes": true
      }
    }
  ],
  "fields": [
    {
      "type": "barcodeValue",
      "name": "Barcode",
      "barcodeValue": {
        "type": "barcodeData"
      }
    },
    {
      "type": "barcodeValue",
      "name": "Quantity",
      "barcodeValue": {
        "type": "quantity"
      }
    },
    {
      "type": "barcodeValue",
      "name": "Count Status",
      "barcodeValue": {
        "type": "counted",
        "notInListValue": "Item not in list",
        "notInListAcceptedValue": "Item not in list - but accepted",
        "notInListRejectedValue": "Item not in list - and rejected",
        "receivedValue": "Received",
        "notReceivedValue": "Not Received"
      }
    },
    {
      "type": "barcodeValue",
      "name": "parsed field",
      "barcodeValue": {
        "type": "parsed",
        "parsedValues": [
          {
            "parserType": "swissQR",
            "keys": "QRCH/AltPmtInf/AltPmt/2",
            "options": {
              "parserOptionKey1": true,
              "parserOptionKey2": false
            },
          }
        ]
      }
    },
    {
      "type": "inputValue",
      "name": "StoreName1",
      "inputValue": "STORE_NAME_1"
    },
    {
      "type": "inputValue",
      "name": "StoreName2",
      "inputValue": "STORE_NAME_2"
    },
    {
      "type": "barcodeValue",
      "name": "The First Barcode PD splitted",
      "labelValue": "pd",
      "barcodeValue": {
        "type": "parsed",
        "parsedValues": [
          {
              "parserType": "gs1AI",
              "keys": "02.GTIN"
          }
        ]
      }
    },
    {
      "type": "labelValue",
      "name": "The First Barcode PD",
      "labelValue": "pd"
    }
  ]
}
```  
