---
toc_max_heading_level: 4
framework: xamarinAndroid
keywords:
  - xamarinAndroid
---

import DeprecationNotice from '/docs/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>

# Advanced Configurations

## Customization of the Overlays

To customize the appearance of an overlay you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [LabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField()](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```csharp
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.Data;

var overlay = LabelCaptureBasicOverlay.Create(labelCapture, dataCaptureView);
overlay.AddListener(new LabelCaptureBasicOverlayListener(
    brushForLabel: (overlay, label) => {
        return null;
    },
    brushForField: (overlay, field, label) => {
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

```csharp
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.Data;

var overlay = LabelCaptureAdvancedOverlay.Create(labelCapture, dataCaptureView);
overlay.AddListener(new LabelCaptureAdvancedOverlayListener(
    brushForLabel: (overlay, label) => {
        return null;
    },
    brushForField: (overlay, field, label) => {
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

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/xamarin/android/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```csharp
var validationFlowOverlay = LabelCaptureValidationFlowOverlay.Create(
  context,
  labelCapture,
  dataCaptureView
);

// Set the listener
validationFlowOverlay.AddListener(new MyValidationFlowListener());
```

### Adjust the Hint Messages

```csharp
var validationFlowOverlay = LabelCaptureValidationFlowOverlay.Create(
  context,
  labelCapture,
  dataCaptureView
);

// Set the listener
validationFlowOverlay.AddListener(new MyValidationFlowListener());
```

### Define a Listener

To handle validation events, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.

```csharp
var MyValidationFlowListener = new LabelCaptureValidationFlowOverlayListener(
    onValidationFlowLabelCaptured: (fields) => {
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
);
```