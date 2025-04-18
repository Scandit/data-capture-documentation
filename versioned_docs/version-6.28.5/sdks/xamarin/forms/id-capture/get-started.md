---
sidebar_position: 2
framework: xamarinForms
keywords:
  - xamarinForms
---

# Get Started

In this guide you will learn step-by-step how to add ID Capture to your application.

:::note
Using ID Capture at the same time as other modes (e.g. Barcode Capture or Text Capture) is not supported.
:::

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and
that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

Please note that your license may support only a subset of ID Capture features. If you would like to use additional features please contact us at [Scandit Support](mailto:support@scandit.com).

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/camera.html#class-scandit.datacapture.core.Camera):

```csharp
camera = Camera.GetDefaultCamera();

if (camera != null)
{
// Use the settings recommended by id capture.
camera.ApplySettingsAsync(IdCapture.RecommendedCameraSettings);
context.SetFrameSourceAsync(camera);
}
```

## Create ID Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the types of documents that you’d like to scan. Check [IdDocumentType](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all the available options.

:::warning
Using [IdDocumentType.DlViz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.DlViz) or [IdDocumentType.IdCardViz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardViz) together with any MRZ document ([IdDocumentType.IdCardMrz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.IdCardMrz), [IdDocumentType.VisaMrz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.VisaMrz), [IdDocumentType.PassportMrz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.PassportMrz), [IdDocumentType.SwissDlMrz](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-document-type.html#value-scandit.datacapture.id.IdDocumentType.SwissDlMrz)) while [SupportedSides.FrontAndBack](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-supported-document-sides.html#value-scandit.datacapture.id.SupportedSides.FrontAndBack) is enabled is currently not supported.
:::

```csharp
IdCaptureSettings settings = new IdCaptureSettings
{
SupportedDocuments = IdDocumentType.IdCardViz | IdDocumentType.DlViz | IdDocumentType.AamvaBarcode
};
```

## Implement the Listener

To receive scan results, implement [IIdCaptureListener](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). A result is delivered as [CapturedId](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents. For more specific information use its non-_null_ result properties (for example [CapturedId.AamvaBarcode](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.AamvaBarcode)).

```csharp
public class MyListener : IIdCaptureListener
{
public void OnIdCaptured(IdCapture mode, IdCaptureSession session, IFrameData data)
{
CapturedId capturedId = session.NewlyCapturedId;

// The recognized fields of the captured ID can vary based on the type.
if (capturedId.CapturedResultType == CapturedResultType.MrzResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.VizResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.AamvaBarcodeResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.UsUniformedServicesBarcodeResult)
{
// Handle the information extracted.
}
}

public void OnErrorEncountered(IdCapture mode, IdCaptureError error, IdCaptureSession session, IFrameData frameData)
{
// Implement to handle an error encountered during the capture process.
}

public void OnObservationStarted(IdCapture mode)
{ }

public void OnObservationStopped(IdCapture mode)
{ }
}
```

Alternatively to register [IIdCaptureListener](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) interface it is possible to subscribe to corresponding events. For example:

```csharp
idCapture.IdCaptured += (object sender, IdCaptureEventArgs args) =>
{
CapturedId capturedId = args.Session.NewlyCapturedId;

// The recognized fields of the captured ID can vary based on the type.
if (capturedId.CapturedResultType == CapturedResultType.MrzResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.VizResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.AamvaBarcodeResult)
{
// Handle the information extracted.
}
else if (capturedId.CapturedResultType == CapturedResultType.UsUniformedServicesBarcodeResult)
{
// Handle the information extracted.
}
};
```

Create a new ID Capture mode with the chosen settings. Then register the listener:

```csharp
idCapture = IdCapture.Create(context, settings);
idCapture.AddListener(new MyListener())
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```xml
<ContentPage xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:scanditCore="clr-namespace:Scandit.DataCapture.Core.UI.Unified;assembly=ScanditCaptureCoreUnified">
    <scanditCore:DataCaptureView x:Name="dataCaptureView" DataCaptureContext="{Binding context}">
    </scanditCore:DataCaptureView>
</ContentPage>
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```csharp
overlay = IdCaptureOverlay.Create(idCapture, dataCaptureView);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings). If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.IdLayout](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Turn on the Camera

Finally, turn on the camera to start scanning:

```csharp
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
```

And this is it. You can now scan documents.
