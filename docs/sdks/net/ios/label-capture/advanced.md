---
description: "Guide to customizing overlays in the Scandit .NET iOS Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: net-ios
keywords:
  - net-ios
---

# Advanced Configurations

## Customization of the Overlays

### Basic Overlay

To customize the appearance of an overlay you can implement a [ILabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [ILabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [BrushForLabel()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [BrushForField()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```csharp
public class BasicOverlayListener : NSObject, ILabelCaptureBasicOverlayListener
{
    private readonly Brush upcBrush = new(
        fillColor: UIColor.FromRGB(46, 193, 206),    // #2EC1CE
        strokeColor: UIColor.FromRGB(46, 193, 206),
        strokeWidth: 1f);
    private readonly Brush expiryDateBrush = new(
        fillColor: UIColor.FromRGB(250, 68, 70),     // #FA4446
        strokeColor: UIColor.FromRGB(250, 68, 70),
        strokeWidth: 1f);
    private readonly Brush transparentBrush = Brush.TransparentBrush;

    /*
     * Customize the appearance of the overlay for the individual fields.
     */
    public Brush? BrushForField(
        LabelCaptureBasicOverlay overlay,
        LabelField field,
        CapturedLabel label)
    {
        return field.Name switch
        {
            "barcode" => this.upcBrush,
            "expiry_date" => this.expiryDateBrush,
            _ => null
        };
    }

    /*
     * Customize the appearance of the overlay for the full label.
     * In this example, we disable label overlays by returning a transparent brush.
     */
    public Brush? BrushForLabel(
        LabelCaptureBasicOverlay overlay,
        CapturedLabel label)
    {
        return this.transparentBrush;
    }

    public void OnLabelTapped(
        LabelCaptureBasicOverlay overlay,
        CapturedLabel label)
    {
        /*
         * Handle the user tap gesture on the label.
         */
    }
}

// Set the listener on the overlay
overlay.Listener = new BasicOverlayListener();
```

:::tip
You can also use `LabelCaptureBasicOverlay.LabelBrush`, `LabelCaptureBasicOverlay.CapturedFieldBrush`, and `LabelCaptureBasicOverlay.PredictedFieldBrush` properties to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::

### Advanced Overlay

For more advanced use cases, such as adding custom views or implementing Augmented Reality (AR) features, you can use the `LabelCaptureAdvancedOverlay`. The example below creates an advanced overlay, configuring it to display a styled warning message below expiry date fields when they're close to expiring, while ignoring other fields.

```csharp
// Create an advanced overlay that allows for custom views to be added over detected label fields
// This is the key component for implementing Augmented Reality features
var advancedOverlay = LabelCaptureAdvancedOverlay.Create(labelCapture);

// Add the overlay to the data capture view
dataCaptureView.AddOverlay(advancedOverlay);

// Configure the advanced overlay with a listener that handles AR content creation and positioning
advancedOverlay.Listener = new AdvancedOverlayListener();

public class AdvancedOverlayListener : NSObject, ILabelCaptureAdvancedOverlayListener
{
    // This method is called when a label is detected - we return null since we're only adding AR elements to specific fields, not the entire label
    public UIView? ViewForCapturedLabel(
        LabelCaptureAdvancedOverlay overlay,
        CapturedLabel capturedLabel)
    {
        return null;
    }

    // This defines where on the detected label the AR view would be anchored
    public Anchor AnchorForCapturedLabel(
        LabelCaptureAdvancedOverlay overlay,
        CapturedLabel capturedLabel)
    {
        return Anchor.Center;
    }

    // This defines the offset from the anchor point for the label's AR view
    public PointWithUnit OffsetForCapturedLabel(
        LabelCaptureAdvancedOverlay overlay,
        CapturedLabel capturedLabel,
        UIView view)
    {
        return new PointWithUnit(0f, 0f, MeasureUnit.Pixel);
    }

    // This method is called when a field is detected in a label
    public UIView? ViewForCapturedLabelField(
        LabelCaptureAdvancedOverlay overlay,
        LabelField labelField)
    {
        // We only want to create AR elements for expiry date fields that are text-based
        if (labelField.Name.ToLower().Contains("expiry") && labelField.Type == LabelFieldType.Text)
        {
            //
            // data extraction from expiry date field and days until expiry date calculation
            //

            // Check if scanned expiry date is too close to actual date
            var daysUntilExpiry = CalculateDaysUntilExpiry(labelField.Text);
            var dayLimit = 3;

            if (daysUntilExpiry < dayLimit)
            {
                // Create and configure the AR element - a UILabel with appropriate styling
                // This view will appear as an overlay on the camera feed
                var label = new UILabel
                {
                    Text = "Item expires soon!",
                    Font = UIFont.SystemFontOfSize(14f),
                    TextColor = UIColor.White,
                    BackgroundColor = UIColor.Red
                };
                label.Layer.CornerRadius = 4f;
                label.Layer.MasksToBounds = true;

                // Add some padding
                label.SizeToFit();
                var frame = label.Frame;
                frame.Width += 32;
                frame.Height += 16;
                label.Frame = frame;

                return label;
            }
        }
        // Return null for any fields that aren't expiry dates, which means no AR overlay
        return null;
    }

    // This defines where on the detected field the AR view should be anchored
    // BottomCenter places it right below the expiry date text for better visibility
    public Anchor AnchorForCapturedLabelField(
        LabelCaptureAdvancedOverlay overlay,
        LabelField labelField)
    {
        return Anchor.BottomCenter;
    }

    // This defines the offset from the anchor point
    public PointWithUnit OffsetForCapturedLabelField(
        LabelCaptureAdvancedOverlay overlay,
        LabelField labelField,
        UIView view)
    {
        return new PointWithUnit(0f, 22f, MeasureUnit.Dip);
    }

    private int CalculateDaysUntilExpiry(string? expiryDateText)
    {
        // Parse the expiry date and calculate days remaining
        // Implementation depends on your date format
        return 0; // placeholder
    }
}
```

## Validation Flow

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/net/ios/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```csharp
// Create the overlay
var validationFlowOverlay = LabelCaptureValidationFlowOverlay.Create(
    labelCapture,
    dataCaptureView
);

// Set the listener to receive validation events
validationFlowOverlay.Listener = new ValidationFlowListener();
```

### Adjust the Hint Messages

```csharp
// Configure the validation flow with custom settings
var validationSettings = LabelCaptureValidationFlowSettings.Create();
validationSettings.MissingFieldsHintText = "Please add this field";
validationSettings.StandbyHintText = "No label detected, camera paused";
validationSettings.ValidationHintText = "fields captured"; // X/Y (X fields out of total Y) is shown in front of this string
validationSettings.ValidationErrorText = "Input not valid";
validationSettings.RequiredFieldErrorText = "This field is required";
validationSettings.ManualInputButtonText = "Add info manually";

// Apply the settings to the overlay
validationFlowOverlay.ApplySettings(validationSettings);
```

### Define a Listener

To handle validation events, implement the [ILabelCaptureValidationFlowListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.

```csharp
public class ValidationFlowListener : NSObject, ILabelCaptureValidationFlowListener
{
    // This is called by the validation flow overlay when a label has been fully captured and validated
    public void OnValidationFlowLabelCaptured(IList<LabelField> fields)
    {
        string? barcodeData = null;
        string? expiryDate = null;

        foreach (var field in fields)
        {
            if (field.Name == "barcode")
            {
                barcodeData = field.Barcode?.Data;
            }
            else if (field.Name == "expiry_date")
            {
                expiryDate = field.Text;
            }
        }

        // Process the captured and validated data
    }
}
```
