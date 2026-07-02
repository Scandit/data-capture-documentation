---
description: "MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs."

sidebar_position: 3
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## Set Up a Listener on the BarcodeFind Mode

You may want more fine-grained knowledge of the different events happening during the life of the `BarcodeFind` mode, such as when the search starts, pauses, and stops. To do this, register a `BarcodeFindListener` directly on the mode:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindItem
import com.kmp.datacapture.barcode.find.BarcodeFindListener
import com.kmp.datacapture.barcode.find.BarcodeFindSession

val listener = object : BarcodeFindListener {
    override fun onSearchStarted() {
        // The mode was started
    }

    override fun onSearchPaused(foundItems: Set<BarcodeFindItem>) {
        // The mode was paused
    }

    override fun onSearchStopped(foundItems: Set<BarcodeFindItem>) {
        // The mode was stopped after the finish button was tapped
    }

    override fun onSessionUpdated(session: BarcodeFindSession) {
        // session.trackedBarcodes reflects the barcodes currently tracked in the scene
    }
}

barcodeFind.addListener(listener)
```

## Transform Barcode Data

If the data encoded in your barcodes doesn't directly match the data you search for (for example, it needs stripping or reformatting), register a `BarcodeFindTransformer`. It is invoked on every decoded barcode before it is matched against the item list:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindTransformer

barcodeFind.setBarcodeTransformer(
    object : BarcodeFindTransformer {
        override fun transformBarcodeData(data: String?): String? {
            // Return the transformed data used for matching, or null to ignore the barcode
            return data
        }
    },
)
```

## Custom Highlight per Item

Each `BarcodeFindItemSearchOptions` can carry its own highlight `Brush`, overriding the view's default in-list/not-in-list colors for that specific item:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindItemSearchOptions
import com.kmp.datacapture.core.ui.style.Brush

// customBrush is any Brush you've already constructed for your own highlight style.
val searchOptions = BarcodeFindItemSearchOptions("9783598215438", brush = customBrush)
```

## UI Configuration

`BarcodeFindView` shows a set of UI elements by default, which can be optionally hidden:

```kotlin
barcodeFindView.shouldShowPauseButton = false
barcodeFindView.shouldShowFinishButton = false
barcodeFindView.shouldShowCarousel = false
barcodeFindView.shouldShowHints = false
barcodeFindView.shouldShowUserGuidanceView = false
```

There is also a progress bar, hidden by default:

```kotlin
barcodeFindView.shouldShowProgressBar = true
```

The torch and zoom controls can be toggled the same way:

```kotlin
barcodeFindView.shouldShowTorchControl = false
barcodeFindView.shouldShowZoomControl = false
```

## Hardware Trigger

On devices with a hardware scan trigger, you can let the user start/pause searching with a physical button instead of the on-screen shutter. Check support first, then enable it through `BarcodeFindViewSettings`:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindView
import com.kmp.datacapture.barcode.find.BarcodeFindViewSettings
import com.kmp.datacapture.core.common.Color

if (BarcodeFindView.hardwareTriggerSupported) {
    val viewSettings = BarcodeFindViewSettings(
        inListItemColor = Color.fromRgba(0, 255, 0),
        notInListItemColor = Color.fromRgba(255, 0, 0),
        soundEnabled = true,
        hapticEnabled = true,
        hardwareTriggerEnabled = true,
        hardwareTriggerKeyCode = 0,
    )
}
```

## Pausing the Search

In addition to `startSearching()` and `stopSearching()`, you can pause an in-progress search — for example when the user wants to inspect the found-items carousel without losing progress:

```kotlin
barcodeFindView.pauseSearching()
```
