---
title: Migrate from Barcode Scanner 6.x
description: Migrate from Barcode Scanner 6.x to version 7.x of the Scandit Smart Data Capture SDK.
sidebar_label: From 6.x to 7.x
toc_max_heading_level: 4
---

# Migrate to Data Capture SDK 7.x

This guide will help you migrate from versions 6.x of the Scandit Smart Data Capture SDK to version 7.x.

Version 7.0 deprecates and removes many APIs from versions 6.x, as well as making many of the existing APIs more intuitive, resulting in a simpler and quicker integration experience.

While not all features and functionalities are impacted, it is likely you will need to modify your app. If you are unsure about how to perform the migration or the feature you are using is not covered in this migration guide, please reach out to our [support team](mailto:support@scandit.com).

## Updating for Deprecated APIs

:::tip[Version 5.x Users]
If your app is still using version 5.x of the Scandit Barcode Scanner SDK, you will need to first migrate to version 6.x before migrating to version 7.x. Please refer to the [migration guide from 5.x to 6.x](/migrate-5-to-6.md) for more information.
:::

Version 7.0 includes the removal of all APIs that were deprecated throughout the 6.x series. For the simplest migration process, we recommend you:

- Update your app to the latest 6.28.x version. This version includes warnings for all deprecated APIs.
- Address all deprecation warnings in your app.
- Update to version 7.0.

## Barcode Capture Changes

### SparkScan

In version 7.0, we are introducing the second generation of our ready-to-use barcode scanning UI, SparkScan. This new UI is more intuitive and provides a more modern look and feel, as well as bringing more customization options.

As part of these changes, there have been various deprecations, modifications, and additions to the SparkScan APIs, as detailed below.

#### Deprecations

All previously deprecated APIs have been removed and the following APIs have been deprecated in version 7.0 and should be removed or replaced in your app:

| Deprecated API |Details |
|---|---|
| `torchButtonVisible` | The torch button has been moved to the mini preview. Use `torchControlVisible` instead. |
| `stopCapturingText` | The trigger button no longer displays any text. |
| `startCapturingText` | The trigger button no longer displays any text. |
| `resumeCapturingText` | The trigger button no longer displays any text. |
| `scanningCapturingText` | The trigger button no longer displays any text. |
| `cameraButtonBackgroundColor` | Use `triggerButtonCollapsedColor`, `triggerButtonExpandedColor`, and `triggerButtonAnimationColor` instead. |
| `captureButtonTintColor` | Use `triggerButtonTintColor` instead. |
| `captureButtonActiveBackgroundColor` | No longer needed. |
| `handModeButtonVisible` | The trigger is fully floating now, eliminating the concept of left or right positioning. |
| `defaultHandMode` | No longer needed. |
| `soundModeButtonVisible` | No longer needed. |
| `hapticModeButtonVisible` | No longer needed. |
| `shouldShowScanAreaGuides` | No longer needed. |
| `fastFindButtonVisible` | Renamed to `barcodeFindButtonVisible`. |

#### Changes and Additions

The following changes and additions have been made to the SparkScan APIs:

| API | Details |
|---|---|
| `SparkScanViewState` | New API to set the initial state of the SparkScan UI. |
| `defaultMiniPreviewSize` | New API to set the default size of the mini preview. |
| `miniPreviewCloseControlVisible` | New API to show or hide the close button in the mini preview. |
| `triggerButtonVisible` | New API to show or hide the trigger button. See also:<br/>`triggerButtonCollapsedColor`<br/>`triggerButtonExpandedColor`<br/>`triggerButtonAnimationColor`<br/>`triggerButtonTintColor`<br/>`triggerButtonImage` |
| `triggerButtonCollapseTimeout` | Default value changed from `-1` to `5` for the new UI. |

### MatrixScan

Version 7.0 introduces new naming conventions for the MatrixScan APIs that better reflect the functionality they provide. This includes renaming the core MatrixScan functionality (previously `BarcodeTracking`) and the upcoming separation of the MatrixScan Augmented Reality (AR) functionality (`AdvancedOverlay`) into a separate module.

#### BarcodeTracking

The `BarcodeTracking` API has been renamed to `BarcodeBatch`. Apart from the name change, the API remains largely the same and simply requires updating the class name in your code for migration.

:::warning
If your application uses of any `BarcodeTracking` APIs alongside another product (e.g. MatrixScan Count), you must update any mentions to conform with this naming change.
:::

#### AdvancedOverlay

The `AdvancedOverlay` API will be deprecated in version 8.x. No changes are required for version 7.0, but you should be aware of the upcoming changes.

In version 7.1, a new ready-to-use solution - MatrixScan Check - will be released that enables fast and easy integration of Advanced Overlay features into your application.

## ID Capture Changes

Version 7.0 introduces a completely redesigned ID Capture and Validation API. This new API provides a more intuitive and flexible way to capture and validate IDs, along with enhanced configuration options and improved result structures.

### Document Selection

Using the new ID Capture API, you can now select the document type(s) you want to capture or exclude based on geographic regions, along with the sections of the document(s) to be captured. This allows you to create a more tailored and efficient ID capture experience for your users.

The tables below indicate the corresponding API and configurations for the previous ID Capture API in version 6.x and the new ID Capture API in version 7.0.

#### Front and Back ID Capture

Previously you would need to configure the `supportedSides` for your desired document types. In version 7.0, you select the `scannerType` to be used:

| Version 6.x | Version 7.0 |
|---|---|
| `FRONT_ONLY` | [`SingleSideScanner`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-scanner.html#single-side-scanner) |
| `FRONT_AND_BACK` | [`FullDocumentScanner`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-scanner.html#full-document-scanner) |

#### Document Type Selection

Previously there were separate document types based upon the zone(s) you wanted to capture, for example the VIZ zone or the MRZ zone. In version 7.0, this is simplified into a configuration of your scanner type based upon ending suffix in your previous configuration:

| Version 6.x | Version 7.0 |
|---|---|
| `*_VIZ` | `SingleSideScanner.visualInspectionZone(true)` or `FullDocumentScanner` |
| `*_MRZ` | `SingleSideScanner.machineReadableZone(true)` |
| `*_BARCODE` | `SingleSideScanner.barcode(true)` |
| Multiple zones | `FullDocumentScanner` or `SingleSideScanner` with multiple zones enabled |

:::tip
If you need to scan certain documents in full, and others only a specific zone, we recommend using the `FullDocumentScanner` for all documents.
:::

#### Document Category Selection

Where previously there were separate document types for a given region and ID type (e.g. Colombia Driver's License, and Colombia ID), in version 7.0 you can select the document category and region to capture (or exclude).

See [ID Capture Document](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-document.html#id-capture-document) for more information on **acceptedDocuments**.

| 6.x API    | 7.x API    |
|----------------------------|---------------------|
| **supportedDocuments**     | **acceptedDocuments**  |
| DL_VIZ       | DriverLicense|
| AAMVA_BARCODE| DriverLicense and IdCard   |
| VISA_MRZ     | Visalcao |
| PASSPORT_MRZ | Passport |
| SWISS_DL_MRZ | DriverLicense|
| ID_CARD_MRZ  | IdCard and/or ResidencePermit and/or certain RegionSpecific documents.   |
| ID_CARD_VIZ  | IdCard and/or ResidencePermit and/or certain RegionSpecific documents.   |
| US_US_ID_BARCODE | RegionSpecific with US_UNIFORMED_SERVICES_ID subtype   |
| COLOMBIA_DL_BARCODE        | DriverLicense limited to Region.Colombia |
| COLOMBIA_ID_BARCODE        | IdCard limited to Region.Colombia    |
| ARGENTINA_ID_BARCODE       | IdCard limited to Region.Argentina   |
| SOUTH_AFRICA_DL_BARCODE    | DriverLicense limited to Region.SouthAfrica  |
| SOUTH_AFRICA_ID_BARCODE    | IdCard limited to Region.SouthAfrica |
| CHINA_MAINLAND_TRAVEL_PERMIT_MRZ | RegionSpecific with subtypes CHINA_MAINLAND_TRAVEL_PERMIT_TAIWAN and CHINA_MAINLAND_TRAVEL_PERMIT_HK_MACAU |
| CHINA_EXIT_ENTRY_PERMIT_MRZ | RegionSpecific with subtype CHINA_EXIT_ENTRY_PERMIT   |
| CHINA_ONE_WAY_PERMIT_BACK_MRZ | RegionSpecific with subtype CHINA_ONE_WAY_PERMIT    |
| CHINA_ONE_WAY_PERMIT_FRONT_MRZ | RegionSpecific with subtype CHINA_ONE_WAY_PERMIT   |
| APEC_BUSINESS_TRAVEL_CARD_MRZ | RegionSpecific with subtype APEC_BUSINESS_TRAVEL_CARD   |
| PASSPORT_VIZ | Passport |
| COMMON_ACCESS_CARD_BARCODE | RegionSpecific with subtype US_COMMON_ACCESS_CARD      |
| HEALTH_INSURANCE_CARD_VIZ  | HealthInsuranceCard    |

### Accepting and Rejecting Documents

Previously you would need to create your own logic for which documents to accept or reject after the capture process.

In version 7.0, you can now specify the documents you want to capture or exclude based on the document category and region directly in the [`IDCaptureSettings`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-settings.html#id-capture-settings).

You can accept or reject a given subset of documents based on the document category and region. For example, you can accept only Passports but not IDs, or reject anything except Drivers License.

Setting the [`acceptedDocuments`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.AcceptedDocuments) will automatically reject any documents not specified in the list.

Setting the [`rejectedDocuments`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-settings.html#property-scandit.datacapture.id.IdCaptureSettings.RejectedDocuments) will automatically reject any documents specified in the list.

### Document Images

If you need to receive images of the captured document, you must migrate the `IdImageType` as follows:

| Version 6.x | Version 7.0 |
|---|---|
| FACE | FACE |
| ID_FRONT | CROPPED_DOCUMENT |
| ID_BACK | CROPPED_DOCUMENT |

There is no distinction between front and back. If using `SingleSideScanner`, you will receive the front, if using `FullDocumentScanner`, you will receive the front and back.

For the full frame of the document, you can use [`setShouldPassImageTypeToResult`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-settings.html#method-scandit.datacapture.id.IdCaptureSettings.SetShouldPassImageTypeToResult).

### Callbacks

There are now only two callbacks used: [`onIdCaptured`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-listener.html#method-scandit.datacapture.id.IIdCaptureListener.OnIdCaptured) and [`onIdRejected`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/id-capture-listener.html#method-scandit.datacapture.id.IIdCaptureListener.OnIdRejected).

:::tip
For `FullDocumentScanner`, `onIdCaptured` will be called only when all sides are captured. The ID Capture UI automatically guides the user through the process.
:::

If you previously relied on `onIdCapturedTimedOut`, you will receive the very same callback as `onIdRejected` with `RejectionReason` TIMEOUT.

:::warning
**Web SDK Only**:
If you rely on `SingleImageUploader`, `onIdCaptured` is now delivered if data from a document could be extracted and `onIdRejected` when it couldn’t. `RejectionReason` would be `SINGLE_IMAGE_NOT_CAPTURED` if no document could be detected in the image.
:::

### Capture Result

The structure of [`CapturedId`](https://docs.scandit.com/6.28/data-capture-sdk/android/id-capture/api/captured-id.html) has been simplified and improved. Some of the changes include:

- The `issuingCountry` field is now a `Region` type instead of a `String`.
- `CapturedId::viz::capturedSides` type is now named `CapturedSides` not `SupportedSides`.
- `CapturedId::documentType` is now renamed to `CapturedId::document` and has type `IdCaptureDocument`. You may also use methods like `CapturedId::isPassport()` to determine which document is captured.

Additionally, you can access aggregate fields from the top level and also access fields extracted from individual zones by accessing `CapturedId::barcode`, `CapturedId::mrz` and `CapturedId::viz`. These substructures replace the previous ones that were document-specific, like `aamvaBarcode`.

## Text Capture Changes

Text Capture has been removed from the Scandit Data Capture SDK. If your use case requires text recognition you can use Smart Label Capture.

## Web SDK Changes

Starting with version 7.0, there are some critical changes in installing and hosting the Web SDK that you should be aware of:

- NPM package scope has changed to `@scandit/web-datacapture-*`.
- The public engine directory has been moved from `build/engine` to `sdc-lib`.

See the Web SDK [installation guide](/sdks/web/add-sdk.md) for more information.