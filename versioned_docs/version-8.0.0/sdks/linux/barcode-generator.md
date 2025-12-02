---
displayed_sidebar: linuxSidebar
sidebar_label: JSON Settings
---

# Barcode Generator

The Barcode Generator is a simple API to generate barcodes directly from the Scandit SDK. This document describes the JSON format understood by the [`sc_barcode_generator_set_options()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_generator.html#a045a2b9474895067e8eb1610ae6c5fef) function.

## General Options

* `foregroundColor`: 4-tuple of integers [r, g, b, a] with `r`, `g`, `b` and `a` being in the range [0, 255]
* `backgroundColor`: 4-tuple of integers [r, g, b, a] with `r`, `g`, `b` and `a` being in the range [0, 255]

## 2D Symbologies

### QR Code

* `errorCorrectionLevel`: string, may be `"L"` (up to 7% damage), `"M"` (up to 15% damage), `"Q"` (up to 25% damage) or `"H"` (up to 30% damage). Default correction level is `"M"`.
* `versionNumber`: positive integer, overrides desired version number. Version number is automatically chosen if not set. Barcode generation might fail if version number is too small.
    ```json
    {
        "foregroundColor" :  [ 255, 0, 0, 255 ],
        "backgroundColor" :  [ 0, 0, 255, 255 ],
        "errorCorrectionLevel": "Q"
    }
    ```
