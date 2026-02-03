---
description: "Guide to customizing overlays in the Scandit Web Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Advanced Configurations

## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label captured and [brushForFieldOfLabel()](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```js
// Create the overlay for the label capture mode.
const overlay = new LabelCaptureBasicOverlay(labelCapture);

// Set the listener to customize the appearance of captured labels and fields.
overlay.listener = {
    /**
     * Called for each field of a captured label to determine its brush.
     * Return a Brush to customize the field's appearance, or null to use the default.
     */
    brushForFieldOfLabel: (overlay, field, label) => {
        // Create colors with transparency (alpha 0.5 = 50% opacity).
        const cyanColor = Color.fromRGBA(0, 255, 255, 0.5);
        const orangeColor = Color.fromRGBA(255, 165, 0, 0.5);

        switch (field.name) {
            case "<your-barcode-field-name>":
                // Highlight barcode fields with a cyan color.
                return new Brush(cyanColor, cyanColor, 0);
            case "<your-expiry-date-field-name>":
                // Highlight expiry date fields with an orange color.
                return new Brush(orangeColor, orangeColor, 0);
            default:
                // Use a transparent brush for other fields.
                return Brush.transparent;
        }
    },
    /**
     * Called for each captured label to determine its brush.
     * Return a Brush to customize the label's appearance, or null to use the default.
     */
    brushForLabel: (overlay, label) => {
        // Use a transparent brush for the label itself.
        return Brush.transparent;
    },
    /**
     * Called when the user taps on a label.
     */
    didTapLabel: (overlay, label) => {
        // Handle user tap gestures on the label.
    }
};

// Add the overlay to the data capture view.
dataCaptureView.addOverlay(overlay);
```

:::tip
Use brush colors with transparency (alpha < 100%) to not occlude the captured barcodes or texts.
:::

## Validation Flow

Validation Flow is a workflow available in Smart Label Capture to improve the accuracy and completeness of scanned label data in real-world environments. See the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-validation-flow-overlay.html) and [LabelCaptureValidationFlowSettings](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-validation-flow-settings.html) API references for implementation details.
