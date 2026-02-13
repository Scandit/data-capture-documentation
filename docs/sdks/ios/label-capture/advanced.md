---
description: "Guide to customizing overlays in the Scandit iOS Label Capture SDK."
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
        switch field.name {
        case "<your-barcode-field-name>":
            fillColor = .systemCyan.withAlphaComponent(0.5)
            strokeColor = .systemCyan
        case "<your-expiry-date-field-name>":
            fillColor = .systemOrange.withAlphaComponent(0.5)
            strokeColor = .systemOrange
        default:
            fillColor = .clear
            strokeColor = .clear
        }
        return Brush(fill: fillColor, stroke: strokeColor, strokeWidth: 1)
    }
}
```

## Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they're close to expiring, while ignoring other fields.

```swift
import ScanditLabelCapture

// Create an advanced overlay that allows for custom views to be added over detected label fields
// This is the key component for implementing Augmented Reality features
let advancedOverlay = LabelCaptureAdvancedOverlay(labelCapture: labelCapture, view: dataCaptureView)

// Configure the advanced overlay with a delegate that handles AR content creation and positioning
advancedOverlay.delegate = self

extension YourScanViewController: LabelCaptureAdvancedOverlayDelegate {
    
    // This method is called when a label is detected - we return nil since we're only adding AR elements to specific fields, not the entire label
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                     viewFor capturedLabel: CapturedLabel) -> UIView? {
        return nil
    }

    // This defines where on the detected label the AR view would be anchored
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                     anchorFor capturedLabel: CapturedLabel) -> Anchor {
        return .center
    }

    // This defines the offset from the anchor point for the label's AR view
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                    offsetFor capturedLabel: CapturedLabel) -> PointWithUnit {
        return PointWithUnit(x: .zero, y: .zero)
    }

    // This method is called when a field is detected in a label
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                     viewFor labelField: LabelField) -> UIView? {
        // We only want to create AR elements for expiry date fields that are text-based
        if labelField.name.lowercased().contains("expiry") && labelField.type == .text {
            
            // Check if scanned expiry date is too close to actual date
            let daysUntilExpiry = daysUntilExpiry(from: labelField.text) // Your method
            let dayLimit = 3
            
            if daysUntilExpiry < dayLimit {
                // Create and configure the AR element - a UILabel with appropriate styling
                // This view will appear as an overlay on the camera feed
                let warningLabel = UILabel()
                warningLabel.text = "Item expires soon!"
                warningLabel.textColor = .white
                warningLabel.backgroundColor = .red
                warningLabel.textAlignment = .center
                warningLabel.layer.cornerRadius = 8
                warningLabel.layer.masksToBounds = true
                warningLabel.font = UIFont.boldSystemFont(ofSize: 14)
                
                // Add padding
                warningLabel.frame = CGRect(x: 0, y: 0, width: 200, height: 40)
                
                return warningLabel
            }
        }
        // Return nil for any fields that aren't expiry dates, which means no AR overlay
        return nil
    }
    
    // This defines where on the detected field the AR view should be anchored
    // .bottomCenter places it right below the expiry date text for better visibility
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                     anchorFor labelField: LabelField) -> Anchor {
        return .bottomCenter
    }

    // This defines the offset from the anchor point
    func labelCaptureAdvancedOverlay(_ overlay: LabelCaptureAdvancedOverlay,
                                     offsetFor capturedField: LabelField,
                                     of capturedLabel: CapturedLabel) -> PointWithUnit {
        return PointWithUnit(x: .zero, y: .zero)
    }
}
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/ios/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the `LabelCaptureValidationFlowOverlay`. This overlay provides a user interface that guides users through the label capture process, including validation steps.

```swift
// Create the overlay
let validationFlowOverlay = LabelCaptureValidationFlowOverlay(
    labelCapture: labelCapture,
    dataCaptureView: dataCaptureView
)

// Set the delegate to receive validation events
validationFlowOverlay.delegate = self
```

### Adjust the Hint Messages

```swift
// Configure the validation flow with custom settings
let validationSettings = LabelCaptureValidationFlowSettings()
validationSettings.missingFieldsHintText = "Please add this field"
validationSettings.standbyHintText = "No label detected, camera paused"
validationSettings.validationHintText = "fields captured" // X/Y (X fields out of total Y) is shown in front of this string
validationSettings.validationErrorText = "Input not valid"
validationSettings.requiredFieldErrorText = "This field is required"
validationSettings.manualInputButtonText = "Add info manually"

// Apply the settings to the overlay
validationFlowOverlay.applySettings(validationSettings)
```

### Define a Listener

To handle validation events, implement the `LabelCaptureValidationFlowOverlayDelegate` protocol.

```swift
extension YourScanViewController: LabelCaptureValidationFlowDelegate {
    // This is called by the validation flow overlay when a label has been fully captured and validated
    func labelCaptureValidationFlowOverlay(_ overlay: LabelCaptureValidationFlowOverlay,
                                           didCaptureLabelWith fields: [LabelField]) {
        
        let barcodeData = fields.first { $0.name == "<your-barcode-field-name>" }?.barcode?.data
        let expiryDate = fields.first { $0.name == "<your-expiry-date-field-name>" }?.text
        
        // Handle the captured values
    }
}
```

