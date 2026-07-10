---
sidebar_position: 3
pagination_next: null
framework: capacitor
keywords:
  - capacitor
---

# Advanced Configurations

SparkScan is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are some cases where you might want to customize the behavior of SparkScan. This guide will show you how to add additional capabilities and further customize SparkScan to best fit your needs.

## Advanced Capabilities

### Hardware Button Control

Allowing the end user to control the scanner with hardware buttons can be useful if your users typically wear gloves. It can also improve ergonomics in some workflows.

SparkScan offers a built-in API to let you do this via [`SparkScanViewSettings.hardwareTriggerEnabled`](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.HardwareTriggerEnabled).

### Trigger Error State

You may want to introduce logic in your app to show an error message when scanning specific barcodes (e.g. barcodes already added to the list, barcodes from the wrong lot etc.). SparkScan offers a built-in error state you can easily set to trigger an error feedback prompt to the user. You will be able to customize:

- The text message
- The timeout of the error message: the scanner will be paused for the specified amount of time, but the user can quickly restart the scanning process by tapping the trigger button
- The color of the flashing screen upon scan. You can enable or disable the visual feedback via [SparkScanViewSettings.visualFeedbackEnabled](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.VisualFeedbackEnabled) and you can control the color via [SparkScanViewSuccessFeedback](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-feedback.html#class-scandit.datacapture.barcode.spark.ui.SparkScanViewSuccessFeedback) and [SparkScanViewErrorFeedback](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view-feedback.html#class-scandit.datacapture.barcode.spark.ui.SparkScanViewErrorFeedback).

To emit an error, implement a [SparkScanFeedbackDelegate](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-feedback-delegate.html#interface-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate) and set it on the [SparkScanView](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FeedbackDelegate):

```js
sparkScanView.feedbackDelegate = sparkScanFeedbackDelegate;
```

In the [feedbackForBarcode](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-feedback-delegate.html#method-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate.GetFeedbackForBarcode) callback you can return an error or a success feedback:

```js
const sparkScanFeedbackDelegate = {
    feedbackForBarcode: (barcode) => {
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

:::note
You can have different error states triggered by different logic conditions. For example you can trigger an error state when a wrong barcode is scanned, and another one when a duplicate barcode is scanned. These errors can show different colors and have different timeouts.
:::

![SparkScan Error State](../../../img/errors.png)

A high timeout (e.g. `10`+ seconds) typically requires the users to interact with the UI to start scanning again. This is a good choice when you want to interrupt the scanning workflow, for example when a wrong barcode is scanned and some actions need to be performed.

A small timeout could allow the user to scan again without having to interact with the app, just momentarily pausing the workflow to acknowledge that a “special” barcode has been scanned. If timeout is set to 0 workflow is not paused at all.

### Reject Barcodes

To prevent scanning unwanted barcodes (like those already listed or from incorrect lots), use SparkScan’s built-in error state. Setting the [`SparkScanBarcodeErrorFeedback.resumeCapturingDelay`](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-barcode-feedback.html#property-scandit.datacapture.barcode.spark.feedback.Error.ResumeCapturingDelay) parameter to 0 allows the user to continue scanning immediately without pausing on rejected codes.

### Add Advanced Scanning Modes to the Setting Toolbar

SparkScan is our best solution for high-speed single scanning and scan-intensive workflows. Depending on your use case, you can use SparkScan scan in conjunction with other Scandit advanced scanning modes, such as MatrixScan Find or MatrixScan Count, to speed up your workflows.

SparkScan offers pre-build buttons you can add to the setting toolbar to easily move to different scan modes from within the SparkScan UI.

First you will need to show these buttons:

```js
// Show the MatrixScan Count and MatrixScan Find buttons
sparkScanView.barcodeCountButtonVisible = true;
sparkScanView.barcodeFindButtonVisible = true;
```
![SparkScan Advanced Scanning Modes](../../../img/toolbars.png)

## Customization

### Customize colors and texts

All texts (guidance inside the trigger button and hints’ messages), colors and opacity of the SparkScan UI elements (trigger button, setting toolbar, toasts) can be customized to match the desired language and color scheme. Please refer to [SparkScanView](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) for the full list of available parameters.

### Add Controls to the Setting Toolbar

The Setting Toolbar comes with default buttons included, but the full list of available controls includes:

* Target Mode (visible by default)
* Continuous Mode
* Torch Control (visible by default)
* Audio Feedback Control
* Haptics Control
* Left-handed Mode

In some cases you want to avoid end users from accessing these controls, for example to prevent them from:

- Disabling audio feedback on scan, as the work environment is always noisy
- Toggling the continuous mode, as you want them to pick items one by one.

To add controls to the settings toolbar, just change the visibility of these buttons. Please refer to [SparkScanView](https://docs.scandit.com/6.28/data-capture-sdk/capacitor/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) for the full list of parameters.
