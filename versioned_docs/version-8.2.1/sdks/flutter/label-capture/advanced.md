---
description: "Guide to customizing overlays in the Scandit Flutter Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter
---

import ValidationFlowHowItWorks from '../../../partials/advanced/_validation-flow-how-it-works.mdx';
import ValidationFlowCustomButtons from '../../../partials/advanced/_validation-flow-custom-buttons.mdx';
import ValidationFlowTypingHints from '../../../partials/advanced/_validation-flow-typing-hints.mdx';
import ValidationFlowCloudVLM from '../../../partials/advanced/_validation-flow-cloud-vlm.mdx';
import ValidationFlowRequiredOptional from '../../../partials/advanced/_validation-flow-required-optional.mdx';
import ValidationFlowCustomToasts from '../../../partials/advanced/_validation-flow-custom-toasts.mdx';
import ValidationFlowCustomField from '../../../partials/advanced/_validation-flow-custom-field.mdx';

# Advanced Configurations

## Customization of the Overlays

To customize the appearance of an overlay you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [LabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForFieldOfLabel()](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```dart
// Create a custom listener class that implements LabelCaptureBasicOverlayListener.
class MyBasicOverlayListener extends LabelCaptureBasicOverlayListener {
  @override
  Future<Brush?> brushForLabel(LabelCaptureBasicOverlay overlay, CapturedLabel label) async {
    // Use a transparent brush for the label itself.
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

    // Use transparent brush for other fields.
    return null;
  }

  @override
  void didTapLabel(LabelCaptureBasicOverlay overlay, CapturedLabel label) {
    // Handle user tap gestures on the label.
  }
}

// Create the overlay and set the listener.
final overlay = LabelCaptureBasicOverlay(labelCapture);
overlay.listener = MyBasicOverlayListener();
```

:::tip
You can also use `LabelCaptureBasicOverlay.setLabelBrush()` and `LabelCaptureBasicOverlay.setCapturedFieldBrush()` to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::

### Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they’re close to expiring, while ignoring other fields.

```dart
final advancedOverlay = LabelCaptureAdvancedOverlay(labelCapture);
dataCaptureView.addOverlay(advancedOverlay);

advancedOverlay.listener = MyAdvancedOverlayListener();
```

Implement `LabelCaptureAdvancedOverlayListener` as a concrete class. The `widgetForCapturedLabel` and `widgetForCapturedLabelField` callbacks must return a `LabelCaptureAdvancedOverlayWidget` subclass (or `null` to show nothing):

```dart
class MyAdvancedOverlayListener extends LabelCaptureAdvancedOverlayListener {
  @override
  Future<LabelCaptureAdvancedOverlayWidget?> widgetForCapturedLabel(
      LabelCaptureAdvancedOverlay overlay, CapturedLabel capturedLabel) async {
    return null; // We only care about specific fields
  }

  @override
  Future<Anchor> anchorForCapturedLabel(
      LabelCaptureAdvancedOverlay overlay, CapturedLabel capturedLabel) async {
    return Anchor.center;
  }

  @override
  Future<PointWithUnit> offsetForCapturedLabel(
      LabelCaptureAdvancedOverlay overlay, CapturedLabel capturedLabel) async {
    return PointWithUnit(DoubleWithUnit(0, MeasureUnit.pixel), DoubleWithUnit(0, MeasureUnit.pixel));
  }

  @override
  Future<LabelCaptureAdvancedOverlayWidget?> widgetForCapturedLabelField(
      LabelCaptureAdvancedOverlay overlay, LabelField labelField) async {
    if (labelField.name.toLowerCase().contains("expiry") &&
        labelField.type == LabelFieldType.text) {
      final daysUntilExpiry = daysUntilExpiryFunction(labelField.text); // Your method
      const dayLimit = 3;

      if (daysUntilExpiry < dayLimit) {
        // Return your custom LabelCaptureAdvancedOverlayWidget subclass here
      }
    }
    return null;
  }

  @override
  Future<Anchor> anchorForCapturedLabelField(
      LabelCaptureAdvancedOverlay overlay, LabelField labelField) async {
    return Anchor.bottomCenter;
  }

  @override
  Future<PointWithUnit> offsetForCapturedLabelField(
      LabelCaptureAdvancedOverlay overlay, LabelField labelField) async {
    return PointWithUnit(DoubleWithUnit(0, MeasureUnit.dip), DoubleWithUnit(22, MeasureUnit.dip));
  }
}
```

## Validation Flow

<ValidationFlowHowItWorks/>

```dart
final validationFlowOverlay = LabelCaptureValidationFlowOverlay(labelCapture);
dataCaptureView.addOverlay(validationFlowOverlay);

// Set the listener
validationFlowOverlay.listener = MyValidationFlowListener();
```

### Define a Listener

When the user has verified that all fields are correctly captured and presses the finish button, the Validation Flow triggers a callback with the final results. To receive these results, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-validation-flow-listener.html) interface:

```dart
class MyValidationFlowListener extends LabelCaptureValidationFlowListener {
  @override
  void didCaptureLabelWithFields(List<LabelField> fields) {
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

<ValidationFlowRequiredOptional/>

<ValidationFlowTypingHints/>

```dart
final validationFlowOverlaySettings = LabelCaptureValidationFlowSettings();
validationFlowOverlaySettings.setPlaceholderTextForLabelDefinition("Expiry Date", "MM/DD/YYYY");

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomButtons/>

```dart
final validationFlowOverlaySettings = LabelCaptureValidationFlowSettings();
validationFlowOverlaySettings.restartButtonText = "Borrar todo";
validationFlowOverlaySettings.pauseButtonText = "Pausar";
validationFlowOverlaySettings.finishButtonText = "Finalizar";

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomToasts/>

```dart
final validationFlowOverlaySettings = LabelCaptureValidationFlowSettings();
validationFlowOverlaySettings.standbyHintText = "No label detected, camera paused";
validationFlowOverlaySettings.validationHintText = "data fields collected"; // X/Y (X fields out of total Y) is shown in front

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomField/>

```dart
final validationFlowOverlaySettings = LabelCaptureValidationFlowSettings();
validationFlowOverlaySettings.validationErrorText = "Incorrect format.";
validationFlowOverlaySettings.scanningText = "Scan in progress";
validationFlowOverlaySettings.adaptiveScanningText = "Processing";

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCloudVLM/>

```dart
LabelCaptureSettings _buildLabelCaptureSettings() {
    final customBarcode = CustomBarcodeBuilder()
        .setSymbologies([Symbology.ean13Upca, Symbology.gs1DatabarExpanded, Symbology.code128])
        .isOptional(false)
        .build(Constants.fieldBarcode);

    final expiryDateText = ExpiryDateTextBuilder()
        .setLabelDateFormat(
          LabelDateFormat(
            LabelDateComponentFormat.mdy,
            false, // acceptPartialDates
          ),
        )
        .isOptional(false)
        .build(Constants.fieldExpiryDate);

    final labelDefinition = LabelDefinitionBuilder()
        .addCustomBarcode(customBarcode)
        .addExpiryDateText(expiryDateText)
        .build(Constants.labelRetailItem);
    labelDefinition.adaptiveRecognitionMode = AdaptiveRecognitionMode.auto;

    var settings = LabelCaptureSettings([labelDefinition]);
    return settings;
}
```

See [AdaptiveRecognitionMode](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-definition.html#property-scandit.datacapture.label.LabelDefinition.AdaptiveRecognitionMode) for available options.