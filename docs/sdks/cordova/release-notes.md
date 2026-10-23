---
description: "Release notes and updates for the Scandit Cordova SDK."
toc_max_heading_level: 3
displayed_sidebar: cordovaSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: cordova
keywords:
  - cordova
product: platform
topic_type: release-notes
canonical_id: scandit.platform.release-notes
---

## 8.7.0-beta.1

**Released**: October 22, 2026

### New Features

#### Barcode

* Added support for the Han Xin Code symbology (`SC_SYMBOLOGY_HAN_XIN`)
* Added structured append support to MaxiCode. The "m of n" sequencing metadata is now no longer part of the barcode data.
* Added an AdaptiveRecognitionServiceListener that can be attached to the BarcodeCapture and BarcodeCount modes to be notified of adaptive recognition responses and errors. Each callback carries the originating frame's AdaptiveRecognitionFrameMetadata (frame ID and recognized barcodes), so an asynchronously delivered outcome can be correlated back to its frame. On the Web SDK the listener is available on BarcodeCapture only
* Extended BarcodeArResponsiveAnnotation to accept an annotationsByThreshold map, so an annotation can switch between any number of distance-based states instead of only close-up and far-away
* Extended BarcodeCountStatusItem to expose the icon associated with a barcode, and added createWithIcon(barcode, icon) to create a status item with a custom icon
* Added SparkScanViewSettings.scanningBehavior/previewBehavior, SparkScanScanningMode.scanningBehavior/previewBehavior and SparkScanView.getScanningMode(). SparkScanViewUiListener.didChangeScanningMode is now delivered, and SparkScanPreviewBehavior.Persistent now serializes correctly

#### Id

* Extended the ID rejection API to reject documents based on passport type with rejectPassportTypes, and added a new PassportType, EmergencyTravelDocument
* Added PassportType.EmergencyTravelDocument and split PU-prefixed passport MRZs out of Emergency. The same change is now exposed on the frameworks
* Added VIZ support for the front of the 2026 Alberta driver's license and of the 2026 Nebraska driver's license and ID card, including the versions for minors.
* Added VIZ support for the front of the 2026 Hawaii driver's license and ID card, including the under-21 driver's license.
* ID Capture now offers `MrzResult.passportType` with the `PassportType` enum and `IdCaptureSettings.rejectPassportTypes`, the visa fields on `MrzResult` (`visaNumber`, `visaNumberOfEntries`, `visaMultipleEntries`, `visaDurationInDays`), `CapturedId.visaNumber` and `passportNumber`, `rejectionTimeoutSeconds`, `removeAnonymizedField()` and `clearAnonymizedFields()`, and the mDL signature image (`MobileDocumentResult.signature`, `MobileDocumentDataElement.signatureUsualMark`).
* ID Validate now verifies the digital signature in the barcode of California driver's licenses and ID cards issued since October 2025. A valid signature confirms the barcode as authentic; a missing or invalid signature is reported as forged.

#### Smart Label Capture

* Changed date fields to report the month text as it was read from the label, in its original language and letter case, instead of a normalized English abbreviation

#### Core

* Optimized rendering so that idle viewfinders (target aimer and laserline) no longer force a continuous render loop when nothing is animating
* Added `ScanditLogger.writeLogs()` to write the in-app debug log to a specified location

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
* Fixed the camera view temporarily rotating incorrectly in SparkScan Target mode when using hold-to-scan.
* Fixed a UI glitch when switching Selection Mode from On to Auto in BarcodeCapture.
* Fixed BarcodeAr annotations configured with the Barcode Scan trigger showing or hiding when the barcode highlight was tapped. The popover annotation's default trigger is now Highlight Tap, matching the native SDKs; apps that relied on the previous value must set the trigger explicitly.
* Fixed BarcodeArViewSettings.soundEnabled and hapticEnabled being ignored when the view settings were updated after the BarcodeAr view was created.
* Fixed a brief fullscreen zoom and camera freeze that appeared when exiting a BarcodeAr screen.
* Fixed a camera freeze when an app alternates MatrixScan Count's scan preview with another camera-backed mode. Returning to the scan preview could leave the camera unresponsive for 10-15 seconds.
* Fixed MatrixScan Count losing its counted barcodes when recognition is interrupted, for example by opening Control Center. Scanning a retained barcode again counts it again.

#### Id

* Fixed the 2026 Oklahoma driver's license not returning `issuingJurisdiction` and `issuingJurisdictionIso`
* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.
* Fixed iOS reporting error 3072 instead of 33805 when the license key does not include VIZ scanning, matching Android
* Fixed a crash when tapping the view after the ID Capture mode was removed from the data capture context.
* Fixed South African driving licenses failing to scan when the barcode contains a vehicle restriction issue date without a day.
* Fixed FullDocumentScanner returning no MRZ result for the US Border Crossing Card. The result now combines the VIZ and the MRZ.
* Fixed IdCapture.externalTransactionId being cleared when new settings were applied. Scans after the settings change were reported without the ID.

#### Smart Label Capture

* Fixed expiry and packing date fields accepting a numeric date that does not exist, such as `BEST BEFORE 32/13/2027`. Such a date is now rejected instead of being returned as the field value.
* Changed the month of a captured date field to be reported with the month name as it was read from the label, in its original language and letter case, rather than a normalized lowercase English abbreviation. `10 Ene 2026` yields the month text `Ene` instead of `jan`, and the field text `10.Ene.2026` instead of `10.jan.2026`. A zero read in place of the letter `o` is still corrected, so `N0V` yields `NOV`. The numeric month is unaffected—compare against it instead of the text to branch on a month.
* Fixed the label capture validation flow on iOS not starting when the mode is enabled before the overlay is attached to the data capture view
* Fixed the LabelCapture validation flow staying idle when returning to a screen that keeps the mode enabled; a paused or finished flow now survives the navigation round trip, and validation flow listener removal takes effect
* Fixed LabelCapture adaptive-recognition settings for the processing hint text not reaching native
* Fixed a crash that could occur when the adaptive recognition result type was changed while a scan was still being processed

#### Core

* Fixed a bug in Camera API 1 that might cause a camera to show as STANDBY instead of OFF when another application takes over the device camera
* Fixed camera preview failures during a live settings change (for example, resolution): a rejected parameter update or a failed preview restart could leave the camera stopped or streaming mismatched frames; it now recovers or reports a consistent state
* Fixed the recovery from a failed camera wake-up in Camera API 1, which now restarts the camera reliably, including when the camera was started via standby
* Fixed a crash when starting the camera on devices whose camera reports zoom support without providing zoom ratios
* Fixed rapid torch toggles being dropped or applied twice when issued before the previous toggle was confirmed by the camera
* Fixed a memory leak where cleared weak references to torch and zoom listeners accumulated indefinitely in the camera's listener sets
* Fixed a crash that terminated the app when a camera frame used a pixel layout the SDK cannot convert, for example frames produced by the camera image-injection features of automated testing services. Such frames are now skipped with a warning instead
* Fixed an error thrown on iOS when passing an empty byte array to ArucoMarker.create() or Parser.parseRawData(), which now matches the existing Android behavior
* Fixed the camera and torch switch controls not updating their accessibility labels on the main thread, so TalkBack announcements no longer misfire when the camera or torch state changes

## 8.6.1

**Released**: October 1, 2026

### New Features

#### Id

* Visa VIZ results for Canadian visa stickers now report the full 10-character number in `VizResult.visaNumber` (the MRZ result remains truncated).
* Added `IdCaptureSettings.notifyOnSideCapture`. When enabled, the capture callback fires for both the front and the back side of a double-sided document, so your app gets a partial result independent of the back side scan. Use `CapturedId.isCapturingComplete` to tell a partial result from a complete one.

### Bug Fixes

#### Barcode

* Fixed a QR scanning accuracy regression introduced in 8.6 for codes with degraded finder patterns (round, dotted, curved, bent, damaged) in single-barcode scanning.
* Rectangular Micro QR: Fixed a rare crash during detection of codes whose finder pattern covers a large part of the frame, such as when scanning at very close range.
* Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.
* Fixed Data Matrix codes not being read when their encoder ends the data with an Unlatch codeword followed by more than one pad codeword.
* Fixed a 1D symbology scan regression from SDK 5.19 for codes with colored backgrounds, such as dark print on a saturated label.
* Fixed the barcode duplicate filter explicitly set to -2 under SelectionMode On not being respected and being incorrectly relaxed to 0.
* Fixed pausing or stopping a Barcode AR view discarding the highlights and annotations that were already shown, so taps and position updates keep working and resuming no longer requires the app to supply them again.

#### Id

* Fixed the 2026 Oklahoma driver's license not returning the Jurisdiction and JurisdictionIso fields.
* Fixed a crash in the IdCapture overlay when it was tapped.
* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.

#### Smart Label Capture

* Fixed a bug where the camera preview could remain black or frozen when opening a scanning screen after leaving a LabelCapture validation flow screen.

#### Core

* Fixed a crash that terminated the app when a camera frame used a pixel layout the SDK cannot convert, for example frames produced by the camera image-injection features of automated testing services. Such frames are now skipped with a warning instead.
* Fixed customer archives for Capacitor, Cordova and React Native shipping unresolvable `workspace:*` dependency specifiers, so `npm install` now succeeds in the bundled samples.

## 8.6.0

**Released**: August 31, 2026

### New Features

#### Barcode

* BarcodeArResponsiveAnnotation now takes a map of distance thresholds to annotations, so a barcode can show a different annotation at any number of distances instead of only close-up and far-away. The previous two-state API is deprecated, see Deprecations below.
* Added the zoomControlOrientation property to BarcodeArView.
* Added the BarcodeArCircleHighlight.isPulsing property to toggle the highlight's pulsing animation.
* Extended BarcodeBatch on Android so that setting the overlay brush to null clears the highlights of tracked barcodes, matching iOS.
* Extended the support for DotCode features by adding support for:
  - Extended Channel Interpretation (ECI). Symbols that switch character sets (for example to Cyrillic or another code page) now report the correct per-segment encoding. As part of this, the default character set for DotCode is now reported as ISO 8859-1 instead of ASCII.
  - Message envelopes as defined in ISO/IEC 15434.
  - Structured append. DotCode has no file ID, so segments are not automatically grouped by the buffered barcode session.

#### Id

* Extended the VizDocumentScanner sanitizer restriction to run all sanitizers for front-and-back captures and only reject on front-only captures, so front-side VIZ field corrections are no longer lost in double-sided captures.

#### Smart Label Capture

* Added the CameraSwitchControl API. The control can be added to a DataCaptureView to let end users switch between a primary and a secondary camera (for example, back and front), with customizable button images and accessibility labels.
* Added support for label definitions that use the "semantics" feature on fields of both type "barcode" and "text" simultaneously; previously only one of the two types could use it at once.

#### Core

* Added support in the GS1 parser for the telecom Application Identifiers 8040 (IMEI), 8041 (IMEI2), 8042 (eSIM/EID), and 8043 (pSIM), so GS1 codes carrying them parse instead of being rejected as unrecognized.
* Added more detailed error reporting when required resources are missing.
* Added iOS support for multiple DataCaptureView instances to render the camera preview simultaneously, so navigating between screens that each show a DataCaptureView no longer causes black or frozen previews, including during interactive edge-swipe transitions. DataCaptureView also now renders a preview when the frame source is an ImageFrameSource or SequenceFrameSource.
* Added LicenseInfo.allowedModes, exposing the set of capture modes a license key permits via the new CaptureMode enum.
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
* MatrixScan Count uses a new default colour for scanned (counted) barcodes, chosen to meet accessibility contrast requirements. It applies to single scanned barcodes, to the barcodes inside a cluster, and to the cluster highlight itself. To keep your previous appearance, set the colour through the existing icon customization.
* Enabled detection and decoding of mirrored MaxiCodes by default. Previously this required enabling the symbology extension `mirrored`, which has been removed.
* Limited the GS1 format flag for DotCode to genuine GS1 openings (a leading digit pair without FNC1) per AIM DotCode v3.0, instead of defaulting all symbols to GS1.
* Disabled enhanced low-resolution scanning of QR codes (introduced in 8.5.0) for MatrixScan modes. Customers who need this feature should contact Scandit support.

### Bug Fixes

#### Barcode

* Fixed a crash when clearing highlights or changing the scanning state on a MatrixScan Count mode that had been removed from its data capture context.
* Fixed a bug with the highlight colors of BarcodeCount clusters.
* Fixed the Android BarcodeAR mode opening to a black screen: the camera runtime permission is now requested when the view is created, so the permission prompt appears instead of the view failing silently.
* Fixed the MatrixScan Count not-in-list accept/reject popover not reflecting a custom accepted/rejected ScanditIcon when configured.
* Fixed a visual artifact that could appear around the scan preview indicators in MatrixScan Count when using Scan Preview.
* Fixed MatrixScan AR to adapt to the device UI scale.
* Fixed rare cases where DotCode Code Set C symbols using the date/lot macro decoded to incorrect data due to a dropped leading zero in a digit pair.
* Fixed a regression where short ITF codes with low wide/narrow ratio were not decoded.

#### Id

* Fixed a crash that could occur when navigating away from a screen while a hint was displayed.
* Improved the DLID parser, fixing previously unparsable codes found in analytics.
* Hardened dependency resolution for Android native samples.
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.
* Fixed an issue where the VLM scanning screen remained permanently displayed if IdCaptureSettings were applied mid-scan.
* Fixed BarcodeResult.barcodeDataElements always being empty. The field is now correctly populated with the parsed AAMVA barcode data elements.

#### Smart Label Capture

* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same mode instance.
* Fixed prebuilt date fields to recognize Spanish month abbreviations. The abbreviations `ene`, `abr`, `ago`, and `dic` are newly supported; the remaining Spanish abbreviations already resolved because they match their English form. The expiry-date anchor additionally recognizes common Spanish expiry terms such as `caducidad`, `vencimiento`, `consumir antes`, and `consumo preferente`.

#### Core

* Fixed a SequenceFrameSource occasionally delivering the same frame to its listeners twice.
* Fixed Nokia G11 and Nokia 8.3 5G devices not correctly getting the Camera2 path when API2-only features were requested.
* Fixed the Galaxy Note10 camera profile selection so the international Note10 family (SM-N970x/SM-N971x) gets its intended fixed-focus and Camera2 behaviors.
* Fixed the Galaxy S9+ (SM-G965x) camera profile selection so Camera2-based capture is enabled on those devices as intended.
* Fixed the camera preview appearing darker in single-scan modes after using a mode that applies its own exposure adjustment, such as SparkScan or MatrixScan Count.
* Fixed a race condition in SimplePropertyBehaviorSubject where mutating the subscriber list during a callback could cause crashes or missed notifications.
* Fixed an IllegalStateException in analytics HTTPS requests when the app is instrumented by APM tools such as Dynatrace.
* Fixed EventsResponse::getRetryTimeoutInSeconds to return a fallback instead of aborting on out-of-range header values.
* Fixed an issue in MatrixScanARSimpleSample where status icons could occasionally appear blank and unresponsive.

### Deprecations

#### Barcode

* Deprecated the two-state BarcodeArResponsiveAnnotation API in favor of a new configurable annotationsByThreshold map that supports more than two distance states; the previous two-state API remains available.
* Deprecated the SparkScan target-mode APIs and ScanIntention.SmartSelection in favor of the new SelectionMode API: set selectionMode (off/on/auto) on BarcodeCaptureSettings and SparkScanSettings to control whether an aimed-at barcode is scanned automatically or requires explicit selection.

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

### Bug Fixes

#### Barcode

* Fixed a crash when clearing highlights or changing the scanning state on a MatrixScan Count mode that had been removed from its data capture context.

#### Id

* Fixed a crash that could occur when navigating away from a screen while a hint was displayed.

#### Core

* Fixed an IllegalStateException in analytics HTTPS requests when the app is instrumented by APM tools such as Dynatrace.

## 8.5.2

**Released**: July 31, 2026

### Performance Improvements

#### Id

* Improved performance of Irish Garda Age Card

### Bug Fixes

#### Barcode

* Fixed BarcodeCount clusters where the not-in-list cluster color incorrectly followed the matched/deviated customization.

#### Smart Label Capture

* Fixed a memory leak preventing the batch and label advanced overlay from being collected until the mode they're bound to is collectable.

## 8.5.1

**Released**: July 20, 2026

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

#### Id

* Added Irish Garda Age Card as `RegionSpecificSubtype.IrelandAgeCard`.
* Added double-sided support for the Oman residence card.
* Added single-sided support for extraction of issue date and birth date from the 2025 NYC Municipal ID.

#### Smart Label Capture

* Extended VIN label capture to also scan Code 128 barcodes (in addition to QR, Code 39, and Data Matrix) via `createVinLabelDefinition()`.
* Extended LabelCapture to accept label definitions where both "barcode" and "text" field types use the "semantics" feature simultaneously; previously this was restricted to only one field type at a time.

### Performance Improvements

#### Barcode

* Enhanced detection of low-resolution QR codes, improving scan rates for QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
  - codes is now enabled by default, improving scan rates for challenging QR codes with degraded print quality or unfavorable capture conditions. This improvement applies to QR codes of versions 1, 2, and 3 (21×21, 25×25, and 29×29 modules).
* Improved scanning of micro-QR codes affected by quiet zone violations and perspective distortion.

#### Smart Label Capture

* Improved Receipt Scanning efficiency by optimizing receipt image processing before extraction.

### Behavioral Changes

#### Barcode

* Reduced Code 128 minimum symbol count from 6 to 4; short codes (4 & 5 symbols) use stricter matching rules than longer codes. To explicitly exclude short codes, disable symbol counts 4 & 5 via `sc_symbology_settings_set_active_symbol_counts()` for Code 128. Note that if you previously enabled short code scanning, more strict settings are now in effect to reduce the chance of false positives, which are more likely for very short codes.
* Tightened Code 39 false positive filter thresholds by default; to restore the previous behavior, enable the `relaxed` extension on Code 39 via `sc_symbology_settings_set_extension_enabled()`. This is only advised when external validation measures are available, for example, scanning against a known list of valid codes or when codes contain structured data.
* Updated `SymbologyDescription.forIdentifier` to return `null` for unrecognized identifiers (for example, `"EAN-8"` instead of `"ean8"`); previously such input was silently mapped to `Codabar`.

### Bug Fixes

#### Barcode

* Fixed BarcodeAR not displaying an overlay for every scanned barcode when duplicate barcode values are present.
* Fixed a memory leak in item-based scanning.
* Fixed an issue in BarcodeCount where the strap mode setting would not be saved in all cases.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed rare cases of incorrect (tiny) PDF417 location outlines.

#### Id

* Fixed an issue where cropped document images were rotated when Frame Image was also enabled.
* Corrected the orientation of cropped Visa document images that were being rotated incorrectly when scanned using a single-frame image source.
* Fixed parser handling of non-standard Surrey BC AAMVA barcodes that were incorrectly returning "Invalid Format."
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.
* Fixed a bug where setting `valueRegexes` or `anchorRegexes` to null in frameworks was incorrectly treated the same as setting them to an empty list; they now correctly fall back to the definition type's defaults.

#### Core

* Fixed a TypeError: `frameSource.setNativeFrameSourceIsBeingCreated is not a function` thrown when calling `DataCaptureContext.setFrameSource()` with an `ImageFrameSource` on Cordova, Capacitor, and React Native SDKs.
* Fixed a Cordova Android issue with cordova-android 15.x where HTML overlays in the WebView could appear hidden behind the camera preview.
* Fixed a rare crash when starting camera capture while under memory pressure.
* Fixed a rare crash when opening the camera.
* Fixed a crash when the `DataCaptureContext` singleton was initialized more than once.

### Deprecations

#### Barcode

* The SparkScan target-mode APIs and `ScanIntention.smartSelection` are deprecated in favour of selectionMode.

## 8.4.2

**Released**: September 28, 2026

### Bug Fixes

#### Barcode

* Fixed a Data Matrix scanning accuracy regression introduced in 8.4.0 for codes scanned with the `direct_part_marking_mode` symbology extension.
* Fixed a crash when clearing highlights or changing the scanning state on a MatrixScan Count mode that had been removed from its data capture context.
* Fixed a memory leak that prevented the Batch and Label advanced overlays from being collected until the mode they are bound to was collectable.

#### Id

* Updated the bundled ID Validate model to `8.0.20260626`, which fixes valid Ohio driver's licenses (OH0901DL format) being reported as forged by ID Validate. This model was previously delivered over the air; it is now included in the SDK, so new installs use it from the first scan.

#### Core

* Fixed a rare crash during camera setup on iOS when the active camera format reported no supported frame-rate ranges.

## 8.4.1

**Released**: June 23, 2026

### Bug Fixes

#### Barcode

* Fixed BarcodeAR not displaying an overlay for every scanned barcode when duplicate barcode values are present.
* Fixed a memory leak in SparkScan when using the item-based API.

#### Id

* Fixed an issue where cropped document images were rotated when they are recovered using the getFrame API.
* Resolved a duplicate Objective-C class registration that could trigger spurious casting failures or crashes when an app links both ScanditCaptureCore and ScanditIdCapture.

#### Core

* Fixed a TypeError: `frameSource.setNativeFrameSourceIsBeingCreated is not a function` thrown when calling `DataCaptureContext.setFrameSource()` with an `ImageFrameSource` on Cordova, Capacitor, and React Native SDKs.

## 8.4.0

**Released**: May 18, 2026

### New Features

#### Barcode

* Added `dotRadius` property to `BarcodeBatchBasicOverlay` to allow customizing the size of dots when using the Dot overlay style.
* Added custom view support for barcode pick highlighting in JavaScript frameworks.
* Added support for PDF417 in the Barcode Generator.

#### Id

* Added support for reading the vehicle table on the back of New Zealand driving licences, with the latest expiry date returned; supported vehicle classes are 1–6, including L=learner and R=restricted variants.
* Added support for new versions of USA, California–Driver's License; USA, North Carolina–Driver's License; USA, Texas–Driver's License; and USA, Oklahoma–Driver's License.

#### Smart Label Capture

* Added the LabelCapture simple sample for Cordova.

#### Core

* Redesigned `ZoomSwitchControl` to support multiple configurable zoom levels; the control now displays as a compact button that expands to show all available zoom levels, automatically filtered to those supported by the device hardware.
* Added a new `PinchToZoom` gesture.
* Added Swift Package Manager support to Cordova plugins for iOS.

### Performance Improvements

#### Barcode

* Improved Code 128 scan robustness for codes with uneven blur and geometric distortions. Available on all platforms except WebAssembly without SIMD and ARM without FP16.
* Improved 1D barcode scanning speed and reduced false positives for linear symbologies.
* Further improved scanning of square DataMatrix codes with damaged or occluded timing patterns.

### Behavioral Changes

#### Barcode

* Smart Scan Intention now continuously adapts between Single Scan and Selection modes during a scanning session when Smart Scan Selection is enabled, switching back to Single Scan when the scene no longer requires Selection mode. Previously, once Selection mode was activated it remained active for the rest of the session.
* Changed ITF scanning to reduce false positives by introducing checksum-dependent scoring. ITF has an optional checksum which is mandated to be enabled by many of the standards that use ITF as the data carrier. Starting with this release, checksum-passing ITF codes are scanned with more relaxed conditions than codes that don't pass the checksum test. This happens even if the optional mod 10 checksum isn't enabled. To disable this behavior, enable the `no_checksum_dependent_validation` symbology extension for the ITF symbology.
* Removed the Abseil library dependency.
* Reduced Code 39 false positives.

#### Core

* Updated mbedtls from version 3.6.5 to 3.6.6.

### Bug Fixes

#### Barcode

* Fixed an issue in `BarcodeCount` where the floating shutter button was not visible after setting `shouldShowFloatingShutterButton` to `true`.
* Fixed an issue preventing `BarcodeFind` from finding binary barcodes.
* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session.
* Fixed an issue where `BarcodeCountView` would display incorrectly after rotating the device when a sibling view was present in the same parent view.
* Fixed an unnecessary second scan callback that occurs after freezing barcode recognition.
* Fixed PDF417 macro block file ID decoding to correctly handle numeric formatting according to the ISO/IEC 15438:2015 specification.
* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed an issue where the Smart Scan Selection aimer would become too small when scan-area margins restricted the visible scan area; the aimer is now sized relative to the view, keeping a consistent on-screen size regardless of margins.
* Fixed an issue in BarcodeCount where the strap mode setting would not be saved in all cases.

#### Id

* Fixed an issue where the US Permanent Residence Card was not processed through the VizMrz flow.
* Fixed an issue where AAMVA verification was being performed even when no AAMVA document types were enabled in the accepted documents.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture
* Fixed an issue where the validation flow viewfinder was not displayed.
* Fixed a race condition in the validation flow.
* Fixed a bug where the label capture validation flow overlay sometimes did not reflect label capture settings when reused.
* Fixed a bug that caused error messages in `DataCaptureView` to be rendered partially out-of-view.
* Fixed a rare race condition in Label Capture.
* Added `.asDate()` support to `ExpiryDate` and `PackingDate` label fields when the text is provided as manual input or as an Adaptive-Recognition-Engine response.
* Fixed a bug where the receipt scanning overlay and validation flow overlay could not be used on the same LabelCapture mode instance.

#### Core

* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.
* Fixed a rare crash when opening the camera.
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (for example, industrial barcode scanners like the Newland NLS-MT93).
* Fixed custom sound not working in Barcode Find on Android.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.
* Fixed a Cordova Android issue with cordova-android 15.x where HTML overlays in the WebView could appear hidden behind the camera preview.
* Fixed an issue on Cordova Android where AR overlay views (such as bubbles in MatrixScan-based samples) could become unresponsive to taps after the app was minimized and reopened while the camera preview was frozen.
* Fixed a rare crash when starting camera capture while under memory pressure.

## 8.3.1

**Released**: April 14, 2026

### Bug Fixes

#### Smart Label Capture

* Fixed the validation flow to accept dates in more formats when manually entered
* Fixed a race condition in the validation flow

## 8.3.0

**Released**: March 26, 2026

### New Features

#### Barcode

* Added support for composite codes in SparkScan
* Added a SparkScan ListBuilding sample for Cordova

#### Id

* Added support for OCR scanning of the 2026 version of Victoria mobile driver licenses
* Added IdCaptureSettings.anonymizeDefaultFields setting that controls whether the SDK applies default anonymization rules for specific document types and regions

#### Smart Label Capture

* Fixed a rare race condition

#### Core

* Added Camera-related APIs for macro mode, torch, accessibility hints, as well as ImageBuffer and Timestamp for FrameData.
* Added shouldShowZoomNotification and setProperty to DataCaptureView
* Added new SparkScan APIs related to feedback, scanning mode change, and periscope mode.
* Added BarcodeFilterSettings public constructor and exposed excludedSymbolCounts property for JavaScript frameworks
* Added BarcodeCount-related APIs for BarcodeCountNotInListActionSettings, BarcodeCountToolbarSettings, BarcodeCountMappingFlowSettings, status mode and accessibility properties on BarcodeCountView, BarcodeCountStatusProvider with status items and callbacks, cluster support, capture list completion listener, and session update listener
* Added moduleCountX and moduleCountY to Barcode API

### Performance Improvements

#### Barcode

* Improved EAN8 false positive filtering in strict mode
* Improved speed of MatrixScan Count scanning phase for mid- and high-end devices

### Behavioral Changes

#### Core

* Building for iOS now requires Xcode 16.3 or later.

### Bug Fixes

#### Barcode

* Fixed an issue in BarcodeCount where the floating shutter button was not visible after setting shouldShowFloatingShutterButton to true.
* Fixed a bug that was causing BarcodeFind to render barcodes filtered out by the Transformer as if they were valid targets.
* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session.

#### Id

* Fixed BarcodeDictionary anonymization setting for iOS and Web
* Fixed support for UAE Esaad card
* Sanitized name fields on ACT driver license to split FullName and populate first and last name properties
* Added support for scanning MRZ from the back of Argentinian DN when using `FullDocumentScanner`
* Fixed misplaced MRZ anonymization on FullFrame images.

#### Smart Label Capture

* Fixed an issue in the `LabelCaptureValidationFlowOverlay` when using it with Jetpack Compose that caused focus loss when opening the keyboard
* Added `LabelCaptureValidationFlowOverlay.ShouldHandleKeyboardInsetsInternally` for cases when customers don't want to follow official Android edge-to-edge and inset guidelines

#### Core

* Fixed Cordova iOS compilation error due to missing header files
* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.

## 8.2.1

**Released**: March 5, 2026

### Bug Fixes

#### Id

* Sanitized name fields on ACT DL. Splits FullName to populate first and last name properties

#### Smart Label Capture

* Fixed LabelCaptureValidationFlowOverlay possible issue with Jetpack Compose that caused focus loss when opening the keyboard
* Added LabelCaptureValidationFlowOverlay::ShouldHandleKeyboardInsetsInternally in case customers don't want to follow official Android guidelines for edge-to-edge and insets
* Fixed a rare race condition

## 8.2.0

**Released**: February 13, 2026

### New Features

#### Barcode

* Added new getFeedbackForScannedItem method to SparkScanFeedbackDelegate
* Added BarcodeArResponsiveAnnotation API
* Added MatrixScanArSimpleSample on Cordova
* Added MatrixScan AR mode to Cordova framework
* Added some missing BarcodePick APIs to React-Native, Capacitor and Cordova

#### Smart Label Capture

* [Smart Label Capture](/sdks/cordova/label-capture/intro.md) is now available on .NET for Android. It enables multi-modal data capture, extracting barcode and text data from labels simultaneously and making complex data entry up to 7 times faster. Ideal for labels containing serial numbers, weights, or expiry dates, it improves accuracy, reduces errors, and prevents revenue loss from incorrect information.

#### Core

* Added Electronic Product Code (EPC) data format

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes
* Barcode Generator: Improved DataMatrix encoding efficiency, which depending on input data may result in smaller generated codes

### Bug Fixes

#### Barcode

* Improved the Smart Scan Intention logic for detecting main codes + five-digit add on codes. This improves the rate of complete main + add-on code pairs.
* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed BarcodeCount Scan Preview issues including: fixed an issue where preview barcodes were used to populate the scanning list, the correct feedback is played when a barcode not in list is scanned, fixed an issue where scanning was not possible after the app was put in background, and corrected highlight orientation in landscape
* Added cameraStateOnStop property to BarcodeFindView to optimize camera transitions when switching between modes
* Fixed an issue where the successful hint in BarcodeFind is not displayed
* Fixed the missing found item icon in the MatrixScan Find carousel

#### Id

* Fixed an issue affecting MRZ scanning performance when using the user facing camera in portrait mode on Android
* Fixed a memory issue leading to a persistent black screen during ID Capture startup
* Treated Puerto Rico driver licenses as AAMVA to enforce barcode capture with FullScanner
* Fixed a bug that would cause Canada Northwest Territories driver license scans to be incomplete

#### Core

* Fixed MatrixScanBubble Tap not being triggered in Cordova
* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed an issue where some LabelCapture fields were being returned incorrectly on TS frameworks
* Fixed a crash in the DataCaptureView overlay management that could occur during rapid view updates.
* Fixed a Cordova iOS compilation error due to missing header files

## 8.1.7

**Released**: October 7, 2026

### Bug Fixes

#### Barcode

* Fixed a crash when clearing highlights or changing the scanning state on a MatrixScan Count mode that had been removed from its data capture context.

#### Core

* Fixed a rare crash during camera setup on iOS when the active camera format reported no supported frame-rate ranges.

## 8.1.6

**Released**: July 29, 2026

### Bug Fixes

#### Smart Label Capture

* Fixed a memory leak preventing the batch and label advanced overlay from being collected until the mode they're bound to is collectable.

## 8.1.5

**Released**: June 10, 2026

### Bug Fixes

#### Barcode

* Fixed a memory leak in item-based scanning.

#### Smart Label Capture

* Fixed a memory leak in LabelCapture.

#### Core

* Fixed a TypeError: `frameSource.setNativeFrameSourceIsBeingCreated is not a function` thrown when calling `DataCaptureContext.setFrameSource()` with an `ImageFrameSource` on Cordova, Capacitor, and React Native SDKs.
* Fixed a rare crash when starting camera capture while under memory pressure.
* Fixed a rare crash when opening the camera.
* Fixed a rare native crash (SIGABRT in BitTube::recvObjects) that could occur on Android during camera preview rendering.

## 8.1.4

**Released**: April 21, 2026

### Bug Fixes

#### Barcode

* Fixed a crash that could occur when scanning barcodes with the k-out-of-n filter enabled, if some detected barcodes were not subject to filtering.
* Fixed a crash that occurred when the `DataCaptureContext` singleton was initialized more than once.

#### Core

* Fixed a rare issue that was causing a crash when the app moved to the background.
* Fixed a rare SIGABRT crash on camera initialization on devices whose HAL returns null from `Camera.Parameters.getSupportedFocusModes()` (for example, industrial barcode scanners like the Newland NLS-MT93).
* Fixed crashes caused by RuntimeExceptions thrown by OEM camera code that are not part of the standard Android Camera API contract; these exceptions are now caught and logged instead of crashing.

## 8.1.3

**Released**: March 25, 2026

### Bug Fixes

#### Core

* Fixed a potential app hang when the app transitions to the background for licenses without analytics enabled.
* Fixed a potential deadlock on iOS when reading the camera torch state from the main thread while the camera was starting up.

## 8.1.2

**Released**: March 9, 2026

### Bug Fixes

#### Barcode

* Fixed a stability issue that could cause a crash when tracked barcodes were removed or expired during a scanning session

#### Smart Label Capture

* Fixed a rare race condition

## 8.1.1

**Released**: February 5, 2026

### Performance Improvements

#### Core

* Reduced intermittent memory spikes while configuring the barcode scanner across all capture modes

### Bug Fixes

#### Id

* Fixed a memory issue leading to a persistent black screen during ID Capture startup

#### Core

* Fixed a crash in the DataCaptureView overlay management that could occur during rapid view updates
* Fixed an issue where the camera preview appeared rotated 90 degrees in landscape orientation
* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera

## 8.1.0

**Released**: December 17, 2025

### New Features

#### Barcode

* Smart Scan Selection is now available in Barcode Capture. Scanning a single barcode is often difficult in environments where multiple barcodes are placed closely together, like on a densely packed warehouse shelf or on a package with various labels. This can lead to scanning the wrong item, causing errors and slowing down operations. Smart Scan Selection solves this problem by automatically detecting when a user is trying to scan in a "dense barcode" environment. The interface then intelligently adapts, providing an aimer to help the user precisely select the desired barcode without needing to manually change any settings. This creates a more intuitive scanning experience that requires no manual configuration.
* [SparkScan](/sdks/cordova/sparkscan/intro.md) is not limited to only barcodes anymore, but can also scan items - in other words any combinations of barcodes and text present on a target to be scanned. The feature is available in beta at the moment, please contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out.
* Extended Aztec codes reader to support scanning mirrored codes.
* Added support for square DataMatrix codes with one-sided damage or occlusion. This feature is only enabled in Barcode Capture and SparkScan.

#### Id

* Added NationalityISO property that maps results from Nationality field to country ISO code
* Added RejectionDiagnosticJSON property to CapturedId to report debug info during Timeout rejections
* Added support for new California DL, new South Carolina DL, Arizona Medical Marijuana Card, Kuwait Civil card, and new Texas DL
* Our SDK can now scan the following documents both in single-side and double-side mode:
  - All Mexican DLs
  - Mexican Voter Cards

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
* Fixed a bug in the default color of BarcodeCapture highlights
* Fixed an issue where popover annotations with HIGHLIGHT_TAP_AND_BARCODE_SCAN trigger could not be opened again
* Fixed an issue in BarcodeSequence where camera would not be ON in portrait
* Fixed an issue where SparkScan mini preview would sometimes stay in regular when entering target mode
* Fixed the app becoming unresponsive after being in the background for extended periods
* Added the `cameraStateOnStop` property to BarcodeFindView to optimize camera transitions when switching between modes
* Fixed an issue where the successful notification in BarcodeFind was not displayed

#### Id

* Fixed an issue where front expiry date anonymization rectangle is erroneously drawn on front and back
* Fixed a bug that prevented VizResult anonymization of the following fields: additionalAddressInformation, bloodType, employer, fathersName, issuingAuthority, maritalStatus, mothersName, placeOfBirth, profession, race, residentialStatus
* Fixed a bug concerning return complete instead of cropped images on the back of EU driving licenses

#### Core

* Fixed a bug that could in rare cases produce a black screen when starting the camera
* Fixed a small memory leak that affected fresh install runs only
* Fixed an issue where barcode scanning would permanently stop after the app returned from background, particularly when camera permission dialogs were shown during initialization

## 8.0.1

**Released**: January 14, 2026

### Bug Fixes

#### Barcode

* Fixed an issue where the successful hint in BarcodeFind was not displayed
* Fixed a rare out-of-bound memory access crash when scanning low-resolution or blurry `EAN13/UPCA` codes at a specific distance

#### Core

* Fixed an issue where the camera would not restart when opened from another app
* Fixed an issue where the interface and video feed could have different visual orientations
* Fixed a bug that could in rare cases produce a black screen when starting the camera
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

#### Barcode

* Updated the Gradle version for all sample applications to 8.14.3.
* `BarcodeBatchBasicOverlay` and `BarcodeBatchBasicOverlayListener` now allow for nullable brushes.

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

#### ID

* The configuration for the following documents has been changed as detailed below:
  * Australian mobile driver licenses (mDL) are now treated as normal documents, with no separate mode.
  * US Green Cards are now treated as residence permits.
* Removed the deprecated API `DateResult::toDate`. Use `DateResult::toLocalDate` or `DateResult::toUtcDate` instead.
* `fullName` now an optional field on all `IdCapture` result types and `capturedMrz` now an optional field on `MrzeeeeeResult`.

### Bug Fixes

#### ID

* Fixed a bug that could get the scanner stuck when scanning a US passport card.

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.


## 7.6.7

Find earlier versions in the [release notes section of version 7](/7.6.15/sdks/cordova/release-notes)