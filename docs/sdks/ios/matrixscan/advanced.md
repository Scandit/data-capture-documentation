---
sidebar_position: 3
pagination_next: null
framework: ios
tags: [ios]
keywords:
  - ios
unlisted: true
---

# Adding AR Overlays

In the previous section we covered how to vizualize the scan process using the [`BarcodeTrackingBasicOverlay`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay). In this section we will cover how to add custom AR overlays to your MatrixScan application.

There are two ways to add custom AR overlays to your application:

* Using the [`BarcodeTrackingAdvancedOverlay`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, our ready-to-use implementation for view-based AR overlays.
* Provide your own fully custom implementation by using the [`SDCBarcodeTrackingListener.barcodeTracking:didUpdate:frameData:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function to retrieve the tracking information and implement your own AR overlay.

The first option is the easiest and recommended approach for most applications. It covers adding, removing, and animating the overlay’s views whenever needed and is also flexible enough to cover the majority of use cases.

## Using BarcodeTrackingAdvancedOverlay

The advanced overlay combined with its listener offers an easy way of adding augmentations to your [`SDCDataCaptureView`](https://docs.scandit.com/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView). In this example we'll add a view above each barcode showing its content.

First, create a new instance of `SDCBarcodeTrackingAdvancedOverlay` and add it to your `SDCDataCaptureView`:

```swift
let overlay = BarcodeTrackingAdvancedOverlay(barcodeTracking: barcodeTracking, for: captureView)
```

There are two ways to proceed from here:

* Add a [`SDCBarcodeTrackingAdvancedOverlayDelegate`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
* Use the `setters` in the [`overlay`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) to specify the view, anchor, and offset for each barcode.

:::note
The second way will take priority over the first one, meaning that if a view for a barcode has been set using [`SDCBarcodeTrackingAdvancedOverlay.setView:forTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [`SDCBarcodeTrackingAdvancedOverlayDelegate.barcodeTrackingAdvancedOverlay:viewForTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) won’t be invoked for that specific barcode.
:::

### Using the Delegate

For this option, keep in mind that:

* You need to conform to `SDCBarcodeTrackingAdvancedOverlayDelegate`. This protocol’s methods are invoked every time a barcode is newly tracked.
* [`SDCBarcodeTrackingAdvancedOverlayDelegate.barcodeTrackingAdvancedOverlay:viewForTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning `nil` will show no view.
* [`SDCBarcodeTrackingAdvancedOverlayDelegate.barcodeTrackingAdvancedOverlay:anchorForTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through [`SDCAnchor`](https://docs.scandit.com/data-capture-sdk/ios/core/api/anchor.html#enum-scandit.datacapture.core.Anchor). Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom you will have to set an offset.
* [`SDCBarcodeTrackingAdvancedOverlayDelegate.barcodeTrackingAdvancedOverlay:offsetForTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [`SDCPointWithUnit`](https://docs.scandit.com/data-capture-sdk/ios/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```swift
func barcodeTrackingAdvancedOverlay(_ overlay: BarcodeTrackingAdvancedOverlay,
                                    viewFor trackedBarcode: TrackedBarcode) -> UIView? {
    // Create and return the view you want to show for this tracked barcode. You can also return nil, to have no view for this barcode.
    let label = UILabel()
    label.text = trackedBarcode.barcode.data
    label.backgroundColor = .white
    label.sizeToFit()
    return label
}

func barcodeTrackingAdvancedOverlay(_ overlay: BarcodeTrackingAdvancedOverlay,
                                    anchorFor trackedBarcode: TrackedBarcode) -> Anchor {
    // As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
    // Use the function below to adjust the position of the view by providing an offset.
    return .topCenter
}

func barcodeTrackingAdvancedOverlay(_ overlay: BarcodeTrackingAdvancedOverlay,
                                    offsetFor trackedBarcode: TrackedBarcode) -> PointWithUnit {

    // This is the offset that will be applied to the view.
    // You can use .fraction to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
    // We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
    return PointWithUnit(
        x: FloatWithUnit(value: 0, unit: .fraction),
        y: FloatWithUnit(value: -1, unit: .fraction)
    )
}
```

### Using the Setters

The function [`SDCBarcodeTrackingListener.barcodeTracking:didUpdate:frameData:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) gives you access to a [session](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession). This session object contains all added, updated, and removed tracked barcodes. 

From there you can create the view you want to display, and then call:
* [`SDCBarcodeTrackingAdvancedOverlay.setView:forTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode)
* [`SDCBarcodeTrackingAdvancedOverlay.setAnchor:forTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode)
* [`SDCBarcodeTrackingAdvancedOverlay.setOffset:forTrackedBarcode:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```swift
func barcodeTracking(_ barcodeTracking: BarcodeTracking,
                    didUpdate session: BarcodeTrackingSession,
                    frameData: FrameData) {
    DispatchQueue.main.async {
        for trackedBarcode in session.addedTrackedBarcodes {
            let label = UILabel()
            label.text = trackedBarcode.barcode.data
            label.backgroundColor = .white
            label.sizeToFit()
            self.overlay.setView(label, for: trackedBarcode)
            self.overlay.setAnchor(.topCenter, for: trackedBarcode)
            let point = PointWithUnit(x: FloatWithUnit(value: 0, unit: .fraction),
                                      y: FloatWithUnit(value: -1, unit: .fraction))
            self.overlay.setOffset(point, for: trackedBarcode)
        }
    }
}
```

## Using Custom Implementations

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/data-capture-sdk/ios/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates of every tracked barcode. When doing so, keep the following in mind:

* Set a [`SDCBarcodeTrackingListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) on the barcode tracking
* In the [`SDCBarcodeTrackingListener.barcodeTracking:didUpdate:frameData:`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) function fetch the [added](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.AddedTrackedBarcodes) and [removed](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-session.html#property-scandit.datacapture.barcode.tracking.BarcodeTrackingSession.RemovedTrackedBarcodes) tracked barcodes
* Create and show the views for the added barcodes
* Remove the views for the lost barcode
* Via [`CADisplayLink`](https://developer.apple.com/documentation/quartzcore/cadisplaylink), add a method called 60fps when [`SDCBarcodeTracking`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) is enabled. In this method, for each [`SDCTrackedBarcode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.tracking.TrackedBarcode) on-screen, update the position based on [`SDCTrackedBarcode.location`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location). There is no need to animate the change of location, the change of position will happen frequently enough that the view will look animated.
* The frame coordinates from `SDCTrackedBarcode.location` need to be mapped to view coordinates using [`SDCDataCaptureView.viewQuadrilateralForFrameQuadrilateral:`](https://docs.scandit.com/data-capture-sdk/ios/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).

```swift
func barcodeTracking(_ barcodeTracking: BarcodeTracking,
                    didUpdate session: BarcodeTrackingSession,
                    frameData: FrameData) {
    DispatchQueue.main.async {
        for lostTrackIdentifier in session.removedTrackedBarcodes {
            // You now know the identifier of the tracked barcode that has been lost. Usually here you would remove the views associated.
        }

        for trackedBarcode in session.addedTrackedBarcodes {
            // Fixed identifier for the tracked barcode.
            let trackingIdentifier = trackedBarcode.identifier

            // Current location of the tracked barcode.
            let location = trackedBarcode.location
            let quadrilateral = self.captureView.viewQuadrilateral(forFrameQuadrilateral: location)

            // You now know this new tracking's identifier and location. Usually here you would create and show the views.
        }
    }
}
```