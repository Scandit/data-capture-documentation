---
sidebar_position: 2
framework: netAndroid
keywords:
  - netAndroid
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:

- Barcode AR: The data capture mode that is used for scan and check functionality.
- A Barcode AR View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode AR Mode
- Setup the Barcode AR View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/net/android/add-sdk).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Internal Dependencies

import InternalDependencies from '../../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/dotnet.android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-ar-settings.html).

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```csharp
BarcodeArSettings settings = new BarcodeArSettings();
settings.SetSymbologyEnabled(Symbology.EAN13_UPCA, true);
```

Then create the mode with the previously created settings:

```csharp
BarcodeAr mode = new BarcodeAr(dataCaptureContext, settings);
```

## Setup the `BarcodeArView`

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), properties on the`BarcodeArView`, and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Camera position
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlights and annotations

```csharp
BarcodeArViewSettings viewSettings = new BarcodeArViewSettings();
viewSettings.HapticEnabled(false);
viewSettings.SoundEnabled(false);
viewSettings.DefaultCameraPosition(CameraPosition.USER_FACING);
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```csharp
BarcodeArView barcodeArView = BarcodeArView(parentView, barcodeAr, dataCaptureContext, viewSettings);
barcodeArView.ShouldShowCameraSwitchControl(true);
barcodeArView.ShouldShowTorchControl(true);
barcodeArView.ShouldShowZoomControl(true);
barcodeArView.CameraSwitchControlPosition(Anchor.TOP_RIGHT);
barcodeArView.TorchControlPosition(Anchor.BOTTOM_RIGHT);
barcodeArView.ZoomControlPosition(Anchor.TOP_LEFT);
```

Configure the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider).

```csharp
public class AnnotationProvider : BarcodeArAnnotationProvider
{
    public void AnnotationForBarcode(Context context, Barcode barcode, ICallback callback)
    {
        var annotation = new BarcodeArStatusIconAnnotation(context, barcode);
        annotation.Text = "Example annotation";
        callback.OnData(annotation);
    }
}

public class HighlightProvider : BarcodeArHighlightProvider
{
    public void HighlightForBarcode(Context context, Barcode barcode, ICallback callback)
    {
        callback.OnData(new BarcodeArRectangleHighlight(context, barcode));
    }
}
```

And set them to the view:

```csharp
barcodeArView.HighlightProvider(new HighlightProvider());
barcodeArView.AnnotationProvider(new AnnotationProvider());
```

## Register the Listener

If you want a callback when a highlight is tapped, register a [BarcodeArViewUiListener](https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener).

```csharp
barcodeArView.SetUiListener(new BarcodeArViewUiListener());

public class BarcodeArViewUiListener : BarcodeArViewUiListener
{
    public void OnHighlightForBarcodeTapped(BarcodeAr barcodeAr, Barcode barcode, BarcodeArHighlight highlight, View highlightView)
    {
        // Handle tap
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling:

```csharp
barcodeArView.Start();
```
