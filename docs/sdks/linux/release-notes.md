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

* Resolved a rare issue where a race condition during the deconstruction of MatrixScan Data Capture views could lead to invalid memory access.

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