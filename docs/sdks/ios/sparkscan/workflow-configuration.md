---
description: "SparkScan can be customized to fit a wide range of scanning workflows through the combination of **Scanning Mode**, **Scanning Behavior**, and **Preview Behavior**.                                                                             "

title: Workflow Options
framework: ios
keywords:
  - ios
---

# Configuring Scanning and Preview Behavior

This guide explains all the available options to configure SparkScan to best fit your case, in case you found something that didn't work well in the default configuration (that remains our recommended option).

SparkScan can be customized to fit a wide range of scanning workflows through the combination of three different parameters: **Scanning Mode**, **Scanning Behavior**, and **Preview Behavior**.

## Scanning Mode

The scanning mode determines the programmatic presence of an aimer in the preview to help with precision scanning.

| Mode  | Description   |
| ----------- | --------------------------------------------------- |
| **Default** | Generally recommended. This mode will display a small camera preview to aid with aiming. The preview size and zoom level can be adjusted as needed. User can aim easily at the intended barcode.       |
| **Target**  | This mode will always add an aimer to the camera preview to precisely select the barcode to scan. This is recommended only when selecting among many close barcodes is the common task. |

:::tip
Even in the *Default* mode, SparkScan will automatically show an aimer when multiple barcodes are present in the view and no clear intention from the user to scan a single one is recorded. Enabling the *Target* mode will simply force this "precision selection" state to be on at all time.
:::

## Scanning Behavior

The scanning behavior determines how barcodes are scanned - one at a time or continuously.

| Behavior  | Description  |
| ------------------- | ---------------------------------------------------------- |
| **Single scan**     | Scan one barcode at a time. The user needs to trigger the scanner every time to scan a barcode. This allows for a more controlled scanning and lower battery consumption. |
| **Continuous scan** | Scan barcodes consecutively. The user needs to trigger the scanner once and barcodes will be scanned without any further interaction before each scan. This allows for a smoother experience when multiple barcodes need to be scanned consecutively.  |

:::tip
Users can enable continuous scanning by holding down the trigger button ([`SDCSparkScanViewSettings.holdToScanEnabled`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.HoldToScanEnabled)). This gesture can be disabled.
:::

## Preview Behavior

The preview behavior determines how the camera preview behaves when the scanner is not actively scanning.

| Behavior  | Description    |
| -------------- | -------------------------- |
| **Default**    | Preview fades away when the scanner is off. This lets the user check important information displayed by the app and reduces battery consumption.                 |
| **Persistent** | Preview remains visible, but darkened, even when the scanner is off. This is useful for scenarios where you want to select a barcode (among many) or need to look through the preview at all times (to ensure the right scan) - especially if used in conjunction with the target mode. |

## Available Configurations

Developers can set a combination of scanning mode, scanning behavior and camera preview behavior - defining the initial state of the scanner. This can be done by setting the default scanning mode ([SDCSparkScanViewSettings.defaultScanningMode](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.DefaultScanningMode)).

The combination of scanning mode, scanning behavior, and preview behavior allows for flexible configurations to suit different scanning needs.
