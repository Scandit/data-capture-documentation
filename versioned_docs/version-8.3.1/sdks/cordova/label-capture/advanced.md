---
description: "Guide to customizing overlays in the Scandit Web Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: cordova
keywords:
  - cordova
---

import ValidationFlowHowItWorks from '../../../partials/advanced/_validation-flow-how-it-works.mdx';
import ValidationFlowCustomButtons from '../../../partials/advanced/_validation-flow-custom-buttons.mdx';
import ValidationFlowTypingHints from '../../../partials/advanced/_validation-flow-typing-hints.mdx';
import ValidationFlowCloudVLM from '../../../partials/advanced/_validation-flow-cloud-vlm.mdx';
import ReceiptScanning from '../../../partials/advanced/_receipt-scanning.mdx';
import ValidationFlowRequiredOptional from '../../../partials/advanced/_validation-flow-required-optional.mdx';
import ValidationFlowCustomToasts from '../../../partials/advanced/_validation-flow-custom-toasts.mdx';
import ValidationFlowCustomField from '../../../partials/advanced/_validation-flow-custom-field.mdx';

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

<ValidationFlowHowItWorks/>

```js
// Create the overlay
const validationFlowOverlay = new LabelCaptureValidationFlowOverlay(labelCapture);
dataCaptureView.addOverlay(validationFlowOverlay);

// Set the listener to receive validation events
validationFlowOverlay.listener = validationFlowListener;
```

### Define a Listener

When the user has verified that all fields are correctly captured and presses the finish button, the Validation Flow triggers a callback with the final results. To receive these results, implement the [LabelCaptureValidationFlowListener](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/ui/label-capture-validation-flow-listener.html) interface:

```js
const validationFlowListener = {
    // This is called by the validation flow overlay when a label has been fully captured and validated
    didCaptureLabelWithFields: (fields) => {
        const barcodeData = fields.find(f => f.name === "<your-barcode-field-name>")?.barcode?.data;
        const expiryDate = fields.find(f => f.name === "<your-expiry-date-field-name>")?.text;

        // Handle the captured values
    }
};
```

<ValidationFlowRequiredOptional/>

<ValidationFlowTypingHints/>

```js
const validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.create();
validationFlowOverlaySettings.setPlaceholderTextForLabelDefinition("Expiry Date", "MM/DD/YYYY");

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomButtons/>

```js
const validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.create();
validationFlowOverlaySettings.restartButtonText = "Borrar todo";
validationFlowOverlaySettings.pauseButtonText = "Pausar";
validationFlowOverlaySettings.finishButtonText = "Finalizar";

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomToasts/>

```js
const validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.create();
validationFlowOverlaySettings.standbyHintText = "No label detected, camera paused";
validationFlowOverlaySettings.validationHintText = "data fields collected"; // X/Y (X fields out of total Y) is shown in front of this string

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCustomField/>

```js
const validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.create();
validationFlowOverlaySettings.validationErrorText = "Incorrect format.";
validationFlowOverlaySettings.scanningText = "Scan in progress";
validationFlowOverlaySettings.adaptiveScanningText = "Processing";

validationFlowOverlay.applySettings(validationFlowOverlaySettings);
```

<ValidationFlowCloudVLM/>

```js
const customBarcode = CustomBarcode.initWithNameAndSymbologies('Barcode', [
  Symbology.EAN13UPCA,
  Symbology.GS1DatabarExpanded,
  Symbology.Code128,
]);
customBarcode.optional = false;

const expiryDateText = new ExpiryDateText('Expiry Date');
expiryDateText.labelDateFormat = new LabelDateFormat(LabelDateComponentFormat.MDY, false);
expiryDateText.optional = false;

const label = new LabelDefinition('Retail Item');
label.fields = [customBarcode, expiryDateText];
label.adaptiveRecognitionMode = AdaptiveRecognitionMode.Auto;

const settings = LabelCaptureSettings.settingsFromLabelDefinitions([label], {});
```

See [AdaptiveRecognitionMode](https://docs.scandit.com/data-capture-sdk/cordova/label-capture/api/label-definition.html#property-scandit.datacapture.label.LabelDefinition.AdaptiveRecognitionMode) for available options.

<ReceiptScanning/>
