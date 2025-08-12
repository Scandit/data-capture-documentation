---
description: "## Customization of the Overlays                                                                                               "

sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter
---

# Advanced Configurations

## Customization of the Overlays

To customize the appearance of an overlay you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [LabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField()](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```dart
overlay.addListener(LabelCaptureBasicOverlayListener(
  brushForLabel: (overlay, label) {
    return null;
  },
  brushForField: (overlay, field, label) {
    if (field.name == '<your-barcode-field-name>') {
      return Brush(
        fillColor: Colors.blue.withOpacity(0.2),
        strokeColor: Colors.blue,
        strokeWidth: 0,
      );
    }

    if (field.name == '<your-expiry-date-field-name>') {
      return Brush(
        fillColor: Colors.red.withOpacity(0.2),
        strokeColor: Colors.red,
        strokeWidth: 0,
      );
    }

    return null;
  },
));
```

:::tip
You can also use `LabelCaptureBasicOverlay.setLabelBrush()` and `LabelCaptureBasicOverlay.setCapturedFieldBrush()` to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::

### Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they’re close to expiring, while ignoring other fields.

```dart
final advancedOverlay = LabelCaptureAdvancedOverlay.newInstance(
  labelCapture,
  dataCaptureView,
);

advancedOverlay.addListener(LabelCaptureAdvancedOverlayListener(
  viewForCapturedLabel: (overlay, capturedLabel) {
    return null; // We only care about specific fields
  },
  anchorForCapturedLabel: (overlay, capturedLabel) {
    return Anchor.center;
  },
  offsetForCapturedLabel: (overlay, capturedLabel, view) {
    return PointWithUnit.withPixel(0, 0);
  },
  viewForCapturedLabelField: (overlay, labelField) {
    if (labelField.name.toLowerCase().contains("expiry") &&
        labelField.type == LabelFieldType.text) {

      final daysUntilExpiry = daysUntilExpiryFunction(labelField.text); // Your method
      const dayLimit = 3;

      if (daysUntilExpiry < dayLimit) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: Colors.red,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.warning, color: Colors.white),
              SizedBox(width: 8),
              Text("Item expires soon!", style: TextStyle(color: Colors.white)),
            ],
          ),
        );
      }
    }

    return null;
  },
  anchorForCapturedLabelField: (overlay, labelField) {
    return Anchor.bottomCenter;
  },
  offsetForCapturedLabelField: (overlay, labelField, view) {
    return PointWithUnit.withUnit(0, 22, MeasureUnit.dip);
  },
));
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/flutter/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```dart
final validationFlowOverlay = LabelCaptureValidationFlowOverlay.newInstance(
  context,
  labelCapture,
  dataCaptureView,
);

// Set the listener
validationFlowOverlay.addListener(MyValidationFlowListener());
```

### Adjust the Hint Messages

```dart
final validationSettings = LabelCaptureValidationFlowSettings.newInstance();

validationSettings.missingFieldsHintText = "Please add this field";
validationSettings.standbyHintText = "No label detected, camera paused";
validationSettings.validationHintText = "fields captured"; // X/Y (X fields out of total Y) is shown in front
validationSettings.validationErrorText = "Input not valid";
validationSettings.requiredFieldErrorText = "This field is required";
validationSettings.manualInputButtonText = "Add info manually";

// Apply the settings
validationFlowOverlay.applySettings(validationSettings);
```

### Define a Listener

To handle validation events, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.


```dart
class MyValidationFlowListener extends LabelCaptureValidationFlowOverlayListener {
  @override
  void onValidationFlowLabelCaptured(List<LabelField> fields) {
    String? barcodeData;
    String? expiryDate;

    for (final field in fields) {
      if (field.name == "<your-barcode-field-name>") {
        barcodeData = field.barcode?.data;
      } else if (field.name == "<your-expiry-date-field-name>") {
        expiryDate = field.text;
      }
    }

    // Handle the captured values
  }
}
```