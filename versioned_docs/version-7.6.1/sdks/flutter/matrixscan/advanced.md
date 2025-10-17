---
description: "There are two ways to add advanced AR overlays to a Data Capture View:                                                                                      "

sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter

---

# Adding AR Overlays

There are two ways to add advanced AR overlays to a Data Capture View:

- Take advantage of the [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.
- Provide your own custom implementation, using the function [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) to retrieve the barcode’s current screen position for each frame.

:::note

- The first way is the easiest, as it takes care of adding, removing and animating the overlay’s views whenever needed.
  It’s also flexible enough to cover the majority of use cases.
- You can always handle touch events on the views you create like you normally would.
  :::

## Using BarcodeBatchAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```dart
var overlay = BarcodeBatchAdvancedOverlay.forView(barcodeBatch, dataCaptureView);
```

At this point, you have two options.

- Add a [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeBatchAdvancedOverlay.setWidgetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeBatchAdvancedOverlayListener.widgetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

Using [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener)

- You need to implement [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeBatchAdvancedOverlayListener.widgetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/anchor.html#enum-scandit.datacapture.core.Ancho). Be aware that it anchors the
  view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```dart
@override
Widget widgetForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for
this barcode.
return ARWidget(trackedBarcode.barcode.data);
}

@override
Anchor anchorForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode
quadrilateral.
// Use the function 'offsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
return Anchor.topCenter;
}

@override
PointWithUnit offsetForTrackedBarcode(BarcodeBatchAdvancedOverlay overlay, TrackedBarcode trackedBarcode) {
// This is the offset that will be applied to the view.
// You can use MeasureUnit.fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
// We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
return PointWithUnit(DoubleWithUnit(0, MeasureUnit.fraction), DoubleWithUnit(-1, MeasureUnit.fraction));
}
```

Using the setters in the [overlay](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay)

The function [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) gives you access to a
[session](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeBatchAdvancedOverlay.setWidgetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeBatchAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeBatchAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetOffsetForTrackedBarcode)

```dart
@override
void didUpdateSession(BarcodeBatch barcodeBatch, BarcodeBatchSession session) {
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

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates that every tracked barcode has. Below are some pointers.

- Set a [BarcodeBatchListener](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) on the barcode tracking
- In the [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeBatch](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.batch.TrackedBarcode) on-screen, update the position based on
  [TrackedBarcode.location](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.location](https://docs.scandit.com/7.6/data-capture-sdk/flutter/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location) need to be mapped to view coordinates, using [DataCaptureView.viewQuadrilateralForFrameQuadrilateral()](https://docs.scandit.com/7.6/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```dart
@override
void didUpdateSession(BarcodeBatch barcodeBatch, BarcodeBatchSession session) {
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
