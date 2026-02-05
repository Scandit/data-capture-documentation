---
description: "In this guide you will learn step-by-step how to add Smart Label Capture to your application.                                                                                    "

sidebar_position: 2
framework: react-native
keywords:
  - react-native
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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/react-native/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a Component to Handle the Capture Process {#create-component}

To start capturing labels, you need to setup and configure the Data Capture Context, Camera, and Label Capture Mode.

You can then add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy to display the camera preview on the screen together with UI elements that guide the user through the capture process.

You can create a component that initializes all the necessary objects and adds the DataCaptureView to the view hierarchy.

```js
import { DataCaptureView } from "scandit-react-native-datacapture-core"

export const YourDataCaptureView = (props: Props) => {
  const { /* ... */ } = props

  const dataCaptureViewRef = useRef<DataCaptureView>(null)

  const [dataCaptureContext] = // see Data Capture Context section
  const camera = // see Camera section

  const labelCapture = useMemo<LabelCapture>(() => {
    // Initialize as described in the Label Capture Mode section
  }, [dataCaptureContext])
  
  const labelCaptureListener = useMemo<LabelCaptureListener>(() => ({
    // Implement a listener as described in the Implement a Listener section
  }), [onLabelCaptured])
  
  const labelCaptureOverlay = useMemo<LabelCaptureBasicOverlay>(() => {
    // Initialize the overlay as described in the Visualize the Scan Process section
  }, [labelCapture])


  // Add listener to the LabelCapture mode
  useEffect(() => {
    labelCapture.addListener(labelCaptureListener)
    return () => {
      labelCapture.removeListener(labelCaptureListener)
    }
  }, [labelCapture, labelCaptureListener])
  
  // Add the overlay to the DataCaptureView
  useEffect(() => {
    const dataCaptureView = dataCaptureViewRef.current
    dataCaptureView?.addOverlay(basicOverlay)
    return () => {
      dataCaptureView?.removeOverlay(basicOverlay)
    }
  }, [basicOverlay, basicOverlayListener])

  // Subscribe to the AppState and start/stop the camera 
  // as described in the Start the Camera section

  return (
    <View style={[
      styles.container,
    ]}>
      <DataCaptureView
        context={dataCaptureContext}
        ref={dataCaptureViewRef}
      />
    </View>
  )
}
```

## Initialize the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## Initialize the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```js
import { useMemo } from 'react';
import { Symbology } from 'scandit-react-native-datacapture-barcode';
import {
  CustomBarcode,
  ExpiryDateText,
  LabelCapture,
  LabelCaptureSettings,
  LabelDefinition,
} from 'scandit-react-native-datacapture-label';

const labelCapture = useMemo<LabelCapture>(() => {
  // Create a barcode field with the expected symbologies.
  const barcodeField = CustomBarcode.initWithNameAndSymbologies('Barcode', [
    Symbology.EAN13UPCA,
    Symbology.Code128,
  ]);
  barcodeField.optional = false;

  // Create an expiry date text field using the ExpiryDateText preset.
  const expiryDateField = new ExpiryDateText('Expiry Date');
  expiryDateField.optional = true;

  // Create a label definition with the fields created above.
  const labelDefinition = new LabelDefinition('Product Label');
  labelDefinition.fields = [barcodeField, expiryDateField];

  // Create the label capture settings from the label definition.
  const settings = LabelCaptureSettings.settingsFromLabelDefinitions([labelDefinition], {});

  // Create the label capture mode with the settings.
  const labelCapture = new LabelCapture(settings);
  
  // Add the mode to the data capture context created earlier.
  dataCaptureContext.addMode(labelCapture);
  
  return labelCapture;
}, [dataCaptureContext]);
```

## Implement a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above. 

Remember to add and remove listeners as described in the [Create Component](#create-component) section.

```js
import { useMemo } from 'react';
import { Feedback } from 'scandit-react-native-datacapture-core';
import { LabelCaptureListener } from 'scandit-react-native-datacapture-label';

const labelCaptureListener = useMemo<LabelCaptureListener>(() => ({
  didUpdateSession: (labelCapture, session) => {
    // The session update callback is called for every processed frame.
    // Early return if no label has been captured.
    if (session.capturedLabels.length === 0) {
      return;
    }
    
    // Process each captured label.
    session.capturedLabels.forEach((capturedLabel) => {
      const fields = capturedLabel.fields;
      
      // Access the barcode field by its name (as defined in the label definition).
      // The barcode property contains the scanned barcode data.
      const barcodeField = fields.find((field) => field.name === 'Barcode');
      const barcodeData = barcodeField?.barcode?.data;
      
      // Access the expiry date field. Use the text property for OCR-captured text,
      // or the asDate() method to get a parsed LabelDateResult.
      const expiryDateField = fields.find((field) => field.name === 'Expiry Date');
      const expiryDateText = expiryDateField?.text;
      const expiryDateResult = expiryDateField?.asDate();

      // Handle the captured data as needed, for example:
      // - Update your app's state
      // - Navigate to a results screen
      // - Send data to your backend
      console.log('Barcode:', barcodeData);
      console.log('Expiry Date:', expiryDateText);
    });

    // Disable label capture to prevent capturing the same labels multiple times.
    // Re-enable it when you're ready to scan again.
    labelCapture.isEnabled = false;

    // Emit feedback to indicate a successful scan.
    // See the Feedback section for customization options.
    Feedback.defaultFeedback.emit();
  }
}), []);
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls the UI elements, such as the viewfinder and overlays, that are shown to visualize captured labels.

To visualize the results of Label Capture, you can choose between two overlays, [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) and [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay).

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`. Remember to add and remove overlays from the data capture view as described in the [Create Component](#create-component) section.

```js
import { useMemo } from 'react';
import { RectangularViewfinder, RectangularViewfinderStyle } from 'scandit-react-native-datacapture-core';
import { LabelCaptureBasicOverlay } from 'scandit-react-native-datacapture-label';

const labelCaptureOverlay = useMemo<LabelCaptureBasicOverlay>(() => {
  // Create the overlay for the label capture mode created earlier.
  const overlay = new LabelCaptureBasicOverlay(labelCapture);
  
  // Optionally, add a viewfinder to guide users through the capture process.
  const viewfinder = new RectangularViewfinder(RectangularViewfinderStyle.Square);
  overlay.viewfinder = viewfinder;
  
  return overlay;
}, [labelCapture]);
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary Android views such as text views, icons or images.
:::

## Start the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html#class-scandit.datacapture.core.Camera):

```js
import { Camera, FrameSourceState } from 'scandit-react-native-datacapture-core';
import { LabelCapture } from 'scandit-react-native-datacapture-label';

// Get the default camera (usually the back-facing camera).
const camera = Camera.default;

// Set the camera as the frame source for the data capture context.
dataCaptureContext.setFrameSource(camera);

// Use the recommended camera settings for label capture.
const cameraSettings = LabelCapture.createRecommendedCameraSettings();

// Depending on the use case, further camera settings adjustments can be made here.
camera?.applySettings(cameraSettings);
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.

Typically, this is done once the view becomes active and the user granted permission to use the camera, or once the user presses continue scanning after handling a previous scan.

```js
// Turn on the camera to start capturing labels.
await camera.switchToDesiredState(FrameSourceState.On);
```

Please refer to the available [sample apps](https://github.com/Scandit/datacapture-react-native-samples) for detailed examples of camera permission handling and view lifecycle management.

## Provide Feedback

Label Capture doesn’t emit feedback (sound or vibration) by default when a new label is recognized, as it may be that the label is not complete and you choose to ignore it and wait for the next recognition.

However, we provide a `Feedback` class that you can use to emit feedback when a label is recognized and successfully processed.

Here, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/react-native/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

```js
import { Feedback } from 'scandit-react-native-datacapture-core';

// Get the default feedback configuration.
const feedback = Feedback.defaultFeedback;
```

After creating the feedback, you can emit it on successful scans with `feedback.emit()`. See the `LabelCaptureListener` implementation above for more information.

:::note
Audio feedback is only played if the device is not muted.
:::