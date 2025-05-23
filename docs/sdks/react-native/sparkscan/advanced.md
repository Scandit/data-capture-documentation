---
sidebar_position: 3
pagination_next: null
framework: react
keywords:
  - react
---

# Advanced Configurations

SparkScan is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are some cases where you might want to customize the behavior of SparkScan. This guide will show you how to add additional capabilities and further customize SparkScan to best fit your needs.

## Advanced Capabilities

### Hardware Button Control

Allowing the end user to control the scanner with hardware buttons can be useful if your users typically wear gloves. It can also improve ergonomics in some workflows.

SparkScan offers a built-in API to let you do this via [scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.HardwareTriggerEnabled](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view-settings.html#property-scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.HardwareTriggerEnabled).

### Trigger Error State

You may want to introduce logic in your app to show an error message when scanning specific barcodes (e.g. barcodes already added to the list, barcodes from the wrong lot etc.). SparkScan offers a built-in error state you can easily set to trigger an error feedback prompt to the user.

You can customize:

* The text message.
- The timeout of the error message: the scanner will be paused for the specified amount of time, but the user can quickly restart the scanning process by tapping the trigger button.

    :::tip
    A high timeout (>10s) typically requires the users to interact with the UI to start scanning again. This is a good choice when you want to interrupt the scanning workflow (e.g. because a wrong barcode is scanned and some actions need to be performed). A small timeout (\<2s) could allow the user to scan again without having to interact with the app, just momentarily pausing the workflow to acknowledge that a “special” barcode has been scanned.
    :::
 
* The color of the flashing screen upon scan. You can enable or disable the visual feedback via `scandit.datacapture.barcode.spark.ui.SparkScanViewSettings.VisualFeedbackEnabled` and control the color via `scandit.datacapture.barcode.spark.ui.SparkScanViewFeedback`.
* The color of the highlight for the scanned barcode.
* The feedback (sound, vibration).

To emit an error, you have to implement a [SDCSparkScanFeedbackDelegate](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/spark-scan-feedback-delegate.html#interface-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate) and set it to the [SparkScanView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#property-scandit.datacapture.barcode.spark.ui.SparkScanView.FeedbackDelegate):

```js
sparkScanView.feedbackDelegate  = sparkScanFeedbackDelegate;
```

In the [SDCSparkScanFeedbackDelegate.feedbackForBarcode](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/spark-scan-feedback-delegate.html#method-scandit.datacapture.barcode.spark.feedback.ISparkScanFeedbackDelegate.GetFeedbackForBarcode) you can then return an error or a success feedback:

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

You can have different error states triggered by different logic conditions. For example you can trigger an error state when a wrong barcode is scanned, and another one when a duplicate barcode is scanned. These errors can show different colors and have different timeouts.

<p align="center">
  <img src="/img/sparkscan/error-wrong.png" alt="Wrong scan error" /><br></br>This error state for a code that should not have been scanned.
</p>

<p align="center">
  <img src="/img/sparkscan/error-duplicate.png" alt="Duplicate scan error" /><br></br>This error state for a code that has been scanned more than once.
</p>



### Reject Barcodes

To prevent scanning unwanted barcodes (like those already listed or from incorrect lots), use SparkScan’s built-in error state. Setting the [SDCSparkScanBarcodeErrorFeedback.resumeCapturingDelay](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-barcode-feedback.html#property-scandit.datacapture.barcode.spark.feedback.Error.ResumeCapturingDelay) parameter to `0` allows the user to continue scanning immediately without pausing on rejected codes.

## UI Customization

:::tip
Please refer to [SparkScanView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/spark-scan-view.html#class-scandit.datacapture.barcode.spark.ui.SparkScanView) for the full list of parameters.
:::

import Customization from '../../../partials/advanced/_sparkscan-customization.mdx';

<Customization/>

## React Navigation

When using the `SparkScanView` component with React Navigation and `headerShown: true`, you may encounter an issue where the Buttons within your `SparkScanView` don't respond to touch events. 

This is a known issue with React Navigation's header implementation. The navigation header can interfere with touch event handling for components rendered within certain custom views like `SparkScanView`. While the buttons appear to be functioning visually, their `onPress` events do not trigger when the screen includes a header.

Try the following if you encounter this issue:

**Use TouchableOpacity instead of Button**

```jsx
<TouchableOpacity
  onPressIn={() => handleButtonPress()}>
  <Text>Scan</Text>
</TouchableOpacity>
```
or

```jsx
<TouchableOpacity
  onPressOut={() => handleButtonPress()}>
  <Text>Scan</Text>
</TouchableOpacity>
```

**Ensure you're importing TouchableOpacity from 'react-native'**

Some users have found that using the `TouchableOpacity` component from `react-native-gesture-handler` causes issues, while the one from `react-native` works correctly.