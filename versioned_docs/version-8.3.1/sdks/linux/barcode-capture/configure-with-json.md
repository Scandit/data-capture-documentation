---
sidebar_position: 2
pagination_prev: null
framework: linux
keywords:
  - linux
---

# Configure with JSON

This document describes the JSON format understood by the [`sc_barcode_scanner_settings_new_from_json()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_scanner_settings.html#a12865e80efbcf01cac8bc8c749032663) function.

## JSON Format

The top-level must always be a dictionary (object) containing one or more key-value pairs. In the simplest form, an empty dictionary can be passed to the function. This will return a default barcode scanner settings instance with all symbologies disabled. All other properties have their default value. In general, missing properties are left at their default value, so only the properties that need to be changed away from their default need to be specified. Key-value pairs not understood the by JSON parser are ignored as if they were not specified.

The following table shows the symbology names understood by the JSON parser:

<details>
<summary>Click to expand</summary>

| Symbology                  | JSON Name (case is ignored)      |
|----------------------------|----------------------------------|
| ArUco                      | aruco                           |
| Australia Post 4State      | australian-post-4state          |
| Aztec                      | aztec                           |
| Codabar                    | codabar                         |
| Code 11                    | code11                          |
| Code 128                   | code128                         |
| Code 32                    | code32                          |
| Code 39                    | code39                          |
| Code 93                    | code93                          |
| DataBar 14                 | databar                         |
| DataBar Expanded           | databar-expanded                |
| DataBar Limited            | databar-limited                 |
| DataMatrix                 | data-matrix                     |
| DotCode                    | dotcode                         |
| EAN13 / UPCA               | ean13upca                       |
| EAN8                       | ean8                            |
| Five-Digit-Add-On          | five-digit-add-on               |
| French Post (La Poste)     | french-post                     |
| IATA 2of5                  | iata2of5                        |
| Interleaved 2 of 5         | itf                             |
| KIX                        | kix                             |
| LAPA 4SC                   | lapa4sc                         |
| Matrix 2of5                | matrix2of5                      |
| MaxiCode                   | maxicode                        |
| MicroPDF417                | micropdf417                     |
| Micro QR                   | microqr                         |
| MSI-Plessey                | msi-plessey                     |
| PDF417                     | pdf417                          |
| QR Code                    | qr                              |
| Royal Mail 4State          | rm4scc                          |
| Standard 2 of 5 (Code 25)  | code25                          |
| Two-Digit-Add-On           | two-digit-add-on                |
| UPCE                       | upce                            |
| UPU 4State                 | upu-4state                      |
| USPS Intelligent Mail      | usps-intelligent-mail           |

</details>

## Symbology Settings

By default, all symbologies are disabled. To enable a symbology, it must be listed under the `"symbologies"` key. Symbologies can either be a dictionary, or an array of symbology names:

```json
{
    "symbologies" :  [ "ean13upca", "ean8", "code128" ]
}
```

When using a dictionary, further symbology options can be specified, such as extensions to enable, used checksums etc.: 

```json
{
    "symbologies" :  {
        "code128" : true,
        "ean13upca" : { 
           "extensions" : ["remove_leading_upca_zero"]
        },
        "itf" : {
            "checksums" : [ "mod10" ]
        }
    }
}
```

The following options are currently supported:

* `enabled`: boolean indicating whether the symbology should be enabled. When using the dictionary form, `enabled` is automatically set to true.
* `colorInvertedEnabled`: boolean indicating whether color-inverted codes of that symbology should be decoded. Default is false.
* `activeSymbolCounts`: array of integers specifying the active symbol counts for the symbology. See [`sc_symbology_settings_set_active_symbol_counts`](https://docs.scandit.com/stable/c_api/struct_sc_symbology_settings.html#a0f06eab88bee48cb45ed96af0f170d16) for details.
* `extensions`: Extensions to be enabled for the symbology.
* `checksums`: List of optional checksums to use for the symbology.

Depending on the symbology, some of these properties are ignored. See [Configure Barcode Symbologies](/sdks/linux/barcode-capture/configure-barcode-symbologies.md) for details.

## Code Location and Search Area

To customize the search area and code location hints, you can use the `codeLocation1d`, `codeLocation2d`, `searchArea` and `codeDirectionHint` properties.

### Search Area

To customize the search area, set the `searchArea` property by defining the rectangle with `x`, `y`, `width`, and `height`.

```json
{ 
    "searchArea" : { 
        "x" : 0.0, "y" : 0.0, "width" : 1.0, "height" : 0.5 
    } 
}
```

### Code Location

To customize code location 1d and code location 2d, use the `codeLocation1d` and `codeLocation2d` properties. They consist of a rectangle, the area, and a constraint.

```json
{ 
    "codeLocation1d" : { 
        "area" : {"x" : 0.0, "y" : 0.0, "width" : 1.0, "height" : 0.5 },
        "constraint" : "restrict" // or "hint"
    } 
}
```

Constraint must either be `"restrict"`, or `"hint"`.

### Code Direction Hint

To customize the code direction hint, use the `codeDirectionHint` property.

```json
{ 
	"codeDirectionHint" : "left-to-right"
}
```

The code direction hint must either be `"left-to-right"`, `"right-to-left"`, `"bottom-to-top"`, `"top-to-bottom"`, `"none"`, `"vertical"`, or `"horizontal"`.

## Additional Properties

`maxNumberOfCodesPerFrame` sets the maximum number of codes per frame, see [`sc_barcode_scanner_settings_set_max_number_of_codes_per_frame()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_scanner_settings.html#a941eb7ee16744e83ef86ad14c66391cf).
`codeDuplicateFilter` sets the code duplicate filter, see [`sc_barcode_scanner_settings_set_code_duplicate_filter()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_scanner_settings.html#a3b6890b17a508e4931767c1e4bbc6483).
`arucoDictionaryPreset` sets the ArUco dictionary preset, see [`sc_aruco_dictionary_from_preset()`](https://docs.scandit.com/stable/c_api/struct_sc_aruco_dictionary.html#a32620469440760f6a07e09ebb9a9bb1e).
