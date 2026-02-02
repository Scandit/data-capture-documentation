---
description: "In this guide you will learn step-by-step how to add Smart Label Capture to your application.                                                                                    "

sidebar_position: 2
framework: net-android
keywords:
  - net-android
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Create a new Data Capture Context instance
- Configure the LabelCapture mode
- Define a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/net/android/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a Data Capture Context

import DataCaptureContextAndroid from '../../../../partials/get-started/_create-data-capture-context-android.mdx';

<DataCaptureContextAndroid/>

## Configure the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

:::tip
You can use Label Definitions provided in Smart Label Capture to set pre-built label types or define your label using pre-built fields. For more information, see the [Label Definitions](label-definitions.md) section.
:::

```csharp
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.Data;
using Scandit.DataCapture.Barcode.Data;

// Build LabelCaptureSettings
var settings = LabelCaptureSettings.Create()
    .AddLabel()
        // Add a barcode field with the expected symbologies and pattern
        .AddCustomBarcode()
            .SetSymbologies(Symbology.Ean13Upca, Symbology.Code128)
            .SetPattern("\\d{12,14}")
        .BuildFluent("<your-barcode-field-name>")
        // Add a text field for capturing expiry dates
        .AddExpiryDateText()
            .IsOptional(true)
            .SetLabelDateFormat(new LabelDateFormat(LabelDateComponentFormat.MDY, false))
        .BuildFluent("<your-expiry-date-field-name>")
    .BuildFluent("<your-label-name>")
    .Build();

// Create the label capture mode with the settings and data capture context
var labelCapture = LabelCapture.Create(dataCaptureContext, settings);
```

## Define a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [ILabelCaptureListener](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.AddListener()](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application's needs.

First implement the `ILabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above:

```csharp
public class LabelCaptureRepository : ILabelCaptureListener
{
    public void OnSessionUpdated(LabelCapture labelCapture, LabelCaptureSession session, IFrameData frameData)
    {
        /*
         * The session update callback is called for every processed frame.
         * Check if the session contains any captured labels;
         * if not, continue capturing.
         */
        var labels = session.CapturedLabels;

        if (labels.Count > 0)
        {
            var label = labels[0];

            /*
             * Given the label capture settings defined above,
             * the barcode field would always be present.
             */
            var barcodeData = label.Fields
                .FirstOrDefault(field => field.Name == "<your-barcode-field-name>")
                ?.Barcode?.Data;

            /*
             * The expiry date field is optional.
             * Check for null in your result handling.
             */
            var expiryDate = label.Fields
                .FirstOrDefault(field => field.Name == "<your-expiry-date-field-name>")
                ?.Text;

            /*
             * Disable the label capture mode after a label has been captured
             * to prevent it from capturing the same label multiple times.
             */
            labelCapture.Enabled = false;

            /*
             * Consider handling the results on a background thread to avoid
             * blocking the main thread when processing data.
             */
            Task.Run(() =>
            {
                HandleResults(barcodeData, expiryDate);
                Feedback.DefaultFeedback.Emit();
            });
        }
    }

    public void OnObservationStarted(LabelCapture labelCapture)
    {
        // Called when the listener is added to LabelCapture
    }

    public void OnObservationStopped(LabelCapture labelCapture)
    {
        // Called when the listener is removed from LabelCapture
    }

    private void HandleResults(string barcodeData, string expiryDate)
    {
        // Process the captured data
    }
}
```

Then add the listener to the label capture instance:

```csharp
var listener = new LabelCaptureRepository();
labelCapture.AddListener(listener);
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/dotnet.android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.

To visualize the results of Label Capture you can use two overlays:

- [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay)
- [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay)

:::tip
The overlays can be used independently of each other, but you can also use both at the same time as each can serve to extend the functionality of the other.
:::

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

```csharp
/*
 * Create the data capture view and attach it to the data capture context created earlier.
 */
var dataCaptureView = DataCaptureView.Create(this, dataCaptureContext);

/*
 * Add the data capture view to your view hierarchy
 */
var container = /* get your containing view here, e.g. FindViewById */;
container.AddView(
    dataCaptureView,
    new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent)
);

/*
 * Create the overlay with the label capture mode and data capture view created earlier.
 */
var overlay = LabelCaptureBasicOverlay.Create(labelCapture, dataCaptureView);
overlay.Viewfinder = new RectangularViewfinder(RectangularViewfinderStyle.Square);
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary Android views such as text views, icons or images.
:::

## Start the Camera

Next, you need to create a new instance of the [Camera](https://docs.scandit.com/data-capture-sdk/dotnet.android/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera to stream previews and to capture images.

When initializing the camera, you can pass the recommended camera settings for Label Capture.

```csharp
var camera = Camera.GetDefaultCamera(LabelCapture.CreateRecommendedCameraSettings());
if (camera == null)
{
    throw new InvalidOperationException("Failed to init camera!");
}
dataCaptureContext.SetFrameSourceAsync(camera);
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.
Typically, this is done on resuming the view and when the user granted permission to use the camera, or once the user pressed continue scanning after handling a previous scan.

```csharp
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
```

## Provide Feedback

Smart Label Capture provides customizable feedback, emitted automatically when a label is recognized and successfully processed, configurable via [`LabelCapture.Feedback`](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-capture.html#property-scandit.datacapture.label.LabelCapture.Feedback).

You can use the default feedback, or configure your own sound or vibration.

:::tip
If you already have a [Feedback](https://docs.scandit.com/data-capture-sdk/dotnet.android/core/api/feedback.html#class-scandit.datacapture.core.Feedback) instance implemented in your application, remove it to avoid double feedback.
:::

```csharp
labelCapture.Feedback = LabelCaptureFeedback.DefaultFeedback;
```

:::note
Audio feedback is only played if the device is not muted.
:::
