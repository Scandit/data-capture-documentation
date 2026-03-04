---
description: "Guide to customizing overlays in the Scandit Web Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: web
keywords:
  - web
---

import ValidationFlowHowItWorks from '../../../partials/advanced/_validation-flow-how-it-works.mdx';
import ValidationFlowCustomButtons from '../../../partials/advanced/_validation-flow-custom-buttons.mdx';
import ValidationFlowTypingHints from '../../../partials/advanced/_validation-flow-typing-hints.mdx';
import ValidationFlowCloudVLM from '../../../partials/advanced/_validation-flow-cloud-vlm.mdx';
import ValidationFlowRequiredOptional from '../../../partials/advanced/_validation-flow-required-optional.mdx';

# Advanced Configurations

## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label captured and [brushForField()](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```js
const overlayListener = LabelCaptureBasicOverlayListener>(() => ({
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

## Validation Flow

<ValidationFlowHowItWorks/>

```js
// Create the overlay
const validationFlowOverlay = await LabelCaptureValidationFlowOverlay.withLabelCaptureForView(
    labelCapture,
    dataCaptureView
);

// Set the listener to receive validation events
validationFlowOverlay.listener = validationFlowListener;
```

### Define a Listener

When the user has verified that all fields are correctly captured and presses the finish button, the Validation Flow triggers a callback with the final results. To receive these results, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-validation-flow-listener.html) interface:

```js
const validationFlowListener = {
    // This is called by the validation flow overlay when a label has been fully captured and validated
    onValidationFlowLabelCaptured: (fields) => {
        const barcodeData = fields.find(f => f.name === "<your-barcode-field-name>")?.barcode?.data;
        const expiryDate = fields.find(f => f.name === "<your-expiry-date-field-name>")?.text;

        // Handle the captured values
    }
};
```

<ValidationFlowRequiredOptional/>

<ValidationFlowCloudVLM/>

```js
const retailItem = await new LabelDefinitionBuilder()
  .addCustomBarcode(
    await new CustomBarcodeBuilder()
      .isOptional(false)
      .setSymbologies([Symbology.EAN13UPCA, Symbology.GS1DatabarExpanded, Symbology.Code128])
      .build("Barcode")
  )
  .addExpiryDateText(
    await new ExpiryDateTextBuilder()
      .isOptional(true)
      .setLabelDateFormat(new LabelDateFormat(LabelDateComponentFormat.MDY))
      .build("Expiry Date")
  )
  .adaptiveRecognitionMode(AdaptiveRecognitionMode.Auto)
  .build("Perishable Product");
```

<ValidationFlowTypingHints/>

```js
const overlaySettings = await LabelCaptureValidationFlowSettings.create();
await overlaySettings.setPlaceholderTextForLabelDefinition("Expiry Date", "MM/DD/YYYY")

overlay.applySettings(overlaySettings)
```

<ValidationFlowCustomButtons/>

#### Adjust Hint Messages

```js
const validationSettings = await LabelCaptureValidationFlowSettings.create();
await validationSettings.setMissingFieldsHintText("Please add this field");
await validationSettings.setStandbyHintText("No label detected, camera paused");
await validationSettings.setValidationHintText("fields captured"); // X/Y (X fields out of total Y) is shown in front of this string
await validationSettings.setValidationErrorText("Input not valid");
await validationSettings.setRequiredFieldErrorText("This field is required");
await validationSettings.setManualInputButtonText("Add info manually");

validationFlowOverlay.applySettings(validationSettings);
```

#### Customize Button Text

```js
const overlaySettings = await LabelCaptureValidationFlowSettings.create();
await overlaySettings.setRestartButtonText("Borrar todo")
await overlaySettings.setPauseButtonText("Pausar")
await overlaySettings.setFinishButtonText("Finalizar")

overlay.applySettings(overlaySettings)
```