---
sidebar_position: 1
pagination_next: null
framework: linux
keywords:
  - linux
---

# Scan structured append codes

Structured append mode is a standardized mechanism for spliting message data across a sequence of codes when
it wouldn't fit a single code capabilities.
Since version 7.6, the Scandit SDK supports structured append mode (also known as Extension Codes) for QR, DataMatrix, Aztec, PDF417/MicroPDF417 - we have added a number of functions to `ScBarcode` API to allow querying whether given scanned code belongs to a structured append codes sequence and which place in the sequence it occupies:

- `char const *sc_barcode_get_file_id(ScBarcode const *barcode)` function returns structured append sequence id which should match across all codes belonging to the same sequence.
- `int32_t sc_barcode_get_segment_index(ScBarcode const *barcode)` function returns a codes absolute position within a sequence.
- `int32_t sc_barcode_get_segment_count(ScBarcode const *barcode)` function returns an expected number of codes within a sequence.

For more details see `include/Scandit/ScBarcode.h`.

## Enable structured append codes in the SDK

There is nothing special required from the user in order to enable structured append scanning support - just enable the symbologies that you would like to scan an in case the scanned codes happen to be a structured append sequence the information would be returned via the above mentioned APIs.

### Example

Given the following four QR codes 
![QR structured append code #1](/static/img/symbologies/qr_sa_04_01.png)
![QR structured append code #2](/static/img/symbologies/qr_sa_04_02.png)
![QR structured append code #3](/static/img/symbologies/qr_sa_04_03.png)
![QR structured append code #4](/static/img/symbologies/qr_sa_04_04.png)

Settings setup for structured append QR codes on Linux:

```c
    ScBarcodeScanner *scanner = sc_barcode_scanner_new(context);

    ScBarcodeScannerSettings *settings = sc_barcode_scanner_settings_new();
    sc_barcode_scanner_settings_set_symbology_enabled(settings, SC_SYMBOLOGY_QR, SC_TRUE);
    ScContextStatus status = sc_barcode_scanned_apply_settings(scanner, settings);
```

The structured append codes are returned as four separate codes and they need to be combined from the scan session. A possible implementation of the result collection can look like this:

```c
    char const *structured_append_sequence_id = 0;
    char const *structured_append_sequence[32] = {0};
    int structured_append_sequence_expected_segments_count = -1;
    int structured_append_sequence_found_segments_count = 0;

    void extract_new_structured_append_codes(ScBarcodeScannerSession const *session) {
        ScBarcodeArray *codes = sc_barcode_scanner_session_get_newly_recognized_codes(session);
        // will contain 0 to 4 codes.
        uint32_t const count = sc_barcode_array_get_size(codes);
        for (uint32_t i = 0; i < count; i++) {
            ScBarcode *code = sc_barcode_array_get_item_at(codes, i);
            char const *code_file_id = sc_barcode_get_file_id(code);
            if (code_file_id) {
                if (!structured_append_sequence_id) {
                    structured_append_sequence_id = code_file_id;
                    structured_append_sequence_expected_segments_count = sc_barcode_get_segment_count(code)
                    structured_append_sequence_found_segments_count++;

                    int segment_index = sc_barcode_get_segment_index(code);
                    ScByteArray segment_data = sc_barcode_get_data(code);
                    if (segment_data.size > 0) {
                        char *segment_data_copy = (char *)malloc(segment_data.size);
                        memcpy(segment_data_copy, segment_data.str, segment_data.size);
                        structured_append_sequence[segment_index] = segment_data_copy;
                    }
                    sc_byte_array_free(segment_data);
                } else if (std::strcmp(structured_append_sequence_id, code_file_id) != 0) {
                    // found different structured append sequences
                    break;
                }
            } else {
                // code does not belong to a sequence
            }
        }

        sc_barcode_array_release(codes);
    }
```
