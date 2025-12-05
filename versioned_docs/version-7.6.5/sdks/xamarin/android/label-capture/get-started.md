---
sidebar_label: Get Started
title: Get Started with Smart Label Capture
toc_max_heading_level: 4
framework: xamarinAndroid
keywords:
  - xamarinAndroid
---

import DeprecationNotice from '/versioned_docs/version-7.6.5/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>


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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/xamarin/android/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```csharp
using Scandit.DataCapture.Core.Capture;
using Scandit.DataCapture.Barcode.Data;
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.Data;
using System.Collections.Generic;

var settings = new LabelCaptureSettings();

// Create a label definition with barcode and text fields.
var barcodeField = new BarcodeFieldDefinition(
    name: "<your-barcode-field-name>",
    symbologies: new HashSet<Symbology> { Symbology.Ean13Upca, Symbology.Code128 }
) {
    Regex = @"d{12,14}"
};

var expiryDateField = new TextFieldDefinition(
    name: "<your-expiry-date-field-name>"
) {
    IsOptional = false
};

var labelDefinition = new LabelDefinition(
    identifier: "<your-label-name>",
    fields: new List<FieldDefinition> { barcodeField, expiryDateField }
);

settings.AddLabelDefinition(labelDefinition);

// Assuming you have a DataCaptureContext instance from the previous step.
LabelCapture labelCapture = LabelCapture.Create(dataCaptureContext, settings);
```

## Define a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above.

In this example, we create a `LabelCaptureManager` class that implements the `LabelCaptureListener` interface. This class is responsible for handling the captured labels and processing them accordingly.

```csharp
using System;
using System.Linq;
using Scandit.DataCapture.Core.Capture;
using Scandit.DataCapture.Core.Data;
using Scandit.DataCapture.Core.Feedback;
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.Data;

public class CapturedLabelEvent : EventArgs
{
    public string BarcodeData { get; }
    public string ExpiryDate { get; }

    public CapturedLabelEvent(string barcodeData, string expiryDate)
    {
        this.BarcodeData = barcodeData;
        this.ExpiryDate = expiryDate;
    }
}

public class LabelCaptureManager : Java.Lang.Object, ILabelCaptureListener, IDisposable
{
    public event EventHandler<CapturedLabelEvent> LabelsCaptured;

    private readonly LabelCapture labelCapture;

    public LabelCaptureManager(DataCaptureContext context, LabelCaptureSettings settings)
    {
        this.labelCapture = LabelCapture.Create(context, settings);
        this.labelCapture.AddListener(this);
    }

    public void OnSessionUpdated(LabelCapture capture, LabelCaptureSession session, IFrameData frameData)
    {
        CapturedLabel label = session.CapturedLabels.FirstOrDefault();

        if (label != null)
        {
            // Extract the barcode field by casting the generic Field object.
            var barcodeField = label.Fields
                .FirstOrDefault(f => f.Name == "<your-barcode-field-name>") as BarcodeField;
            string barcodeData = barcodeField?.Barcode?.Data;

            // Extract the expiry date field by casting.
            var expiryDateField = label.Fields
                .FirstOrDefault(f => f.Name == "<your-expiry-date-field-name>") as TextField;
            string expiryDate = expiryDateField?.Text;

            // Disable label capture to avoid duplicate scans.
            capture.Enabled = false;

            // Notify UI via a C# event.
            this.LabelsCaptured?.Invoke(this, new CapturedLabelEvent(barcodeData, expiryDate));

            // Emit default feedback (sound + vibration).
            Feedback.DefaultFeedback.Emit();
        }
    }
    
    // Proper disposal to remove listener and free resources
    public new void Dispose()
    {
        this.labelCapture.RemoveListener(this);
        this.labelCapture.Dispose();
        base.Dispose();
    }
}
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.

To visualize the results of Label Capture you can use two overlays:

- [LabelCaptureBasicOverlay](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) 
- [LabelCaptureAdvancedOverlay](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay)

:::tip
The overlays can be used independently of each other, but you can also use both at the same time as each can serve to extend the functionality of the other.
:::

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView` inside your Android Activity's `OnCreate` method.

```csharp
// In your Android Activity
using Android.App;
using Android.OS;
using Scandit.DataCapture.Core.Capture;
using Scandit.DataCapture.Core.UI;
using Scandit.DataCapture.Core.UI.Viewfinder;
using Scandit.DataCapture.Label.Capture;
using Scandit.DataCapture.Label.UI;

// These would be member variables in your Activity
private DataCaptureContext dataCaptureContext;
private LabelCapture labelCapture;
private DataCaptureView dataCaptureView;

protected override void OnCreate(Bundle savedInstanceState)
{
    base.OnCreate(savedInstanceState);

    // Initialize dataCaptureContext and labelCapture first...

    // Create the DataCaptureView. In a real app, you would likely inflate this
    // from an XML layout file and find it with FindViewById<DataCaptureView>().
    this.dataCaptureView = DataCaptureView.Create(this, this.dataCaptureContext);
    SetContentView(this.dataCaptureView);

    // Create the overlay and add it to the DataCaptureView.
    var overlay = LabelCaptureBasicOverlay.Create(this.labelCapture, this.dataCaptureView);

    // Optionally set a rectangular viewfinder.
    overlay.Viewfinder = new RectangularViewfinder(RectangularViewfinderStyle.Square);
}
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays.
:::

## Start the Camera

Next, you need to create a new instance of the [Camera](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera to stream previews and to capture images.

When initializing the camera, you can pass the recommended camera settings for Label Capture.

```csharp
using System;
using System.Threading.Tasks;
using Scandit.DataCapture.Core.Capture;
using Scandit.DataCapture.Core.Source;
using Scandit.DataCapture.Label.Capture;

public async Task SetupCameraAsync(DataCaptureContext context)
{
    // Get the default camera.
    Camera camera = Camera.GetDefault();

    if (camera == null)
    {
        throw new InvalidOperationException("Failed to initialize camera!");
    }

    // Apply recommended settings for LabelCapture.
    var settings = LabelCapture.RecommendedCameraSettings;
    await camera.ApplySettingsAsync(settings);

    // Set camera as the frame source for the context.
    await context.SetFrameSourceAsync(camera);
}
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.
Typically, this is done when the Activity or Fragment resumes and after the user has granted camera permissions.

```csharp
// 'camera' is the Camera instance from the previous step.
await camera.SwitchToDesiredStateAsync(FrameSourceState.On);
```

## Provide Feedback

Label Capture doesn't emit any sound or vibration automatically when a new label is recognized. This is because it may be that the label is not complete and you choose to ignore it and wait for the next recognition.

However, we provide a [Feedback](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/feedback.html#class-scandit.datacapture.core.Feedback) class that can be uses to emit feedback when a label is recognized and successfully processed.

You can use the default feedback, or configure your own sound or vibration.

```csharp
using Scandit.DataCapture.Core.Feedback;

Feedback feedback = Feedback.DefaultFeedback;

// You would call Emit() inside your listener after a successful scan.
// feedback.Emit();
```

:::note
Audio feedback is only played if the device is not muted.
:::