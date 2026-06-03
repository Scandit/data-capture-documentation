---
description: "MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.                                                                     "

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
extension ViewController: BarcodePickListener {
    func barcodePick(_ barcodePick: BarcodePick, didUpdate session: BarcodePickSession) {
        // This callback will be invoked on a background thread every frame. The session object contains
        // updated the newly tracked items.
    }
}
```

## BarcodePickView Listener

For lifecycle events on the `BarcodePickView` itself — when scanning starts, freezes, pauses, or stops — register a [`BarcodePickViewListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-pick-view-listener.html#interface-scandit.datacapture.barcode.pick.ui.BarcodePickViewListener) on the view. All callbacks are optional; implement only the ones you need.

```swift
extension ViewController: BarcodePickViewListener {
    func barcodePickViewDidStartScanning(_ view: BarcodePickView) {
        // Invoked when the view starts scanning (e.g. after a call to start()).
    }

    func barcodePickViewDidFreezeScanning(_ view: BarcodePickView) {
        // Invoked when the view freezes the current frame (e.g. after a call to freeze()).
    }

    func barcodePickViewDidPauseScanning(_ view: BarcodePickView) {
        // Invoked when the view pauses scanning (e.g. after a call to pause()).
    }

    func barcodePickViewDidStopScanning(_ view: BarcodePickView) {
        // Invoked when the view stops scanning (e.g. after a call to stop()).
    }
}
```

Register it on the view:

```swift
barcodePickView.addListener(self)
```