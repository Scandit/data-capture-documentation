---
title: Adding AR Overlays
sidebar_position: 3
pagination_next: null
framework: xamarinForms
keywords:
  - xamarinForms
---

import DeprecationNotice from '/docs/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>

# Adding AR Overlays

There are two ways to add advanced AR overlays to a Data Capture View:

- Take advantage of the [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.
- Provide your own custom implementation, using the function [IBarcodeBatchListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) to retrieve the barcode’s current screen position for each frame.

:::note

- The first way is the easiest, as it takes care of adding, removing and animating the overlay’s views whenever needed. It’s also flexible enough to cover the majority of use cases.
- You can always handle touch events on the views you create like you normally would.
  :::

## Using BarcodeBatchAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```csharp
BarcodeBatchAdvancedOverlay overlay = BarcodeBatchAdvancedOverlay.Create(barcodeBatch, dataCaptureView);
```

At this point, you have two options.

- Add a [IBarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), the function [IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

Using [IBarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener)

- You need to implement [IBarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [IBarcodeBatchAdvancedOverlayListener.AnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/anchor.html#enum-scandit.datacapture.core.Anchor). Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [IBarcodeBatchAdvancedOverlayListener.OffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```csharp
public View ViewForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode)
{
// Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for this barcode.
ContentView view = new ContentView
{
HeightRequest = 50,
WidthRequest = 200
};

    var contentView = new StackLayout();
    contentView.Children.Add(new Label { Text = trackedBarcode.Barcode.Data });

    view.Content = contentView;
    return view;

}

public Anchor AnchorForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode)
{
// As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
// Use the function 'OffsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
return Anchor.TopCenter;
}

public PointWithUnit OffsetForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode)
{
// This is the offset that will be applied to the view.
// You can use MeasureUnit.Fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
// We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
return new PointWithUnit(
x: new FloatWithUnit(value: 0, unit: MeasureUnit.Fraction),
y: new FloatWithUnit(value: -1, unit: MeasureUnit.Fraction));
}
```

Using the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay)

The function [IBarcodeBatchListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) gives you access to a [session](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeBatchAdvancedOverlay.SetAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeBatchAdvancedOverlay.SetOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetOffsetForTrackedBarcode)

```csharp
public void OnSessionUpdated(BarcodeBatch barcodeBatch, BarcodeBatchSession session, IFrameData frameData)
{
// Be careful, this method is not invoked on the main thread!
Device.InvokeOnMainThreadAsync(() =>
{
foreach (TrackedBarcode trackedBarcode in session.AddedTrackedBarcodes)
{
ContentView view = new ContentView
{
HeightRequest = 50,
WidthRequest = 200
};

            var contentView = new StackLayout();
            contentView.Children.Add(new Label { Text = trackedBarcode.Barcode.Data });
            view.Content = contentView;

            overlay.SetViewForTrackedBarcode(trackedBarcode, view);
            overlay.SetAnchorForTrackedBarcode(trackedBarcode, Anchor.TopCenter);
            overlay.SetOffsetForTrackedBarcode(
                trackedBarcode,
                new PointWithUnit(
                    new FloatWithUnit(0f, MeasureUnit.Fraction),
                    new FloatWithUnit(-1f, MeasureUnit.Fraction)
                )
            );
        }
    });

}
```

## Provide your own custom implementation

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates that every tracked barcode has. Below are some pointers.

- Set a [IBarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) on the barcode tracking
- In the [IBarcodeBatchListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.batch.TrackedBarcode) on-screen, update the position based on [TrackedBarcode.Location](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.Location](https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location) need to be mapped to view coordinates, using [DataCaptureView.MapFrameQuadrilateralToView()](https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```csharp
public void OnSessionUpdated(BarcodeBatch barcodeBatch, BarcodeBatchSession session, IFrameData frameData)
{
// Be careful, this method is not invoked on the main thread!
Device.InvokeOnMainThreadAsync(() =>
{
foreach (var identifier in session.RemovedTrackedBarcodes)
{
// You now know the identifier of the tracked barcode that has been lost. Usually here you would remove the views associated.
}

      foreach (TrackedBarcode trackedBarcode in session.AddedTrackedBarcodes)
      {
          // Fixed identifier for the tracked barcode.
          int trackingIdentifier = trackedBarcode.Identifier;

          // Current location of the tracked barcode.
          Quadrilateral location = trackedBarcode.Location;
          Quadrilateral quadrilateral = dataCaptureView.MapFrameQuadrilateralToView(location);

          // You now know this new tracking's identifier and location. Usually here you would create and show the views.
      }

});
}
```
