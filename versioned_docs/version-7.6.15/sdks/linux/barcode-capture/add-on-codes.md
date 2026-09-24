---
sidebar_position: 1
pagination_next: null
framework: linux
keywords:
  - linux
---

# Scan add-on / extension codes

The Scandit SDK supports add-on codes (also known as Extension Codes) for EAN-8, EAN-13, UPC-A and UPC-E codes.
These codes encode additional product data like an issue number, date or price. There is a two (EAN-2/two-digit add-on) and a
five digit (EAN-5/five-digit add-on) version.

![EAN13 with two digit add-on code](/img/symbologies/ean13_with_addon2.png)
![EAN13 with five digit add-on code](/img/symbologies/ean13_with_addon5.png)

## Enable add-on codes in the SDK

* Enable both the main symbologies (e.g. EAN-13) and the add-on symbology (e.g. two-digit add-on) that you want to scan.
* Set the number of codes to scan in a frame to 2.

Accumulate scan results until two codes were scanned that fulfill the following conditions:
1. One corresponds to the main symbology
2. The other one corresponds to a symbology extension

The data of the two scanned codes is then returned as two separate results.
Be aware that it can happen that only the main code is found in a particular frame. Isolated extension
codes are never returned as a result.

### Example

Settings setup for EAN-13/UPC-A codes with a 3 or 5 digit add-on on Linux:

```c
    ScBarcodeScannerSettings *settings = sc_barcode_scanner_settings_new();
    sc_barcode_scanner_settings_set_symbology_enabled(settings, SC_SYMBOLOGY_EAN13_UPCA, SC_TRUE);
    sc_barcode_scanner_settings_set_symbology_enabled(settings, SC_SYMBOLOGY_TWO_DIGIT_ADD_ON, SC_TRUE);
    sc_barcode_scanner_settings_set_symbology_enabled(settings, SC_SYMBOLOGY_FIVE_DIGIT_ADD_ON, SC_TRUE);
    sc_barcode_scanner_settings_set_max_number_of_codes_per_frame(settings, 2);

    ScBarcodeScanner *sc_barcode_scanner_new_with_settings(context, settings);
```

The Add-On code and the main code (EAN13/UPCA, EAN8, or UPCE) are returned as two separate codes and the result needs to be combined from the scan session. A possible implementation of the result collection can look like this:

```c
    ScBool addon_code_found(ScBarcodeScannerSession const *session) {
        ScBarcode *other_code = NULL;
        ScBarcode *addon_code = NULL;

        ScBarcodeArray *codes = sc_barcode_scanner_session_get_newly_localized_codes(session);
        // will contain 0 to 2 codes.
        uint32_t const count = sc_barcode_array_get_size(codes);
        for (uint32_t i = 0; i < count; i++) {
            ScBarcode *code = sc_barcode_array_get_item_at(codes, i);
            if (sc_barcode_get_symbology(code) == SC_SYMBOLOGY_TWO_DIGIT_ADD_ON ||
                sc_barcode_get_symbology(code) == SC_SYMBOLOGY_FIVE_DIGIT_ADD_ON) {
                addon_code = code;
            } else {
                other_code = code;
            }
        }

        if (addon_code != NULL && other_code != NULL) {
            // concatenate or process the data using sc_barcode_get_data()
            return SC_TRUE;
        }

        // only a main code or no code was found
        return SC_FALSE;
    }
```

