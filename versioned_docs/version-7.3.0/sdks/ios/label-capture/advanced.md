---
sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

# Advanced Configurations


## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayDelegate](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#label-capture-basic-overlay-delegate).

The method [brushForLabel](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```swift
import ScanditLabelCapture

extension YourScanViewController: LabelCaptureBasicOverlayDelegate {
    func labelCaptureBasicOverlay(_ overlay: LabelCaptureBasicOverlay,
                                  brushFor field: LabelField,
                                  of label: CapturedLabel) -> Brush? {
        return brush(for: field)
    }

    func labelCaptureBasicOverlay(_ overlay: LabelCaptureBasicOverlay,
                                  brushFor label: CapturedLabel) -> Brush? {
        /*
         * Customize the appearance of the overlay for the full label.
         * In this example, we always disable label overlays by returning nil.
         */
        return nil
    }

    func labelCaptureBasicOverlay(_ overlay: LabelCaptureBasicOverlay,
                                  didTap label: CapturedLabel) {
        /*
         * Handle user tap gestures on the label.
         */
    }

    private func brush(for field: LabelField) -> Brush {
        let fillColor: UIColor
        let strokeColor: UIColor
        switch Field(rawValue: field.name) {
        case "<your-barcode-field-name>":
            fillColor = .systemCyan.withAlphaComponent(0.5)
            strokeColor = .systemCyan
        case "<your-expiry-date-field-name>":
            fillColor = .systemOrange.withAlphaComponent(0.5)
            strokeColor = .systemOrange
        case .none:
            fillColor = .clear
            strokeColor = .clear
        }
        return Brush(fill: fillColor, stroke: strokeColor, strokeWidth: 1)
    }
}
```

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

See the [LabelCaptureValidationFlowSettings](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/ui/label-capture-validation-flow-settings.html) API reference for more details.

### Viewfinder and Layout

| Element             | Default Value                     | Description                                 |
| ------------------- | --------------------------------- | ------------------------------------------- |
| `timeout`           | 10s                               | Max scan duration before transitioning.     |
| `dimming_layer`     | `rgba(0, 0, 0, 0.5)`              | Dim background during frozen states.        |
| `label_viewfinder`  | `RectangularViewfinderStyleLight` | Used in Initial and Validation States.      |
| `label_margins`     | 90% width, 40% height             | Initial/Validation scan frame.              |
| `target_viewfinder` | `RectangularViewfinderStyleLight` | Used in Target Scanning State.              |
| `target_margins`    | 90% width, 15% height             | Focused scan margins for individual fields. |

See the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/ui/label-capture-validation-flow-overlay.html) API reference for more details.
