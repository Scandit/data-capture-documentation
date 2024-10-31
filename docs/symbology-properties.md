---
toc_max_heading_level: 4
displayed_sidebar: sdcSidebar
tags: [android, capacitor, cordova, flutter, ios, netIos, netAndroid, react-native, titanium, web, xamarinIos, xamarinAndroid, xamarinForms]
---

# Symbology Properties

Symbologies often have different properties, such as symbol count (length of the barcode) or inverted colors (printed white on black). To provide optimal performances, some properties/values are disabled by default in our SDK. You might need to scan a symbology whose properties are by default disabled. This article lists all symbology specific properties, their defaults and possible values.

## 1D Symbology Properties

* Color-inverted (bright bars on dark background) decoding for symbologies that support it is disabled and must be explicitly enabled.
* Optional checksum digits (e.g. for interleaved 2 of 5 codes, or MSI-Plessey codes) are always returned as part of the data.

| Symbology | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Checksum&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  | Symbol Count | Supports Color-Inversion | Extensions    |
|-----------|:-----------|--------------|:------------------------:|---------------|
| EAN-13<br/>UPC-A  | **Mandatory**: mod10 | **Default**: 12<br/>**Range**: 12 | yes| relaxed_sharp_quiet_zone_check<br/>remove_leading_upca_zero<br/>two_digit_add_on<br/>five_digit_add_on<br/>strict |
| EAN-8  | **Mandatory**: mod10 | **Default**: 8<br/>**Range**: 8 | yes| relaxed_sharp_quiet_zone_check<br/>two_digit_add_on<br/>five_digit_add_on<br/>strict |
| UPC-E  | **Mandatory**: mod10 | **Default**: 6<br/>**Range**: 6 | yes| return_as_upca<br/>remove_leading_upca_zero<br/>two_digit_add_on<br/>five_digit_add_on<br/>strict |
| Two-Digit Add-on  | **Mandatory**: mod10 | **Default**: 2<br/>**Range**: 2 | yes| strict |
| Five-Digit Add-on  | **Mandatory**: mod10 | **Default**: 5<br/>**Range**: 5 | yes| strict |
| MSI Plessey  | **Mandatory**: none<br/>**Supported**: mod10, mod11, mod1010, mod1110<br/>**Default**: mod10 | **Default**: 6-32<br/>**Range**: 3-32 | no| strict |
| Code 128  | **Mandatory**: mod103 | **Default**: 6-40<br/>**Range**: 4-50 | yes| strip_leading_fnc1<br/>strict |
| Code 11  | **Mandatory**: none<br/>**Supported**: mod11<br/>**Default**: mod11 | **Default**: 7-20<br/>**Range**: 5-34 | no| strict |
| Code 25  | **Mandatory**: none<br/>**Supported**: mod10 | **Default**: 7-20<br/>**Range**: 3-32 | no| strict |
| IATA 2 of 5  | **Mandatory**: none<br/>**Supported**: mod1010 | **Default**: 7-20<br/>**Range**: 3-32 | no| strict |
| Matrix 2 of 5  | **Mandatory**: none<br/>**Supported**: mod10 | **Default**: 7-20<br/>**Range**: 3-32 | no| strict |
| Code 32  | **Mandatory**: mod10 | **Default**: 8<br/>**Range**: 8 | no| strict |
| Code 39  | **Mandatory**: none<br/>**Supported**: mod43 | **Default**: 6-40<br/>**Range**: 3-50 | yes| full_ascii<br/>relaxed_sharp_quiet_zone_check<br/>strict |
| Code 93  | **Mandatory**: mod47 | **Default**: 6-40<br/>**Range**: 5-60 | yes| full_ascii<br/>strict |
| Codabar  | **Mandatory**: none<br/>**Supported**: mod16, mod11 | **Default**: 7-20<br/>**Range**: 3-34 | no| strict |
| GS1 DataBar 14  | **Mandatory**: mod10 | **Default**: 2<br/>**Range**: 2 | no| strict |
| GS1 DataBar Expanded  | **Mandatory**: mod211 | **Default**: 1-11<br/>**Range**: 1-11 | no| strict |
| GS1 DataBar Limited  | **Mandatory**: mod89 | **Default**: 1<br/>**Range**: 1 | no| relaxed_sharp_quiet_zone_check<br/>strict |
| ITF  | **Mandatory**: none<br/>**Supported**: mod10 | **Default**: 6-40<br/>**Range**: 4-50 | no| strict |
| RM4SCC  | **Mandatory**: mod103 | **Default**: 7-24<br/>**Range**: 4-50 | no|  |
| KIX  | **Mandatory**: none | **Default**: 7-24<br/>**Range**: 4-50 | no|  |
| LAPA  | **Mandatory**: none | **Default**: 16<br/>**Range**: 16 | no|  |
| USPS Intelligent Mail  | **Mandatory**: none | **Default**: 65<br/>**Range**: 65 | no|  |
| UPU S18 4-State  | **Mandatory**: none | **Default**: 19 or 25<br/>**Range**: 19 or 25 | no| fluorescent_orange_ink |
| Australian Post 4-State  | **Mandatory**: none | **Default**: 10-41<br/>**Range**: 10-41 | no| force_table_c<br/>force_table_n<br/>decode_bar_states |
| French Post  | **Mandatory**: none |  | no| fluorescent_orange_ink |

## 2D Symbology Properties

| Symbology      | Supports Color-Inversion | Extensions                               |
|----------------|--------------------------|------------------------------------------|
| Aztec Code     | yes                      |                                          |
| Data Matrix    | yes                      | strip_leading_fnc1 (enabled by default)<br></br> direct_part_marking_mode |
| DotCode        | yes                      |                                          |
| MaxiCode       | no                       |                                          |
| MicroPDF417    | no                       |                                          |
| PDF417         | no                       |                                          |
| QR Code        | yes                      | guess_encoding_disabled                  |
| Micro QR Code  | yes                      |                                          |
| ArUco          | yes                      |                                          |

## Symbology Extension Descriptions

| Extension  | Description   |
|----------------------------------------|-------------------------------------------------------------------|
| full_ascii                             | Interprets the Code39 code data using two symbols per output character to encode all ASCII characters.                                                                                                                       |
| relaxed_sharp_quiet_zone_check         | Enables scanning codes that have quiet zones (white area before and after the code) that are significantly smaller than allowed by the symbology specification. Use this extension if you are having difficulties to scan codes due to quiet zone violations. However, enabling it may come at the cost of more false positives under certain circumstances. |
| return_as_upca                         | Transforms the UPCE result into its UPCA representation.  |
| remove_leading_upca_zero               | Removes the leading zero digit from the result if the UPCA representation extension ‘return_as_upca’ is enabled.   |
| strip_leading_fnc1                     | Removes the leading FNC1 character that indicates a GS1 code. To determine whether a certain code is a GS1 code, use ref sc_barcode_is_gs1_data_carrier.  |
| direct_part_marking_mode               | Use this mode to improve scan performance when reading direct part marked (DPM) Data Matrix codes. Enabling this extension comes at the cost of increased frame processing times. It is recommended to restrict the scanning area to a smaller part of the image for best performance. |
| strict                                 | Enforce strict standard adherence to eliminate false positives in blurry, irregular or damaged barcodes at the cost of reduced scan performance.      |
| fluorescent_orange_ink                 | Enables the scanning of low contrast fluorescent orange codes. Enabling this option can have a negative impact on the scan performance of other symbologies.   |
| force_table_c, force_table_n and decode_bar_states | For Australian Post 4-State, customer information is decoded by default with Table N, and Table C is used as a fallback. force_table_c and force_table_n respectively enforce decoding with either C or N tables, and the symbology extension decode_bar_states will return the error-corrected customer information bars as a string of the bar states, A for ascending, D for descending, T for tracker and F for full.     |
| guess_encoding_disabled | By default QR code encoding is guessed based on the code's data. If guessing is disabled, ISO-8859-1 is reported as default (unless extension `use_utf8_as_default_encoding` is set to report UTF-8). |

## Calculating Symbol Counts for Variable-Length Symbologies

The length of data encoded in variable-length symbologies such as Code 128, Codabar, Code 39 etc. is measured as the number of symbols. Depending on the symbology, the symbol count includes the start and end symbol, and/or checksum characters. The following list shows how to calculate the number of symbols for each variable-length symbology. These counts can be used as the input to sc_symbology_settings_set_active_symbol_counts().

## Interleaved-Two-of-Five

The number of symbols corresponds to the number of digits in the code. Note that the number of digits must be even. Example: the code c “1234567890123” has a symbol count of 14. For the active symbol count calculation, optional checksum digits are treated like normal data symbols.

## Codabar

The number of symbols corresponds to the number of digits in the code, plus the start and end symbols. Example: the code c “A2334253D” has a symbol count of 7 + 2 = 9.

## Code 11

The number of symbols corresponds to the number of digits in the code, plus one or two checksum symbols. For less than ten digits in the code, one checksum symbol is added. Two checksum symbols are added for ten or more digits in the code. Example: the code c “912-34956” (c “912-349566”) has a symbol count of 9 + 1 = 10. The code c “912-3495-6” (c “912-3495-638”) has a symbol count of 10 + 2 = 12.

## Code 128

The number of symbols depends on the encoding used (A, B or C). All encodings require a start, an end and a checksum symbol. The ASCII encoding modes (A and B) store each character in one symbol. Example: the code c “ABC123” in mode A has a symbol count of 6 + 2 + 1 = 9. The numeric encoding mode (C) encodes pairs of digits in one symbol. Example: the code c “123456” has a symbol count of 3 + 2 + 1 = 6. Some encoders switch modes inside the code using switch symbols to optimize the code length. In this case the exact encoding used is needed to compute the number of symbols.

## Code 93

The number of symbols corresponds to the number of characters in the code, plus the start and end symbols and 2 checksum digits. Shift characters used in “extended code93” are treated as normal data symbols. Example: the code c “ABCDE12345” has a symbol count of 10 + 2 + 2 = 14.

## Code 39

The number of symbols corresponds to the number of characters in the code, plus the start and end symbols. Note that the start and end symbols are not included in the returned barcode data. Example: the code c “4F70050378196356D” (c “4F70050378196356D”) has a symbol count of 17 + 2 = 19.

## MSI Plessey and Code 25

The number of symbols corresponds to the number of digits in the code. Example: the code c “12345674” has a symbol count of 8. For the active symbol count calculation, optional checksum digits are treated like normal data symbols.

## GS1 DataBar 14

The symbol count corresponds to the number of finder patterns in the code. Each finder is accompanied by two data segments.

## GS1 DataBar Expanded

The symbol count cannot be changed at the moment.

## RM4SCC

The number of symbols corresponds to the number of characters in the code, including the checksum character.

## KIX

The number of symbols corresponds to the number of characters in the code.

Australian Post 4-State
The number of symbol corresponds to 10 digit FCC and DPID codes, and up to 31 characters representing the customer information bar states.

## Australian Post 4-State

The number of symbol corresponds to 10 digit FCC and DPID codes, and up to 31 characters representing the customer information bar states.