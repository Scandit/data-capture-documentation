---
description: "MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs."

sidebar_position: 3
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Mode Listener

To be notified of scan-and-pick session updates directly on the mode (independent of the view), implement `BarcodePickListener` and register it on `BarcodePick`. Listener callbacks are invoked from a background thread.

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePick
import com.kmp.datacapture.barcode.pick.BarcodePickListener
import com.kmp.datacapture.barcode.pick.BarcodePickSession

class MyPickListener : BarcodePickListener {
    override fun onSessionUpdated(barcodePick: BarcodePick, session: BarcodePickSession) {
        // session.trackedItems: barcode data of every item currently tracked.
        // session.addedItems: barcode data of items added since the previous update.
        // session.trackedObjects / session.addedObjects: the underlying tracked objects.
    }
}

barcodePick.addListener(MyPickListener())
```

## Scanning Phase Listener

To track the underlying scanning phase (before items are resolved into pick/unpick actions), implement `BarcodePickScanningListener` and register it with `addScanningListener`:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickScanningListener
import com.kmp.datacapture.barcode.pick.BarcodePickScanningSession

class MyScanningListener : BarcodePickScanningListener {
    override fun onScanningSessionUpdated(barcodePick: BarcodePick, session: BarcodePickScanningSession) {
        // session.scannedItems / session.pickedItems
    }

    override fun onScanningSessionCompleted(barcodePick: BarcodePick, session: BarcodePickScanningSession) {
        // The scanning phase has completed.
    }
}

barcodePick.addScanningListener(MyScanningListener())
```

## BarcodePickView Lifecycle Listener

To know when the view starts, freezes, pauses, or stops, implement `BarcodePickViewListener` and register it on the view:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickViewListener

class MyViewListener : BarcodePickViewListener {
    override fun onStarted(view: BarcodePickView) {
        // The view started (or resumed) picking.
    }

    override fun onFreezed(view: BarcodePickView) {
        // The view froze the camera/highlights.
    }

    override fun onPaused(view: BarcodePickView) {
        // The view paused picking.
    }

    override fun onStopped(view: BarcodePickView) {
        // The view was torn down.
    }
}

barcodePickView.addListener(MyViewListener())
```

## Handling Pick and Unpick Actions

By default, MatrixScan Pick resolves pick/unpick actions on its own. To intercept them — for example, to confirm an action against a backend before it's applied — implement `BarcodePickActionListener` and register it on the view. Each callback must eventually be completed by invoking `onFinish` on the supplied `BarcodePickActionCallback`.

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickActionCallback
import com.kmp.datacapture.barcode.pick.BarcodePickActionListener

class MyActionListener : BarcodePickActionListener {
    override fun onPick(itemData: String, callback: BarcodePickActionCallback) {
        // Perform any validation, then resolve the action.
        callback.onFinish(true)
    }

    override fun onUnpick(itemData: String, callback: BarcodePickActionCallback) {
        callback.onFinish(true)
    }
}

barcodePickView.addActionListener(MyActionListener())
```

## Programmatic Item Selection

To start an item-selection request from your own code (for example, from a custom UI element rather than the built-in highlights), call `selectItemWithData` on `BarcodePick`. Complete the pending `BarcodePickSelectItemActionCallback` with the desired `BarcodePickAction`:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickAction
import com.kmp.datacapture.barcode.pick.BarcodePickSelectItemActionCallback

barcodePick.selectItemWithData(
    "9783598215438",
    object : BarcodePickSelectItemActionCallback {
        override fun onFinish(action: BarcodePickAction) {
            // action is PICK, UNPICK, or NONE.
        }
    },
)
```

Once an action has been triggered (by the built-in UI or programmatically), confirm or cancel it explicitly:

```kotlin
barcodePick.confirmActionForItemWithData("9783598215438")
// or
barcodePick.cancelActionForItemWithData("9783598215438")
```

## Updating the Product List at Runtime

If the set of products to pick changes during a session (e.g. a new pick list is loaded), call `updateProductList` on the `BarcodePickAsyncMapperProductProvider` instead of recreating the mode:

```kotlin
productProvider.updateProductList(
    setOf(
        BarcodePickProduct("9783598215438", 5),
    ),
)
```

## Customizing Highlight Styles

`BarcodePickViewSettings.highlightStyle` accepts any `BarcodePickViewHighlightStyle` implementation. The dot and rectangular styles let you customize the brush used per picking state (`BarcodePickState.IGNORE`, `TO_PICK`, `PICKED`, `UNKNOWN`):

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickState
import com.kmp.datacapture.barcode.pick.BarcodePickViewHighlightStyleDot
import com.kmp.datacapture.core.common.Color
import com.kmp.datacapture.core.ui.style.Brush

val toPickBrush = Brush(
    fillColor = Color.fromRgba(0, 255, 0),
    strokeColor = Color.fromRgba(0, 0, 0),
    strokeWidth = 2f,
)

val highlightStyle = BarcodePickViewHighlightStyleDot().also {
    it.setBrushForState(toPickBrush, BarcodePickState.TO_PICK)
    it.setSelectedBrushForState(toPickBrush, BarcodePickState.TO_PICK)
}

barcodePickViewSettings.highlightStyle = highlightStyle
```

`BarcodePickViewHighlightStyleRectangular` offers the same brush customization with a rectangular highlight shape, plus `minimumHighlightWidth`/`minimumHighlightHeight`.

### Icons and Async Highlight Styles

`BarcodePickViewHighlightStyleDotWithIcons` and `BarcodePickViewHighlightStyleRectangularWithIcons` add per-state icons (`setIconForState`/`setSelectedIconForState`) on top of the brush customization above. Both also expose `asyncStyleProvider`, letting you resolve the style per item asynchronously — for example, to look up a status icon from a backend:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickStatusIconStyle
import com.kmp.datacapture.barcode.pick.BarcodePickViewHighlightStyleAsyncProvider
import com.kmp.datacapture.barcode.pick.BarcodePickViewHighlightStyleDotWithIcons
import com.kmp.datacapture.barcode.pick.BarcodePickViewHighlightStyleRequest
import com.kmp.datacapture.barcode.pick.BarcodePickViewHighlightStyleResponse
import com.kmp.datacapture.core.common.Color
import com.kmp.datacapture.core.ui.ScanditIcon
import com.kmp.datacapture.core.ui.ScanditIconType

val outOfStockIcon = ScanditIcon.builder()
    .withIcon(ScanditIconType.EXCLAMATION_MARK)
    .withIconColor(Color.fromRgba(255, 255, 255))
    .withBackgroundColor(Color.fromRgba(200, 0, 0))
    .build()

val iconHighlightStyle = BarcodePickViewHighlightStyleDotWithIcons().also {
    it.asyncStyleProvider = object : BarcodePickViewHighlightStyleAsyncProvider {
        override fun styleForRequest(
            request: BarcodePickViewHighlightStyleRequest,
            callback: (BarcodePickViewHighlightStyleResponse?) -> Unit,
        ) {
            val statusIconStyle = BarcodePickStatusIconStyle.withColors(
                iconColor = Color.fromRgba(255, 255, 255),
                iconBackgroundColor = Color.fromRgba(200, 0, 0),
                text = "Out of stock",
            )
            callback(
                BarcodePickViewHighlightStyleResponse.withBrushAndIcon(
                    brush = null,
                    icon = outOfStockIcon,
                    statusIconStyle = statusIconStyle,
                ),
            )
        }
    }
}
```

`request.itemData`, `request.productIdentifier`, and `request.state` let you tailor the response per scanned item. Returning `null` from `callback` falls back to the default style. `BarcodePickStatusIconSettings` (`ratioToHighlightSize`, `minSize`, `maxSize`) controls the rendered icon size on the `...WithIcons` and `BarcodePickViewHighlightStyleCustomView` styles.

## Recommended Camera Settings

`BarcodePick` exposes camera settings tuned for scan-and-pick workflows:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePick

val cameraSettings = BarcodePick.recommendedCameraSettings()
```
