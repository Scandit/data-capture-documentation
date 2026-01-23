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

To do this, you can directly register a [`BarcodeFindListener`](https://docs.scandit.com/7.6/data-capture-sdk/android/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```java
mode.addListener(new BarcodeFindListener() {
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

## Set up a transformation

Sometimes, the barcode data needs to be transformed. For example, if the barcode contains the product identifier and other information, when a product is scanned, the barcode data is first parsed (via a transformation) and then the input list is checked.

First implement the [BarcodeFindTransformer](https://docs.scandit.com/7.6/data-capture-sdk/android/barcode-capture/api/barcode-find-transformer.html#interface-scandit.datacapture.barcode.find.IBarcodeFindTransformer) interface. For example, if you want to only consider the first 5 characters:

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
barcodeFind.setBarcodeTransformer(new Transformer())
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
