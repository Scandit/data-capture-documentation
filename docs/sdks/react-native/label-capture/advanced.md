---
description: "## Customize the Overlay Appearance                                                                                               "

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

## Validation Flow

Validation Flow is a workflow available in Smart Label Capture to improve the accuracy and completeness of scanned label data in real-world environments. The following settings and configurations are available to customize the validation flow:

### UI Elements

| Constant                | Default Value                          | Description                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| `missingFieldErrorText` | `This field is required.`              | Shown under the field when it's left empty. |
| `missingFieldHintText`  | `Please fill in missing fields.`       | Displayed when required fields are missing. |
| `standbyHintText`       | `Scanning paused to conserve battery.` | Used in Standby State.                      |
| `validationHintText`    | `label fields captured.`               | Displays scan status before this message.   |
| `validationErrorText`   | `Invalid input.`                       | Appears on incorrect manual input.          |
| `manualInputButtonText` | `Input manually`                       | Label for the manual input button.          |

See the [LabelCaptureValidationFlowSettings](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-validation-flow-settings.html) API reference for more details.

### Viewfinder and Layout

| Element             | Default Value                     | Description                                 |
| ------------------- | --------------------------------- | ------------------------------------------- |
| `timeout`           | 10s                               | Max scan duration before transitioning.     |
| `dimming_layer`     | `rgba(0, 0, 0, 0.5)`              | Dim background during frozen states.        |
| `label_viewfinder`  | `RectangularViewfinderStyleLight` | Used in Initial and Validation States.      |
| `label_margins`     | 90% width, 40% height             | Initial/Validation scan frame.              |
| `target_viewfinder` | `RectangularViewfinderStyleLight` | Used in Target Scanning State.              |
| `target_margins`    | 90% width, 15% height             | Focused scan margins for individual fields. |

See the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api/ui/label-capture-validation-flow-overlay.html) API reference for more details.