---
description: "MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You can register a [`BarcodePickListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-listener.html) on the mode, which can be used to get updates about the scanned items with each frame.

```kotlin
barcodePick.addListener(object : BarcodePickListener {
    override fun onSessionUpdated(barcodePick: BarcodePick, session: BarcodePickSession) {
        // This callback will be invoked on a background thread every frame. the session object contains
        // updated the newly tracked items.
    }

    override fun onObservationStarted(barcodePick: BarcodePick) {}

    override fun onObservationStopped(barcodePick: BarcodePick) {}
})
```

## BarcodePickScanning Listener

You can register a [`BarcodePickScanningListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-scanning-listener.html) on the mode, which can be used to listen to every time the pick state changes.

```kotlin
barcodePick.addScanningListener(object : BarcodePickScanningListener {
    override fun onScanningSessionUpdated(barcodePick: BarcodePick, session: BarcodePickScanningSession) {
        // This callback will be invoked on a background thread every time the picked state of some item changes.
        // The session object contains the list of picked and scanned items.
    }

    override fun onScanningSessionCompleted(barcodePick: BarcodePick, session: BarcodePickScanningSession) {
        // This callback is invoked when all the registered items needing picking have been picked.
    }

    override fun onObservationStarted(barcodePick: BarcodePick) {}

    override fun onObservationStopped(barcodePick: BarcodePick) {}
})
```

## BarcodePickView Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickViewListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-listener.html) on the mode itself, keeping in mind that these listeners are called from a background thread.

```kotlin
barcodePickView.listener = object : BarcodePickViewListener {
    override fun onStopped(view: BarcodePickView) {}

    override fun onPaused(view: BarcodePickView) {}

    override fun onFreezed(view: BarcodePickView) {}

    override fun onStarted(view: BarcodePickView) {}
}
```

## BarcodePickAction Listener

You can also register a [`BarcodePickActionListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-action-listener.html) on the mode, which can be used to reject specific pick/unpick actions.

```kotlin
barcodePickView.addActionListener(object : BarcodePickActionListener {
    override fun onPick(itemData: String, callback: BarcodePickActionCallback) {
        // Perform the needed checks, and invoke callback.onFinish(true/false) to allow/reject
        // the current pick action
    }

    override fun onUnpick(itemData: String, callback: BarcodePickActionCallback) {
        // Perform the needed checks, and invoke callback.onFinish(true/false) to allow/reject
        // the current unpick action
    }
})
```
