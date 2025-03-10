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
extension ViewController: BarcodePickListener {
    func barcodePick(_ barcodePick: BarcodePick, didUpdate session: BarcodePickSession) {
        // This callback will be invoked on a background thread every frame. The session object contains
        // updated the newly tracked items.
    }
}
```

## BarcodePickAction Listener

You may want to be notified when a user interacts with the UI of the `BarcodePick` mode, which can then be used to reject specific pick/unpick actions.

```swift
extension ViewController: BarcodePickActionListener {
    func didPickItem(withData data: String, completionHandler: @escaping (Bool) -> Void) {
        // Perform the needed checks, and invoke completionHandler(true/false) to allow/reject
        // the current pick action
        completionHandler(true)
    }
    
    func didUnpickItem(withData data: String, completionHandler: @escaping (Bool) -> Void) {
        // Perform the needed checks, and invoke completionHandler(true/false) to allow/reject
        // the current unpick action
        completionHandler(true)
    }
}
```

## BarcodePickScanning Listener

You can register a [`BarcodePickScanningListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-pick-scanning-listener.html#interface-scandit.datacapture.barcode.pick.IBarcodePickScanningListener) on the mode, which can be used to listen to every time the pick state changes.

```swift
extension ViewController: BarcodePickScanningListener {
    func barcodePick(_ barcodePick: BarcodePick, didUpdate scanningSession: BarcodePickScanningSession) {
        // This callback will be invoked on a background thread every time the picked state of some item changes.
        // The session object contains the list of picked and scanned items.
    }

    func barcodePick(_ barcodePick: BarcodePick, didComplete scanningSession: BarcodePickScanningSession) {
        // This callback is invoked when all the registered items needing picking have been picked.
    }
}
```