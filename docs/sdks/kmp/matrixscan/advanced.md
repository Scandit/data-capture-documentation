---
description: "There are two ways to add advanced AR overlays to a Data Capture View with MatrixScan Batch."

sidebar_position: 3
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Adding AR Overlays

There are two ways to add advanced AR overlays to a `DataCaptureView` used with MatrixScan Batch:

- Take advantage of the `BarcodeBatchAdvancedOverlay` class, which provides a ready-to-use implementation for view-based AR overlays.
- Provide your own custom implementation, using `BarcodeBatchListener.onSessionUpdated()` to retrieve each barcode's current screen position for every frame.

:::note

- The first way is the easiest, as it takes care of adding, removing and positioning the views whenever needed. It's also flexible enough to cover most use cases.
- You can always handle touch events on the native views you create like you normally would.
  :::

## Using BarcodeBatchAdvancedOverlay

The advanced overlay, combined with `BarcodeBatchAdvancedOverlayListener`, offers an easy way to add augmentations to your `DataCaptureView`. In this guide we add a native view above each tracked barcode.

First, create a `BarcodeBatchAdvancedOverlay` and add it to the `DataCaptureView`:

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatchAdvancedOverlay

val overlay = BarcodeBatchAdvancedOverlay.withBarcodeBatch(barcodeBatch)
dataCaptureView.addOverlay(overlay)
```

At this point, you have two options:

- Set a `BarcodeBatchAdvancedOverlayListener` on the overlay.
- Use the setter methods on the overlay to specify the view, anchor, and offset for each tracked barcode directly.

:::note
The setter methods take priority: if a view for a tracked barcode has been set with `setViewForTrackedBarcode()`, the listener's `viewForTrackedBarcode()` won't be invoked for that barcode.
:::

### Using BarcodeBatchAdvancedOverlayListener

`viewForTrackedBarcode()` asks for a `NativeView` (`android.view.View` on Android, `UIView` on iOS) to display above the barcode. Returning `null` shows no view. `anchorForTrackedBarcode()` asks how to anchor the view via `Anchor` — note that it anchors the view's *center* to the anchor point, so to pin the top or bottom of the view instead, apply an offset. `offsetForTrackedBarcode()` supplies that offset, expressed as a `PointWithUnit`.

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatchAdvancedOverlay
import com.kmp.datacapture.barcode.batch.BarcodeBatchAdvancedOverlayListener
import com.kmp.datacapture.barcode.batch.TrackedBarcode
import com.kmp.datacapture.core.common.geometry.Anchor
import com.kmp.datacapture.core.common.geometry.FloatWithUnit
import com.kmp.datacapture.core.common.geometry.MeasureUnit
import com.kmp.datacapture.core.common.geometry.PointWithUnit
import com.kmp.datacapture.core.ui.NativeView

class MyAdvancedOverlayListener : BarcodeBatchAdvancedOverlayListener {
    override fun viewForTrackedBarcode(
        overlay: BarcodeBatchAdvancedOverlay,
        trackedBarcode: TrackedBarcode,
    ): NativeView? {
        // Build (or return null for) the view you want to show for this tracked barcode.
        return null
    }

    override fun anchorForTrackedBarcode(
        overlay: BarcodeBatchAdvancedOverlay,
        trackedBarcode: TrackedBarcode,
    ): Anchor = Anchor.TOP_CENTER

    override fun offsetForTrackedBarcode(
        overlay: BarcodeBatchAdvancedOverlay,
        trackedBarcode: TrackedBarcode,
    ): PointWithUnit = PointWithUnit(
        // Center horizontally, and move up by the view's own height so it sits above the barcode.
        FloatWithUnit(0f, MeasureUnit.FRACTION),
        FloatWithUnit(-1f, MeasureUnit.FRACTION),
    )
}

overlay.listener = MyAdvancedOverlayListener()
```

### Using the Overlay's Setters

Instead of a listener, `BarcodeBatchListener.onSessionUpdated()` gives you access to a `BarcodeBatchSession` containing added, updated, and removed tracked barcodes. From here you can build the view you want to display and call `setViewForTrackedBarcode()`, `setAnchorForTrackedBarcode()`, and `setOffsetForTrackedBarcode()` on the overlay directly:

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatch
import com.kmp.datacapture.barcode.batch.BarcodeBatchListener
import com.kmp.datacapture.barcode.batch.BarcodeBatchSession
import com.kmp.datacapture.core.common.geometry.Anchor
import com.kmp.datacapture.core.common.geometry.FloatWithUnit
import com.kmp.datacapture.core.common.geometry.MeasureUnit
import com.kmp.datacapture.core.common.geometry.PointWithUnit
import com.kmp.datacapture.core.data.FrameData

class MySetterBasedListener(private val overlay: BarcodeBatchAdvancedOverlay) : BarcodeBatchListener {
    override fun onSessionUpdated(
        barcodeBatch: BarcodeBatch,
        session: BarcodeBatchSession,
        frameData: FrameData,
    ) {
        for (trackedBarcode in session.addedTrackedBarcodes) {
            val view = /* build the native view you want to show for this tracked barcode */ return
            overlay.setViewForTrackedBarcode(trackedBarcode, view)
            overlay.setAnchorForTrackedBarcode(trackedBarcode, Anchor.TOP_CENTER)
            overlay.setOffsetForTrackedBarcode(
                trackedBarcode,
                PointWithUnit(
                    FloatWithUnit(0f, MeasureUnit.FRACTION),
                    FloatWithUnit(-1f, MeasureUnit.FRACTION),
                ),
            )
        }
    }
}
```

Call `overlay.clearTrackedBarcodeViews()` to remove every view the overlay is currently displaying.

## Provide Your Own Custom Implementation

If you do not want to use the advanced overlay, you can build augmented-reality features yourself from the tracking identifier and quadrilateral coordinates every tracked barcode carries:

- Set a `BarcodeBatchListener` on `BarcodeBatch`.
- In `onSessionUpdated()`, read `session.addedTrackedBarcodes` and `session.removedTrackedBarcodes`.
- Create and show your own views for the added barcodes; remove the views for the barcodes that were lost.
- On every update, reposition the views for the barcodes still on screen using `TrackedBarcode.location`. There's no need to animate the change yourself — updates happen frequently enough that the movement already looks smooth.

:::note
`TrackedBarcode.location` is expressed in frame coordinates and must be mapped to view coordinates with `DataCaptureView.mapFrameQuadrilateralToView()`.
:::

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatch
import com.kmp.datacapture.barcode.batch.BarcodeBatchListener
import com.kmp.datacapture.barcode.batch.BarcodeBatchSession
import com.kmp.datacapture.core.data.FrameData

class MyCustomArListener(private val dataCaptureView: DataCaptureView) : BarcodeBatchListener {
    override fun onSessionUpdated(
        barcodeBatch: BarcodeBatch,
        session: BarcodeBatchSession,
        frameData: FrameData,
    ) {
        for (lostIdentifier in session.removedTrackedBarcodes) {
            // Remove the view associated with this tracking identifier.
        }

        for (trackedBarcode in session.addedTrackedBarcodes + session.updatedTrackedBarcodes) {
            val viewQuadrilateral = dataCaptureView.mapFrameQuadrilateralToView(trackedBarcode.location)
            // Position your view at viewQuadrilateral, keyed on trackedBarcode.identifier.
        }
    }
}
```
