---
sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-pick-listener.html#interface-scandit.datacapture.barcode.pick.IBarcodePickListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```swift
mode.addListener(self)

extension PlaygroundViewController: BarcodePickListener {
    func BarcodePick(_ BarcodePick: BarcodePick,
                        didUpdateSession: {
        // Called every time a frame is processed
    }
}
```
