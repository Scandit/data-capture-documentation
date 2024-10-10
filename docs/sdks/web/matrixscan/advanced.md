---
sidebar_position: 3
pagination_next: null
unlisted: true
framework: web
keywords:
  - web
---

# Adding AR Overlays

In the previous section we covered how to vizualize the scan process using the `BarcodeTrackingBasicOverlay`. In this section we will cover how to add custom AR overlays to your MatrixScan application.

There are two ways to add custom AR overlays to your application:

- Using the [`BarcodeTrackingAdvancedOverlay`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, our ready-to-use implementation for view-based AR overlays.
- Provide your own fully custom implementation by using the [`BarcodeTrackingListener.didUpdateSession()`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function to retrieve the tracking information and implement your own AR overlay.

The first option is the easiest and recommended approach for most applications. It covers adding, removing, and animating the overlay’s views whenever needed and is also flexible enough to cover the majority of use cases.

## Using BarcodeTrackingAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) and add it to the
[DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```js
const overlay = BarcodeTrackingAdvancedOverlay.withBarcodeTrackingForView(
	barcodeTracking,
	view
);
```

At this point, you have two options.

- Add a [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

### Using [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener)

- You need to implement [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeTrackingAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/web/core/api/anchor.html#enum-scandit.datacapture.core.Anchor 'Anchor enum'). Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeTrackingAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/web/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```js
import { PointWithUnit, MeasureUnit, NumberWithUnit, Anchor } from "@scandit/web-datacapture-core"
import { TrackedBarcodeView } from "@scandit/web-datacapture-barcode"

// ...
overlay.listener = {
  viewForTrackedBarcode: (overlay, trackedBarcode) => {
    // Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for this barcode.
    let element = document.createElement('span');
    element.innerText = trackedBarcode.barcode.data;
    element.style.backgroundColor = '#FFFFFFFF';
    return TrackedBarcodeView.withHTMLElement(element, null);
  },

  anchorForTrackedBarcode: (overlay, trackedBarcode) => {
    // As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
    // Use the function 'offsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
    return Anchor.TopCenter;
  },

  offsetForTrackedBarcode: (overlay, trackedBarcode) => {
    // This is the offset that will be applied to the view.
    // You can use .fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
    // We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
    return new PointWithUnit(
      new NumberWithUnit(0, MeasureUnit.Fraction),
      new NumberWithUnit(-1, MeasureUnit.Fraction),
    );
  },
};
```

### Using the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay)

The function [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) gives you access to a
[session](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeTrackingAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeTrackingAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```js
import { PointWithUnit, MeasureUnit, NumberWithUnit, Anchor } from "@scandit/web-datacapture-core"
import { TrackedBarcodeView } from "@scandit/web-datacapture-barcode"

// ...
barcodeTracking.addListener({
  didUpdateSession: (barcodeTracking, session) => {
    session.addedTrackedBarcodes.forEach(trackedBarcode => {
      let element = document.createElement('span');
      element.innerText = trackedBarcode.barcode.data;
      element.style.backgroundColor = '#FFFFFFFF';
      let trackedBarcodeView = TrackedBarcodeView.withHTMLElement(element, null);

      overlay.setViewForTrackedBarcode(trackedBarcodeView, trackedBarcode);
      overlay.setAnchorForTrackedBarcode(Anchor.TopCenter, trackedBarcode);
      overlay.setOffsetForTrackedBarcode(
        new PointWithUnit(
          new NumberWithUnit(0, MeasureUnit.Fraction), new NumberWithUnit(-1, MeasureUnit.Fraction)
        ), trackedBarcode);
    })
});
```

## Provide your own custom implementation

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/data-capture-sdk/web/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates that every tracked barcode has. Below are some pointers.

- Set a [BarcodeTrackingListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) on the barcode tracking
- In the [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.tracking.TrackedBarcode) on-screen, update the position based on [TrackedBarcode.location](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.location](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location) need to be mapped to view coordinates, using
[DataCaptureView.viewQuadrilateralForFrameQuadrilateral()](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```js
didUpdateSession: (barcodeTracking, session) => {
	session.removedTrackedBarcodes.map((lostTrackIdentifier) => {
		// You now know the identifier of the tracked barcode that has been lost.
		// Usually here you would remove the views associated.
	});

	session.addedTrackedBarcodes.map((trackedBarcode) => {
		// Fixed identifier for the tracked barcode.
		const trackingIdentifier = trackedBarcode.identifier;

		// Current location of the tracked barcode.
		const location = trackedBarcode.location;
		view
			.viewQuadrilateralForFrameQuadrilateral(location)
			.then((quadrilateral) => {
				// You now know the location of the tracked barcode.
			});
	});
};
```
