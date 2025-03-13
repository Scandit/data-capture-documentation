---
sidebar_position: 3
pagination_next: null

framework: web
keywords:
  - web
---

# Adding AR Overlays

In the previous section we covered how to vizualize the scan process using the `BarcodeBatchBasicOverlay`. In this section we will cover how to add custom AR overlays to your MatrixScan application.

There are two ways to add custom AR overlays to your application:

- Using the [`BarcodeBatchAdvancedOverlay`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) class, our ready-to-use implementation for view-based AR overlays.
- Provide your own fully custom implementation by using the [`BarcodeBatchListener.didUpdateSession()`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) function to retrieve the tracking information and implement your own AR overlay.

The first option is the easiest and recommended approach for most applications. It covers adding, removing, and animating the overlay’s views whenever needed and is also flexible enough to cover the majority of use cases.

## Using BarcodeBatchAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) and add it to the
[DataCaptureView](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```js
const overlay = BarcodeBatchAdvancedOverlay.withBarcodeBatchForView(
	barcodeBatch,
	view
);
```

At this point, you have two options.

- Add a [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeBatchAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

### Using [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener)

- You need to implement [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/web/core/api/anchor.html#enum-scandit.datacapture.core.Anchor 'Anchor enum'). Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/web/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

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

### Using the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay)

The function [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) gives you access to a
[session](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you want to display, and then call [BarcodeBatchAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeBatchAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeBatchAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetOffsetForTrackedBarcode)

```js
import { PointWithUnit, MeasureUnit, NumberWithUnit, Anchor } from "@scandit/web-datacapture-core"
import { TrackedBarcodeView } from "@scandit/web-datacapture-barcode"

// ...
barcodeBatch.addListener({
  didUpdateSession: (barcodeBatch, session) => {
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

- Set a [BarcodeBatchListener](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) on the barcode tracking
- In the [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch-session.html#property-scandit.datacapture.barcode.batch.BarcodeBatchSession.RemovedTrackedBarcodes) tracked barcodes.
- Create and show the views for the added barcodes.
- Remove the views for the lost barcodes.
- Add a method that is called 60fps when [BarcodeBatch](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.batch.TrackedBarcode) on-screen, update the position based on [TrackedBarcode.location](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated.

:::note
The frame coordinates from [TrackedBarcode.location](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.batch.TrackedBarcode.Location) need to be mapped to view coordinates, using
[DataCaptureView.viewQuadrilateralForFrameQuadrilateral()](https://docs.scandit.com/data-capture-sdk/web/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```js
didUpdateSession: (barcodeBatch, session) => {
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
