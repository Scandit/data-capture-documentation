---
description: "MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs."

sidebar_position: 3
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Advanced Configurations

MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.

## Group (Cluster) Scanning

`BarcodeCountSettings` lets you enable cluster scanning, grouping multiple barcodes together based on their spatial context:

```kotlin
settings.groupScanningEnabled = true
settings.expectedNumberOfBarcodesPerCluster = 5
```

Recognized clusters are surfaced as `Cluster` instances, each exposing the barcodes it contains and a `ClusterExpectationStatus` (`NOT_EVALUATED`, `MATCHES`, `DEVIATES`). You can customize how clusters are highlighted and react to taps on them by implementing `BarcodeCountViewListener`:

```kotlin
import com.kmp.datacapture.barcode.count.BarcodeCountViewListener
import com.kmp.datacapture.barcode.data.Cluster
import com.kmp.datacapture.core.ui.style.Brush

val listener = object : BarcodeCountViewListener {
    override fun brushForCluster(view: BarcodeCountView, cluster: Cluster): Brush? {
        // Return a custom brush based on cluster.expectationStatus
        return null
    }

    override fun onClusterTapped(view: BarcodeCountView, cluster: Cluster) {
        // Do something with the tapped cluster
    }
}

barcodeCountView.listener = listener
```

## Strap Mode

It can be difficult to reach the shutter button if the smart device is attached to the user's wrist by a strap or similar. In this instance, you can enable a floating shutter button that can be positioned by the end user in a more ergonomically suitable position:

```kotlin
barcodeCountView.shouldShowFloatingShutterButton = true
```

## Filtering

If you have several types of barcodes on your label or package, you may want to scan only one of them. This can be done by symbology, symbol count, or a regular expression, through `BarcodeCountSettings.filterSettings`.

For example, you might want to scan only Code 128 barcodes and exclude PDF417 ones:

```kotlin
import com.kmp.datacapture.barcode.data.Symbology

settings.enableSymbology(Symbology.CODE128, true)
settings.filterSettings.excludedSymbologies = setOf(Symbology.PDF417)
```

Or exclude all barcodes matching a pattern, for instance ones starting with four digits:

```kotlin
settings.filterSettings.excludedCodesRegex = "^1234.*"
```

You can also exclude EAN-13 or UPC-A barcodes specifically:

```kotlin
settings.filterSettings.excludeEan13 = true
settings.filterSettings.excludeUpca = true
```

Filtered-out barcodes that are tapped by the user are surfaced through `BarcodeCountViewListener.onFilteredBarcodeTapped`.

## Custom Status Icons

Instead of the default recognized/accepted/rejected icons, you can drive per-barcode status icons (for example, "expiring soon" or "low stock") by implementing `BarcodeCountStatusProvider` and registering it on the view:

```kotlin
import com.kmp.datacapture.barcode.batch.TrackedBarcode
import com.kmp.datacapture.barcode.count.BarcodeCountStatus
import com.kmp.datacapture.barcode.count.BarcodeCountStatusItem
import com.kmp.datacapture.barcode.count.BarcodeCountStatusProvider
import com.kmp.datacapture.barcode.count.BarcodeCountStatusProviderCallback
import com.kmp.datacapture.barcode.count.BarcodeCountStatusResult

val statusProvider = object : BarcodeCountStatusProvider {
    override fun onStatusRequested(
        barcodes: List<TrackedBarcode>,
        callback: BarcodeCountStatusProviderCallback,
    ) {
        val statusItems = barcodes.map { barcode ->
            BarcodeCountStatusItem.create(barcode, BarcodeCountStatus.EXPIRING_SOON)
        }
        callback.onStatusReady(
            BarcodeCountStatusResult.Success(
                statusList = statusItems,
                statusModeEnabledMessage = "Status mode enabled",
                statusModeDisabledMessage = "Status mode disabled",
            ),
        )
    }
}

barcodeCountView.setStatusProvider(statusProvider)
barcodeCountView.shouldShowStatusModeButton = true
```

`BarcodeCountStatusResult` can also be created via `Abort(errorMessage)` when the status lookup fails, or `Error(statusList, errorMessage, statusModeDisabledMessage)` to report a partial failure.

## Clear Screen Button

There are situations in which the user may find it helpful to clean up their screen (i.e. clear all the AR overlays) but keep the list of barcodes scanned. If this is the case, you can enable the "Clear screen" button:

```kotlin
barcodeCountView.shouldShowClearHighlightsButton = true
```

You can also trigger the same behavior programmatically:

```kotlin
barcodeCountView.clearHighlights()
```

## Customize Overlay Colors and Icons

MatrixScan Count comes with recommended and user-tested AR overlays. However, if you wish to customize the overlay colors or icons, implement `BarcodeCountViewListener` and register it on the view. The relevant methods are invoked every time a new recognized, accepted, or rejected barcode appears:

```kotlin
import com.kmp.datacapture.barcode.batch.TrackedBarcode
import com.kmp.datacapture.barcode.count.BarcodeCountIcon
import com.kmp.datacapture.barcode.count.BarcodeCountViewListener
import com.kmp.datacapture.core.ui.style.Brush

val listener = object : BarcodeCountViewListener {
    override fun brushForRecognizedBarcode(view: BarcodeCountView, trackedBarcode: TrackedBarcode): Brush? {
        // Return a custom brush
        return null
    }

    override fun iconForRecognizedBarcode(view: BarcodeCountView, trackedBarcode: TrackedBarcode): BarcodeCountIcon? {
        // Return a custom icon
        return null
    }
}

barcodeCountView.listener = listener
```

`brushForRecognizedBarcodeNotInList`, `brushForAcceptedBarcode`, `brushForRejectedBarcode` (and their `iconFor…` counterparts) are available the same way.

## Notifications on Tap

If you want to be notified when a user taps on an overlay, implement the corresponding methods on `BarcodeCountViewListener`:

```kotlin
override fun onRecognizedBarcodeTapped(view: BarcodeCountView, trackedBarcode: TrackedBarcode) {
    // Do something with the tapped barcode
}

override fun onRecognizedBarcodeNotInListTapped(view: BarcodeCountView, trackedBarcode: TrackedBarcode) {
    // Do something with the tapped barcode
}
```

To let the user tap a highlight to deselect (uncount) it, enable:

```kotlin
barcodeCountView.tapToUncountEnabled = true
```

## Disable UI Elements

The UI is an integral part of MatrixScan Count and we do not recommend that you use it without it. However, if you wish to disable UI elements you can do so as follows.

Disable buttons:

```kotlin
barcodeCountView.shouldShowListButton = false
barcodeCountView.shouldShowExitButton = false
barcodeCountView.shouldShowShutterButton = false
```

Disable feedback and hints:

```kotlin
barcodeCountView.shouldShowUserGuidanceView = false
barcodeCountView.shouldShowHints = false
```

## Feedback

Success and failure sound/vibration feedback is configured on the mode via `BarcodeCountFeedback`:

```kotlin
import com.kmp.datacapture.barcode.count.BarcodeCountFeedback

val feedback = BarcodeCountFeedback.defaultFeedback()
barcodeCount.feedback = feedback
```

## Additional Barcodes

You can inject barcodes into a session that were not scanned by the camera — for example, items added manually by the user:

```kotlin
// barcode is a previously obtained com.kmp.datacapture.barcode.data.Barcode instance.
barcodeCount.setAdditionalBarcodes(listOf(barcode))
// ...
barcodeCount.clearAdditionalBarcodes()
```
