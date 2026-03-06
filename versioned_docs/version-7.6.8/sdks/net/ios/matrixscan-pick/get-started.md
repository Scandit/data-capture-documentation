---
sidebar_position: 2
framework: netIos
keywords:
  - netIos
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:

- Barcode Pick: The data capture mode that is used for scan and pick functionality.
- A Barcode Pick View: The pre-built UI elements used to highlight items to be picked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Pick Mode
- Setup the Barcode Pick View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```csharp
DataCaptureContext dataCaptureContext = DataCaptureContext.ForLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Pick Mode

The main entry point for the Barcode Pick Mode is the `BarcodePick` object. You can configure the supported Symbologies through its [`BarcodePickSettings`](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-pick-settings.html), and set up the list of items that you want MatrixScan Pick to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```csharp
BarcodePickSettings settings = new BarcodePickSettings();
settings.EnableSymbology(Symbology.Ean13Upca, true);
```

Then you have to create the list of items that will be picked and quantity to be picked for each item.

```csharp
ICollection<BarcodePickProduct> items = new HashSet<BarcodePickProduct>()
{
    new BarcodePickProduct(
        new BarcodePickProductIdentifier("9783598215438"),
        new BarcodePickProductQuantityToPick(3),
    new BarcodePickProduct(
        new BarcodePickProductIdentifier("9783598215414"),
        new BarcodePickProductQuantityToPick(3)
};
```

Create the mode with the previously created settings:

```csharp
BarcodePick mode = new BarcodePick(settings);
```

## Setup the `BarcodePickView`

MatrixScan Pick’s built-in AR user interface includes buttons and overlays that guide the user through the scan and pick process. By adding a [`BarcodePickView`](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView), the scanning interface is added automatically to your application.

The `BarcodePickView` appearance can be customized through [`BarcodePickViewSettings`](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.ios/barcode-capture/api/ui/barcode-pick-view-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings) to match your application’s look and feel. The following settings can be customized:

* Colors of dots in augmented reality overlay
* Enable sound and haptic alerts
* Guidelines text
* Showing hints
* Finish button
* Pause button
* Zoom button
* Loading Dialog

```csharp
BarcodePickViewSettings viewSettings = new BarcodePickViewSettings();
// ...
```
(The parent view can be any subclass of ViewGroup, such as FrameLayout, …)

Construct a new `BarcodePickView`. The `BarcodePickView` is automatically added to the provided parent view.

```csharp
let BarcodePickView = BarcodePickView(parentView: view, context: context, BarcodePick: mode, settings: viewSettings)
```

You can use a `BarcodePickView` from XAML in your MAUI application.

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
        xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
        xmlns:scandit="clr-namespace:Scandit.DataCapture.Barcode.Pick.UI.Maui;assembly=ScanditBarcodeCaptureMaui"
        x:Class="MyFindBarcodePage">
    <ContentPage.Content>
        <AbsoluteLayout>
            <scandit:BarcodePickView
                x:Name="BarcodePickView"
                AbsoluteLayout.LayoutBounds="0,0,1,1"
                AbsoluteLayout.LayoutFlags="All"
                DataCaptureContext="{Binding DataCaptureContext}"
                BarcodePick="{Binding BarcodePick}"
                BarcodePickViewSettings="{Binding BarcodePickViewSettings}">
            </scandit:BarcodePickView>
        </AbsoluteLayout>
    </ContentPage.Content>
</ContentPage>
```

You can configure your view in the code behind class. For example:

```csharp
public partial class MyFindBarcodePage : ContentPage
{
    public MyFindBarcodePage()
    {
        this.InitializeComponent();

        // Initialization of BarcodePickView happens on handler changed event.
        this.BarcodePickView.HandlerChanged += SetupBarcodePickView;
    }

    private void SetupBarcodePickView(object? sender, EventArgs args)
    {
        // Your BarcodePickView configuration goes here, e.g. subscribe for button tap events
    }
}
```

:::important
For MAUI development add the [`Scandit.DataCapture.Barcode.Maui`](https://www.nuget.org/packages/Scandit.DataCapture.Barcode.Maui) NuGet package into your project.
:::

Connect the `BarcodePickView` to the iOS view controller lifecycle. In particular, make sure to call `BarcodePickView.prepareSearching()` on your UIViewController’s [`viewWillAppear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621510-viewwillappear) method to make sure that start up time is optimal.

```csharp
public override void ViewWillAppear(bool animated)
{
    base.ViewWillAppear(animated);
    BarcodePickView.PrepareSearching();
}

public override void ViewWillDisappear(bool animated)
{
    base.ViewWillDisappear(animated);
    BarcodePickView.StopSearching();
}
```

If your are developing on MAUI then connect the BarcodePickView to the MAUI page lifecycle.

In particular, make sure to call `BarcodePickView.OnResume` on your [`Element.HandlerChanged`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.maui.controls.element.handlerchanged) event and `BarcodePickView.OnPause` on your [`Page.OnDisappearing`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.maui.controls.page.ondisappearing).

```csharp
public FindBarcodePage()
{
    this.BarcodePickView.HandlerChanged += SetupBarcodePickView;
}

private void SetupBarcodePickView(object? sender, EventArgs args)
{
    #if __IOS__
    this.BarcodePickView.PrepareSearching();
    #endif
}

protected override void OnDisappearing()
{
    base.OnDisappearing();
    this.BarcodePickView.StopSearching();
}
```

## Subscribe to View Events

The `BarcodePickView` displays a **Finish** button next to its shutter button. 

Subscribe to a `BarcodePickView.onFinishButtonTapped` event to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```csharp
BarcodePickView.FinishButtonTapped += (object? sender, FinishButtonTappedEventArgs e) =>
{
    NavigationController?.PopViewController(animated: true);
};
```

However, this convenient “finish” button is not supported with MAUI development. You can create the button manually and invoke `BarcodePickView.StopSearching` to achieve the same functionality. The following code snippet demonstrates how to do this:

`FindBarcodePage.xaml`:
```csharp
<AbsoluteLayout>
    (...)
    <ImageButton Source="finish_icon.png"
                  AbsoluteLayout.LayoutBounds="0.9,0.9,50,50"
                  AbsoluteLayout.LayoutFlags="PositionProportional"
                  Clicked="FinishButtonClicked" />
</AbsoluteLayout>
```

`FindBarcodePage.xaml.cs`:
```csharp
private void FinishButtonClicked(object? sender, EventArgs args)
{
    if (Application.Current?.MainPage is NavigationPage navigation)
    {
        BarcodePickView.StopSearching();
        navigation.PopToRootAsync(animated: true);
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `BarcodePickView.start()`.

```csharp
BarcodePickView.start();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
