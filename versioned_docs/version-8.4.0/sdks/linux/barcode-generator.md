---
displayed_sidebar: linuxSidebar
sidebar_label: Configure barcode encoding
---

# Barcode Generator

The Barcode Generator is a simple API to generate barcodes directly from the Scandit SDK. The function [`sc_barcode_generator_new`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_generator.html) creates a barcode generator for a sepcific symbology.

The Barcode Generator supports the following formats:

* Code 39
* Code 128
* EAN 13
* UPCA
* ITF
* QR
* DataMatrix
* PDF417 (SDK version >= 8.2)

## Sample

A C and Python sample is provided in the Linux SDK archive: `CommandLineBarcodeGeneratorSample.c/py`.

## JSON Configuration

The generator can be configured using a JSON string understood by the [`sc_barcode_generator_set_options()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_generator.html#a045a2b9474895067e8eb1610ae6c5fef) function.

### General Options

* `foregroundColor`: 4-tuple of integers [r, g, b, a] with `r`, `g`, `b` and `a` being in the range [0, 255]
* `backgroundColor`: 4-tuple of integers [r, g, b, a] with `r`, `g`, `b` and `a` being in the range [0, 255]

### QR Code

* `errorCorrectionLevel`: string, may be `"L"` (up to 7% damage), `"M"` (up to 15% damage), `"Q"` (up to 25% damage) or `"H"` (up to 30% damage). Default correction level is `"M"`.
* `versionNumber`: integer from 1 to 40, overrides desired version number. Version number is automatically chosen if not set. Barcode generation might fail if version number is too small.

Example:
    ```json
    {
        "foregroundColor" :  [ 255, 0, 0, 255 ],
        "backgroundColor" :  [ 0, 0, 255, 255 ],
        "errorCorrectionLevel": "Q"
    }
    ```

### PDF417

All settings are optional.

* `errorCorrectionLevel`: integer with values 0 to 8. A higher numbers increases the error correction data in the code.
* `compact`: boolean, switches from normal to a compact code layout.
* `compaction`: string, values `TEXT`, `BYTE`, `NUMERIC` or `AUTO`.
* `dimensions`:	object,	`{"minCols" : n, "maxCols" : n, "minRows" : n, "maxRows" : n}` symbol dimensions as integer. Encoding fails if incompatible dimensions are defined.

Example:
    ```json
    {
        "errorCorrectionLevel": 3,
        "compact": true,
        "dimensions" {
            "minCols" : 1,
            "maxCols" : 3,
            "minRows" : 2,
            "maxRows" : 10
        }
    }
    ```