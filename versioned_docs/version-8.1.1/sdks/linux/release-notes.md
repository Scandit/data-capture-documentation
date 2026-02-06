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

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Fixed a typo in the ProcessFrameResult.message function of SDK Python bindings

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.

### Performance Improvements

#### Barcode

* Improved MicroQR detector tolerance to quiet zone violations
* Improved suppression of incorrect Codabar recognitions when using the [“strict" symbology extension](../symbology-properties#symbology-extension-descriptions)

### Behavioral Changes

#### Barcode

* Enabling the [“ocr_fallback" symbology extension](../symbology-properties#symbology-extension-descriptions) with missing OCR model resources now triggers the context error 28 (“Missing Resource”)

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

## 8.0.1

**Released**: January 14, 2026

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

## 8.0.0

**Released**: November 4, 2025

### New Features

Scandit's SDK 8.0 marks the evolution of data capture from a high-performing scanning tool into an intelligent AI-powered workflow enabler. As frontline operations face mounting pressures with more data points to capture, increasingly complex workflows to navigate, and tighter resource constraints, SDK 8.0 delivers a set of innovations that: 
  * Adapt its scanning settings and UI to context by analyzing the scanning environment and user intent;
  * Automate the capture of any data format, barcode clustering, task handling or camera settings;
  * Accelerate critical use cases to maximize ROI through intuitive, streamlined scanning workflows, using interactive AR-guidance, adaptive UI and out-of-the-box custom-branded passenger experiences.

With SDK 8.0 businesses can transform data capture from a basic function to a strategic advantage. It enables intelligent scanning that:
  * Understands not just what is being scanned, but also what you want to scan and why you’re scanning it
  * Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users seamlessly through sophisticated tasks to ensure the highest level of productivity.

* Updated `ScProcessFrameResult` struct definition with additional detailed error information.
* Modified `sc_barcode_scanner_apply_settings` to return `ScContextStatus` with detailed error information.
* Added `sc_context_status_free` to public API to free `ScContextStatus` structures holding detailed error information.
* Added `sc_process_frame_result_free` to public API to free `ScProcessFrameResult` structures holding detailed error information.
* Modified `sc_parser_new_with_context` to take `ScContextStatus *` as the last param instead of just the `ScContextStatusFlag *`.
* Improved and accelerated scanning for 1d symbologies at low resolution, in particular Code 128. 

### Bug Fixes

* Updated Minimum Android API Level to 24 (from 21).
* Unscanned default barcode locations are no longer added as a result to the scan session.
* Removed the following barcode scanner settings APIs in favor of the new max locations to process per frame APIs:
  * `sc_barcode_scanner_settings_get_max_number_of_codes_per_frame` (use `sc_barcode_scanner_settings_get_max_num_locations_to_process_per_frame`)
  * `sc_barcode_scanner_settings_set_max_number_of_codes_per_frame` (use `sc_barcode_scanner_settings_set_max_num_locations_to_process_per_frame`)
    * Added corresponding Python bindings: `max_num_locations_to_process_per_frame` property on `BarcodeScannerSettings`
* Added barcode scanner settings option to switch from single to multi-scan scanning. Multi-scan requires a tracking license.
  * `sc_barcode_scanner_settings_set_multi_scan_enabled`
  * `sc_barcode_scanner_settings_get_multi_scan_enabled`
    * Python: added `BarcodeScannerSettings.multi_scan_enabled` property
* Replaced Royal Mail symbology string identifier from `rm4scc` to `royal-mail-4state`.
* Removed `sc_barcode_scanner_new_with_settings` API in favor of newly added `sc_barcode_scanner_new` that does not accept settings. New scanner instance must be configured by `sc_barcode_scanner_apply_settings` call.
* Removed `sc_context_status_flag_get_message`.
* Removed deprecated focus mode APIs:
  * Removed `sc_barcode_scanner_settings_get_focus_mode` and `sc_barcode_scanner_settings_set_focus_mode`. Set code direction hint to `SC_CODE_DIRECTION_NONE` for devices without auto-focus.
  * Python API: removed `focus_mode` property from `BarcodeScannerSettings` class
  * Removed `focusMode` field from barcode scanner settings JSON serialization
* Removed deprecated constant `SC_SYMBOLOGY_RM4SCC` (use `SC_SYMBOLOGY_ROYAL_MAIL_4STATE` instead).
* In the public API, changed all `_retain` and `_release` functions on opaque pointers to accept const pointers.


## 7.6.5

Find earlier versions in the [release notes section of version 7](/7.6.6/sdks/linux/release-notes)