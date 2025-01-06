---
sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
unlisted: true
---

# Adding AR Overlays

In the previous section we covered how to vizualize the scan process using the `BarcodeTrackingBasicOverlay`. This section describes the steps to add custom AR overlays to your MatrixScan application.

There are two ways to add custom AR overlays to your application:

* Use [BarcodeTrackingAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay) class, our ready-to-use implementation for view-based AR overlays.
* Provide your own fully custom implementation by using the function [BarcodeTrackingListener.onSessionUpdated()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) to retrieve the barcode’s current screen position for each frame.

:::note
The first option is the easiest and recommended approach for most applications. It covers adding, removing, and animating the overlay’s views whenever needed. In addition, this option is flexible enough to cover the majority of use cases.
:::

## Using BarcodeTrackingAdvancedOverlay

The advanced overlay combined with its [listener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) offers an easy way of adding augmentations to your `DataCaptureView`.
This example describes the steps to add a view above each barcode showing its content.

First, create a new instance of `BarcodeTrackingAdvancedOverlay` and add it to your `DataCaptureView`:

```java
BarcodeTrackingAdvancedOverlay overlay = BarcodeTrackingAdvancedOverlay.newInstance(barcodeTracking, dataCaptureView);
```

There are two ways to proceed from here:

* Add a [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener) to the overlay.
* Use the `setters` in the `overlay` to specify the view, anchor, and offset for each barcode.

:::note
The second way takes priority over the first one, meaning that if a view for a barcode has been set using [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode), the function [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode), won’t be invoked for that specific barcode.
:::

### Using the Listener

For this option, keep in mind that:

* You need to conform to [BarcodeTrackingAdvancedOverlayListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener). This interface’s methods are invoked every time a barcode is newly tracked.
* [BarcodeTrackingAdvancedOverlayListener.viewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.ViewForTrackedBarcode) asks for a view to animate on top of the barcode. Returning null shows no view.
* [BarcodeTrackingAdvancedOverlayListener.anchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.AnchorForTrackedBarcode) asks how to anchor the view to the barcode through Anchor. Be aware that it anchors the view’s center to the anchor point. To achieve anchoring the top of the view or the bottom etc. you need to set an offset as explained in the next point.
* [BarcodeTrackingAdvancedOverlayListener.offsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingAdvancedOverlayListener.OffsetForTrackedBarcode) asks for an offset that is applied on the already anchored view. This offset is expressed through a [PointWithUnit](https://docs.scandit.com/data-capture-sdk/android/core/api/common.html#struct-scandit.datacapture.core.PointWithUnit).

```java
@Nullable
@Override
public View viewForTrackedBarcode(
    @NotNull BarcodeTrackingAdvancedOverlay overlay,
    @NotNull TrackedBarcode trackedBarcode
) {
    // Create and return the view you want to show for this tracked barcode. You can also return null, to have no view for this barcode.
    TextView textView = new TextView(this);
    textView.setBackgroundColor(Color.WHITE);
    textView.setLayoutParams(
        new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
    );
    textView.setText(trackedBarcode.getBarcode().getData());
    return textView;
}

@NotNull
@Override
public Anchor anchorForTrackedBarcode(
    @NotNull BarcodeTrackingAdvancedOverlay overlay,
    @NotNull TrackedBarcode trackedBarcode
) {
    // As we want the view to be above the barcode, we anchor the view's center to the top-center of the barcode quadrilateral.
    // Use the function 'offsetForTrackedBarcode' below to adjust the position of the view by providing an offset.
    return Anchor.TOP_CENTER;
}

@NotNull
@Override
public PointWithUnit offsetForTrackedBarcode(
    @NotNull BarcodeTrackingAdvancedOverlay overlay,
    @NotNull TrackedBarcode trackedBarcode,
    @NotNull View view
) {
    // This is the offset that will be applied to the view.
    // You can use MeasureUnit.FRACTION to give a measure relative to the view itself, the sdk will take care of transforming this into pixel size.
    // We now center horizontally and move up the view to make sure it's centered and above the barcode quadrilateral by half of the view's height.
    return new PointWithUnit(
        new FloatWithUnit(0f, MeasureUnit.FRACTION),
        new FloatWithUnit(-1f, MeasureUnit.FRACTION)
    );
}
```

### Using the Setters

The function `BarcodeTrackingListener.onSessionUpdated()` gives you access to a `session`, which contains all added, updated and removed tracked barcodes.

From here you can create the view you want to display, and then call:

* [BarcodeTrackingAdvancedOverlay.setViewForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetViewForTrackedBarcode)
* [BarcodeTrackingAdvancedOverlay.setAnchorForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetAnchorForTrackedBarcode)
* [BarcodeTrackingAdvancedOverlay.setOffsetForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-advanced-overlay.html#method-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingAdvancedOverlay.SetOffsetForTrackedBarcode)

```java
@Override
public void onSessionUpdated(
    @NonNull BarcodeTracking mode,
    @NonNull final BarcodeTrackingSession session,
    @NonNull FrameData data
) {
      // Be careful, this function is not invoked on the main thread!
      runOnUiThread(new Runnable() {
          @Override
          public void run() {
              for (TrackedBarcode trackedBarcode : session.getAddedTrackedBarcodes()) {
                  TextView textView = new TextView(this);
                  textView.setBackgroundColor(Color.WHITE);
                  textView.setLayoutParams(
                      new ViewGroup.LayoutParams(
                          ViewGroup.LayoutParams.WRAP_CONTENT,
                          ViewGroup.LayoutParams.WRAP_CONTENT
                      )
                  );
                  textView.setText(trackedBarcode.getBarcode().getData());
                  overlay.setViewForTrackedBarcode(trackedBarcode, textView);
                  overlay.setAnchorForTrackedBarcode(
                      trackedBarcode, Anchor.TOP_CENTER
                  );
                  overlay.setOffsetForTrackedBarcode(
                      trackedBarcode,
                      new PointWithUnit(
                          new FloatWithUnit(0f, MeasureUnit.FRACTION),
                          new FloatWithUnit(-1f, MeasureUnit.FRACTION)
                      )
                  );
              }
          }
      });
  }
```

## Using Custom Implementations

If you do not want to use the overlay, it is also possible to add augmented reality features based on the tracking identifier and the [quadrilateral](https://docs.scandit.com/data-capture-sdk/android/core/api/common.html#struct-scandit.datacapture.core.Quadrilateral) coordinates of every tracked barcode. When doing so, keep the following in mind:

* Set a `BarcodeTrackingListener` on the barcode tracking
* In the `BarcodeTrackingListener.onSessionUpdated()` function, fetch the added and removed tracked barcodes
* Create and show the views for the added barcodes
* Remove the views for the lost barcode
* Add a method that is called 60fps when `BarcodeTracking` is enabled. In this method, for each [TrackedBarcode](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/tracked-barcode.html#class-scandit.datacapture.barcode.tracking.TrackedBarcode) on-screen, update the position based on [TrackedBarcode.location](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/tracked-barcode.html#property-scandit.datacapture.barcode.tracking.TrackedBarcode.Location). Please note that there is no need to animate the change of location, the change of position will happen frequently enough that the view will look as it is animated

:::note
The frame coordinates from `TrackedBarcode.location` need to be mapped to view coordinates, using [DataCaptureView.mapFrameQuadrilateralToView()](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#method-scandit.datacapture.core.ui.DataCaptureView.MapFrameQuadrilateralToView).
:::

```java
@Override
  public void onSessionUpdated(
      @NonNull BarcodeTracking mode,
      @NonNull final BarcodeTrackingSession session,
      @NonNull FrameData data
  ) {
      // Be careful, this function is not invoked on the main thread!
      runOnUiThread(new Runnable() {
          @Override
          public void run() {

              for (int lostTrackIdentifier : session.getRemovedTrackedBarcodes()) {
                  // You now know the identifier of the tracked barcode that has been lost. Usually here you would remove the views associated.
              }

              for (TrackedBarcode trackedBarcode : session.getAddedTrackedBarcodes()) {

                  // Fixed identifier for the tracked barcode.
                  Integer trackingIdentifier = trackedBarcode.getIdentifier();

                  // Current location of the tracked barcode.
                  Quadrilateral location = trackedBarcode.getLocation();
                  Quadrilateral quadrilateral = dataCaptureView.mapFrameQuadrilateralToView(location);

                  // You now know this new tracking's identifier and location. Usually here you would create and show the views.
              }
          }
      });
  }
```
