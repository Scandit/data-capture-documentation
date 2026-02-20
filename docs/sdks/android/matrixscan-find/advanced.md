---
description: "MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## BarcodeFind Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodeFind` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodeFindListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```kotlin
barcodeFind.addListener(object : BarcodeFindListener() {
    override fun onSearchPaused(foundItems: Set<BarcodeFindItem>) {
        // The mode was paused
    }

    override fun onSearchStarted() {
        // The mode was started
    }

    override fun onSearchStopped(foundItems: Set<BarcodeFindItem>) {
        // The mode was stopped after the finish button was clicked
    }
})
```

## Multiple criteria

You can assign different brushes to each BarcodeFindItem, so they appear visually different to the end user. This can be used to make some items stand out more, or to help the user mentally group certain items together.

```kotlin
val availableBrush = Brush(Color.GREEN, Color.GREEN, 1f)
val expiredBrush = Brush(Color.RED, Color.RED, 1f)

val items = setOf(
    BarcodeFindItem(
        BarcodeFindItemSearchOptions("9783598215438", availableBrush),
        BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null),
    ),
    BarcodeFindItem(
        BarcodeFindItemSearchOptions("9783598215414", expiredBrush),
        null,
    ),
)
```

## Set up a transformation

Sometimes, the barcode data needs to be transformed. For example, if the barcode contains the product identifier and other information, when a product is scanned, the barcode data is first parsed (via a transformation) and then the input list is checked.

First implement the [BarcodeFindTransformer](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-transformer.html#interface-scandit.datacapture.barcode.find.IBarcodeFindTransformer) interface. For example, if you want to only consider the first 5 characters:

```kotlin
class Transformer: BarcodeFindTransformer {
    override fun transformBarcodeData(data: String?): String? =
        data?.substring(0, 5)
}
```

Then the transformer needs to be set so it can be used by MatrixScan Find:

```kotlin
barcodeFind.setTransformer(Transformer())
```

## UI Customization

The `BarcodeFindView` by default shows a set of UI elements, any of which can be optionally hidden:

- Play/Pause button
- Finish button
- Searched items carousel
- Guidance hints
- Progress bar (hidden by default)

Each of these elements can be shown or hidden as needed. For example:

```kotlin
barcodeFindView.shouldShowCarousel = false
barcodeFindView.shouldShowProgressBar = true
// …
```
