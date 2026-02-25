---
description: "Guide to customizing overlays in the Scandit Android Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

## Customization of the Overlays

### Basic Overlay

To customize the appearance of an overlay you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [LabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField()](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```kotlin
overlay.listener = object : LabelCaptureBasicOverlayListener {
    /*
     * Customize the appearance of the overlay for the individual fields.
     */
    override fun brushForField(
        overlay: LabelCaptureBasicOverlay,
        field: LabelField,
        label: CapturedLabel,
    ): Brush? = when (field.name) {
        "<your-barcode-field-name>" -> Brush(Color.CYAN, Color.CYAN, 1f)
        "<your-expiry-date-field-name>" -> Brush(Color.GREEN, Color.GREEN, 1f)
        else -> Brush(Color.TRANSPARENT, Color.TRANSPARENT, 0f)
    }

    /*
     * Customize the appearance of the overlay for the full label.
     * In this example, we disable label overlays by returning null always.
     */
    override fun brushForLabel(
        overlay: LabelCaptureBasicOverlay,
        label: CapturedLabel,
    ): Brush? = null

    override fun onLabelTapped(
        overlay: LabelCaptureBasicOverlay,
        label: CapturedLabel,
    ) { 
        /*
         * Handle the user tap gesture on the label.
         */
    }
}

```

:::tip
You can also use `LabelCaptureBasicOverlay.setLabelBrush()` and `LabelCaptureBasicOverlay.setCapturedFieldBrush()` to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::

### Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they’re close to expiring, while ignoring other fields.

```kotlin
// Create an advanced overlay that allows for custom views to be added over detected label fields
// This is the key component for implementing Augmented Reality features
val advancedOverlay = LabelCaptureAdvancedOverlay.newInstance(dataCaptureManager.getLabelCapture(), view)

// Configure the advanced overlay with a listener that handles AR content creation and positioning
advancedOverlay.listener = object : LabelCaptureAdvancedOverlayListener {
    
    // This method is called when a label is detected - we return null since we're only adding AR elements to specific fields, not the entire label
    override fun viewForCapturedLabel(
        overlay: LabelCaptureAdvancedOverlay,
        capturedLabel: CapturedLabel,
    ): View? = null

    // This defines where on the detected label the AR view would be anchored 
    override fun anchorForCapturedLabel(
        overlay: LabelCaptureAdvancedOverlay,
        capturedLabel: CapturedLabel,
    ): Anchor = Anchor.CENTER

    // This defines the offset from the anchor point for the label's AR view
    override fun offsetForCapturedLabel(
        overlay: LabelCaptureAdvancedOverlay,
        capturedLabel: CapturedLabel,
        view: View,
    ): PointWithUnit = PointWithUnit(0f, 0f, MeasureUnit.PIXEL)

    // This method is called when a field is detected in a label
    override fun viewForCapturedLabelField(
        overlay: LabelCaptureAdvancedOverlay,
        labelField: LabelField,
    ): View? {
        // We only want to create AR elements for expiry date fields that are text-based
        if (labelField.name.contains("expiry", ignoreCase = true) && labelField.type == LabelFieldType.TEXT) {
        
            //
            // data extraction from expiry date field and days until expiry date calculation
            //
            
            // Check if scanned expiry date is to close to actual date
            if (daysUntilExpiry < dayLimit) {
            
                // Create and configure the AR element - a TextView with appropriate styling
                // This view will appear as an overlay on the camera feed
                return TextView(context).apply {
                
                    text = "Item expires soon!"
                    setTextColor(Color.WHITE)
                    setBackgroundColor(Color.RED)
                    setPadding(16, 8, 16, 8)
                    
                    // Add an icon to the left of the text for visual guidance
                    // This enhances the AR experience by providing clear visual cues
                    val drawable = ContextCompat.getDrawable(context, R.drawable.ic_warning)
                    drawable?.setBounds(0, 0, drawable.intrinsicWidth, drawable.intrinsicHeight)
                    setCompoundDrawables(drawable, null, null, null)
                    compoundDrawablePadding = 16 // Add some padding between icon and text
                }
            }
        }
        // Return null for any fields that aren't expiry dates, which means no AR overlay
        return null
    }
    
    // This defines where on the detected field the AR view should be anchored
    // BOTTOM_CENTER places it right below the expiry date text for better visibility
    override fun anchorForCapturedLabelField(
        overlay: LabelCaptureAdvancedOverlay,
        labelField: LabelField,
    ): Anchor = Anchor.BOTTOM_CENTER

    // This defines the offset from the anchor point
    override fun offsetForCapturedLabelField(
        overlay: LabelCaptureAdvancedOverlay,
        labelField: LabelField,
        view: View,
    ): PointWithUnit = PointWithUnit(0f, 22f, MeasureUnit.DIP)
}
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/android/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```kotlin
// Create the overlay
val validationFlowOverlay = LabelCaptureValidationFlowOverlay.newInstance(
    requireContext(),
    dataCaptureManager.getLabelCapture(),
    view,
)

// Set the listener to receive validation events
validationFlowOverlay.listener = this
```

### Adjust the Hint Messages

```kotlin
// Configure the validation flow with custom settings
val validationSettings = LabelCaptureValidationFlowSettings.newInstance().apply {
    missingFieldsHintText = "Please add this field"
    standbyHintText = "No label detected, camera paused"
    validationHintText = "fields captured" // X/Y (X fields out of total Y) is  shown in front of this string
    validationErrorText = "Input not valid"
    requiredFieldErrorText = "This field is required"
    manualInputButtonText = "Add info manually"
}

// Apply the settings to the overlay
validationFlowOverlay.applySettings(validationSettings)
```

### Define a Listener

To handle validation events, implement the [LabelCaptureValidationFlowOverlayListener](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.

```kotlin
// This is called by the validation flow overlay when a label has been fully captured and validated
override fun onValidationFlowLabelCaptured(fields: List<LabelField>) {
    
    val barcodeData = fields.find { it.name == "<your-barcode-field-name>" }?.barcode?.data
        
    val expiryDate = fields.find { it.name == "<your-expiry-date-field-name>" }?.text
}
```
