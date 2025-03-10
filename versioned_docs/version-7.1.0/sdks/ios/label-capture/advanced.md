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
