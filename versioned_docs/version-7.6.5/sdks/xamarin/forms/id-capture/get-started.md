---
sidebar_position: 2
framework: xamarinForms
keywords:
  - xamarinForms
title: Get Started
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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/xamarin/forms/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import IdModuleOverview from '../../../../partials/get-started/_id-module-overview-no-eu-dl.mdx';

<IdModuleOverview/>

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A Xamarin.iOS project with minimum iOS deployment target of 15.0 or higher. Or a Xamarin.Android project with target SDK version 24 or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::note
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/core/api/camera.html#class-scandit.datacapture.core.Camera):

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

Use [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type and the accepted and rejected documents.

Check [IdCaptureDocumentType](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all the available options.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

```csharp
IdCaptureSettings settings = new IdCaptureSettings
{
AcceptedDocuments = IdDocumentType.Passport | IdDocumentType.DriverLicense,
RejectedDocuments = IdDocumentType.IdCard,
};
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). 

Capture results are delivered as a [CapturedId](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

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
else if (capturedId.CapturedResultType == CapturedResultType.BarcodeResult)
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

Alternatively to register [IIdCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener) interface it is possible to subscribe to corresponding events. For example:

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

When using the built-in camera as [frameSource](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/core/api/frame-source.html#interface-scandit.datacapture.core.IFrameSource), you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```xml
<ContentPage xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:scanditCore="clr-namespace:Scandit.DataCapture.Core.UI.Unified;assembly=ScanditCaptureCoreUnified">
    <scanditCore:DataCaptureView x:Name="dataCaptureView" DataCaptureContext="{Binding context}">
    </scanditCore:DataCaptureView>
</ContentPage>
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```csharp
overlay = IdCaptureOverlay.Create(idCapture, dataCaptureView);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.forms/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```csharp
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
```
