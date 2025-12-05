---
sidebar_position: 2
framework: xamarinAndroid
keywords:
  - xamarinAndroid
title: Get Started
---

import DeprecationNotice from '/versioned_docs/version-7.6.5/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>


# Get Started

In this guide you will learn step-by-step how to add MatrixScan Count to your application.

The general steps are:

- Create a new Data Capture Context instance
- Configure the Barcode Count Mode
- Obtain camera instance and set frame source used
- Register the listener to be informed when scanned phase is over
- Set capture view and AR overlays
- Set up the camera so that it switches on when you are in scanning view
- Store and retrieve scanned barcodes
- Reset Barcode Count mode
- List and Exit callbacks

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A Xamarin.iOS project with minimum iOS deployment target of 14.0 or higher. Or a Xamarin.Android project with target SDK version 23 (Android 6, Marshmallow) or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::note
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create a New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure The Barcode Count Mode

The main entry point for the Barcode Count Mode is the [BarcodeCount](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) object. It is configured through [BarcodeCountSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-settings.html#class-scandit.datacapture.barcode.count.BarcodeCountSettings) and allows you to register one or more listeners that are informed whenever a scan phase has finished.

For this tutorial, we will set up Barcode Count for tracking EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```csharp
BarcodeCountSettings settings = new BarcodeCountSettings();
settings.SetSymbologyEnabled(Symbology.Ean13Upca, true);
```

If you are sure that your environment will only have unique barcodes (i.e. no duplicated values), you can also enable [BarcodeCountSettings.ExpectsOnlyUniqueBarcodes](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-settings.html#property-scandit.datacapture.barcode.count.BarcodeCountSettings.ExpectsOnlyUniqueBarcodes). This option improves scanning performance as long as you are sure that no duplicates will be present. Next, create a
[BarcodeCount](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) instance with the [Data Capture Context](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and the settings initialized in the previous step:

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

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.SetFrameSourceAsync()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```csharp
dataCaptureContext.SetFrameSourceAsync(camera);
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the
[IBarcodeCountListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface and register the listener.

```csharp
// Register self as a listener to monitor the barcode count session.
barcodeCount.AddListener(this);
```

[IBarcodeCountListener.OnScan()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan) is called when the scan phase has finished and results can be retrieved from [BarcodeCountSession](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession).

Alternatively to register [IBarcodeCountListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface it is possible to subscribe to corresponding event. For example:

```csharp
barcodeCount.Scanned += (object sender, BarcodeCountEventArgs args) =>
{
};
```

## Set Capture View And AR Overlays

MatrixScan Count’s built-in AR user interface includes buttons and overlays that guide the user through the capturing process. By adding a [BarcodeCountView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a [BarcodeCountView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) to your view hierarchy:

```csharp
BarcodeCountView barcodeCountView = BarcodeCountView.Create(context, dataCaptureContext, barcodeCount);
```

## Set Up The Camera So That It Switches On When You Are In Scanning View

The camera is not automatically turned on when you are in a scanning view. You need to set up the camera so that it switches on when needed and it switches off when not needed anymore. Similarly [BarcodeCount](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount) should also be enabled and disabled. For instance, you should switch off the camera when the [BarcodeCountView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is not visible anymore (including when the app goes in the background), similarly you want to switch on the camera when the [BarcodeCountView](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) is visible (including when the app goes to the foreground). One way to achieve this is the following:

```csharp
protected override void OnPause()
{
camera.SwitchToDesiredStateAsync(FrameSourceState.Off);
base.OnPause();
}

protected override void OnResume()
{
camera.SwitchToDesiredStateAsync(FrameSourceState.On);
base.OnResume();
}
```

## Store And Retrieve Scanned Barcodes

The values captured as part of the scanning process are part of the [session](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession), and the session is not accessible outside [IBarcodeCountListener.OnScan()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan). Therefore, we recommend that you store the values to present a list, for example when the user taps the list icon. To do this, make a copy of [BarcodeCountSession.RecognizedBarcodes](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count-session.html#property-scandit.datacapture.barcode.count.BarcodeCountSession.RecognizedBarcodes):

## Reset Barcode Count Mode

When the scanning process is over, you need to reset the mode to make it ready for the next process. This clears the list of barcodes scanned and all the AR overlays.

To reset Barcode Count’s scanning process, you need to call the [BarcodeCount.Reset()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-count.html#method-scandit.datacapture.barcode.count.BarcodeCount.Reset) method.

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
