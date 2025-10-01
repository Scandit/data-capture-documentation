---
description: "MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## BarcodeFind Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodeFind` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`SDCBarcodeFindListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```swift
mode.addListener(self)

extension PlaygroundViewController: BarcodeFindListener {
    func barcodeFind(_ barcodeFind: BarcodeFind,
                     didPauseSearch foundItems: Set<BarcodeFindItem>) {
        // The mode was paused
    }

    func barcodeFindDidStartSearch(_ barcodeFind: BarcodeFind) {
        // The mode was started
    }

    func barcodeFind(_ barcodeFind: BarcodeFind,
                     didStopSearch foundItems: Set<BarcodeFindItem>) {
        // The mode was stopped
    }
}
```

## Set Up a Transformation

Sometimes the barcode data needs to be transformed. For example, if the barcode contains the product identifier and other information, when a product is scanned, the barcode data is first parsed (via a transformation) and then the input list is checked.

First conform to the [`SDCBarcodeFindTransformer`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find-transformer.html#interface-scandit.datacapture.barcode.find.IBarcodeFindTransformer) protocol. For example, if you want to only consider the first 5 characters:

```swift
class Transformer: NSObject, BarcodeFindTransformer {
    func transformBarcodeData(_ data: String) -> String? {
        return String(data.prefix(5))
    }
}
```

Then the transformer needs to be set so it can be used by Barcode Find:

```swift
barcodeFind.setBarcodeTransformer(Transformer())
```

## UI Customization

The [`SDCBarcodeFindView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) by default shows a set of UI elements, any of which can be optionally hidden:

- Play/Pause button
- Finish button
- Searched items carousel
- Guidance hints
- Progress bar (hidden by default)

Each of these elements can be shown or hidden as needed. For example:

```swift
barcodeFindView.shouldShowCarousel = false
barcodeFindView.shouldShowProgressBar = true
```
