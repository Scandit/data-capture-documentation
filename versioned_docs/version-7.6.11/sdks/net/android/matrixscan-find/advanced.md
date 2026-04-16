---
sidebar_position: 3
pagination_next: null
framework: netAndroid
keywords:
  - netAndroid
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## BarcodeFind Listener

You may want more fine-grained knowledge over the different events happening during the life of the BarcodeFind mode, such as when the search starts, pauses and stops. To do this, you can directly register a [IBarcodeFindListener](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself.

Be aware that these listeners will be called from a background thread.

```csharp
public class BarcodeFindListener : IBarcodeFindListener
{
    public void OnSearchPaused(ICollection<BarcodeFindItem> foundItems)
    {
        // The mode was paused
    }

    public void OnSearchStarted()
    {
        // The mode was started
    }

    public void OnSearchStopped(ICollection<BarcodeFindItem> foundItems)
    {
        // The mode was stopped after the finish button was clicked
    }
}

private void Initialize()
{
    barcodeFind.AddListener(new BarcodeFindListener())
}
```

Alternatively it is possible to subscribe to corresponding events [BarcodeFind.SearchPaused](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-find.html#property-scandit.datacapture.barcode.find.BarcodeFind.SearchPaused), [BarcodeFind.SearchStarted](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-find.html#property-scandit.datacapture.barcode.find.BarcodeFind.SearchStarted) or [BarcodeFind.SearchStopped](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-find.html#property-scandit.datacapture.barcode.find.BarcodeFind.SearchStopped). For example:

```csharp
barcodeFind.SearchStarted += (object? sender, EventArgs args) =>
{
    // The mode was started
};
barcodeFind.SearchPaused += (object? sender, BarcodeFindEventArgs args) =>
{
    // The mode was paused
};
barcodeFind.SearchStopped += (object? sender, BarcodeFindEventArgs args) =>
{
    // The mode was stopped after the finish button was clicked
};
```

## UI configuration

The [BarcodeFindView](https://docs.scandit.com/7.6/data-capture-sdk/dotnet.android/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) will by default show a set of UI elements, which can be optionally hidden:

- A play/pause button
- A finish button
- A searched items carousel
- Guidance hints

There is also a progress bar but this is hidden by default.

Each of these elements can be shown or hidden at will.

```csharp
barcodeFindView.ShouldShowCarousel = false;
barcodeFindView.ShouldShowProgressBar = true;
// …
```
