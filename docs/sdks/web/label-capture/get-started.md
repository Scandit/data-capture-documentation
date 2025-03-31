---
sidebar_position: 2
framework: web
keywords:
  - web
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Create a component to handle the capture process
- Initialize the Data Capture Context
- Initialize the Label Capture Mode
- Implement a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/web/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Initialize the Data Capture Context

import DataCaptureContextWeb from '../../../partials/get-started/_create-data-capture-context-web.mdx';

<DataCaptureContextWeb/>

## Initialize the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```js
import { Symbology } from "@scandit/web-datacapture-barcode"
import {
  CustomBarcodeBuilder,
  LabelCapture,
  LabelCaptureSettings,
  LabelDefinitionBuilder,
  TotalPriceTextBuilder,
  UnitPriceTextBuilder,
  LabelDateFormat,
  WeightTextBuilder,
  ImeiOneBarcodeBuilder,
  ImeiTwoBarcodeBuilder,
  SerialNumberBarcodeBuilder,
} from "@scandit/web-datacapture-label"

const isofLabel = await new LabelDefinitionBuilder()
  .addCustomBarcode(
    // Create a barcode field with the expected symbologies
    await new CustomBarcodeBuilder().isOptional(false).setSymbology(Symbology.EAN13UPCA).build("Barcode")
  )
  .addTotalPriceText(await new TotalPriceTextBuilder().isOptional(false).build("Total Price"))
  .addUnitPriceText(await new UnitPriceTextBuilder().isOptional(false).build("Unit Price"))
  .addExpiryDateText(
    await new ExpiryDateTextBuilder()
      .isOptional(false)
      .setLabelDateFormat(new LabelDateFormat(LabelDateComponentFormat.MDY))
      .build("Expiry Date")
  )
  .addWeightText(await new WeightTextBuilder().isOptional(false).build("Weight"))
  .build("ISOF Label");

const smartDeviceLabel = await new LabelDefinitionBuilder()
  .addImeiOneBarcode(
    await new ImeiOneBarcodeBuilder().isOptional(false).setSymbology(Symbology.Code128).build("IMEI")
  )
  .addImeiTwoBarcode(
    await new ImeiTwoBarcodeBuilder().isOptional(false).setSymbology(Symbology.Code128).build("IMEI2")
  )
  .addSerialNumberBarcode(
    await new SerialNumberBarcodeBuilder().isOptional(false).setSymbology(Symbology.Code128).build("Serial Number")
  )
  .addCustomBarcode(await new CustomBarcodeBuilder().isOptional(false).setSymbology(Symbology.Code128).build("EID"))
  .build("Smart Device Label");

const settings = await new LabelCaptureSettingsBuilder().addLabel(isofLabel).addLabel(smartDeviceLabel).build();
// Create the label capture mode with the settings and data capture context created earlier
const mode = await LabelCapture.forContext(dataCaptureContext, settings);
```

## Implement a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above.

```ts
import { CapturedLabel, LabelCaptureListener } from '@scandit/web-datacapture-label';
import type { LabelCapture, LabelCaptureSession } from '@scandit/web-datacapture-label';

const labelCaptureListener: LabelCaptureListener = {
  async didUpdateSession(labelCapture: LabelCapture, session: LabelCaptureSession) {
    /* 
     * The session update callback is called for every processed frame.
     * Early return if no label has been captured.
     */
    if (!session.capturedLabels.length) return;
    
    session.capturedLabels.forEach(capturedLabel => {
      const { fields } = capturedLabel;
      
      /* 
       * Given the label capture settings defined above, barcode data will always be present.
       */
      const barcodeData = fields.find(
        field => field.name === '<your-barcode-field-name>'
      )?.barcode?.data;
      
      /* 
       * The expiry date is an optional field.
       * Check for null in your result handling.
       */
      const expiryDate = fields.find(
        field => field.name === '<your-expiry-date-field-name>'
      )?.text;

      /* 
       * Handle the captured data as needed, for example:
       * - Update your app's state
       * - Call a callback function
       * - Navigate to a results screen
       */
      onLabelCaptured({ barcodeData, expiryDate });
    });

    /* 
     * Disable the label capture mode after all labels have been processed
     * to prevent it from capturing the same labels multiple times.
     */
    await labelCapture.setEnabled(false);

    /* 
     * You may want to communicate a successful scan with vibration and audio feedback.
     * See the Feedback section for more information on how to customize the feedback.
     */
    Feedback.defaultFeedback.emit();
  }
}
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls the UI elements, such as the viewfinder and overlays, that are shown to visualize captured labels.

To visualize the results of Label Capture, you can choose between two overlays, [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) and [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay).

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`.

```js
import { RectangularViewfinder, RectangularViewfinderStyle } from '@scandit/web-datacapture-core';
import { LabelCapture, LabelCaptureBasicOverlay } from "@scandit/web-datacapture-label"


// Create the overlay with the label capture mode created earlier
const overlay = await LabelCaptureBasicOverlay.withLabelCapture(mode);
await view.addOverlay(overlay);

// Add a square viewfinder to the overlay to guide users through the capture process
const viewfinder = new RectangularViewfinder(RectangularViewfinderStyle.Square)
await labelCaptureOverlay.setViewfinder(viewfinder)
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary Android views such as text views, icons or images.
:::

## Start the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera):

```js
const camera = Camera.default;
await context.setFrameSource(camera);

const cameraSettings = LabelCapture.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.
camera?.applySettings(cameraSettings);
```

Once the `Camera`, `DataCaptureContext`, `DataCaptureView` and `LabelCapture` are initialized, you can switch on the camera to start capturing labels.

Typically, this is done once the view becomes active and the user granted permission to use the camera, or once the user presses continue scanning after handling a previous scan.

```js
await camera.switchToDesiredState(FrameSourceState.On);
```

Please refer to the available [sample apps](/sdks/web/samples.md) for detailed examples of camera permission handling and view lifecycle management.

## Provide Feedback

Label Capture doesn’t emit feedback (sound or vibration) by default when a new label is recognized, as it may be that the label is not complete and you choose to ignore it and wait for the next recognition.

However, we provide a `Feedback` class that you can use to emit feedback when a label is recognized and successfully processed.

Here, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/web/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

```js
import { Feedback } from '@scandit/web-datacapture-core';

const feedback = Feedback.defaultFeedback();
```

After creating the feedback, you can emit it on successful scans with `feedback.emit()`. See the `LabelCaptureListener` implementation above for more information.

:::note
Audio feedback is only played if the device is not muted.
:::
