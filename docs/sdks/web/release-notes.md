---
description: "Release notes and updates for the Scandit Web SDK."
toc_max_heading_level: 3
displayed_sidebar: webSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: web
keywords:
  - web
---

## 8.7.0-beta.1

**Released**: October 22, 2026

### New Features

#### Barcode

* Added structured append support to MaxiCode. The "m of n" sequencing metadata is now no longer part of the barcode data.
* Changed SparkScan so that button taps no longer vibrate when haptic feedback is disabled in SparkScanViewSettings
* Added an AdaptiveRecognitionServiceListener that can be attached to the BarcodeCapture mode to be notified of adaptive recognition responses and errors. Each callback carries the originating frame's AdaptiveRecognitionFrameMetadata (frame ID and recognized barcodes), so an asynchronously delivered outcome can be correlated back to its frame.
* Extended BarcodeArResponsiveAnnotation to accept any BarcodeArAnnotation (info, popover, status icon, or custom) per distance state, not just BarcodeArInfoAnnotation
* Added the expectsOnlyUniqueBarcodes property to BarcodeArSettings, matching other platforms

#### Id

* Extended the ID rejection API to reject documents based on passport type with rejectPassportTypes, and added a new PassportType, EmergencyTravelDocument
* Added PassportType.EmergencyTravelDocument and split PU-prefixed passport MRZs out of Emergency. The same change is now exposed on the frameworks
* Added VIZ support for the front of the 2026 Alberta driver's license and of the 2026 Nebraska driver's license and ID card, including the versions for minors.
* Added VIZ support for the front of the 2026 Hawaii driver's license and ID card, including the under-21 driver's license.
* Added a convenience conversion from IdCaptureRegion to ISO code as public API
* ID Validate now verifies the digital signature in the barcode of California driver's licenses and ID cards issued since October 2025. A valid signature confirms the barcode as authentic; a missing or invalid signature is reported as forged.

#### Smart Label Capture

* Added LabelCaptureSettings languages and the LabelCaptureLanguage enum (English, Spanish) to restrict prebuilt field recognition to the labels' languages. Spanish labels now also recognize full month names such as "15 de enero de 2026"
* Changed date fields to report the month text as it was read from the label, in its original language and letter case, instead of a normalized English abbreviation
* Added LabelCaptureSettings.settingsForSymbology(), so Smart Label Capture symbology settings (extensions, active symbol counts, OCR fallback regex) can be configured directly via the public API
* Added the LabelFieldLocationType enum to the public exports, so it can now be imported from @scandit/web-datacapture-label

#### Core

* Optimized rendering so that idle viewfinders (target aimer and laserline) no longer force a continuous render loop when nothing is animating

### Performance Improvements

#### Barcode

* Improved MaxiCode detection robustness for digitally generated and screen-displayed codes.
* Improved PDF417 recognition of codes at low resolution and with poor print quality.
* Improved the error correction capacity available to QR Model 1 codes. Damaged Model 1 codes now read more reliably.
* Improved decoding accuracy on blurry and otherwise hard-to-read EAN-13 and UPC-A codes.

#### Id

* Improved VIZ scanning of the Swiss passport (2022 design).
* Improved VIZ scanning of ID cards and driver's licenses, so that more card designs are read correctly. Passports and visas are unchanged.

#### Core

* Improved the speed of camera frame downscaling by a factor of 4/3 on ARM CPUs, most noticeably on low-end Android devices.

### Behavioral Changes

#### Barcode

* Changed 1D symbology decoding to reduce false scans, at the cost of a lower scan rate on hard-to-read codes:
  - Reduced false scans of EAN-13/UPC-A and Code 93, and of EAN-8 and UPC-E reads inside an EAN-13/UPC-A code, in normal and strict mode.
  - Reduced false scans in strict mode, which now requires at least 0.75 pixels per module and decodes EAN-13/UPC-A more conservatively.
  - Lowered the scan rate of hard-to-read UPC-E and Code 93 codes in normal and strict mode, and of EAN-13/UPC-A, Code 128, ITF and Codabar codes in strict mode, as a cost of the false-scan reductions.
* Changed GS1 decoding to reject codes that previously produced unreliable data:
  - Changed the GS1 DataBar Expanded reader to reject codes whose compressed item identification, weight, date or currency field holds a value the specification does not define, or whose AI 392x or 393x price has no digits, as damaged instead of producing malformed element strings.
  - Changed GS1 Composite decoding to reject composite codes with a damaged 2D component instead of producing a GS1 barcode with empty or malformed data.
* Data Matrix: Malformed codes with invalid shift values or unhandled Upper Shift sequences are now correctly rejected as damaged rather than decoding incorrectly.
* Improved QR code validation to reject improperly formatted or non-standard codes, reducing false positives and unreliable data.
* Changed the Aztec reader to no longer accept a structured append header whose sequencing field is not two upper-case letters. Such symbols previously reported an invented segment index and count, for example a negative index or the third of three segments, and could be grouped into a sequence they do not belong to; their content is now decoded as ordinary message data.
* Aligned which Data Matrix symbols are reported as GS1 with the Data Matrix specification: an FNC1 in any other position is a field separator and no longer sets the flag, so a symbol carrying GS1 Application Identifier data without a leading FNC1 is no longer reported as GS1; with leading-FNC1 stripping enabled the data follows the flag in both directions, so such a symbol now keeps its first FNC1 while a Structured Append symbol with an FNC1 in the fifth position now loses it.

#### Id

* Spanish residence permits now return the NIE in both `VizResult.personalIdNumber` and `VizResult.documentAdditionalNumber`. Previously only one of the two carried it.

### Bug Fixes

#### Barcode

* Fixed several MaxiCode decoding and character encoding defects:
  - Fixed the reading of symbols where the relative size of finder pattern and module rows is slightly off relative to the specification.
  - Fixed corrupted characters in the data of damaged symbols that end in a truncated Numeric Shift or ECI sequence.
  - Fixed a crash on mode 2 and 3 symbols whose secondary message is cut off inside the `[)>RS01GS` format header. Such symbols now decode to the postal code, country code and service class followed by the truncated message.
  - Fixed character encoding reporting issues in `sc_barcode_get_data_encoding` for ECI and MaxiCode mode 2 and 3 symbols.
* Fixed several Data Matrix decoding and character encoding defects:
  - Fixed the GS1 flag reported by `sc_barcode_is_gs1_data_carrier`, which is now set by an FNC1 in the first symbol character position, or the fifth of a Structured Append symbol, as the specification defines.
  - Fixed the decoded value of a backtick encoded in the Text encodation scheme, which was read as an apostrophe.
  - Fixed several Data Matrix decoding defects related to character encoding, end-of-data handling, and shift formatting.
  - Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.
* Fixed several QR decoding defects:
  - Fixed the reading of Model 1 codes that use data mask pattern 111. The reader accepted only seven of the eight mask patterns the standard defines for Model 1, so such codes went unrecognized.
  - Fixed false Structured Append results from damaged codes: a Structured Append header that is not at the start of the code, or a second one, now makes the code fail to decode instead of reporting arbitrary sequence and parity information.
  - Fixed decoding and flag reporting for QR codes carrying AIM Application Indicators and GS1 headers.
  - Fixed a QR scanning accuracy regression introduced in 8.6 for codes with degraded finder patterns (round, dotted, curved, bent, damaged) in single-barcode scanning.
* Fixed several Micro QR and rectangular Micro QR (rMQR) defects:
  - MicroQR: Fixed an issue that prevented improvements for rotated codes and codes with cluttered backgrounds from being available in production builds.
  - Fixed decoding and truncation issues in Micro QR codes with invalid character counts or fully filled codewords.
  - Fixed the AIM Application Indicator (FNC1 in second position) of rectangular Micro QR (rMQR) codes, which is now transmitted as the two digits or the letter the specification defines instead of three digits. Codes with a reserved Application Indicator, or with an FNC1 mode indicator that is not placed right before the first data mode indicator, are now rejected, and FNC1 mode now stays in effect across later ECI headers.
  - Fixed a rare crash during detection of rectangular Micro QR codes whose finder pattern covers a large part of the frame, such as when scanning at very close range.
* Fixed several GS1 Composite and GS1 DataBar Expanded decoding defects:
  - Fixed decoding errors in GS1 composite codes, such as misread lot number flag bits and dropped digits when fields are followed by additional element strings.
  - Removed extraneous group separators and trailing characters incorrectly appended to the decoded data of composite codes.
  - Fixed decoding errors in GS1 DataBar Expanded codes with AI 392x or 393x prices followed by additional element strings, such as dropped element strings or lost digits.
* Fixed a false ArUco result where the inner shape of a marker was read as a second, color-inverted marker.
* Fixed several Aztec decoding defects:
  - Fixed the file ID of an Aztec structured append symbol whose optional message ID field is absent. `sc_barcode_get_file_id` returned the placeholder `DEFAULT` and merged unrelated sequences; it now returns an empty string, and such segments are no longer automatically grouped.
  - Fixed the character encoding reported for Aztec byte shift data that follows an ECI.
* Fixed a scan regression from SDK 5.19 for 1D codes with colored backgrounds, such as dark print on a saturated label.
* Fixed a rare out-of-bounds image read while detecting a code that touches the right or bottom image border.
* Fixed the missing error report when a symbology's `ocr_fallback` extension is enabled without the ScanditLabelCaptureText module: the data capture context now reports a Missing Resource error naming the resources that could not be loaded, and barcode scanning continues without OCR fallback.
* Fixed a bug that caused SparkScan to crash when using SmartScanSelection.
* Fixed the SparkScan mini preview not being draggable.
* Fixed a UI glitch when switching Selection Mode from On to Auto in BarcodeCapture.
* Fixed a placement problem with BarcodeArStatusIconAnnotation when the barcode rotates.
* Fixed BarcodeFind overwriting the zoom levels of the camera settings it was given: a BarcodeFindView created with custom CameraSettings now runs on the zoom levels it was configured with. BarcodeFind's recommended camera settings now report the .5x/1x levels, matching iOS and Android.

#### Id

* Fixed the 2026 Oklahoma driver's license not returning `issuingJurisdiction` and `issuingJurisdictionIso`
* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.
* Fixed a crash when tapping the view after the ID Capture mode was removed from the data capture context.
* Fixed South African driving licenses failing to scan when the barcode contains a vehicle restriction issue date without a day.
* Fixed FullDocumentScanner returning no MRZ result for the US Border Crossing Card. The result now combines the VIZ and the MRZ.
* Fixed IdCapture.externalTransactionId being cleared when new settings were applied. Scans after the settings change were reported without the ID.

#### Smart Label Capture

* Fixed expiry and packing date fields accepting a numeric date that does not exist, such as `BEST BEFORE 32/13/2027`. Such a date is now rejected instead of being returned as the field value.
* Changed the month of a captured date field to be reported with the month name as it was read from the label, in its original language and letter case, rather than a normalized lowercase English abbreviation. `10 Ene 2026` yields the month text `Ene` instead of `jan`, and the field text `10.Ene.2026` instead of `10.jan.2026`. A zero read in place of the letter `o` is still corrected, so `N0V` yields `NOV`. The numeric month is unaffected—compare against it instead of the text to branch on a month.
* Fixed label capture with Data Matrix enabled stalling on the multithreaded build with the default settings.
* Fixed a crash that could occur when the adaptive recognition result type was changed while a scan was still being processed
* Fixed the built-in hint/notification banner (for example, the 'scanning paused' message) spanning edge-to-edge instead of staying centered when the device is in landscape orientation

#### Core

* Fixed the camera preview appearing shrunk with a large margin on Safari for iOS 27, caused by a WebKit regression
* Fixed a crash that terminated the app when a camera frame used a pixel layout the SDK cannot convert, for example frames produced by the camera image-injection features of automated testing services. Such frames are now skipped with a warning instead
* Fixed an issue where on iOS the sound was sometimes not correctly reproduced at the first scan
* Updated Emscripten from 5.0.3 to 5.0.7

## 8.6.1

**Released**: October 1, 2026

### New Features

#### Id

* Visa VIZ results for Canadian visa stickers now report the full 10-character number in `VIZResult.visaNumber` (the MRZ result remains truncated).

### Bug Fixes

#### Barcode

* Fixed a QR scanning accuracy regression introduced in 8.6 for codes with degraded finder patterns (round, dotted, curved, bent, damaged) in single-barcode scanning.
* Rectangular Micro QR: Fixed a rare crash during detection of codes whose finder pattern covers a large part of the frame, such as when scanning at very close range.
* Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.
* Fixed Data Matrix codes not being read when their encoder ends the data with an Unlatch codeword followed by more than one pad codeword.
* Fixed a 1D symbology scan regression from SDK 5.19 for codes with colored backgrounds, such as dark print on a saturated label.
* Fixed SparkScan selection highlight brushes not applying until the next selection cycle.
* Fixed a bug that caused SparkScan to crash when using SmartScanSelection.
* Fixed the SparkScan mini preview not being draggable.
* Fixed the barcode duplicate filter explicitly set to -2 under SelectionMode On not being respected and being incorrectly relaxed to 0.
* Fixed MatrixScan AR info annotations so that replacing a header, footer, icon or body replaces it instead of adding a second one, and setting it to null removes it. BarcodeArPopoverAnnotationButton.text now returns the button's label instead of an empty string.
* Fixed a placement problem with BarcodeArStatusIconAnnotation when the barcode rotates.
* Fixed BarcodeArAnnotationAnchor not being available at runtime, which made a custom BarcodeAr annotation ignore its anchor. The default placement now also matches native, above the tracked barcode instead of below it.
* Fixed BarcodeFind overwriting the zoom levels of the camera settings it was given: a BarcodeFindView created with custom CameraSettings now runs on the zoom levels it was configured with. BarcodeFind's recommended camera settings now report the .5x/1x levels, matching iOS and Android.

#### Id

* Fixed the 2026 Oklahoma driver's license not returning the Jurisdiction and JurisdictionIso fields.
* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.

#### Core

* Fixed scanning silently stopping after the browser released the page's WebGL context, while the camera preview kept rendering.
* Fixed a crash that terminated the app when a camera frame used a pixel layout the SDK cannot convert, for example frames produced by the camera image-injection features of automated testing services. Such frames are now skipped with a warning instead.
* Fixed ScanditIcon not rendering a background stroke by default when a background shape and stroke color were both configured, matching iOS and Android.

## 8.6.0

**Released**: August 31, 2026

### New Features

#### Barcode

* BarcodeArResponsiveAnnotation now takes a map of distance thresholds to annotations, so a barcode can show a different annotation at any number of distances instead of only close-up and far-away. The previous two-state API is deprecated, see Deprecations below.
* Extended BarcodeBatch on Android so that setting the overlay brush to null clears the highlights of tracked barcodes, matching iOS.
* Extended the support for DotCode features by adding support for:
  - Extended Channel Interpretation (ECI). Symbols that switch character sets (for example to Cyrillic or another code page) now report the correct per-segment encoding. As part of this, the default character set for DotCode is now reported as ISO 8859-1 instead of ASCII.
  - Message envelopes as defined in ISO/IEC 15434.
  - Structured append. DotCode has no file ID, so segments are not automatically grouped by the buffered barcode session.

#### Id

* Visa MRZ results now report country-specific additional details such as `MRZResult.visaNumber`, `MRZResult.visaNumberOfEntries`, `MRZResult.visaMultipleEntries` and `MRZResult.visaDurationInDays`.
* Extended the VizDocumentScanner sanitizer restriction to run all sanitizers for front-and-back captures and only reject on front-only captures, so front-side VIZ field corrections are no longer lost in double-sided captures.

#### Smart Label Capture

* Restored SIMD support in WebAssembly for iOS 26, recovering performance across all capture modes, most noticeably Label Capture.
* [BETA] Added shipping-label support (`AdaptiveRecognitionResultType.ShippingLabel`, `Carrier`, `ShippingLabelScanningResult`) to adaptive recognition.
* Added a new sample to quickly test and integrate Smart Label Capture to read and validate price shelf labels against a database - showing live AR overlays based on the match and mismatch of the content.
* Added support for label definitions that use the "semantics" feature on fields of both type "barcode" and "text" simultaneously; previously only one of the two types could use it at once.

#### Core

* Added support in the GS1 parser for the telecom Application Identifiers 8040 (IMEI), 8041 (IMEI2), 8042 (eSIM/EID), and 8043 (pSIM), so GS1 codes carrying them parse instead of being rejected as unrecognized.
* Added support for parsing the 2D-DOC (French 2D-Doc / ANTS) data format.
* Added more detailed error reporting when required resources are missing.
* Added HTTPS as the default protocol for SDK samples, so you can open and test a sample directly on a device without setting up an HTTPS tunnel.
* Added the DataCaptureView.setProperty method.
* Added CameraSwitchControl.behavior to choose between cycling through all cameras (Cycle) or flipping between front and back (Flip).
* Added a default camera frame rate cap of 30 fps, configurable via CameraSettings.maxFrameRate.
* Added LicenseInfo.allowedModes, exposing the set of capture modes a license key permits via the new CaptureMode enum.
* Added Camera.getAllWithPermissionState(), which returns the available cameras together with the current camera PermissionState (granted, denied, or prompt). This lets you distinguish an empty camera list caused by the absence of cameras on the device from one caused by the user denying camera access.
* Added a UMD build alongside the ESM build.
* Added support for reading camera frames directly into a SharedArrayBuffer in supported environments (currently Chrome or Firefox, when pthread is enabled), avoiding an extra copy.

### Performance Improvements

#### Barcode

* Reduced the false positive rate for EAN13, UPCA, EAN8, and UPC-E.
* Improved ITF decoding robustness, reducing the number of unscanned codes. On our internal datasets, we measured an improvement of more than 20% true positives.
* Improved MicroQR decoding for rotated codes and cluttered backgrounds. On our internal datasets, we measured an improvement of more than 40% true positives.

#### Id

* Improved PDF417 scanning on Quebec, Alaska, and Oklahoma driver’s licenses.

### Behavioral Changes

#### Barcode

* Changed the default highlight brush in SparkScan and Barcode Capture.
* Updated recommended camera settings for MatrixScan Batch, Find, Pick, Sequence, and AR, now using UHD4K resolution with a 16:9 aspect ratio.
* Enabled detection and decoding of mirrored MaxiCodes by default. Previously this required enabling the symbology extension `mirrored`, which has been removed.
* Limited the GS1 format flag for DotCode to genuine GS1 openings (a leading digit pair without FNC1) per AIM DotCode v3.0, instead of defaulting all symbols to GS1.
* Disabled enhanced low-resolution scanning of QR codes (introduced in 8.5.0) for MatrixScan modes. Customers who need this feature should contact Scandit support.

### Bug Fixes

#### Barcode

* Fixed rare cases where DotCode Code Set C symbols using the date/lot macro decoded to incorrect data due to a dropped leading zero in a digit pair.
* Fixed a regression where short ITF codes with low wide/narrow ratio were not decoded.

#### Id

* Improved the DLID parser, fixing previously unparsable codes found in analytics.
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.

#### Smart Label Capture

* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same mode instance.
* Fixed several LabelCapture debug-app scenarios (Point To Scan - Dates, EU Driver License Back Side, Mixed Semantics) that failed to scan.
* Fixed prebuilt date fields to recognize Spanish month abbreviations. The abbreviations `ene`, `abr`, `ago`, and `dic` are newly supported; the remaining Spanish abbreviations already resolved because they match their English form. The expiry-date anchor additionally recognizes common Spanish expiry terms such as `caducidad`, `vencimiento`, `consumir antes`, and `consumo preferente`.

#### Core

* Fixed a SequenceFrameSource occasionally delivering the same frame to its listeners twice.
* Fixed a race condition in SimplePropertyBehaviorSubject where mutating the subscriber list during a callback could cause crashes or missed notifications.
* Fixed EventsResponse::getRetryTimeoutInSeconds to return a fallback instead of aborting on out-of-range header values.
* Fixed pinch-to-zoom and swipe-to-zoom becoming unresponsive after the browser interrupted a touch gesture, and duplicated tap and zoom handling after a data capture view was re-attached.
* Fixed a memory leak that could make the browser tab run out of memory and crash when the data capture context was disposed and created again repeatedly.

### Deprecations

#### Barcode

* Deprecated the two-state BarcodeArResponsiveAnnotation API in favor of a new configurable annotationsByThreshold map that supports more than two distance states; the previous two-state API remains available.

## 8.5.4

**Released**: October 19, 2026

### Bug Fixes

#### Id

* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by IdValidate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.

## 8.5.3

**Released**: August 18, 2026

### Behavioral Changes

#### Barcode

* Disabled enhanced low-resolution scanning of QR codes (introduced in 8.5.0) for MatrixScan modes. Customers who need this feature should contact Scandit support.

## 8.5.2

**Released**: July 31, 2026

### Performance Improvements

#### Id

* Improved performance of Irish Garda Age Card

## 8.5.1

**Released**: July 20, 2026

### Performance Improvements

#### Core

* Re-enabled SIMD support in WebAssembly for iOS 26. Restores performance in all capture modes, noticeably Label Capture.

### Bug Fixes

#### Barcode

* Fixed BarcodeCapture and SparkScan not applying a selectionMode change from On to Auto, which left the aimer visible.

#### Id

* Fixed an incorrect license key check that prevented scanning of documents with a PDF417 barcode or MRZ on one side, and of mDLs read via OCR.

## 8.5.0

**Released**: July 9, 2026

### New Features

#### Barcode

* Added the SelectionMode API to replace the SparkScan target-mode APIs and `ScanIntention.smartSelection`: Set `selectionMode` (off/on/auto) in the `BarcodeCaptureSettings` and `SparkScanSettings` to control whether an aimed-at barcode is scanned automatically or requires explicit selection.
* Added `logoStyle` and `logoAnchor` customization properties to `BarcodeArView`, `BarcodeCountView`, `BarcodeFindView`, `BarcodePickView`, and `BarcodeSequenceView`.

#### Id

* Added Irish Garda Age Card as `RegionSpecificSubtype.IrelandAgeCard`.
* Added a new `PassportType` property to `MrzResult`.
* Added double-sided support for the Oman residence card.
* Added single-sided support for extraction of issue date and birth date from the 2025 NYC Municipal ID.
* Added Web support for: Australia ACT Driver's License, USA Oklahoma Driver's License, and USA Puerto Rico ID.

#### Smart Label Capture

* Extended VIN label capture to also scan Code 128 barcodes (in addition to QR, Code 39, and Data Matrix) via `createVinLabelDefinition()`.
* Extended LabelCapture to accept label definitions where both "barcode" and "text" field types use the "semantics" feature simultaneously; previously this was restricted to only one field type at a time.
* Improved the add/remove lifecycle handling of the validation flow overlay.

### Performance Improvements

#### Barcode

* Enhanced detection of low-resolution QR codes, improving scan rates for QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
  - codes is now enabled by default, improving scan rates for challenging QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
* Improved scanning of micro-QR codes affected by quiet zone violations and perspective distortion.

#### Smart Label Capture

* Improved Receipt Scanning efficiency by optimizing receipt image processing before extraction.

#### Core

* Improved worker loading.

### Behavioral Changes

#### Barcode

* Reduced Code 128 minimum symbol count from 6 to 4; short codes (4 & 5 symbols) use stricter matching rules than longer codes. To explicitly exclude short codes, disable symbol counts 4 & 5 via `sc_symbology_settings_set_active_symbol_counts()` for Code 128. Note that if you previously enabled short code scanning, more strict settings are now in effect to reduce the chance of false positives, which are more likely for very short codes.
* Tightened Code 39 false positive filter thresholds by default; to restore the previous behavior, enable the `relaxed` extension on Code 39 via `sc_symbology_settings_set_extension_enabled()`. This is only advised when external validation measures are available, for example, scanning against a known list of valid codes or when codes contain structured data.
* Updated `SymbologyDescription.forIdentifier` to return `null` for unrecognized identifiers (for example, `"EAN-8"` instead of `"ean8"`); previously such input was silently mapped to `Codabar`.

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.
* Fixed BarcodeAR view settings not being taken into account.
* Fixed recommended BarcodeAR camera settings not being applied correctly.
* Fixed a `BarcodeFind` view issue where overlay dots were sometimes not rendered correctly after pausing.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed rare cases of incorrect (tiny) PDF417 location outlines.

#### Id

* Fixed an issue where cropped document images were rotated when Frame Image was also enabled.
* Corrected the orientation of cropped Visa document images that were being rotated incorrectly when scanned using a single-frame image source.
* Fixed parser handling of non-standard Surrey BC AAMVA barcodes that were incorrectly returning "Invalid Format."
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

#### Core

* Fixed the Web SDK camera preview expanding to full-screen in iOS WebViews by setting `playsinline` and `webkit-playsinline` attributes on the video element; the host `WKWebView` must also enable `allowsInlineMediaPlayback`.
* Fixed a bug that caused the zoom notification to not be shown when using the `ZoomSwitchControl`.
* Fixed a crash when the `DataCaptureContext` singleton was initialized more than once.
* Fixed an issue that caused the torch to turn off after minimizing the browser or switching tabs.

### Deprecations

#### Barcode

* The SparkScan target-mode APIs and `ScanIntention.smartSelection` are deprecated in favour of selectionMode.

## 8.4.2

**Released**: September 28, 2026

### Performance Improvements

#### Core

* Re-enabled SIMD support in WebAssembly for iOS 26, restoring performance in all capture modes, most noticeably Label Capture.

### Bug Fixes

#### Barcode

* Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.

#### Id

* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.

## 8.4.1

**Released**: June 23, 2026

### Bug Fixes

#### Barcode

* Fixed BarcodeAR view settings not being taken into account.
* Fixed recommended BarcodeAR camera settings not being applied correctly.
* Fixed a memory leak in SparkScan when using the item-based API.

#### Id

* Fixed an issue where cropped document images were rotated when they are recovered using the getFrame API.

#### Core

* Fixed WebKit 26.x bugs causing pthreads WASM crashes (WebKit bug #303387) and SIMD corruption on affected versions (Apple Radar 176035764) by pinning memory and disabling SIMD engine-wide. This slows compute-heavy scanning on those versions, most noticeably Label Capture OCR.

## 8.4.0

**Released**: May 18, 2026

### New Features

#### Barcode

* Added `dotRadius` property to `BarcodeBatchBasicOverlay` to allow customizing the size of dots when using the Dot overlay style.

#### Id

* Added support for reading the vehicle table on the back of New Zealand driving licences, with the latest expiry date returned; supported vehicle classes are 1–6, including L=learner and R=restricted variants.
* Added support for new versions of USA, California–Driver's License; USA, North Carolina–Driver's License; USA, Texas–Driver's License; and USA, Oklahoma–Driver's License.

#### Smart Label Capture

* Added the `numberOfMandatoryInstances` property to the Web platform.

#### Core

* Redesigned `ZoomSwitchControl` to support multiple configurable zoom levels; the control now displays as a compact button that expands to show all available zoom levels, automatically filtered to those supported by the device hardware.
* Added a new `PinchToZoom` gesture.
* Introduced a new `ZoomListener` on the Camera object.
* Added support for the `SwipeToZoom` gesture.
* Added a default value to the `ZoomSwitchOrientation` enum.
* Adjusted control colors for better visibility on dark and light backgrounds.
* Fixed a bug where sound feedback was not correctly played in a multi-tab scenario.

### Performance Improvements

#### Barcode

* Improved Code 128 scan robustness for codes with uneven blur and geometric distortions. Available on all platforms except WebAssembly without SIMD and ARM without FP16.
* Improved 1D barcode scanning speed and reduced false positives for linear symbologies.
* Further improved scanning of square DataMatrix codes with damaged or occluded timing patterns.

#### Core

* Improved worker loading.

### Behavioral Changes

#### Barcode

* Smart Scan Intention now continuously adapts between Single Scan and Selection modes during a scanning session when Smart Scan Selection is enabled, switching back to Single Scan when the scene no longer requires Selection mode. Previously, once Selection mode was activated it remained active for the rest of the session.
* Changed ITF scanning to reduce false positives by introducing checksum-dependent scoring. ITF has an optional checksum which is mandated to be enabled by many of the standards that use ITF as the data carrier. Starting with this release, checksum-passing ITF codes are scanned with more relaxed conditions than codes that don't pass the checksum test. This happens even if the optional mod 10 checksum isn't enabled. To disable this behavior, enable the `no_checksum_dependent_validation` symbology extension for the ITF symbology.
* Removed the Abseil library dependency.
* Reduced Code 39 false positives.

#### Core

* Updated mbedtls from version 3.6.5 to 3.6.6.
* Updated the `CameraSwitchControl` and `TorchSwitchControl` UI.

### Bug Fixes

#### Barcode

* Fixed an issue where zoom notifications were not shown when zooming in and out.
* Fixed an issue causing the SparkScan mini preview to have an incorrect size in landscape orientation.
* Fixed an issue that caused the SparkScan camera to stop working when disposing the context and re-initializing it.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed an issue where the Smart Scan Selection aimer would become too small when scan-area margins restricted the visible scan area; the aimer is now sized relative to the view, keeping a consistent on-screen size regardless of margins.

#### Id

* Fixed an issue where the US Permanent Residence Card was not processed through the VizMrz flow.
* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture.
* Fixed an issue where AAMVA verification was being performed even when no AAMVA document types were enabled in the accepted documents.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture
* Fixed an issue where the validation flow viewfinder was not displayed.
* Fixed a race condition in the validation flow.
* Fixed an issue where adaptive scanning text was sometimes not correctly shown in the validation flow overlay.
* Fixed a bug in the validation flow where input was not fully visible when focused in landscape orientation.
* Fixed a bug that caused error messages in `DataCaptureView` to be rendered partially out-of-view.
* Fixed a rare race condition in Label Capture.
* Added `.asDate()` support to `ExpiryDate` and `PackingDate` label fields when the text is provided as manual input or as an Adaptive-Recognition-Engine response.
* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same LabelCapture mode instance.

#### Core

* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.
* Fixed a bug where setting the same `DataCaptureContext` instance twice on a `DataCaptureView` would lead to a crash.

### Deprecations

#### Core

* Added `zoomLevels` property to `CameraSettings` and deprecated `zoomGestureZoomFactor`.
* Deprecated `CameraFOVSwitchControl` in favor of `ZoomSwitchControl`.

## 8.3.1

**Released**: April 14, 2026

### Bug Fixes

#### Id

* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture

#### Smart Label Capture

* Fixed the validation flow to accept dates in more formats when manually entered
* Fixed a race condition in the validation flow

#### Core

* Fixed JavaScript syntax in the sdc-lib folder that was not correctly downleveled to respect the minimum browser version

## 8.3.0

**Released**: March 26, 2026

### New Features

#### Barcode

* Added support for composite codes in SparkScan

#### Id

* Corrected Mexican Voter ID parent names to firstName and lastName
* Added support for OCR scanning of the 2026 version of Victoria mobile driver licenses
* Added IdCaptureSettings.anonymizeDefaultFields setting that controls whether the SDK applies default anonymization rules for specific document types and regions
* US, EU/ Schengen + UK passports no longer fallback to MRZ only. Now, US, EU/ Schengen + UK passports must capture VIZ instead of returning MRZ values after the configurable timeout has elapsed. This applies to FullDocumentScanner or SingleSideScanner when both VIZ and MRZ zones are enabled.

#### Smart Label Capture

* Fixed a rare race condition
* Fixed some issues with keyboard handling in Validation Flow

### Performance Improvements

#### Barcode

* Improved EAN8 false positive filtering in strict mode
* Improved speed of MatrixScan Count scanning phase for mid- and high-end devices

### Bug Fixes

#### Barcode

* Fixed an issue that caused the SparkScan camera to stop working when disposing the context and re-initializing it.
* Fixed an issue causing the SparkScan toolbar buttons to be aligned incorrectly.

#### Id

* Fixed BarcodeDictionary anonymization setting for iOS and Web
* Fixed support for UAE Esaad card
* Sanitized name fields on ACT driver license to split FullName and populate first and last name properties
* Added support for scanning MRZ from the back of Argentinian DN when using `FullDocumentScanner`
* Fixed misplaced MRZ anonymization on FullFrame images.

#### Smart Label Capture

* Fixed issue where the `LabelCaptureValidationFlowOverlay` sometimes did not reflect label capture settings when reused
* Enhanced the `LabelCaptureValidationFlowOverlay` to resume when the mode is enabled and Validation Flow is paused.
* Fixed camera being incorrectly paused while cloud backup started in Validation Flow
* Fixed runtime error that sometimes occurred during cloud backup request when screen was tapped in validation flow

#### Core

* Fixed sound feedback playback in multi-tab scenarios
* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.

## 8.2.1

**Released**: March 5, 2026

### Bug Fixes

#### Id

* Corrected Mexican Voter ID parent names to map to firstName and lastName
* Sanitized name fields on ACT DL. Splits FullName to populate first and last name properties

#### Smart Label Capture

* Fixed `LabelCaptureValidationFlowOverlay` not reflecting Label Capture settings if reused
* Fixed `LabelCaptureValidationFlowOverlay` not correctly resuming if user changes view when in pause and comes back
* Fixed some issues with keyboard handling in Validation Flow
* Fixed camera being incorrectly paused while cloud backup started in Validation Flow
* Fixed runtime error thrown in Validation Flow when screen was tapped while a cloud backup request was running
* Fixed a rare race condition

## 8.2.0

**Released**: February 13, 2026

### New Features

#### Barcode

* Stopped emitting vibration feedbacks when the scanner is stopped without user interaction

#### Id

* Enabled scanning of MRZ on the backside of several EU residence permits
* Added extraction of a cropped document image from Passports and VISAs that do not support VIZ extraction
* Added extraction of the date of birth from Romanian IDs

#### Smart Label Capture

* The Validation Flow, our ready‑to‑use workflow in Smart Label Capture for capturing and validating label data with minimal code, now features a completely redesigned user interface. The update improves ergonomics through a simplified API and highly requested customization options, making Smart Label Capture more intuitive and significantly reducing integration and customization effort across a wider range of use cases

#### Core

* Removed Howler.hs and JavaScript Cookie third-party dependencies

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Improved the Smart Scan Intention logic for detecting main codes + five-digit add on codes. This improves the rate of complete main + add-on code pairs.
* Fixed a bug where the torch control would be shown even if the torch was not supported
* Fixed an issue where SparkScan would select the wrong camera
* Fixed an issue where the SparkScanView was not being disposed correctly

#### Id

* Treated Puerto Rico driver licenses as AAMVA to enforce barcode capture with FullScanner
* Fixed a bug that would cause Canada Northwest Territories driver license scans to be incomplete

#### Core

* Fixed an issue where in some webview scenarios the wrong back camera was selected on the iPhone Pro

### Deprecations

#### Smart Label Capture

* Deprecated some LabelCaptureValidationFlowSetting APIs: requiredFieldErrorText, missingFieldsHintText, manualInputButtonText, as those don't make sense anymore with the redesign of Validation Flow in 8.2

## 8.1.7

**Released**: October 7, 2026

No updates for this framework in this release.

## 8.1.6

**Released**: July 29, 2026

No updates for this framework in this release.

## 8.1.5

**Released**: June 10, 2026

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

## 8.1.4

**Released**: April 21, 2026

### Bug Fixes

#### Barcode

* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.

#### Id

* Fixed an issue with browsers that don't support `createImageBitmap` in ID Capture.

## 8.1.3

**Released**: March 25, 2026

### Bug Fixes

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed syntax in JavaScript sdc-lib folder not correctly downleveled to respect minimum browser version.

## 8.1.2

**Released**: March 9, 2026

### Bug Fixes

#### Barcode

* Fixed an issue where SparkScan would select the wrong camera

#### Smart Label Capture

* Fixed a rare race condition

#### Core

* Fixed an issue where in some webview scenarios on iPhone Pro the wrong back camera was selected

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Barcode

* Fixed an issue where the SparkScanView was not being disposed correctly

#### Id

* Removed the Centaurus dependency from the ID Capture package which was accidentally added in 8.1.0 but never actually used

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Smart Scan Selection is now available in Barcode Capture. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a more intuitive scanning experience that requires no manual configuration.
* Added SymbologySettings.ocrFallbackRegex, allowing you to filter or constrain results returned from OCR fallback.
* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.
* [SparkScan](/sdks/web/sparkscan/intro.md) now supports Smart Scan Selection. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Users might have to manually switch to a special, more precise scanning mode (Target Mode), which is inefficient. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a more intuitive scanning experience that requires no manual configuration.
* Added `ScanditIconType.Delete` and `ScanditIconType.Slash` which can be used in `BarcodeArStatusIconAnnotationAnchor`.

#### Id

* Added NationalityISO property that maps results from Nationality field to country ISO code
* Added RejectionDiagnosticJSON property to CapturedId to report debug info during Timeout rejections
* Added rejectionTimeoutSeconds to IdCaptureSettings allowing customers to use timeout other than default (6 s). Minimum timeout is 1 s.
* Added support for new California DL, new South Carolina DL, Arizona Medical Marijuana Card, Kuwait Civil card, and new Texas DL

#### Core

* Added Electronic Product Code (EPC) parser and GS1_DIGITAL_LINK parsers

### Performance Improvements

#### Barcode

* Improved MicroQR detector tolerance to quiet zone violations
* Improved suppression of incorrect Codabar recognitions when using the [“strict" symbology extension](../symbology-properties#symbology-extension-descriptions)

#### Id

* Improved success rate when scanning using the ImageFrameSource or the SingleImageUploader as frame source

#### Smart Label Capture

* Incremental improvements in accuracy across all use-cases for the OCR model powering Smart Label Capture.

### Behavioral Changes

#### Barcode

* Enabling the [“ocr_fallback" symbology extension](../symbology-properties#symbology-extension-descriptions) with missing OCR model resources now triggers the context error 28 (“Missing Resource”)

#### Smart Label Capture

* Validation Flow: Manually input values for barcodes will go through a stricter validation. Some values may no longer be accepted if they do not match the symbology specs for the symbology’s definition

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance
* Fixed an issue that caused continuous scanning to stop working when rotating the device
* Fixed an issue where FrameData was not usable for tracking modes

#### Core

* Fixed a small memory leak that affected fresh install runs only
* Overcome orientation change limitation in iOS PWAs when display mode is fullscreen or standalone

## 8.0.1

**Released**: January 14, 2026

### Bug Fixes

#### Barcode

* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

#### Core

* Fixed a small memory leak that affected fresh install runs only

## 8.0.0

**Released**: November 4, 2025

### New Features

Scandit's SDK 8.0 marks the evolution of data capture from a high-performing scanning tool into an intelligent AI-powered workflow enabler. As frontline operations face mounting pressures with more data points to capture, increasingly complex workflows to navigate, and tighter resource constraints, SDK 8.0 delivers a set of innovations that:

* Adapt its scanning settings and UI to context by analyzing the scanning environment and user intent;
* Automate the capture of any data format, barcode clustering, task handling or camera settings;
* Accelerate critical use cases to maximize ROI through intuitive, streamlined scanning workflows, using interactive AR-guidance, adaptive UI and out-of-the-box custom-branded passenger experiences.

With SDK 8.0 businesses can transform data capture from a basic function to a strategic advantage. It enables intelligent scanning that:

* Understands not just what is being scanned, but also what you want to scan and why you’re scanning it
* Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users through sophisticated tasks to ensure the highest level of productivity.

#### Core

* The `Camera` API has been completely redesigned for this release. See the [API reference](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#camera) for complete details.
* The minimum Chrome version supported is now 85+.
* The `DataCaptureContext.create`, `createWithOptions` and `configure` methods have been removed in favor of `DataCaptureContext.forLicenseKey`.

#### Barcode

* Smart Scan Selection is now available in SparkScan for the Web SDK.
* Adapted `SparkScanView` to now be usable as a web component. Also added a `SparkScanReactSample` to demonstrate this usage.
* The following have been added to MatrixScan AR:
  * `BarcodeArView.getHighlightForBarcode`
  * `BarcodeAirView.getAnnotationForBarcode`

#### Smart Label Capture

* We’re introducing an enhancement that makes Smart Label Capture more robust and scalable by complementing its on-device model with a larger, more capable model. When the on-device model can’t capture certain labels, the SDK automatically escalates to this enhancement to handle complex or unforeseen cases with high accuracy and reliability. This capability is currently available in `beta`. If you’re interested in trying it, please contact Scandit Support. For configuration details, see `labelDefinition.adaptiveRecognitionEngine`.

#### ID

* Added `ElementsToRetain` to `MobileDocumentScanner`: The set of data elements that the application intends to retain from scanned mobile documents. This information is used to set the `IntentToRetain` flag in ISO 18013-5 mdoc requests, which is required for legal compliance with data protection standards. An empty set indicates no elements will be retained, and `IntentToRetain` will be set to `false` for all fields.
* ID Capture now supports full-frame anonymization.
* The result of `decodeMobileDriverLicenseViz`, which is currently returned as part of the `VizResult` within `CapturedId`, will now be provided through a new field named `mobileDocumentOcr`.
* Added `CapturedId::isCitizenPassport`, which indicates whether the passport was issued to a citizen of the issuing country. Returns `false` for travel documents such as refugee, stateless, or alien passports, and for any passports issued by organizations rather than states.
* The following Chinese travel permits now extract VIZ + MIZ data during double-sided scanning flows:
  * CT - Taiwan Residents Mainland Travel Permit
  * W - Mainland Residents Exit-Entry Permit to and from Hong Kong and Macao
  * CD - Mainland Residents Entry-Exit Permit to and from Taiwan

### Behavioral Changes

#### Barcode

* Symbology `RM4SCC` has been renamed to `ROYAL_MAIL_4STATE`.
* Changed the default highlight brush in SparkScan and Barcode Capture.

#### Label

* The `LabelFieldDefinition` API has been updated with the following changes:
  * Renamed property: `pattern` → `valueRegex`, `patterns` → `valueRegexes`
  * Renamed property: `dataTypePattern` → `anchorRegex`, `dataTypePatterns` → `anchorRegexes`
* Receipt Scanning API has been updated with the following changes:
  * `ReceiptScanningResult`:
    * Removed properties: `storeNumber`, `storeStreet`, `storeZip`, `storeState`, `storePhone`, `paymentMethod`, and `paymentCurrency`.
    * Added property: `storeAddress` - Full address of the store (Street Number, Street, City, State, NPA).
    * Renamed property: `paymentSubtotal` → `paymentPreTaxTotal` - Total balance before taxes are applied.
  * `ReceiptScanningLineItem`:
    * Removed property: `category`.
    * Renamed properties: `price` → `unitPrice` (Price for a single unit of the item), `total` → `totalPrice` (Total price for a specific product, quantity × unitPrice).

#### ID

* The configuration for the following documents has been changed as detailed below:
  * Australian mobile driver licenses (mDL) are now treated as normal documents, with no separate mode.
  * US Green Cards are now treated as residence permits.
* Removed the deprecated API `DateResult::toDate`. Use `DateResult::toLocalDate` or `DateResult::toUtcDate` instead.
* `fullName` now an optional field on all `IdCapture` result types and `capturedMrz` now an optional field on `MrzResult`.

### Bug Fixes

#### ID

* Fixed a bug that could get the scanner stuck when scanning a US passport card.
* Fixed an issue where unavailable dates would not be properly set to `null` in an ID scan result.

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.

#### Barcode

* All previously deprecated APIs have been removed in this release.
* `DataCaptureContext.create`, `createWithOptions` and `configure` have been removed in favor of the `forLicenseKey` method.


## 7.6.7

Find earlier versions in the [release notes section of version 7](/7.6.15/sdks/web/release-notes)