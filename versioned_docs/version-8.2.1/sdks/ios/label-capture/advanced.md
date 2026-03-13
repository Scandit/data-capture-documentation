---
description: "Guide to customizing overlays in the Scandit iOS Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

import ValidationFlowHowItWorks from '../../../partials/advanced/_validation-flow-how-it-works.mdx';
import ValidationFlowCustomButtons from '../../../partials/advanced/_validation-flow-custom-buttons.mdx';
import ValidationFlowTypingHints from '../../../partials/advanced/_validation-flow-typing-hints.mdx';
import ValidationFlowCloudVLM from '../../../partials/advanced/_validation-flow-cloud-vlm.mdx';
import ValidationFlowRequiredOptional from '../../../partials/advanced/_validation-flow-required-optional.mdx';
import ValidationFlowCustomToasts from '../../../partials/advanced/_validation-flow-custom-toasts.mdx';
import ValidationFlowCustomField from '../../../partials/advanced/_validation-flow-custom-field.mdx';

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

<ValidationFlowHowItWorks/>

```swift
// Create the overlay
let validationFlowOverlay = LabelCaptureValidationFlowOverlay(
    labelCapture: labelCapture,
    dataCaptureView: dataCaptureView
)

// Set the delegate to receive validation events
validationFlowOverlay.delegate = self
```

### Define a Listener

When the user has verified that all fields are correctly captured and presses the finish button, the Validation Flow triggers a callback with the final results. To receive these results, implement the `LabelCaptureValidationFlowOverlayDelegate` protocol:

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

<ValidationFlowRequiredOptional/>

<ValidationFlowTypingHints/>

```swift
let validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.init()
validationFlowOverlaySettings.setPlaceholderText("MM/DD/YYYY", forLabelDefinition: "Expiry Date")

validationFlowOverlay.apply(validationFlowOverlaySettings)
```

<ValidationFlowCustomButtons/>

```swift
let validationFlowOverlaySettings = LabelCaptureValidationFlowSettings.init()
validationFlowOverlaySettings.restartButtonText = "Borrar todo"
validationFlowOverlaySettings.pauseButtonText = "Pausar"
validationFlowOverlaySettings.finishButtonText = "Finalizar"

validationFlowOverlay.apply(validationFlowOverlaySettings)
```

<ValidationFlowCustomToasts/>

```swift
let validationFlowOverlaySettings = LabelCaptureValidationFlowSettings()
validationFlowOverlaySettings.standbyHintText = "No label detected, camera paused"
validationFlowOverlaySettings.validationHintText = "data fields collected" // X/Y (X fields out of total Y) is shown in front of this string

validationFlowOverlay.applySettings(validationFlowOverlaySettings)
```

<ValidationFlowCustomField/>

```swift
let validationFlowOverlaySettings = LabelCaptureValidationFlowSettings()
validationFlowOverlaySettings.validationErrorText = "Incorrect format."
validationFlowOverlaySettings.scanningText = "Scan in progress"
validationFlowOverlaySettings.adaptiveScanningText = "Processing"

validationFlowOverlay.applySettings(validationFlowOverlaySettings)
```

<ValidationFlowCloudVLM/>

```swift
let labelCaptureSettings = try LabelCaptureSettings {
    LabelDefinition("Retail Item") {
        CustomBarcode(
            name: "Barcode",
            symbologies: [.ean13UPCA, .gs1DatabarExpanded, .code128]
        )
        ExpiryDateText(name: "Expiry Date")
            .labelDateFormat(
                LabelDateFormat(
                    componentFormat: LabelDateComponentFormat.MDY,
                    acceptPartialDates: false
                )
            )
    }
    .adaptiveRecognition(.auto)
}
```

See [AdaptiveRecognitionMode](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/label-definition.html#property-scandit.datacapture.label.LabelDefinition.AdaptiveRecognitionMode) for available options.

