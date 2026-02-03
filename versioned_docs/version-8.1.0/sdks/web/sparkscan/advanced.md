---
description: "SparkScan is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are some cases where you might want to customize the behavior of SparkScan. This guide will show you how to add additional capabilities and further customize SparkScan to best fit your needs.                                                     "

sidebar_position: 3
pagination_next: null
framework: web
keywords:
  - web
---

# Advanced Configurations

SparkScan is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are some cases where you might want to customize the behavior of SparkScan. This guide will show you how to add additional capabilities and further customize SparkScan to best fit your needs.

## Advanced Capabilities

### Trigger Error State

You may want to introduce logic in your app to show an error message when scanning specific barcodes (e.g. barcodes already added to the list, barcodes from the wrong lot etc.). SparkScan offers a built-in error state you can easily set to trigger an error feedback prompt to the user. You will be able to customize:

- The text message
- The timeout of the error message: the scanner will be paused for the specified amount of time, but the user can quickly restart the scanning process by tapping the trigger button

    :::tip
    A high timeout (>10s) typically requires the users to interact with the UI to start scanning again. This is a good choice when you want to interrupt the scanning workflow (e.g. because a wrong barcode is scanned and some actions need to be performed). A small timeout (\<2s) could allow the user to scan again without having to interact with the app, just momentarily pausing the workflow to acknowledge that a “special” barcode has been scanned.
    :::

- The color of the flashing screen upon scan. You can enable or disable the visual feedback via [SparkScanViewSettings.visualFeedbackEnabled](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.VisualFeedbackEnabled) and you can control the color via [SparkScanBarcodeFeedback](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-barcode-feedback.html#sparkscan-barcode-feedback).

An error example is here reported:

To emit an error, you have to implement a [`SparkScanFeedbackDelegate`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-feedback-delegate.html#interface-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate) and set it to the `SparkScanView`:

```js
sparkScanView.feedbackDelegate  = sparkScanFeedbackDelegate;
```

In the [`SparkScanFeedbackDelegate.getFeedbackForBarcode()`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-feedback-delegate.html#method-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate.GetFeedbackForBarcode) you can then return an error or a success feedback:

```js
const sparkScanFeedbackDelegate = {
      feedbackForBarcode: (barcode: Barcode) => {
          if (isValidBarcode(barcode)) {
              return new SparkScanBarcodeSuccessFeedback();
          } else {
              return new SparkScanBarcodeErrorFeedback(
                  'This code should not have been scanned',
                  60 * 1000,
                  Color.fromHex('#FF0000'),
                  new Brush(Color.fromHex('#FF0000'), Color.fromHex('#FF0000'), 1),
              );
          }
      },
};
```

You can have different error states triggered by different logic conditions. These errors can show different colors and have different timeouts. For example:

<p align="center">
  <img src="/img/sparkscan/error-wrong.png" alt="Wrong scan error" /><br></br>This error state for a code that should not have been scanned.
</p>

<p align="center">
  <img src="/img/sparkscan/error-duplicate.png" alt="Duplicate scan error" /><br></br>This error state for a code that has been scanned more than once.
</p>

### Reject Barcodes

To prevent scanning unwanted barcodes (like those already listed or from incorrect lots), use SparkScan’s built-in error state. Setting the [`SparkScanBarcodeErrorFeedback.resumeCapturingDelay`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-barcode-feedback.html#property-scandit.datacapture.barcode.spark.feedback.Error.ResumeCapturingDelay) parameter to 0 allows the user to continue scanning immediately without pausing on rejected codes.

## UI Customization

:::tip
Please refer to [SparkScanView](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) for the full list of parameters.
:::

import Customization from '../../../partials/advanced/_sparkscan-customization.mdx';

<Customization/>

## Workflow Options

This section explains all the available options to configure SparkScan to best fit your case, in case you found something that didn't work well in the default configuration (that remains our recommended option).

Developers can set a combination of scanning mode, scanning behavior and camera preview behavior - defining the initial state of the scanner. This can be done by setting the default scanning mode ([`SparkScanViewSettings.defaultScanningMode`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.DefaultScanningMode)). This combination allows for flexible configurations to suit different scanning needs.

### Scanning Mode

The scanning mode determines the programmatic presence of an aimer in the preview to help with precision scanning.

| Mode  | Description   |
| ----------- | --------------------------------------------------- |
| **Default** | Generally recommended. This mode will display a small camera preview to aid with aiming. The preview size and zoom level can be adjusted as needed. User can aim easily at the intended barcode.       |
| **Target**  | This mode will always add an aimer to the camera preview to precisely select the barcode to scan. This is recommended only when selecting among many close barcodes is the common task. |

:::tip
Even in the *Default* mode, SparkScan will automatically show an aimer when multiple barcodes are present in the view and no clear intention from the user to scan a single one is recorded ([`SparkScanSettings.ScanIntention`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-settings.html#property-scandit.datacapture.barcode.spark.SparkScanSettings.ScanIntention)). Enabling the *Target* mode will simply force this "precision selection" state to be on at all time.
:::

### Scanning Behavior

The scanning behavior determines how barcodes are scanned - one at a time or continuously.

| Behavior  | Description  |
| ------------------- | ---------------------------------------------------------- |
| **Single scan**     | Scan one barcode at a time. The user needs to trigger the scanner every time to scan a barcode. This allows for a more controlled scanning and lower battery consumption. |
| **Continuous scan** | Scan barcodes consecutively. The user needs to trigger the scanner once and barcodes will be scanned without any further interaction before each scan. This allows for a smoother experience when multiple barcodes need to be scanned consecutively.  |

:::tip
Users can enable continuous scanning by holding down the trigger button. This gesture can be disabled ([`SparkScanViewSettings.holdToScanEnabled`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.HoldToScanEnabled)).
:::

### Preview Behavior

The preview behavior determines how the camera preview behaves when the scanner is not actively scanning.

| Behavior  | Description    |
| -------------- | -------------------------- |
| **Default**    | Preview fades away when the scanner is off. This lets the user check important information displayed by the app and reduces battery consumption.                 |
| **Persistent** | Preview remains visible, but darkened, even when the scanner is off. This is useful for scenarios where you want to select a barcode (among many) or need to look through the preview at all times (to ensure the right scan) - especially if used in conjunction with the target mode. |
