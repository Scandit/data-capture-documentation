---
sidebar_position: 2
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Count to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Count Mode
- Obtaining the camera instance and set frame source
- Registering the listener to be informed when scan phase is complete
- Setting the capture view and AR overlays
- Configuring the camera for scanning view
- Storing and retrieving the captured barcodes
- Resetting the Barcode Count Mode
- List and exit callbacks

## Create A New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure The Barcode Count Mode

The main entry point for the Barcode Count Mode is the [BarcodeCount](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) object. It is configured through [BarcodeCountSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-settings.html#class-scandit.datacapture.barcode.count.BarcodeCountSettings) and allows you to register one or more listeners that are informed whenever a scan phase has finished.

For this tutorial, we will set up Barcode Count for tracking EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```csharp
BarcodeCountSettings settings = new BarcodeCountSettings();
settings.SetSymbologyEnabled(Symbology.Ean13Upca, true);
```

If you are sure that your environment will only have unique barcodes (i.e. no duplicated values), you can also enable [BarcodeCountSettings.ExpectsOnlyUniqueBarcodes](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-settings.html#property-scandit.datacapture.barcode.count.BarcodeCountSettings.ExpectsOnlyUniqueBarcodes). This option improves scanning performance as long as you are sure that no duplicates will be present. Next, create a [BarcodeCount](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) instance with the [Data Capture Context](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and the settings initialized in the previous step:

```csharp
BarcodeCount barcodeCount = BarcodeCount.Create(dataCaptureContext, settings);
```

## Obtain Camera Instance And Set Frame Source Used

Our recommended camera settings should be used to achieve the best performance and user experience. The following couple of lines show how to get the recommended settings for MatrixScan Count and create the camera from it:

```csharp
CameraSettings cameraSettings = BarcodeCount.RecommendedCameraSettings;

Camera camera = Camera.DefaultCamera;
camera.ApplySettingsAsync(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.SetFrameSourceAsync()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```csharp
dataCaptureContext.SetFrameSourceAsync(camera);
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [IBarcodeCountListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface and register the listener.

```csharp
// Register self as a listener to monitor the barcode count session.
barcodeCount.AddListener(this);
```

[IBarcodeCountListener.OnScan()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan) is called when the scan phase has finished and results can be retrieved from [BarcodeCountSession](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession).

Alternatively to register [IBarcodeCountListener](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface it is possible to subscribe to corresponding event. For example:

```csharp
barcodeCount.Scanned += (object sender, BarcodeCountEventArgs args) =>
{
};
```

## Set Capture View And AR Overlays

MatrixScan Count’s built-in AR user interface includes buttons and overlays that guide the user through the capturing process. By adding a [BarcodeCountView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a [BarcodeCountView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) to your view hierarchy:

```csharp
BarcodeCountView barcodeCountView = BarcodeCountView.Create(View.Bounds, dataCaptureContext, barcodeCount);
```

You can use a [BarcodeCountView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) from XAML in your MAUI application.

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:scandit="clr-namespace:Scandit.DataCapture.Barcode.Count.UI.Maui;assembly=ScanditBarcodeCaptureMaui"
    x:Class="MyScanPage">
    <AbsoluteLayout>
        <scandit:BarcodeCountView x:Name="barcodeCountView" AbsoluteLayout.LayoutBounds="0,0,1,1"
            AbsoluteLayout.LayoutFlags="All" DataCaptureContext="{Binding DataCaptureContext}"
            BarcodeCount="{Binding BarcodeCount}" ViewStyle="Icon">
        </scandit:BarcodeCountView>
    </AbsoluteLayout>
</ContentPage>
```

You can configure your view in the code behind class. For example:

```csharp
public partial class MyScanPage : ContentPage
{
public MyScanPage()
{
this.InitializeComponent();

// Initialization of BarcodeCountView happens on handler changed event.
this.barcodeCountView.HandlerChanged += BarcodeCountViewHandlerChanged;
}

private void BarcodeCountViewHandlerChanged(object sender, EventArgs e)
{
// Your BarcodeCountView configuration goes here, e.g. subscribe for buttons tap events
}
}
```

For MAUI development add [Scandit.DataCapture.Barcode.Maui](https://www.nuget.org/packages/Scandit.DataCapture.Barcode.Maui) NuGet package into your project.

## Set Up The Camera So That It Switches On When You Are In Scanning View

The camera is not automatically turned on when you are in a scanning view. You need to set up the camera so that it switches on when needed and it switches off when not needed anymore. Similarly [BarcodeCount](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) should also be enabled and disabled. For instance, you should switch off the camera when the [BarcodeCountView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is not visible anymore (including when the app goes in the background), similarly you want to switch on the camera when the
[BarcodeCountView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is visible (including when the app goes to the foreground). One way to achieve this is the following:

```csharp
public override void ViewWillDisappear(bool animated)
{
camera.SwitchToDesiredStateAsync(FrameSourceState.Off);
base.ViewWillDisappear(animated);
}

public override void ViewWillAppear(bool animated)
{
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
base.ViewWillAppear(animated);
}
```

## Store And Retrieve Scanned Barcodes

The values captured as part of the scanning process are part of the [session](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession), and the session is not accessible outside [IBarcodeCountListener.OnScan()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan). Therefore, we recommend that you store the values to present a list, for example when the user taps the list icon. To do this, make a copy of [BarcodeCountSession.RecognizedBarcodes](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count-session.html#property-scandit.datacapture.barcode.count.BarcodeCountSession.RecognizedBarcodes):

## Reset Barcode Count Mode

When the scanning process is over, you need to reset the mode to make it ready for the next process. This clears the list of barcodes scanned and all the AR overlays.

To reset Barcode Count’s scanning process, you need to call the [BarcodeCount.Reset()](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-count.html#method-scandit.datacapture.barcode.count.BarcodeCount.Reset) method.

```csharp
barcodeCount.Reset();
```

## List And Exit Callbacks

The UI includes two icons (buttons) named “List” and “Exit”. The SDK provides events so you can add the desired action when those icons are tapped by the user.

```csharp
barcodeCountView.ListButtonTapped += (object sender, ListButtonTappedEventArgs args) =>
{
// Show the current progress but the order is not completed
};

barcodeCountView.ExitButtonTapped += (object sender, ExitButtonTappedEventArgs args) =>
{
// The order is completed
};
```
