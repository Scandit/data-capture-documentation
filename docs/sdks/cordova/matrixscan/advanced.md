---
sidebar_position: 3
pagination_next: null
---

# Adding AR Overlays

## Prerequisites

To proceed, you need to setup a project that uses MatrixScan first, check out [this guide](./get-started.md) (you can ignore the bottom section about the visualization of tracked barcodes using [BarcodeTrackingBasicOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay)).

## Getting started

To add advanced AR overlays to a Data Capture View you can take advantage of the [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.

### Using BarcodeTrackingAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```js
const overlay =
	Scandit.BarcodeTrackingAdvancedOverlay.withBarcodeTrackingForView(
		barcodeTracking,
		view
	);
```

At this point, you have two options.

- Add a [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

Using [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener)

- You need to implement [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeTrackingAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/cordova/core/api/anchor.html#enum-scandit.datacapture.core.Anchor). Be aware that it anchors the
  view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeTrackingAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/cordova/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```js
overlay.listener = {
viewForTrackedBarcode: (overlay, trackedBarcode) => {
// Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for
this barcode.
let element = document.createElement('span');
element.innerText = trackedBarcode.barcode.data;
element.style.backgroundColor = '#FFFFFFFF';
return Scandit.TrackedBarcodeView.withHTMLElement(element, null);
},

anchorForTrackedBarcode: (overlay, trackedBarcode) => {
// As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
// Use the function 'offsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
return Scandit.Anchor.TopCenter;
},

offsetForTrackedBarcode: (overlay, trackedBarcode) => {
// This is the offset that will be applied to the view.
// You can use .fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
// We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
return new Scandit.PointWithUnit(
new Scandit.NumberWithUnit(0, Scandit.MeasureUnit.Fraction),
new Scandit.NumberWithUnit(-1, Scandit.MeasureUnit.Fraction),
);
},
};
```

Using the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay)

The function [BarcodeTrackingListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) gives you access to a [session](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you
want to display, and then call [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeTrackingAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeTrackingAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```js
didUpdateSession: (barcodeTracking, session) => {
	session.addedTrackedBarcodes.map((trackedBarcode) => {
		let element = document.createElement('span');
		element.innerText = trackedBarcode.barcode.data;
		element.style.backgroundColor = '#FFFFFFFF';
		let trackedBarcodeView = Scandit.TrackedBarcodeView.withHTMLElement(
			element,
			null
		);

		window.overlay.setViewForTrackedBarcode(trackedBarcodeView, trackedBarcode);
		window.overlay.setAnchorForTrackedBarcode(
			Scandit.Anchor.TopCenter,
			trackedBarcode
		);
		window.overlay.setOffsetForTrackedBarcode(
			new Scandit.PointWithUnit(
				new Scandit.NumberWithUnit(0, Scandit.MeasureUnit.Fraction),
				new Scandit.NumberWithUnit(-1, Scandit.MeasureUnit.Fraction)
			),
			trackedBarcode
		);
	});
};
```
