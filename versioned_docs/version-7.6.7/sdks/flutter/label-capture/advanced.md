---
description: "Guide to customizing overlays in the Scandit Flutter Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter
---

# Advanced Configurations

## Customization of the Overlays

To customize the appearance of an overlay you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [LabelCaptureAdvancedOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [brushForLabel()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```dart
// Create a custom listener class that implements LabelCaptureBasicOverlayListener.
class MyBasicOverlayListener implements LabelCaptureBasicOverlayListener {
  @override
  Future<Brush?> brushForLabel(LabelCaptureBasicOverlay overlay, CapturedLabel label) async {
    // Return null to use the default brush for the label.
    return null;
  }

  @override
  Future<Brush?> brushForFieldOfLabel(
      LabelCaptureBasicOverlay overlay, LabelField field, CapturedLabel label) async {
    if (field.name == 'Barcode') {
      // Highlight barcode fields with a cyan color.
      return Brush(
        Color.fromRGBO(0, 255, 255, 0.5),
        Color.fromRGBO(0, 255, 255, 0.5),
        0,
      );
    }

    if (field.name == 'Expiry Date') {
      // Highlight expiry date fields with an orange color.
      return Brush(
        Color.fromRGBO(255, 165, 0, 0.5),
        Color.fromRGBO(255, 165, 0, 0.5),
        0,
      );
    }

    // Return null to use the default brush for other fields.
    return null;
  }

  @override
  void didTapLabel(LabelCaptureBasicOverlay overlay, CapturedLabel label) {
    // Handle user tap gestures on the label.
  }
}

// Set the listener on the overlay.
overlay.listener = MyBasicOverlayListener();
```

:::tip
You can also use the `labelBrush` and `capturedFieldBrush` properties on `LabelCaptureBasicOverlay` to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::

### Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they’re close to expiring, while ignoring other fields.

```dart
// Create the advanced overlay.
final advancedOverlay = LabelCaptureAdvancedOverlay.newInstance(
  labelCapture,
  dataCaptureView,
);

// Create a custom listener class that implements LabelCaptureAdvancedOverlayListener.
class MyAdvancedOverlayListener implements LabelCaptureAdvancedOverlayListener {
  @override
  Widget? viewForCapturedLabel(LabelCaptureAdvancedOverlay overlay, CapturedLabel label) {
    return null; // We only care about specific fields.
  }

  @override
  Anchor anchorForCapturedLabel(LabelCaptureAdvancedOverlay overlay, CapturedLabel label) {
    return Anchor.center;
  }

  @override
  PointWithUnit offsetForCapturedLabel(
      LabelCaptureAdvancedOverlay overlay, CapturedLabel label, Widget? view) {
    return PointWithUnit(0, 0, MeasureUnit.pixel);
  }

  @override
  Widget? viewForCapturedLabelField(LabelCaptureAdvancedOverlay overlay, LabelField field) {
    if (field.name.toLowerCase().contains('expiry') && field.type == LabelFieldType.text) {
      // Your method to calculate days until expiry.
      final daysUntilExpiry = calculateDaysUntilExpiry(field.text);
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
              Text('Item expires soon!', style: TextStyle(color: Colors.white)),
            ],
          ),
        );
      }
    }
    return null;
  }

  @override
  Anchor anchorForCapturedLabelField(LabelCaptureAdvancedOverlay overlay, LabelField field) {
    return Anchor.bottomCenter;
  }

  @override
  PointWithUnit offsetForCapturedLabelField(
      LabelCaptureAdvancedOverlay overlay, LabelField field, Widget? view) {
    return PointWithUnit(0, 22, MeasureUnit.dip);
  }
}

// Set the listener on the advanced overlay.
advancedOverlay.listener = MyAdvancedOverlayListener();
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/flutter/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```dart
// Create the validation flow overlay.
final validationFlowOverlay = LabelCaptureValidationFlowOverlay.newInstance(
  dataCaptureContext,
  labelCapture,
  dataCaptureView,
);

// Set the listener.
validationFlowOverlay.listener = MyValidationFlowListener();
```

### Adjust the Hint Messages

```dart
// Create and configure validation flow settings.
final validationSettings = LabelCaptureValidationFlowSettings();

validationSettings.missingFieldsHintText = 'Please add this field';
validationSettings.standbyHintText = 'No label detected, camera paused';
validationSettings.validationHintText = 'fields captured'; // X/Y (X fields out of total Y) is shown in front
validationSettings.validationErrorText = 'Input not valid';
validationSettings.requiredFieldErrorText = 'This field is required';
validationSettings.manualInputButtonText = 'Add info manually';

// Apply the settings to the overlay.
validationFlowOverlay.applySettings(validationSettings);
```

### Define a Listener

To handle validation events, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.


```dart
// Create a custom listener class that implements LabelCaptureValidationFlowOverlayListener.
class MyValidationFlowListener implements LabelCaptureValidationFlowOverlayListener {
  @override
  void didCompleteLabelCapture(List<LabelField> fields) {
    String? barcodeData;
    String? expiryDate;

    for (final field in fields) {
      if (field.name == 'Barcode') {
        barcodeData = field.barcode?.data;
      } else if (field.name == 'Expiry Date') {
        expiryDate = field.text;
      }
    }

    // Handle the captured values.
    print('Barcode: $barcodeData, Expiry: $expiryDate');
  }
}
```