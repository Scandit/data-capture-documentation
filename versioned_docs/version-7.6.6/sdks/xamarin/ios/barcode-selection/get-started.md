---
sidebar_position: 2
pagination_next: null
framework: xamarinIos
keywords:
  - xamarinIos
title: Get Started
---

import DeprecationNotice from '/versioned_docs/version-7.6.6/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>


# Get Started

In this guide you will learn step-by-step how to add Barcode Selection to your application.

The general steps are:

- Create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) instance, initialized with your license key.
- Create a [barcode selection settings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and choose the right configuration.
- Create a new [barcode selection mode](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) instance and initialize it with the settings created above.
- Register a [barcode selection listener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [camera](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [data capture view](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).
- If displaying a preview, optionally create a new [overlay](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-selection-basic-overlay.html#class-scandit.datacapture.barcode.selection.ui.BarcodeSelectionBasicOverlay) and add it to [data capture view](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for a better visual feedback.

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A Xamarin.iOS project with minimum iOS deployment target of 14.0 or higher. Or a Xamarin.Android project with target SDK version 23 (Android 6, Marshmallow) or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::note
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext context = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Selection Behavior

_Symbologies_

Barcode selection is orchestrated by the [BarcodeSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) [data capture mode](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). It is configured through [BarcodeSelectionSettings](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and allows to register one or more [listeners](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) that will get informed whenever new codes have been selected.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called [symbologies](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is highly application specific. We recommend that you only enable the list of symbologies your application requires.

```csharp
BarcodeSelectionSettings settings = BarcodeSelectionSettings.Create();
HashSet<Symbology> symbologies = new HashSet<Symbology>()
{
Symbology.Qr,
Symbology.Ean8,
Symbology.Upce,
Symbology.Ean13Upca
};
settings.EnableSymbologies(symbologies);
```

_Selection Types_

The behavior of Barcode Selection can be changed by using a different [selection type](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-type.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionType). This defines the method used by [BarcodeSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) to select codes. Currently there are two types.

If you want the user to select barcodes with a tap, then use [BarcodeSelectionTapSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection). This selection type can automatically freeze the camera preview to make the selection easier. You can configure the freezing behavior via [BarcodeSelectionTapSelection.FreezeBehavior](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.FreezeBehavior). With
[BarcodeSelectionTapSelection.TapBehavior](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.TapBehavior) you can decide if a second tap on a barcode means that the barcode is unselected or if it is selected another time (increasing the counter).

:::note
Using [BarcodeSelectionTapSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection) requires the MatrixScan add-on.
:::

If you want the selection to happen automatically based on where the user points the camera, then use [BarcodeSelectionAimerSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-aimer-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAimerSelection). It is possible to choose between two different [selection strategies](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-strategy.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionStrategy). Use [BarcodeSelectionAutoSelectionStrategy](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAutoSelectionStrategy) if you want the barcodes to be selected automatically when aiming at them as soon as the intention is understood by our internal algorithms. Use [BarcodeSelectionManualSelectionStrategy](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionManualSelectionStrategy) if you want the barcodes to be selected when aiming at them and tapping anywhere on the screen.

_Single Barcode Auto Detection_

If you want to automatically select a barcode when it is the only one on screen, turn on [BarcodeSelectionSettings.SingleBarcodeAutoDetection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-settings.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionSettings.SingleBarcodeAutoDetection).

_Creating the mode_

Next, create a [BarcodeSelection](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) instance with the settings initialized in the previous step:

```csharp
barcodeSelection = BarcodeSelection.Create(context, settings);
```

## Register the Barcode Selection Listener

To get informed whenever a new code has been recognized, add a [IBarcodeSelectionListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) through [BarcodeSelection.AddListener()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#method-scandit.datacapture.barcode.selection.BarcodeSelection.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [IBarcodeSelectionListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) interface. For example:

```csharp
public class MyBarcodeSelectionListener : NSObject, IBarcodeSelectionListener
{
public void OnObservationStarted(BarcodeSelection barcodeSelection)
{
// Called when Barcode Selection is started.
// We don't use this callback in this guide.
}

public void OnObservationStopped(BarcodeSelection barcodeSelection)
{
// Called when Barcode Selection is stopped.
// We don't use this callback in this guide.
}

public void OnSessionUpdated(
BarcodeSelection barcodeSelection,
BarcodeSelectionSession session,
IFrameData frameData)
{
// Called every new frame.
// We don't use this callback in this guide.

// Dispose the frame when you have finished processing it. If the frame is not properly disposed,
// different issues could arise, e.g. a frozen, non-responsive, or "severely stuttering" video feed.
frameData.Dispose();
}

public void OnSelectionUpdated(
BarcodeSelection barcodeSelection,
BarcodeSelectionSession session,
IFrameData frameData)
{
IList<Barcode> newlySelectedBarcodes = session.NewlySelectedBarcodes;
IList<Barcode> selectedBarcodes = session.SelectedBarcodes;
IList<Barcode> newlyUnselectedBarcodes = session.NewlyUnselectedBarcodes;
// Do something with the retrieved barcodes.

// Dispose the frame when you have finished processing it. If the frame is not properly disposed,
// different issues could arise, e.g. a frozen, non-responsive, or "severely stuttering" video feed.
frameData.Dispose();
}
}
```

Then add the listener:

```csharp
barcodeSelection.AddListener(new MyBarcodeSelectionListener());
```

Alternatively to register [IBarcodeSelectionListener](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) interface it is possible to subscribe to corresponding events. For example:

```csharp
barcodeSelection.SelectionUpdated += (object sender, BarcodeSelectionEventArgs args) =>
{
IList<Barcode> newlySelectedBarcodes = args.Session.NewlySelectedBarcodes;
IList<Barcode> selectedBarcodes = args.Session.SelectedBarcodes;
IList<Barcode> newlyUnselectedBarcodes = args.Session.NewlyUnselectedBarcodes;
// Do something with the retrieved barcodes.
}
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

:::important
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [NSCameraUsageDescription](https://learn.microsoft.com/en-us/xamarin/ios/app-fundamentals/security-privacy?tabs=macos#:~:text=NSCameraUsageDescription) key in your app’s Info.plist file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```csharp
var cameraSettings = BarcodeSelection.RecommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

camera = Camera.GetDefaultCamera();
camera?.ApplySettingsAsync(cameraSettings);
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.SetFrameSourceAsync()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```csharp
context.SetFrameSourceAsync(camera);
```

The camera is off by default and must be turned on. This is done by calling [IFrameSource.SwitchToDesiredState()](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```csharp
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```



## Disabling Barcode Selection

To disable barcode selection, for instance when the selection is complete, set [BarcodeSelection.Enabled](https://docs.scandit.com/7.6/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelection.IsEnabled) to _false_. The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
