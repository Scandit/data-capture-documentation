---
description: "Guide to customizing overlays in the Scandit .NET Android Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: net-android
keywords:
  - net-android
---

# Advanced Configurations

## Customization of the Overlays

### Basic Overlay

To customize the appearance of an overlay you can implement a [ILabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener) and/or [ILabelCaptureAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-advanced-overlay-listener.html) interface, depending on the overlay(s) you are using.

The method [BrushForLabel()](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [BrushForField()](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```csharp
public class BasicOverlayListener : Java.Lang.Object, ILabelCaptureBasicOverlayListener
{
    private readonly Context context;

    public BasicOverlayListener(Context context)
    {
        this.context = context;
    }

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
            "<your-barcode-field-name>" => new Brush(
                fillColor: new Color(context.GetColor(Resource.Color.barcode_highlight)),
                strokeColor: new Color(context.GetColor(Resource.Color.barcode_highlight)),
                strokeWidth: 1f
            ),
            "<your-expiry-date-field-name>" => new Brush(
                fillColor: new Color(context.GetColor(Resource.Color.expiry_date_highlight)),
                strokeColor: new Color(context.GetColor(Resource.Color.expiry_date_highlight)),
                strokeWidth: 1f
            ),
            _ => null
        };
    }

    /*
     * Customize the appearance of the overlay for the full label.
     * In this example, we disable label overlays by returning null always.
     */
    public Brush? BrushForLabel(
        LabelCaptureBasicOverlay overlay,
        CapturedLabel label)
    {
        return null;
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
overlay.Listener = new BasicOverlayListener(context);
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
advancedOverlay.Listener = new AdvancedOverlayListener(this);

public class AdvancedOverlayListener : Java.Lang.Object, ILabelCaptureAdvancedOverlayListener
{
    private readonly Context context;

    public AdvancedOverlayListener(Context context)
    {
        this.context = context;
    }

    // This method is called when a label is detected - we return null since we're only adding AR elements to specific fields, not the entire label
    public View? ViewForCapturedLabel(
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
        View view)
    {
        return new PointWithUnit(0f, 0f, MeasureUnit.Pixel);
    }

    // This method is called when a field is detected in a label
    public View? ViewForCapturedLabelField(
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
                // Create and configure the AR element - a TextView with appropriate styling
                // This view will appear as an overlay on the camera feed
                var textView = new TextView(context)
                {
                    Text = "Item expires soon!",
                    TextSize = 14f
                };
                textView.SetTextColor(Android.Graphics.Color.White);
                textView.SetBackgroundColor(Android.Graphics.Color.Red);
                textView.SetPadding(16, 8, 16, 8);

                // Add an icon to the left of the text for visual guidance
                // This enhances the AR experience by providing clear visual cues
                var drawable = ContextCompat.GetDrawable(context, Resource.Drawable.ic_warning);
                if (drawable != null)
                {
                    drawable.SetBounds(0, 0, drawable.IntrinsicWidth, drawable.IntrinsicHeight);
                    textView.SetCompoundDrawables(drawable, null, null, null);
                }
                textView.CompoundDrawablePadding = 16; // Add some padding between icon and text

                return textView;
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
        View view)
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

Implementing a validation flow in your Smart Label Capture application differs from the [Get Started](/sdks/net/android/label-capture/get-started.md) steps outlined earlier as follows:

### Visualize the Scan Process

Validation flow uses a different overlay, the [LabelCaptureValidationFlowOverlay](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-validation-flow-overlay.html). This overlay provides a user interface that guides users through the label capture process, including validation steps.

```csharp
// Create the validation flow overlay with the label capture mode and data capture view
var validationFlowOverlay = LabelCaptureValidationFlowOverlay.Create(labelCapture, dataCaptureView);

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

To handle validation events, implement the [ILabelCaptureValidationFlowListener](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-validation-flow-listener.html) interface.

```csharp
public class ValidationFlowListener : Java.Lang.Object, ILabelCaptureValidationFlowListener
{
    // This is called by the validation flow overlay when a label has been fully captured and validated
    public void OnValidationFlowLabelCaptured(IList<LabelField> fields)
    {
        string? barcodeData = null;
        string? expiryDate = null;

        foreach (var field in fields)
        {
            if (field.Name == "<your-barcode-field-name>")
            {
                barcodeData = field.Barcode?.Data;
            }
            else if (field.Name == "<your-expiry-date-field-name>")
            {
                expiryDate = field.Text;
            }
        }

        // Process the captured and validated data
    }
}
```
