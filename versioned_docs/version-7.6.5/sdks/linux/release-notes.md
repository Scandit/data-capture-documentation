---
toc_max_heading_level: 3
displayed_sidebar: linuxSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: linux
keywords:
  - linux
---

## 7.6.5

**Released**: November 12, 2025

### Bug Fixes

#### Core

* Fixed a memory leak.

## 7.6.4

**Released**: November 5, 2025

No updates for this framework in this release.

## 7.6.3

**Released**: October 29, 2025

No updates for this framework in this release.

## 7.6.2

**Released**: October 20, 2025

No updates for this framework in this release.

## 7.6.1

**Released**: September 18, 2025

### Bug Fixes

#### Core

* Fixed decoding of some ASCII-encoded DataMatrix codes ending with '254' codeword followed by padding.
* Improved support for missing or damaged timing patterns in Aztec codes.

## 7.6.0

**Released**: September 15, 2025

### New Features

* Added support for QR Structured Append sequences in MatrixScan. Such sequences are reported as barcode clusters by the API.
* Introduced a new symbology string identifier for Royal Mail: `royal-mail-4state`. This will replace`rm4scc` in the Scandit SDK 8.0 release.
* Improved location width accuracy of scanned DataBar-14 codes.

### Bug Fixes

* Fixed incorrect Python API enum value for `scanditsdk.SYMBOLOGY_KIX`.

### Deprecations

* Deprecated the symbology enum `SC_SYMBOLOGY_RM4SCC`, use `SC_SYMBOLOGY_ROYAL_MAIL_4STATE` instead. The same applies to the Python API (`scanditsdk.SYMBOLOGY_RM4SCC` should be used instead of  `scanditsdk.SYMBOLOGY_ROYAL_MAIL_4STATE`).
* Deprecated camera focus mode functions `sc_barcode_scanner_settings_get_focus_mode()` and `sc_barcode_scanner_settings_set_focus_mode()`. For devices without auto-focus, set the code direction hint to `SC_CODE_DIRECTION_NONE`.

## 7.5.1

**Released**: September 4, 2025

No updates for this framework in this release.

## 7.5.0

**Released**: August 12, 2025

### New Features

* Improved Lapa4SC scanning performance.
* Improved support for non-standard GS1 AI codes.
* Added new `ScBarcode` function `sc_barcode_get_symbol_counts` to access module counts of scanned codes.

### Bug Fixes

* Improved Code128 and EAN13/UPCA scanning performance.
* Reduced incorrect EAN13/UPCA, EAN8 and UPCE scans in cases of low resolution and out-of-focus.

## 7.4.4

**Released**: November 22, 2025

### Bug Fixes

#### Core

* Fixed a rare crash in the EAN/UPC reader.

## 7.4.3

**Released**: August 29, 2025

No updates for this framework in this release.

## 7.4.2

**Released**: August 15, 2025

No updates for this framework in this release.

## 7.4.1

**Released**: July 14, 2025

No updates for this framework in this release.

## 7.4.0

**Released**: June 19, 2025

### New Features

* Added OCR fallback symbology extension `ocr_fallback` to Codabar, Code128, Code39 and EAN13/UPCA. It enables text recognition when other readers fail. This feature requires Smart Scan Intention which is available in SparkScan, Barcode Capture, or through the Linux settings preset `SC_PRESET_SINGLE_CODE_HAND_HELD`.
    * Added `sc_symbology_settings_set_ocr_fallback_regex` and `sc_symbology_settings_get_ocr_fallback_regex` to configure a regular expression that OCR Fallback results should fully match for each symbology. This can also be configured with the `ocrFallbackRegex` symbology JSON settings field.
* Improved scanning of vertical and reversed codes for all native and WebAssembly with SIMD devices.

### Bug Fixes

* Updated `sc_barcode_scanner_settings_new_from_json` function to return an error in case a given JSON string contains unrecognized properties.
* Updated Linux camera implementation to disallow following symbolic links in the basename of the device paths and restrict supported devices to block and character devices.
* Fixed typos in python bindings:
  * Fixed `IMAGE_LAYOUT_UYVY_8U` mapping value to match C API.
  * Fixed return type of `get_string_property` function of `PropertyCollection`.

## 7.3.3

**Released**: July 25, 2025

No updates for this framework in this release.

## 7.3.2

**Released**: June 25, 2025

No updates for this framework in this release.

## 7.3.1

**Released**: June 13, 2025

No updates for this framework in this release.

## 7.3.0

**Released**: May 16, 2025

### New Features

* Added Royal Mail 4 State symbology extension `fluorescent_orange_ink` to enable scanning of codes printed with fluorescent orange ink.
* Improved DataMatrix reader for small codes affected by perspective distortion and reduced quiet zones.
* Added `CommandLineBarcodeScannerPillowImageSample.py` SDK sample that demonstrates scanning a code from a local image file that is loaded using pillow module.

### Bug Fixes

* Removed symbology extension `relaxed_sharp_quiet_zone_check` for EAN8 and EAN13/UPCA. Relaxed quiet zone rules are used by default. Strict quiet zone check is only performed in strict mode.

### Behavioral Changes

* MatrixScan Check has been renamed to MatrixScan AR, including in the naming of all relevant APIs.

## 7.2.5

**Released**: November 5, 2025

### Bug Fixes

#### Core

* Fixed a memory leak.

## 7.2.4

**Released**: August 8, 2025

No updates for this framework in this release.

## 7.2.3

**Released**: June 24, 2025

### Bug Fixes

* Fixed `sc_camera_request_image_layout` to free allocated buffers before setting the format as some drivers fail with Device busy error otherwise. Take into account the possibility for the driver to auto-switch the resolution while setting image format.

## 7.2.2

**Released**: May 9, 2025

No updates for this framework in this release.

## 7.2.1

**Released**: April 24, 2025

### New Features

* Extended camera API to allow enumerating supported image layouts as well as setting preferred image layout.
* Removed the restriction of `SC_PRESET_HIGH_EFFORT` on having a license key with tracking/multi-scan enabled.

### Performance Improvements

* Updated the default camera image layout choice to optimize for low latency.
* Updated `CommandLineBarcodeScannerCameraSample.py` to allow setting desired camera format.

### Bug Fixes

* Fixed handling of `SC_IMAGE_LAYOUT_UYVY_8U` image description layout where luma and chroma channels were misplaced.

## 7.2.0

**Released**: March 31, 2025

### Bug Fixes

* Removed optional dependency on OpenGL. Most configurations were already running without OpenGL prior to this release. As of 7.2, remaining configurations that depend on OpenGL were fully removed.
* Fixed rare incorrect QR code reads of codes with a low error correction level.

## 7.1.3

**Released**: March 26, 2025

No updates for this framework in this release.

## 7.1.2

**Released**: March 13, 2025

No updates for this framework in this release.

## 7.1.1

**Released**: March 7, 2025

### Bug Fixes

* Fixed `sc_recognition_context_release` to abort potentially still in-progress background set up of the barcode scanner if `sc_barcode_scanner_wait_for_setup_completed` was not called explicitly.

## 7.1.0

**Released**: February 21, 2025

### New Features

* Added the following new barcode scanner presets:
  * `SC_PRESET_HIGH_EFFORT` to achieve the best accuracy by spending more resources.
  * `SC_PRESET_SINGLE_CODE_HAND_HELD` to enable smart single code scanning.
* `sc_barcode_scanner_settings_set_code_duplicate_filter()` has been extended to accept -2 (`SC_DUPLICATE_FILTER_DEFAULT`) to indicate that an application-specific duplicate filter should be used. -2 is the new default and is currently identical to 0 (duplicate filtering disabled).    
  * New constants `SC_DUPLICATE_FILTER_DEFAULT` and `SC_DUPLICATE_FILTER_OFF` were added to indicate the intent of these values more clearly.
* Updated the package to no longer embed required resources into `libscanditsdk.so` and instead load them from `/usr/share/scanditsdk/resources`.

### Performance Improvements

* We’ve increased the scan rate of 10% on our datasets of QR codes with high perspective distortion (so scanned at high angles). This is particularly important for cases such as receiving boxes or scanning shelf labels.
* Improved the barcode detection and tracking robustness of `ScObjectTracker`.

### Behavioral Changes

* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

## 7.0.2

**Released**: January 20, 2025

### Bug Fixes

* Fixed an issue causing the `SparkScanView` to not be rendered on top of the host application content.

## 7.0.1

**Released**: December 19, 2024

No updates for this framework in this release.

## 7.0.0

**Released**: November 29, 2024

### New Features / Performance Improvements

* This update increases the Linux SDK `libc` version requirements from version 2.27 to 2.31. Ubuntu 18.04 and Debian/GNU Linux 10 are no longer supported.
* The versioning of the Linux SDK has been aligned with the versioning of the Scandit DataCapture SDK. On Linux, 6.x is skipped and the version is updated from 5.x and 7.x directly.

The C API has been cleaned up and streamlined. If you migrate your code from version 5.x to 7.x you need to adjust the following interface changes.
* Recognition Context:
    * Removed deprecated `ScContextStatusFlag`: `SC_RECOGNITION_CONTEXT_STATUS_LICENSE_FILE_EXPIRED`, `SC_RECOGNITION_CONTEXT_STATUS_LICENSE_FILE_IO_ERROR`, `SC_RECOGNITION_CONTEXT_STATUS_LICENSE_VALIDATION_FAILED`, `SC_RECOGNITION_CONTEXT_STATUS_LICENSE_VALIDATION_FAILED_400`
    * Removed deprecated recognition context function `sc_recognition_context_set_geographical_location`.
* ScBarcodeScanner:
    * Replaced symbology enums `SC_SYMBOLOGY_EAN13` and `SC_SYMBOLOGY_UPCA` by `SC_SYMBOLOGY_EAN13_UPCA`. EAN13 and UPCA codes are now represented and configured through the same symbology. If you need to distinguish between UPCA and EAN13, you will need to check for the first digit, or use the `remove_leading_upca_zero` symbology extension and check the length of the returned data string.
    * Removed the `SC_SYMBOLOGY_UPCA` symbology extension `remove_leading_zero`. Use the `SC_SYMBOLOGY_EAN13_UPCA` extension `remove_leading_upca_zero` instead.
    * Removed functionality related to caching of codes in the barcode scanner session. To obtain the results, retrieve them through `sc_barcode_scanner_session_get_newly_recognized_codes` before processing the next frame. Removed the two functions `sc_barcode_scanner_settings_set_code_caching_duration`, `sc_barcode_scanner_settings_get_code_caching_duration` and JSON settings field `codeCachingDuration`.
    * Removed all `ScBarcodeScannerSettings` presets: `SC_PRESET_ENABLE_RETAIL_SYMBOLOGIES`, `SC_PRESET_ENABLE_VIN_DECODING`, `SC_PRESET_ENABLE_SSCC_DECODING`, `SC_PRESET_ENABLE_SINGLE_FRAME_MODE`. New presets will be introduced in upcoming releases.
    * Replaced `sc_barcode_scanner_settings_get_property` and `sc_barcode_scanner_settings_set_property` functions that allowed to get/set scanner integer properties by `sc_barcode_scanner_settings_get_properties`/`sc_barcode_scanner_settings_get_properties_const` to access the settings property collection.
    * Introduced ScPropertyCollection.h header allowing to get/set property values of the generic property collection.
* ScBarcodeGenerator:
    * The `SC_SYMBOLOGY_EAN13_UPCA` code generator no longer accepts UPCA input strings without leading zero character. 12 digits inputs are now interpreted as EAN13 data with a missing checksum.
* ScParser:
    * Moved and renamed parser-related headers from `include/Scandit/Parser/` to `include/Scandit:`
    * Renamed SpParser.h to ScParser.h
      * Renamed `SpParser` to `ScParser`
      * Renamed `SpParserType` to `ScParserType`
      * Renamed `SP_PARSER_TYPE_*` enum entries to `SC_PARSER_TYPE_*`
      * Renamed `sp_parser_*` functions to `sc_parser_*`
    * Renamed SpParserResult.h to ScParserResult.h
      * Renamed `SpParserResult` to `ScParserResult`
      * Renamed `SpField` to `ScField`
      * Renamed `sp_parser_result_*` functions to `sc_parser_result_*`
    * Removed SpParserCommon.h:
      * Use `ScBool` instead of `SpBool`
      * Use `ScByteArray` instead of `SpData`
      * Removed unused `sp_data_free`
* ScCommon:
    * Updated ScByteArray-related api:
      * Removed deprecated `ScByteArray` fields `data`, `c_str`, `length`.
      * Updated functions returning `ScByteArray` such that the returned array size does not include string null terminator.
    * Removed deprecated ScData struct alias:
      * `ScByteArray` should be used directly instead.
    * Removed deprecated `sc_data_free` function. `sc_byte_array_free` should be used instead.
    * Updated `sc_*_free` functions to align their behavior, such that calling `sc_*_free` on any object more than once is undefined behavior that would end up in double free.
* ScImageDescription:
    * Added `sc_image_description_get_planes_count` function to query number of separate planes in an image according to its layout.
    * Added `sc_image_description_get_plane_offset`/`sc_image_description_get_plane_row_bytes` functions to query plane information by index of the plane in a buffer.
    * Removed `sc_image_description_get_first_plane_offset`/`sc_image_description_get_first_plane_row_bytes`, use `sc_image_description_get_plane_offset` instead.
    * Removed `sc_image_description_get_second_plane_offset`/`sc_image_description_get_second_plane_row_bytes`, use `sc_image_description_get_plane_offset` instead.
    * Removed `sc_image_description_get_memory_size`/`sc_image_description_set_memory_size`. There is no more need to set the overall memory size.
* ScObjectTracker:
    * The configuration of barcode scanner settings for use with the `ScObjectTracker` has been moved to a dedicated API: `sc_object_tracker_apply_scanner_settings`. It is no longer necessary to instantiate an `ScBarcodeScanner` to use the `ScObjectTracker`.
    * Replaced the callback-based tracking results API `ScObjectTrackerCallbacks` by a session object `ScObjectTrackerSession`.
* The Python API was adjusted according to the new C API. In addition the following changes were made:
    * Removed all deprecated redundant `SC_CODE_DIRECTION_*` constants. Use `sc.CODE_DIRECTION_*` instead.
    * Removed all deprecated redundant `SC_IMAGE_LAYOUT_*` constants. Use `sc.IMAGE_LAYOUT_*` instead.
    * Removed `sc.IMAGE_LAYOUT_NV16` constant. Use sc.`IMAGE_LAYOUT_NV16_U8` instead.
    * Removed all deprecated redundant `SC_CAMERA_*` constants. Use `sc.CAMERA_*` instead.
    * Removed all deprecated redundant `SC_CODE_LOCATION_*` constants. Use `sc.CODE_LOCATION_*` instead.
* Introduced support for Swiss Post proprietary, UPU 4 State based, postal symbology. It's disabled by default and can be enabled activating the UPU 4-State symbology extension `swiss_post_decoding`.

### Bug Fixes

* Improvements for decoding blurry 1d linear codes.
* Improved tracking of 1D codes that are horizontally aligned.
* Added `remove_delimiter_data` extension to the Codabar symbology. This extension is off by default.
* Fixed `ScCamera` python bindings querying stepwise camera mode resolutions.
* Fixed `sc_camera_get_frame` to not hang after restarting camera stream.
* Fixed Shift-JIS encoding classification for raw byte data in 2d barcodes