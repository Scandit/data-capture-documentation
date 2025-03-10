---
sidebar_position: 2
framework: netIos
keywords:
  - netIos
---

# Get Started

This page will guide you through the process of adding ID Capture to your Xamarin application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/net/ios/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import IdModuleOverview from '../../../../partials/get-started/_id-module-overview.mdx';

<IdModuleOverview/>

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/camera.html#class-scandit.datacapture.core.Camera):

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

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type and the accepted and rejected documents.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all the available options.

```csharp
IdCaptureSettings settings = new IdCaptureSettings
{
AcceptedDocuments = IdDocumentType.Passport | IdDocumentType.DriverLicense,
RejectedDocuments = IdDocumentType.IdCard,
};
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). 

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

```csharp
public class MyListener : Java.Lang.Object, IIdCaptureListener
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
else if (capturedId.CapturedResultType == CapturedResultType.BarcodeResult)
{
// Handle the information extracted.
}
}

public void OnErrorEncountered(IdCapture mode, Throwable error, IdCaptureSession session, IFrameData data)
{
// Implement to handle an error encountered during the capture process.
}

public void OnObservationStarted(IdCapture mode)
{ }

public void OnObservationStopped(IdCapture mode)
{ }
}
```

Alternatively to register [IIdCaptureListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) interface it is possible to subscribe to corresponding events. For example:

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
else if (capturedId.CapturedResultType == CapturedResultType.BarcodeResult)
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

## Set up Capture View and Overlay

When using the built-in camera as [frameSource](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/frame-source.html#interface-scandit.datacapture.core.IFrameSource), you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```csharp
DataCaptureView dataCaptureView = DataCaptureView.Create(this, dataCaptureContext);
SetContentView(dataCaptureView);
```

Alternatively you can use a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) from XAML in your MAUI application. For example:

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:scandit="clr-namespace:Scandit.DataCapture.Core.UI.Maui;assembly=ScanditCaptureCoreMaui">
	<ContentPage.Content>
    <AbsoluteLayout>
        <scandit:DataCaptureView x:Name="dataCaptureView" AbsoluteLayout.LayoutBounds="0,0,1,1"
            AbsoluteLayout.LayoutFlags="All" DataCaptureContext="{Binding DataCaptureContext}">
        </scandit:DataCaptureView>
    </AbsoluteLayout>
    </ContentPage.Content>
</ContentPage>
```

You can configure your view in the code behind class. For example:

```csharp
public partial class MainPage : ContentPage
{
public MainPage()
{
InitializeComponent();

// Initialization of DataCaptureView happens on handler changed event.
dataCaptureView.HandlerChanged += DataCaptureViewHandlerChanged;
}

private void DataCaptureViewHandlerChanged(object? sender, EventArgs e)
{
// Your dataCaptureView configuration goes here, e.g. add overlay
}
}
```

For MAUI development add the [Scandit.DataCapture.Core.Maui](https://www.nuget.org/packages/Scandit.DataCapture.Core.Maui) NuGet package into your project.

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```csharp
overlay = IdCaptureOverlay.Create(idCapture, dataCaptureView);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```csharp
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
```

And this is it. You can now scan documents.
