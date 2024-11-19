---
sidebar_position: 3
pagination_next: null
framework: cordova
keywords:
  - cordova

---

# Adding AR Overlays

## Prerequisites

To proceed, you need to setup a project that uses MatrixScan first, check out [this guide](./get-started.md) (you can ignore the bottom section about the visualization of tracked barcodes using [BarcodeBatchBasicOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay)).

## Getting started

To add advanced AR overlays to a Data Capture View you can take advantage of the [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) class, which provides a ready-to-use implementation for view-based AR overlays.

### Using BarcodeBatchAdvancedOverlay

As mentioned above, the advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) offers an easy way of adding augmentations to your [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this guide we will add a view above each barcode showing its content.

First of all, create a new instance of [BarcodeBatchAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) and add it to the [DataCaptureView](https://docs.scandit.com/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).

```js
const overlay =
	Scandit.BarcodeBatchAdvancedOverlay.withBarcodeBatchForView(
		barcodeBatch,
		view
	);
```

At this point, you have two options.

- Add a [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener) to the overlay.
- Use the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay) to specify the view, anchor and offset for each barcode.

:::note
The second way will take priority over the first one, which means that if a view for a barcode has been set using [BarcodeBatchAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

Using [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener)

- You need to implement [BarcodeBatchAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
- [BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning _null_ will show no view.
- [BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [Anchor](https://docs.scandit.com/data-capture-sdk/cordova/core/api/anchor.html#enum-scandit.datacapture.core.Anchor). Be aware that it anchors the
  view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you will have to set an offset as explained in the next point.
- [BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/cordova/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

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

Using the setters in the [overlay](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay)

The function [BarcodeBatchListener.didUpdateSession()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) gives you access to a [session](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/barcode-batch-session.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSession), which contains all added, updated and removed tracked barcodes. From here you can create the view you
want to display, and then call [BarcodeBatchAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetViewForTrackedBarcode), [BarcodeBatchAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetAnchorForTrackedBarcode) and [BarcodeBatchAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-batch-advanced-overlay.html#method-scandit.datacapture.barcode.batch.ui.BarcodeBatchAdvancedOverlay.SetOffsetForTrackedBarcode)

```js
didUpdateSession: (barcodeBatch, session) => {
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
