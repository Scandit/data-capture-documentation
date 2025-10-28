---
description: "Guide to customizing overlays in the Scandit React Native Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: react-native
keywords:
  - react-native
---

# Advanced Configurations

## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label captured and [brushForField()](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```js
const overlayListener = useMemo<LabelCaptureBasicOverlayListener>(() => ({
    brushForFieldOfLabel: (_, field) => {
      switch (field.name) {
      case "<your-barcode-field-name>":
        return new Brush(
          "rgba(0, 255, 255, 0.5)",
          "rgba(0, 255, 255, 0.5)",
          0)
      case "<your-expiry-date-field-name>":
        return new Brush(
          "rgba(255, 165, 0, 0.5)",
          "rgba(255, 165, 0, 0.5)",
          0)
      default:
        return new Brush(
          Colors.transparentColor,
          Colors.transparentColor,
          0)
    },
    brushForLabel() {
      return new Brush(Colors.transparentColor, Colors.transparentColor, 0)
    },
    didTapLabel() {
      /*
       * Handle user tap gestures on the label.
       */
    }
  }), [])

useEffect(() => {
    /*
     * Assign the overlay listener to the overlay
     * before adding it to the data capture view.
     */
    overlay.listener = overlayListener
    const dataCaptureView = dataCaptureViewRef.current
    dataCaptureView.addOverlay(overlay)
    return () => {
        /*
         * Unassign the overlay listener from the overlay
         * before removing it from the data capture view.
         */
        overlay.listener = null
        dataCaptureView?.removeOverlay(overlay)
    }
}, [])
```

:::tip
Use brush colors with transparency (alpha < 100%) to not occlude the captured barcodes or texts.
:::

## Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they're close to expiring, while ignoring other fields.

```jsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Create an advanced overlay that allows for custom views to be added over detected label fields
// This is the key component for implementing Augmented Reality features
const advancedOverlay = useMemo(() => {
  return new LabelCaptureAdvancedOverlay(labelCapture, dataCaptureView);
}, [labelCapture, dataCaptureView]);

// Configure the advanced overlay with a listener that handles AR content creation and positioning
const advancedOverlayListener = useMemo(() => ({
  // This method is called when a label is detected - we return null since we're only adding AR elements to specific fields, not the entire label
  viewForCapturedLabel: (overlay, capturedLabel) => {
    return null;
  },

  // This defines where on the detected label the AR view would be anchored
  anchorForCapturedLabel: (overlay, capturedLabel) => {
    return Anchor.Center;
  },

  // This defines the offset from the anchor point for the label's AR view
  offsetForCapturedLabel: (overlay, capturedLabel, view) => {
    return new PointWithUnit(0, 0, MeasureUnit.Pixel);
  },

  // This method is called when a field is detected in a label
  viewForCapturedLabelField: (overlay, labelField) => {
    // We only want to create AR elements for expiry date fields that are text-based
    if (labelField.name.toLowerCase().includes("expiry") && labelField.type === LabelFieldType.Text) {
      
      // Check if scanned expiry date is too close to actual date
      const daysUntilExpiry = daysUntilExpiryFunction(labelField.text); // Your method
      const dayLimit = 3;
      
      if (daysUntilExpiry < dayLimit) {
        // Create and configure the AR element - a React Native View with appropriate styling
        // This view will appear as an overlay on the camera feed
        return (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>Item expires soon!</Text>
          </View>
        );
      }
    }
    // Return null for any fields that aren't expiry dates, which means no AR overlay
    return null;
  },
  
  // This defines where on the detected field the AR view should be anchored
  // BottomCenter places it right below the expiry date text for better visibility
  anchorForCapturedLabelField: (overlay, labelField) => {
    return Anchor.BottomCenter;
  },

  // This defines the offset from the anchor point
  offsetForCapturedLabelField: (overlay, labelField, view) => {
    return new PointWithUnit(0, 22, MeasureUnit.Dip);
  }
}), []);

const styles = StyleSheet.create({
  warningContainer: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

useEffect(() => {
  // Assign the overlay listener to the overlay
  advancedOverlay.listener = advancedOverlayListener;
  
  return () => {
    // Clean up
    advancedOverlay.listener = null;
  };
}, [advancedOverlay, advancedOverlayListener]);
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/react-native/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the `LabelCaptureValidationFlowOverlay`. This overlay provides a user interface that guides users through the label capture process, including validation steps.

```jsx
import React, { useMemo } from 'react';

const validationFlowOverlay = useMemo(() => {
  return new LabelCaptureValidationFlowOverlay(labelCapture, dataCaptureView);
}, [labelCapture, dataCaptureView]);

// Set the listener to receive validation events
useEffect(() => {
  validationFlowOverlay.listener = validationFlowListener;
  
  return () => {
    validationFlowOverlay.listener = null;
  };
}, [validationFlowOverlay, validationFlowListener]);
```

### Adjust the Hint Messages

```jsx
import React, { useMemo } from 'react';

const validationSettings = useMemo(() => {
  const settings = new LabelCaptureValidationFlowSettings();
  settings.missingFieldsHintText = "Please add this field";
  settings.standbyHintText = "No label detected, camera paused";
  settings.validationHintText = "fields captured"; // X/Y (X fields out of total Y) is shown in front of this string
  settings.validationErrorText = "Input not valid";
  settings.requiredFieldErrorText = "This field is required";
  settings.manualInputButtonText = "Add info manually";
  
  return settings;
}, []);

// Apply the settings to the overlay
useEffect(() => {
  validationFlowOverlay.applySettings(validationSettings);
}, [validationFlowOverlay, validationSettings]);
```

### Define a Listener

To handle validation events, implement the `LabelCaptureValidationFlowOverlayListener` interface.

```jsx
const validationFlowListener = useMemo(() => ({
  // This is called by the validation flow overlay when a label has been fully captured and validated
  onValidationFlowLabelCaptured: (fields) => {
    let barcodeData = null;
    let expiryDate = null;

    fields.forEach(field => {
      if (field.name === "<your-barcode-field-name>") {
        barcodeData = field.barcode?.data;
      } else if (field.name === "<your-expiry-date-field-name>") {
        expiryDate = field.text;
      }
    });

    // Handle the captured values
  }
}), []);
```
