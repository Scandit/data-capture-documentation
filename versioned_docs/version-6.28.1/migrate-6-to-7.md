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

#### AdvancedOverlay

The `AdvancedOverlay` API will be deprecated in version 7.1 and replaced with a standalone module as MatrixScan Check. No changed are required for version 7.0, but you should be aware of the upcoming changes.

## Text Capture Changes

Text Capture has been removed from the Scandit Data Capture SDK. If your use case requires text recognition you can use Smart Label Capture.

## Web SDK Changes

Starting with version 7.0, there are some critical changes in installing and hosting the Web SDK that you should be aware of:

- NPM package scope has changed to `@scandit/web-datacapture-*`.
- The public engine directory has been moved from `build/engine` to `sdc-lib`.

See the Web SDK [installation guide](/sdks/web/add-sdk.md) for more information.