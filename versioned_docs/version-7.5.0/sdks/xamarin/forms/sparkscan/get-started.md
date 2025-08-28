---
sidebar_position: 2
framework: xamarinForms
keywords:
  - xamarinForms
---

# Get Started

In this guide you will learn step-by-step how to add SparkScan to your application by:

- Create a new Data Capture Context instance.
- Configure the Spark Scan Mode.
- Create the SparkScanView with the desired settings and bind it to the application’s lifecycle.
- Register the listener to be informed when new barcodes are scanned and update your data whenever this event occurs.

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A Xamarin.iOS project with minimum iOS deployment target of 14.0 or higher. Or a Xamarin.Android project with target SDK version 23 (Android 6, Marshmallow) or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::note
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Create a New Data Capture Context Instance

The first step to add capture capabilities to your application is to create a new [Data Capture
Context](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext 'Data Capture Context
class'). The context expects a valid Scandit Data Capture SDK license key during construction.

DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE
--");

## Configure the SparkScan Mode

The SparkScan Mode is configured through SparkScanSettings and allows you to register one or more listeners that are informed whenever a new barcode is scanned.

For this tutorial, we will set up SparkScan for scanning EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```csharp
SparkScanSettings settings = new SparkScanSettings();
HashSet<Symbology> symbologies = new HashSet<Symbology>()
{
Symbology.Ean13Upca
};
settings.EnableSymbologies(symbologies);
```

Next, create a SparkScan instance with the settings initialized in the previous step:

```csharp
SparkScan sparkScan = new SparkScan(settings);
```

## Setup the Spark Scan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements. These guide the user through the scanning process.

The [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view.html) appearance can be customized through [`SparkScanViewSettings`](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view-settings.html).

```csharp
SparkScanViewSettings viewSettings = new SparkScanViewSettings();
// setup the desired appearance settings by updating the fields in the object above
```

See the [SparkScan Workflow Options](./intro.md#workflow-options) section for more information.

By adding a [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view.html), the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view.html) to your view hierarchy:

Construct a new SparkScan view. The SparkScan view should be added as the last item to [AbsoluteLayout](https://learn.microsoft.com/en-us/xamarin/xamarin-forms/user-interface/layouts/absolutelayout) or [RelativeLayout](https://learn.microsoft.com/en-us/xamarin/xamarin-forms/user-interface/layouts/relativelayout) layouts, to make sure other UI components are visible.

```xml
<ContentPage xmlns="http://xamarin.com/schemas/2014/forms"
xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
xmlns:scandit="clr-namespace:Scandit.DataCapture.Barcode.Spark.UI.Unified;assembly=ScanditBarcodeCaptureUnified">
<ContentPage.Content>
<AbsoluteLayout>
<!-- Your other UI components comes here before SparkScanView -->
<scandit:SparkScanView x:Name="SparkScanView" AbsoluteLayout.LayoutBounds="0,0,1,1"
AbsoluteLayout.LayoutFlags="All" DataCaptureContext="{Binding DataCaptureContext}"
SparkScan="{Binding SparkScan}" SparkScanViewSettings="{Binding ViewSettings}">
</scandit:SparkScanView>
</AbsoluteLayout>
</ContentPage.Content>
</ContentPage>
```

Additionally, make sure to call [SparkScanView.OnAppearing()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.OnAppearing) and [SparkScanView.OnDisappearing()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.OnDisappearing) in your [Page.OnAppearing](https://learn.microsoft.com/en-us/dotnet/api/xamarin.forms.page.onappearing) and [Page.OnDisappearing](https://learn.microsoft.com/en-us/dotnet/api/xamarin.forms.page.ondisappearing) callbacks, to make sure that start up time is optimal and scanning is stopped when the app is going in the background.

```csharp
protected override void OnAppearing()
{
base.OnAppearing();
this.SparkScanView.OnAppearing();
}

protected override void OnDisappearing()
{
base.OnDisappearing();
this.SparkScanView.OnDisappearing();
}
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [ISparkScanListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) interface and register the listener to the SparkScan mode.

```csharp
// Register self as a listener to monitor the spark scan session.
sparkScan.AddListener(this);
```

[ISparkScanListener.OnBarcodeScanned()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) is called when a new barcode has been scanned. This result can be retrieved from the first object in the provided barcodes list: [SparkScanSession.NewlyRecognizedBarcode](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode). Please note that this list only contains one barcode entry.

```csharp
public void OnBarcodeScanned(SparkScan sparkScan, SparkScanSession session, IFrameData? data)
{
if (session.NewlyRecognizedBarcode.Count == 0)
{
return;
}

// Gather the recognized barcode
Barcode barcode = session.NewlyRecognizedBarcode[0];

// This method is invoked from a recognition internal thread.
// Run the specified action in the UI thread to update the internal barcode list.
Device.InvokeOnMainThreadAsync(() =>
{
// Update the internal list and the UI with the barcode retrieved above
this.latestBarcode = barcode;
});
}
```

Alternatively to register [ISparkScanListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) interface it is possible to subscribe to corresponding events. For example:

```csharp
sparkScan.BarcodeScanned += (object sender, SparkScanEventArgs args) =>
{
if (args.Session.NewlyRecognizedBarcode.Count == 0)
{
return;
}

// Gather the recognized barcode
Barcode barcode = args.Session.NewlyRecognizedBarcode[0];

// This method is invoked from a recognition internal thread.
// Run the specified action in the UI thread to update the internal barcode list.
Device.InvokeOnMainThreadAsync(() =>
{
// Update the internal list and the UI with the barcode retrieved above
this.latestBarcode = barcode;

// Emit sound and vibration feedback
this.sparkScanView.EmitFeedback(new SparkScanViewSuccessFeedback());
});
}
```

## Scan Some Barcodes

Now that you’re up and running, go find some barcodes to scan. Don’t feel like getting up from your desk? Here’s a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can print out.
