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

You can set the properties of a symbology using the methods of the `ScSymbologySettings` class. You can get the symbology settings of Code128 as follows:

```c
ScSymbologySettings *symbology_settings = sc_barcode_scanner_settings_get_symbology_settings(settings, SC_SYMBOLOGY_CODE128)
```

Some symbologies have optional checksums. A specific checksum method can be set in the following way:

```c
sc_symbology_settings_set_checksums(symbology_settings, SC_CHECKSUM_MOD_10);
```

Symbologies may also have a certain length range configured by default. The length of a barcode can be checked using the "Any Code" mode of our demo app (Apple/Play Store). A new length range can be set by the dedicated symbol count method on the ScSymbologySettings class.

```c
uint16_t symbol_counts[] = {
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
};
sc_symbology_settings_set_active_symbol_counts(symbology_settings, symbol_counts, sizeof(symbol_counts));
```

When working with symbologies printed white on black (default is black on white), you can set it using the dedicated inverted color method on the `ScSymbologySettings` class.

```c
sc_symbology_settings_set_color_inverted_enabled(symbology_settings, SC_TRUE);
```

Symbologies may also have optional extensions/properties, as detailed in the next section. You can enforce these properties through a generic method on the `ScSymbologySettings` class.

```c
sc_symbology_settings_set_extension_enabled(symbology_settings, "relaxed_sharp_quiet_zone_check", SC_TRUE);
```

Some symbologies support Optical Character Recognition (OCR) as a fallback when scanning fails. When the extension is enabled, an optional regular expression can be used to constrain results to a specific format, using the following method on the `ScSymbologySettings` class:

```c
sc_symbology_settings_set_ocr_fallback_regex(symbology_settings, regex);
```

## 1D Symbology Properties

Keep the following in mind when configuring 1D symbologies:

* All symbologies and all extensions are disabled by default when using the low-level API.
* Color-inverted (bright bars on dark background) decoding for symbologies that support it is disabled and must be explicitly enabled.
* Optional checksum digits (e.g. for interleaved 2 of 5 codes, or MSI-Plessey codes) are always returned as part of the data.

| Symbology                     | Mandatory Checksums | Supported Optional <br/>Checksums | Default Optional<br/> Checksum | Default Symbol Count Range                      | Supported Symbol Count Range | Color-Inverted <br/>Codes | Extensions                                                       | Generator Support |
|-------------------------------|---------------------|-----------------------------------|--------------------------------|-------------------------------------------------|------------------------------|---------------------------|------------------------------------------------------------------|-------------------|
| EAN-13 / UPC-A                | mod10               |                                   |                                | 12                                              | 12                           | yes                       | ocr_fallback, remove_leading_upca_zero, strict                   | yes               |
| EAN-8                         | mod10               |                                   |                                | 8                                               | 8                            | yes                       | strict                                                           | no                |
| UPC-E                         | mod10               |                                   |                                | 6                                               | 6                            | yes                       | return_as_upca, remove_leading_upca_zero, strict                 | no                |
| Two-Digit Add-on              | mod10               |                                   |                                | 2                                               | 2                            | yes                       | strict                                                           | no                |
| Five-Digit Add-on             | mod10               |                                   |                                | 5                                               | 5                            | yes                       | strict                                                           | no                |
| MSI Plessey                   | none                | mod10, mod11, mod1010, mod1110    | mod10                          | 6-32                                            | 3-32                         | no                        | strict                                                           | no                |
| Code 128                      | mod103              |                                   |                                | 6-40 (includes 1 checksum and 2 guard symbols)  | 4-50                         | yes                       | ocr_fallback, strip_leading_fnc1<sup>1</sup>, strict             | yes               |
| Code 11                       | none                | mod11                             | mod11                          | 7-20 (includes 0-2 checksum digits)             | 3-32                         | no                        | strict                                                           | no                |
| Code 25                       | none                | mod10                             |                                | 7-20                                            | 3-32                         | no                        | strict                                                           | no                |
| IATA 2 of 5                   | none                | mod1010                           |                                | 7-20                                            | 3-32                         | no                        | strict                                                           | no                |
| Matrix 2 of 5                 | none                | mod10                             |                                | 7-20                                            | 3-32                         | no                        | strict                                                           | no                |
| Code 32                       | mod10               |                                   |                                | 8 (plus one check digit)                        | 8                            | no                        | strict                                                           | no                |
| Code 39                       | none                | mod43                             |                                | 6-40 (includes 2 guard symbols)                 | 3-50                         | yes                       | ocr_fallback, full_ascii, relaxed_sharp_quiet_zone_check, strict | yes               |
| Code 93                       | mod47               |                                   |                                | 6-40 (includes 2 checksums and 2 guard symbols) | 5-60                         | no                        | full_ascii<sup>2</sup>, strict                                   | no                |
| Codabar                       | none                | mod16, mod11                      |                                | 7-20 (includes 2 guard symbols)                 | 3-34                         | no                        | ocr_fallback, strict, remove_delimiter_data                      | no                |
| GS1 DataBar 14                | mod10               |                                   |                                | 2 (encoding 14 digits)                          | 2                            | no                        | strict                                                           | no                |
| GS1 DataBar Expanded          | mod211              |                                   |                                | 1-11 (encoding 1-74 characters)                 | 1-11                         | no                        | strict                                                           | no                |
| GS1 DataBar Limited           | mod89               |                                   |                                | 1 (encoding 14 digits)                          | 1                            | no                        | relaxed_sharp_quiet_zone_check, strict                           | no                |
| Interleaved-Two-of-Five (ITF) | none                | mod10                             |                                | 6-40                                            | 4-50                         | no                        | strict                                                           | yes               |
| Royal Mail 4-State            | mod36               |                                   |                                | 7-24                                            | 4-50                         | no                        | fluorescent_orange_ink                                           | no                |
| KIX                           | none                |                                   |                                | 7-24                                            | 7-24                         | no                        |                                                                  | no                |
| LAPA                          | none                |                                   |                                | 16                                              | 16                           | no                        |                                                                  | no                |
| USPS Intelligent Mail         | none                |                                   |                                | 65                                              | 65                           | no                        |                                                                  | no                |
| UPU 4-State                   | none                |                                   |                                | 19 or 25                                        | 19 or 25                     | no                        | fluorescent_orange_ink, swiss_post_decoding                      | no                |
| Australian Post 4-State       | none                |                                   |                                | 10-41 (10 digits, 0-31 customer info characters)| 10-41                        | no                        | one of force_table_c, force_table_n, decode_bar_states           | no                |
| French Post                   | none                |                                   |                                | -                                               | -                            | no                        | fluorescent_orange_ink                                           | no                |

1: Enabled by default<br/>
2: Always enabled

## 2D Symbology Properties

Keep the following in mind when configuring 2D symbologies:

* All symbologies and all extensions are disabled by default when using the low-level API.
* Color-inverted decoding for symbologies that support it is disabled and must be explicitly enabled, except where mentioned.

| Symbology     | Color-Inverted <br/>Codes | Extensions                                               | Generator Support |
|---------------|---------------------------|----------------------------------------------------------|-------------------|
| ArUco         | yes                       |                                                          | no                |
| Aztec Code    | yes                       |                                                          | yes               |
| Data Matrix   | yes                       | strip_leading_fnc1<sup>1</sup>, direct_part_marking_mode | yes               |
| DotCode       | yes                       |                                                          | no                |
| MaxiCode      | no                        |                                                          | no                |
| MicroPDF417   | no                        |                                                          | no                |
| PDF417        | no                        |                                                          | no                |
| QR Code       | yes<sup>1</sup>           | strict                                                   | yes               |
| Micro QR Code | yes<sup>1</sup>           |                                                          | no                |

1: Enabled by default.

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
| ocr_fallback | Enables Optical Character Recognition of text as a fallback when other readers fail. For more details, refer to section "Using OCR Fallback Symbology Extension". |

## Using OCR Fallback Symbology Extension

When enabled, the OCR Fallback symbology extension performs text detection and recognition next to detected codes. This extension requires Smart Scan Intention which is available in SparkScan, Barcode Capture, or through the Linux settings preset `SC_PRESET_SINGLE_CODE_HAND_HELD`. It also requires the LabelText module.

OCR Fallback is triggered after 1 second of unsuccessful decoding while remaining stationary. The duration can be customized by setting the `ocr_fallback_smart_stationary_timeout` engine property with a value in milliseconds.

When the scanner is configured with multiple symbologies enabled with OCR Fallback, OCR is performed for each symbology in a hard-coded sequence. As soon as a result is detected that is valid for one symbology, OCR Fallback ends and the result is returned.

For some symbologies with overlapping character set and no checkum algorithms for the printed text label, this may cause unwanted results. For instance, a Code128 label may be misidentified as Code39, or vice-versa, depending on the order of execution. It is advised to configure different OCR regular expressions for each symbology when possible, so that codes are identified properly.

When no OCR regular expression is configured for Code128 or Code39, results returned by OCR Fallback may only contain alpha-numerical characters to reduce false-positives. Characters detected through OCR that are non-alpha-numerical are removed from results. To scan codes containing non-alpha-numerical characters, such as spaces or dashes, it is required to configure a regular expression that matches those characters.

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
