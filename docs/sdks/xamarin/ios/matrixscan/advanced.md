---
sidebar_position: 3
pagination_next: null
framework: xamarinIos
tags: [xamarinIos]
keywords:
  - xamarinIos
---

# Adding AR Overlays

There are two ways to add advanced AR overlays to a Data Capture View:

- Take advantage of the [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.
- Provide your own custom implementation, using the function [IBarcodeTrackingListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) to retrieve the barcode’s current screen position for each frame.

:::note

- The first way is the easiest, as it takes care of adding, removing and animating the overlay’s views whenever needed. It’s also flexible enough to cover the majority of use cases.
- You can always handle touch events on the views you create like you normally would.
  :::

## Using BarcodeTrackingAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```csharp
BarcodeTrackingAdvancedOverlay overlay = BarcodeTrackingAdvancedOverlay.Create(barcodeTracking, dataCaptureView);
```

At this point, you have two options.

- Add a [IBarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

## Using `BarcodeTrackingAdvancedOverlayListener`

- You need to implement [IBarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/anchor.html#enum-scandit.datacapture.core.Anchor). Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```csharp
public View ViewForTrackedBarcode(BarcodeTrackingAdvancedOverlay overlay, TrackedBarcode trackedBarcode)
{
// Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for this barcode.
UITextView textView = new UITextView(new CGRect(0, 0, 200, 50));
textView.BackgroundColor = UIColor.White;
textView.Text = trackedBarcode.Barcode.Data;
return textView;
}

public Anchor AnchorForTrackedBarcode(
BarcodeTrackingAdvancedOverlay overlay,
TrackedBarcode trackedBarcode)
{
// As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
// Use the function 'OffsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
return Anchor.TopCenter;
}

public PointWithUnit OffsetForTrackedBarcode(
BarcodeTrackingAdvancedOverlay overlay,
TrackedBarcode trackedBarcode)
{
// This is the offset that will be applied to the view.
// You can use MeasureUnit.Fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
// We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
return new PointWithUnit(
new FloatWithUnit(0f, MeasureUnit.Fraction),
new FloatWithUnit(-1f, MeasureUnit.Fraction));
}
```

## Using the Setters

The function [IBarcodeTrackingListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) gives you access to a [session](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```csharp
public void OnSessionUpdated(BarcodeTracking barcodeTracking, BarcodeTrackingSession session, IFrameData frameData)
{
// Be careful, this method is not necessarily invoked on the main thread!
DispatchQueue.MainQueue.DispatchAsync(() =>
{
foreach (TrackedBarcode trackedBarcode in session.AddedTrackedBarcodes)
{
UITextView textView = new UITextView(new CGRect(0, 0, 200, 50));
textView.BackgroundColor = UIColor.White;
textView.Text = trackedBarcode.Barcode.Data;
overlay.SetViewForTrackedBarcode(trackedBarcode, textView);
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
// Dispose the frame when you have finished processing it. If the frame is not properly disposed,
// different issues could arise, e.g. a frozen, non-responsive, or "severely stuttering" video feed.
frameData.Dispose();
}
```

## Provide Custom Implementation

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates that every tracked barcode has. Below are some pointers.

- Set a [IBarcodeTrackingListener](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) on the barcode tracking
- In the [IBarcodeTrackingListener.OnSessionUpdated()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.tracking.TrackedBarcode) on-screen, update the position based on [TrackedBarcode.Location](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location).

Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.Location](https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location) need to be mapped to view coordinates, using [DataCaptureView.MapFrameQuadrilateralToView()](https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```csharp
public void OnSessionUpdated(BarcodeTracking mode, BarcodeTrackingSession session, IFrameData frameData)
{
// Be careful, this function is not invoked on the main thread!
DispatchQueue.MainQueue.DispatchAsync(() =>
{
foreach (int lostTrackIdentifier in session.RemovedTrackedBarcodes) {
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
// Dispose the frame when you have finished processing it. If the frame is not properly disposed,
// different issues could arise, e.g. a frozen, non-responsive, or "severely stuttering" video feed.
frameData.Dispose();
}
```
