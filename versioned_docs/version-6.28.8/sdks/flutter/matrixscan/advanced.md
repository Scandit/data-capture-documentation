---
sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter
unlisted: true
---

# Adding AR Overlays

There are two ways to add advanced AR overlays to a Data Capture View:

- Take advantage of the [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.
- Provide your own custom implementation, using the function [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) to retrieve the barcode’s current screen position for each frame.

:::note

- The first way is the easiest, as it takes care of adding, removing and animating the overlay’s views whenever needed.
  It’s also flexible enough to cover the majority of use cases.
- You can always handle touch events on the views you create like you normally would.
  :::

## Using BarcodeTrackingAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```dart
var overlay = BarcodeTrackingAdvancedOverlay.forView(barcodeTracking, dataCaptureView);
```

At this point, you have two options.

- Add a [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeTrackingAdvancedOverlay.setWidgetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeTrackingAdvancedOverlayListener.widgetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

Using [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener)

- You need to implement [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeTrackingAdvancedOverlayListener.widgetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeTrackingAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/anchor.html#enum-scandit.datacapture.core.Ancho). Be aware that it anchors the
  view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeTrackingAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```dart
@override
Widget widgetForTrackedBarcode(BarcodeTrackingAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for
this barcode.
return ARWidget(trackedBarcode.barcode.data);
}

@override
Anchor anchorForTrackedBarcode(BarcodeTrackingAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode
quadrilateral.
// Use the function 'offsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
return Anchor.topCenter;
}

@override
PointWithUnit offsetForTrackedBarcode(BarcodeTrackingAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// This is the offset that will be applied to the view.
// You can use MeasureUnit.fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
// We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
return PointWithUnit(DoubleWithUnit(0, MeasureUnit.fraction), DoubleWithUnit(-1, MeasureUnit.fraction));
}
```

Using the setters in the [overlay](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay)

The function [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) gives you access to a
[session](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeTrackingAdvancedOverlay.setWidgetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeTrackingAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeTrackingAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```dart
@override
void didUpdateSession(BarcodeTracking barcodeTracking, BarcodeTrackingSession session) {
for (final trackedBarcode in session.addedTrackedBarcodes) {
Widget arWidget = ARWidget(trackedBarcode.barcode.data);
overlay.setWidgetForTrackedBarcode(arWidget, trackedBarcode);
overlay.setAnchorForTrackedBarcode(Anchor.topCenter, trackedBarcode);
overlay.setOffsetForTrackedBarcode(
PointWithUnit(DoubleWithUnit(0, MeasureUnit.fraction), DoubleWithUnit(-1, MeasureUnit.fraction)),
trackedBarcode);
}
}
```

## Provide your own custom implementation

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates that every tracked barcode has. Below are some pointers.

- Set a [BarcodeTrackingListener](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) on the barcode tracking
- In the [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeTracking](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.tracking.TrackedBarcode) on-screen, update the position based on
  [TrackedBarcode.location](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.location](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location) need to be mapped to view coordinates, using [DataCaptureView.viewQuadrilateralForFrameQuadrilateral()](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```dart
@override
void didUpdateSession(BarcodeTracking barcodeTracking, BarcodeTrackingSession session) {
for (final lostTrackIdentifier in session.removedTrackedBarcodes) {
// You now know the identifier of the tracked barcode that has been lost.
// Usually here you would remove the views associated.
}

for (final trackedBarcode in session.addedTrackedBarcodes) {
// Fixed identifier for the tracked barcode.
var trackingIdentifier = trackedBarcode.identifier;

// Current location of the tracked barcode.
var location = trackedBarcode.location;
view.viewQuadrilateralForFrameQuadrilateral(location).then((quadrilateral) => {
// You now know the location of the tracked barcode.
});
}
}
```
