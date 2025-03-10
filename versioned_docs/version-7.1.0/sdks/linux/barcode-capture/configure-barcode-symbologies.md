---
sidebar_position: 3
pagination_next: null
framework: linux
keywords:
  - linux
---

# Configure Barcode Symbologies

Symbologies often have different properties, such as symbol count (length of the barcode) or inverted colors (printed white on black). To provide optimal performances, some properties/values are disabled by default in our SDK.

You might need to scan a symbology whose properties are by default disabled. This article explains you how to enable the specific properties and which one are available per symbology.

## Setting Symbology Properties

You can set the properties of a symbology using the methods of the `SymbologySettings` class (naming can vary slightly across platforms). For example, on Android, you can get the symbology settings of code 128 as follows:

```java
SymbologySettings symSettings = settings.getSymbologySettings(Barcode.SYMBOLOGY_CODE128);
```

Some symbologies have optional checksums. You can enforce it with the dedicated checksum method of the `SymbologySettings` class. On Android:

```java
symSettings.setChecksums(SymbologySettings.CHECKSUM_MOD_10);
```

Symbologies may also have a certain length range configured by default. You can set a new range using the dedicated symbol count method on the `SymbologySettings` class. On Android:

```java
short[] activeSymbolCounts = new short[] {
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
};
symSettings.setActiveSymbolCounts(activeSymbolCounts);
```

When working with symbologies printed white on black (default is black on white), you can set it using the dedicated inverted color method on the `SymbologySettings` class. On Android:

```java
symSettings.setColorInvertedEnabled(true);
```

Symbologies may also have optional extensions/properties, as detailed in the next section. You can enforce these properties through a generic method on the `SymbologySettings` class. On Android:

```java
symSettings.setExtensionEnabled(relaxed_sharp_quiet_zone_check, false);
```

## 1D Symbology Properties

Keep the following in mind when configuring 1D symbologies:

* All symbologies and all extensions are disabled by default when using the low-level API.
* Color-inverted (bright bars on dark background) decoding for symbologies that support it is disabled and must be explicitly enabled.
* Optional checksum digits (e.g. for interleaved 2 of 5 codes, or MSI-Plessey codes) are always returned as part of the data.

| Symbology                   | Mandatory Checksums | Supported Optional Checksums      | Default Optional Checksum | Default Symbol Count Range | Supported Symbol Count Range | Color-Inverted Codes | Extensions                                     | Generator Support |
|-----------------------------|---------------------|-----------------------------------|---------------------------|----------------------------|-----------------------------|----------------------|------------------------------------------------|------------------|
| EAN-13 / UPC-A              | mod10              | none                              | mod10                    | 12                         | 12                          | yes                  | relaxed_sharp_quiet_zone_check, remove_leading_upca_zero, strict | yes              |
| EAN-8                       | mod10              | none                              | mod10                    | 8                          | 8                           | yes                  | relaxed_sharp_quiet_zone_check, strict           | no               |
| UPC-E                       | mod10              | none                              | mod10                    | 6                          | 6                           | yes                  | return_as_upca, remove_leading_upca_zero, strict | no               |
| Two-Digit Add-on            | mod10              | none                              | mod10                    | 2                          | 2                           | yes                  | strict                                         | no               |
| Five-Digit Add-on           | mod10              | none                              | mod10                    | 5                          | 5                           | yes                  | strict                                         | no               |
| MSI Plessey                 | none               | mod10, mod11, mod1010, mod1110    | mod10                    | 6-32                       | 3-32                        | no                   | strict                                         | no               |
| Code 128                    | mod103             | none                              | mod103                   | 6-40 (includes 1 checksum and 2 guard symbols) | 4-50                 | yes                  | strip_leading_fnc1, strict                     | yes              |
| Code 11                     | none               | mod11                             | mod11                    | 7-20 (includes 0-2 checksum digits) | 3-32                 | no                   | strict                                         | no               |
| Code 25                     | none               | mod10                             | mod10                    | 7-20                       | 3-32                        | no                   | strict                                         | no               |
| IATA 2 of 5                 | none               | mod1010                           | mod1010                  | 7-20                       | 3-32                        | no                   | strict                                         | no               |
| Matrix 2 of 5               | none               | mod10                             | mod10                    | 7-20                       | 3-32                        | no                   | strict                                         | no               |
| Code 32                     | mod10              | none                              | mod10                    | 8 (plus one check digit)   | -                           | no                   | strict                                         | no               |
| Code 39                     | mod43              | none                              | mod43                    | 6-40 (includes 2 checksums and 2 guard symbols) | 3-50                 | yes                  | full_ascii, relaxed_sharp_quiet_zone_check, strict | yes              |
| Code 93                     | mod47              | none                              | mod47                    | 6-40 (includes 2 checksums and 2 guard symbols) | 5-60                 | no                   | full_ascii, strict                              | no               |
| Codabar                     | none               | mod16, mod11                      | mod16                    | 7-20 (includes 2 guard symbols) | 3-34                 | no                   | strict, remove_delimiter_data                  | no               |
| GS1 DataBar 14              | mod10              | none                              | mod10                    | 2 (encoding 14 digits)     | 2                           | no                   | strict                                         | no               |
| GS1 DataBar Expanded        | none               | mod211                            | mod211                   | 1-11 (encoding 1-74 characters) | 1-11                 | no                   | strict                                         | no               |
| GS1 DataBar Limited         | none               | mod89                             | mod89                    | 1 (encoding 14 digits)     | 1                           | no                   | relaxed_sharp_quiet_zone_check, strict          | no               |
| Interleaved-Two-of-Five (ITF)| none              | mod10                             | mod10                    | 6-40                       | 4-50                        | no                   | strict                                         | yes              |
| RMS4SCC                     | mod36              | none                              | mod36                    | 7-24                       | 4-50                        | no                   | none                                          | no               |
| KIX                         | none               | none                              | none                     | 7-24                       | 7-24                        | no                   | none                                          | no               |
| LAPA                        | none               | none                              | none                     | 16                         | 16                          | no                   | none                                          | no               |
| USPS Intelligent Mail       | none               | none                              | none                     | 65                         | 65                          | no                   | none                                          | no               |
| UPU 4-State                 | none               | none                              | none                     | 19 or 25                   | 19 or 25                    | no                   | fluorescent_orange_ink, swiss_post_decoding     | no               |
| Australian Post 4-State     | none               | none                              | none                     | 10-41 (10 digits, 0-31 customer info characters) | 10-41             | no                   | one of force_table_c, force_table_n, decode_bar_states | no               |
| French Post                 | none               | none                              | none                     | -                          | -                           | no                   | fluorescent_orange_ink                         | no               |

1: Enabled by default
2: Always enabled

## 2D Symbology Properties

Keep the following in mind when configuring 2D symbologies:

* All symbologies and all extensions are disabled by default when using the low-level API.
* Color-inverted decoding for symbologies that support it is disabled and must be explicitly enabled.

| Symbology       | Color-Inverted Codes | Extensions                                     | Generator Support |
|------------------|----------------------|-----------------------------------------------|-------------------|
| ArUco           | yes                  | -                                             | no                |
| Aztec Code      | yes                  | -                                             | yes               |
| Data Matrix     | yes                  | strip_leading_fnc1, direct_part_marking_mode  | yes               |
| DotCode         | yes                  | -                                             | yes               |
| MaxiCode        | no                   | -                                             | no                |
| MicroPDF417     | no                   | -                                             | no                |
| PDF417          | no                   | -                                             | no                |
| QR Code         | yes                  | strict                                        | yes               |
| Micro QR Code   | yes                  | -                                             | no                |

## Symbology Extensions

| Extension Name  | Description |
|-----------------|-------------|
| full_ascii      | Interprets the Code39 code data using two symbols per output character to encode all ASCII characters. |
| relaxed_sharp_quiet_zone_check | Enables scanning codes that have quiet zones (white area before and after the code) that are significantly smaller than allowed by the symbology specification. Use this extension if you are having difficulties to scan codes due to quiet zone violations. However, enabling it may come at the cost of more false positives under certain circumstances. |
| return_as_upca  | Transforms the UPCE result into its EAN-13/UPC-A representation. |
| remove_leading_upca_zero | Removes the leading zero digit from the result if the UPC-A representation extension 'return_as_upca' is enabled. |
| strip_leading_fnc1 | Removes the leading FNC1 character that indicates a GS1 code. To determine whether a certain code is a GS1 code, use sc_barcode_is_gs1_data_carrier. |
| direct_part_marking_mode | Use this mode to improve scan performance when reading direct part marked (DPM) Data Matrix codes. Enabling this extension comes at the cost of increased frame processing times. It is recommended to restrict the scanning area to a smaller part of the image for best performance. |
| strict          | Enforce strict standard adherence to eliminate false positives in blurry, irregular or damaged barcodes at the cost of reduced scan performance. |
| fluorescent_orange_ink | Enables the scanning of low contrast fluorescent orange codes. Enabling this option can have a negative impact on the scan performance of other symbologies. |
| force_table_c   | (For Australian Post 4-State) Forces decoding of Australian Post 4-State customer information with Table C. |
| force_table_n   | (For Australian Post 4-State) Forces decoding of Australian Post 4-State customer information with Table N. |
| decode_bar_states | (For Australian Post 4-State) Returns the error-corrected customer information bars as a string of the bar states, A for ascending, D for descending, T for tracker and F for full. |
| swiss_post_decoding | Enables scanning of proprietary Swiss Post UPU 4-State symbology. |
| remove_delimiter_data | Removes start and stop patterns from the result of scanning a Codabar code. |

## Calculating Symbol Counts for Variable-Length Symbologies

The length of data encoded in variable-length symbologies such as Code 128, Codabar, Code 39 etc. is measured as the number of symbols. Depending on the symbology, the symbol count includes the start and end symbol, and/or checksum characters. The following list shows how to calculate the number of symbols for each variable-length symbology. These counts can be used as the input to [`sc_symbology_settings_set_active_symbol_counts`](https://docs.scandit.com/stable/c_api/struct_sc_symbology_settings.html#a0f06eab88bee48cb45ed96af0f170d16).

### Interleaved-Two-of-Five

The number of symbols corresponds to the number of digits in the code. Note that the number of digits must be even. 

Example: the code `“1234567890123”` has a symbol count of 14. For the active symbol count calculation, optional checksum digits are treated like normal data symbols.

### Codabar

The number of symbols corresponds to the number of digits in the code, plus the start and end symbols. 

Example: the code `“A2334253D”` has a symbol count of 7 + 2 = 9.

### Code 11

The number of symbols corresponds to the number of digits in the code, plus one or two checksum symbols. For less than ten digits in the code, one checksum symbol is added. Two checksum symbols are added for ten or more digits in the code. 

Example: the code `“912-34956”` (`“912-349566”`) has a symbol count of 9 + 1 = 10. The code `“912-3495-6”` (`“912-3495-638”`) has a symbol count of 10 + 2 = 12.

### Code 128

The number of symbols depends on the encoding used (A, B or C). All encodings require a start, an end and a checksum symbol. The ASCII encoding modes (A and B) store each character in one symbol. 

Example: the code `“ABC123”` in mode A has a symbol count of 6 + 2 + 1 = 9.

The numeric encoding mode (C) encodes pairs of digits in one symbol.

Example: the code `“123456”` has a symbol count of 3 + 2 + 1 = 6.

Some encoders switch modes inside the code using switch symbols to optimize the code length. In this case the exact encoding used is needed to compute the number of symbols.

### Code 93

The number of symbols corresponds to the number of characters in the code, plus the start and end symbols and 2 checksum digits. Shift characters used in “extended code93” are treated as normal data symbols.

Example: the code `“ABCDE12345”` has a symbol count of 10 + 2 + 2 = 14.

### Code 39

The number of symbols corresponds to the number of characters in the code, plus the start and end symbols. Note that the start and end symbols are not included in the returned barcode data. 

Example: the code `“4F70050378196356D”` (`“*4F70050378196356D”`) has a symbol count of 17 + 2 = 19.

### MSI Plessey and Code 25

The number of symbols corresponds to the number of digits in the code.

Example: the code `“12345674”` has a symbol count of 8. For the active symbol count calculation, optional checksum digits are treated like normal data symbols.

### GS1 DataBar 14

The symbol count corresponds to the number of finder patterns in the code. Each finder is accompanied by two data segments.

### GS1 DataBar Expanded

The symbol count cannot be changed.  All lengths defined by the standard are supported.

### RM4SCC

The number of symbols corresponds to the number of characters in the code, including the checksum character.

### KIX

The number of symbols corresponds to the number of characters in the code.

### UPU 4-State

The number of symbols corresponds to the number of code words. Two lengths are supported, 19 or 25 codewords with a maximum number of error correcting codewords of 6 or 12 respectively.

### Australian Post 4-State

The number of symbol corresponds to 10 digit FCC and DPID codes, and up to 31 characters representing the customer information bar states.