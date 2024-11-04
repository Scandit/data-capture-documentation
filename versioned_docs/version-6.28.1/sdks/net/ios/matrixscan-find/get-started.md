---
sidebar_position: 2
framework: netIos
keywords:
  - netIos
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- Barcode Find: The data capture mode that is used for search and find functionality.
- A Barcode Find View: The pre-built UI elements used to highlight found items.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Find Mode
- Setup the Barcode Find View
- Registering the Listener to notify about found items

## Create a Data Capture Context

The first step to add find capabilities to your application is to create a new [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Find Mode

The main entry point for the Barcode Find Mode is the [BarcodeFind](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind) object. You can configure the supported Symbologies through its [BarcodeFindSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-find-settings.html#class-scandit.datacapture.barcode.find.BarcodeFindSettings), and set up the list of items that you want MatrixScan Find to highlight (e.g. a list of products).

For this tutorial, we will set up Barcode Find for tracking EAN13 codes. Change this to the correct symbologies for your use case (e.g. Code 128, Code 39…).

First create the settings:

```csharp
BarcodeFindSettings settings = new BarcodeFindSettings();
settings.EnableSymbology(Symbology.Ean13Upca, true);
```

Then you have to create the list of items that will be actively searched for.

In this tutorial, let’s look up two items based on their EAN13 codes. We will attach to the first item some optional information that can be used by the BarcodeFindView to display extra information.

```csharp
ICollection<BarcodeFindItem> items = new HashSet<BarcodeFindItem>()
        {
        new BarcodeFindItem(
        new BarcodeFindItemSearchOptions("9783598215438"),
        new BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null)),
        new BarcodeFindItem(
        new BarcodeFindItemSearchOptions("9783598215414"),
        null) // Item information is optional, used for display only
        };
```

Create the mode with the previously created settings and set the items:

```csharp
BarcodeFind mode = new BarcodeFind(settings);
mode.SetItemList(items);
```

## Setup the BarcodeFindView

MatrixScan Find’s built-in AR user interface includes buttons and overlays that guide the user through the searching process. By adding a [BarcodeFindView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView), the scanning interface (camera preview and searching UI elements) will be added automatically to your application.

The BarcodeFindView appearance can be customized through [BarcodeFindViewSettings](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-find-view-settings.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindViewSettings):

- Colors of dots in augmented reality overlay
- Enable sound and haptic alerts

```csharp
BarcodeFindViewSettings viewSettings = new BarcodeFindViewSettings();
```

Construct a new BarcodeFindView. The BarcodeFindView is automatically added to the provided parent view.

```csharp
BarcodeFindView barcodeFindView = BarcodeFindView.Create(parentView, dataCaptureContext, barcodeFind,
viewSettings);
```

Connect the BarcodeFindView to the iOS view controller lifecycle. In particular, make sure to call BarcodeFindView.PrepareSearching() on your UIViewController’s [ViewWillAppear](https://learn.microsoft.com/en-us/dotnet/api/uikit.uiviewcontroller.viewwillappear) method to make sure that start up time is optimal.

```csharp
public override void ViewWillAppear(bool animated)
{
base.ViewWillAppear(animated);
barcodeFindView.PrepareSearching();
}

public override void ViewWillDisappear(bool animated)
{
base.ViewWillDisappear(animated);
barcodeFindView.StopSearching();
}
```

## Subscribe to view events to be notified with found items

The BarcodeFindView displays next to its shutter button a handy “finish” button. Subscribe to a [BarcodeFindView.FinishButtonTapped](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-find-view.html#property-scandit.datacapture.barcode.find.ui.BarcodeFindView.FinishButtonTapped) event to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```csharp
barcodeFindView.FinishButtonTapped += (object? sender, FinishButtonTappedEventArgs e) =>
{
RequireActivity().OnBackPressed();
};
```

## Start searching

As soon as everything is set up, control the [BarcodeFindView](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) to start the search.

```csharp
barcodeFindView.StartSearching();
```

This is the equivalent of pressing the “Play” button programmatically. It will start the search process, turn on the camera and hide the item carousel.
