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

```java
barcodeFind.addListener(new BarcodeFindListener() {
    @Override
    public void onSearchPaused(@NonNull Set<BarcodeFindItem> foundItems) {
        // The mode was paused
    }

    @Override
    public void onSearchStarted() {
        // The mode was started
    }

    @Override
    public void onSearchStopped(@NonNull Set<BarcodeFindItem> foundItems) {
        // The mode was stopped after the finish button was clicked
    }
});
```

## Multiple criteria

You can assign different brushes to each BarcodeFindItem, so they appear visually different to the end user. This can be used to make some items stand out more, or to help the user mentally group certain items together.

```java
Brush availableBrush = new Brush(Color.GREEN, Color.GREEN, 1f);
Brush expiredBrush = new Brush(Color.RED, Color.RED, 1f);

Set<BarcodeFindItem> items = new HashSet<>();
items.add(
    new BarcodeFindItem(
        new BarcodeFindItemSearchOptions("9783598215438", availableBrush),
        new BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", null)
    )
);
items.add(
    new BarcodeFindItem(
        new BarcodeFindItemSearchOptions("9783598215414", expiredBrush),
        null
    )
);
```

## Set up a transformation

Sometimes, the barcode data needs to be transformed. For example, if the barcode contains the product identifier and other information, when a product is scanned, the barcode data is first parsed (via a transformation) and then the input list is checked.

First implement the [BarcodeFindTransformer](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-transformer.html#interface-scandit.datacapture.barcode.find.IBarcodeFindTransformer) interface. For example, if you want to only consider the first 5 characters:

```java
class Transformer implements BarcodeFindTransformer {
    @Override
    public String transformBarcodeData(String data) {
        return data.substring(0, 5);
    }
}
```

Then the transformer needs to be set so it can be used by MatrixScan Find:

```java
barcodeFind.setTransformer(new Transformer());
```

## UI Customization

The `BarcodeFindView` by default shows a set of UI elements, any of which can be optionally hidden:

- Play/Pause button
- Finish button
- Searched items carousel
- Guidance hints
- Progress bar (hidden by default)

Each of these elements can be shown or hidden as needed. For example:

```java
barcodeFindView.setShouldShowCarousel(false);
barcodeFindView.setShouldShowProgressBar(true);
// …
```
