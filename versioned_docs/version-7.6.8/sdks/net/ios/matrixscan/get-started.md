---
sidebar_position: 2
framework: netIos
keywords:
  - netIos
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the MatrixScan mode
- Using the built-in camera
- Visualizing the scan process
- Providing feedback
- Disabling barcode tracking

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Batch Mode

The main entry point for the Barcode Batch Mode is the [BarcodeBatch](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) object. It is configured through [BarcodeBatchSettings](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) and allows to register one or more [listeners](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) that will get informed whenever a new frame has been processed.

Most of the times, you will not need to implement a [IBarcodeBatchListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener), instead you will add a
[BarcodeBatchBasicOverlay](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay) and implement a [IBarcodeBatchBasicOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener).

For this tutorial, we will setup Barcode Batch for tracking QR codes.

```csharp
BarcodeBatchSettings settings = BarcodeBatchSettings.Create();
settings.EnableSymbology(Symbology.Qr, true);
```

Next, create a [BarcodeBatch](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance with the data capture context and the settings initialized in the previous steps:

```csharp
BarcodeBatch barcodeBatch = BarcodeBatch.Create(context, settings);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

:::important
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [NSCameraUsageDescription](https://learn.microsoft.com/en-us/xamarin/ios/app-fundamentals/security-privacy?tabs=macos#:~:text=NSCameraUsageDescription) key in your app’s Info.plist file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the
recommended settings and create the camera from it:

```csharp
camera = Camera.GetDefaultCamera();
camera?.ApplySettingsAsync(BarcodeBatch.RecommendedCameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.SetFrameSourceAsync()](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```csharp
context.SetFrameSourceAsync(camera);
```

The camera is off by default and must be turned on. This is done by calling [IFrameSource.SwitchToDesiredStateAsync()](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```csharp
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```



## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```csharp
DataCaptureView dataCaptureView = DataCaptureView.Create(dataCaptureContext, View.Bounds);
View.AddSubview(dataCaptureView);
```

Alternatively you can use a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) from XAML in your MAUI application. For example:

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:scandit="clr-namespace:Scandit.DataCapture.Core.UI.Maui;assembly=ScanditCaptureCoreMaui" <ContentPage.Content>
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

For MAUI development add [Scandit.DataCapture.Core.Maui](https://www.nuget.org/packages/Scandit.DataCapture.Core.Maui) NuGet package into your project.

To visualize the results of Barcode Batch, first you need to add the following [overlay](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay):

```csharp
BarcodeBatchBasicOverlay overlay = BarcodeBatchBasicOverlay.Create(barcodeBatch, dataCaptureView);
```

Once the overlay has been added, you should implement the [IBarcodeBatchBasicOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener) interface. The method [IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a [brush](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/ui/brush.html#class-scandit.datacapture.core.ui.Brush) that will be used to highlight that specific barcode in the [overlay](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay).

```csharp
public Brush BrushForTrackedBarcode(BarcodeBatchBasicOverlay overlay, TrackedBarcode trackedBarcode)
{
// Return a custom Brush based on the tracked barcode.
}
```

If you would like to make the highlights tappable, you need to implement the [IBarcodeBatchBasicOverlayListener.OnTrackedBarcodeTapped()](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.OnTrackedBarcodeTapped) method.

```csharp
public void OnTrackedBarcodeTapped(BarcodeBatchBasicOverlay overlay, TrackedBarcode trackedBarcode)
{
// A tracked barcode was tapped.
}
```

## Get Barcode Batch Feedback

Barcode Batch, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [IBarcodeBatchListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) to provide a similar experience. Below, we use the default [Feedback](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration if you want.

```csharp
public override void ViewDidLoad()
{
base.ViewDidLoad();
feedback = Feedback.DefaultFeedback;
}
```

Next, use this [feedback](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback) in a [IBarcodeBatchListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener):

```csharp
public class FeedbackListener : Foundation.NSObject, IBarcodeBatchListener
{
public void OnObservationStarted(BarcodeBatch barcodeBatch)
{
// Called when Barcode Batch is started.
// We don't use this callback in this guide.
}

public void OnObservationStopped(BarcodeBatch barcodeBatch)
{
// Called when Barcode Batch is stopped.
// We don't use this callback in this guide.
}

public void OnSessionUpdated(BarcodeBatch barcodeBatch, BarcodeBatchSession session, IFrameData frameData)
{
if (session.AddedTrackedBarcodes.Any())
{
this.feedback.Emit();
}
}
}
```

[IBarcodeBatchListener.OnSessionUpdated()](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) is invoked for every processed frame. The [session](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession) parameter contains information about the currently tracked barcodes, in particular, the newly recognized ones. We check if there are any and if so, we emit the feedback.

As the last step, register the listener responsible for emitting the feedback with the [BarcodeBatch](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance.

```csharp
barcodeBatch.AddListener(feedbackListener);
```

## Disabling Barcode Batch

To disable barcode tracking set [BarcodeBatch.Enabled](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-batch.html#property-scandit.datacapture.barcode.batch.BarcodeBatch.IsEnabled) to _false_. The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [SwitchToDesiredState](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [StandBy](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.Standby).
