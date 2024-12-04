---
sidebar_position: 2
framework: react-native
keywords:
  - react-native
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Initialize the Data Capture Context
- Initialize the Label Capture Mode
- Implement a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/react-native/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Initialize the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Initialize the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object. 
It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```js
import { Symbology } from "scandit-react-native-datacapture-barcode"
import {
  CustomBarcode,
  LabelCapture,
  LabelCaptureSettings,
  LabelDefinition
} from "scandit-react-native-datacapture-label"

/*
 * Create a barcode field with the expected symbologies
 */
const barcodeField = new CustomBarcode.initWithNameAndSymbologies('<your-barcode-field-name>', [Symbology.EAN13_UPCA, Symbology.CODE128]);

/*
 * Create a expiry date text field, using the ExpiryDateText preset
 */
const expiryDateField = new ExpiryDateText('<your-expiry-date-field-name>')
expiryDateField.optional = true 

/*
 * Create a label definition with the fields created above
 */
const labelDefinition = new LabelDefinition('<your-label-name>');
labelDefinition.fields = [
    barcodeField,
    expiryDateField,
];

const settings = LabelCaptureSettings.settingsFromLabelDefinitions([labelDefinition], {})!

/*
 * Create the label capture mode with the settings and data capture context created earlier
 */
const labelCapture = LabelCapture.forContext(dataCaptureContext, settings);
```

## Implement a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above:

```js
import { CapturedLabel, LabelCaptureListener } from 'scandit-react-native-datacapture-label';

const labelCaptureListener = useMemo<LabelCaptureListener>(() => ({
  didUpdateSession(_, session) {
    /* 
     * The session update callback is called for every processed frame.
     * Check if the session contains any captured labels; if not, continue capturing.
     */
    if (!session.capturedLabels.length) {
      return
    }

    for (const capturedLabel of session.capturedLabels) {
      onCapturedLabel(capturedLabel)
    }
  }
}), [onCapturedLabel])

const onCapturedLabel = useCallback((capturedLabel: CapturedLabel) => {
  /* 
   * Given the label capture settings defined above, barcode data will always be present.
   */
  const barcodeData = capturedLabel.fields
    .find(field => field.name === '<your-barcode-field-name>')?.barcode?.data
  
  /* 
   * The expiry date is an optional field.
   * Check for null in your result handling.
   */
  const expiryDate = capturedLabel.fields
    .find(field => field.name === '<your-expiry-date-field-name>')?.text

  /* 
   * Handle the results for barcode and expiry date as needed ...
   */

  /* 
   * Disable the label capture mode after a label has been captured
   * to prevent it from capturing the same label multiple times.
   */
  labelCapture.isEnabled = false

  /* 
   * You may want to communicate a successful scan with feedback.emit() here.
   * See the Feedback section for more information.
   */
  feedback.emit()
}, [/* ... */])

useEffect(() => {
  labelCapture.addListener(labelCaptureListener)
  return () => {
    labelCapture.removeListener(labelCaptureListener)
  }
}, [labelCapture, labelCaptureListener])
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.

To visualize the results of Label Capture, you can choose between two overlays, [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) and [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay).

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

```js
import { DataCaptureView, RectangularViewfinder, RectangularViewfinderStyle, SizeWithUnit, MeasureUnit, NumberWithUnit } from 'scandit-react-native-datacapture-core';
import { LabelCapture, LabelCaptureBasicOverlay } from "scandit-react-native-datacapture-label"

const dataCaptureViewRef = useRef<DataCaptureView>(null)
const basicOverlay = useMemo<LabelCaptureBasicOverlay>(() => {
    const basicOverlay = LabelCaptureBasicOverlay
      .withLabelCapture(labelCapture)
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square)
    basicOverlay.viewfinder = viewfinder
    return basicOverlay
  }, [labelCapture])

useEffect(() => {
  const dataCaptureView = dataCaptureViewRef.current
  dataCaptureView?.addOverlay(basicOverlay)
  return () => {
    dataCaptureView?.removeOverlay(basicOverlay)
  }
}, [basicOverlay])
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary Android views such as text views, icons or images.
:::

## Start the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html#class-scandit.datacapture.core.Camera):

```js
const camera = Camera.default;
context.setFrameSource(camera);

const cameraSettings = IdCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

if (camera != null) {
	camera.applySettings(cameraSettings);
}
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.
Typically, this is done once the view becomes active and the user granted permission to use the camera, or once the user pressed continue scanning after handling a previous scan.

```js
camera.switchToDesiredState(FrameSourceState.ON);
```

## Provide Feedback

Label Capture, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new label is recognized, as it may be that the label is not complete and you choose to ignore it and wait for the next recognition.

However, we provide a `Feedback` class that you can use to emit feedback when a label is recognized and successfully processed. Here, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

```js
import { Feedback } from 'scandit-react-native-datacapture-core';

const feedback = Feedback.defaultFeedback();
```

After creating the feedback, you can emit it on successful scans with `feedback.emit()`. See the `LabelCaptureListener` implementation above for more information.

:::note
Audio feedback is only played if the device is not muted.
:::