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

```java
barcodePick.addListener(new BarcodePickListener() {
    @Override
    public void onSessionUpdated(@NonNull BarcodePick barcodePick, @NonNull BarcodePickSession session) {
        // This callback will be invoked on a background thread every frame. the session object contains
        // updated the newly tracked items.
    }

    @Override
    public void onObservationStarted(@NonNull BarcodePick barcodePick) {}

    @Override
    public void onObservationStopped(@NonNull BarcodePick barcodePick) {}
});
```

## BarcodePickScanning Listener

You can register a [`BarcodePickScanningListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-scanning-listener.html) on the mode, which can be used to listen to every time the pick state changes.

```java
barcodePick.addScanningListener(new BarcodePickScanningListener() {
    @Override
    public void onScanningSessionUpdated(@NonNull BarcodePick barcodePick, @NonNull BarcodePickScanningSession session) {
        // This callback will be invoked on a background thread every time the picked state of some item changes.
        // The session object contains the list of picked and scanned items.
    }

    @Override
    public void onScanningSessionCompleted(@NonNull BarcodePick barcodePick, @NonNull BarcodePickScanningSession session) {
        // This callback is invoked when all the registered items needing picking have been picked.
    }

    @Override
    public void onObservationStarted(@NonNull BarcodePick barcodePick) {}

    @Override
    public void onObservationStopped(@NonNull BarcodePick barcodePick) {}
});
```

## BarcodePickView Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickViewListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-listener.html) on the mode itself, keeping in mind that these listeners are called from a background thread.

```java
barcodePickView.setListener(new BarcodePickViewListener() {
    @Override
    public void onStopped(@NonNull BarcodePickView view) {}

    @Override
    public void onPaused(@NonNull BarcodePickView view) {}

    @Override
    public void onFreezed(@NonNull BarcodePickView view) {}

    @Override
    public void onStarted(@NonNull BarcodePickView view) {}
});
```

## BarcodePickAction Listener

You can also register a [`BarcodePickActionListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-action-listener.html) on the mode, which can be used to reject specific pick/unpick actions.

```java
barcodePickView.addActionListener(new BarcodePickActionListener() {
    @Override
    public void onPick(@NonNull String itemData, @NonNull BarcodePickActionCallback callback) {
        // Perform the needed checks, and invoke callback.onFinish(true/false) to allow/reject
        // the current pick action
    }

    @Override
    public void onUnpick(@NonNull String itemData, @NonNull BarcodePickActionCallback callback) {
        // Perform the needed checks, and invoke callback.onFinish(true/false) to allow/reject
        // the current unpick action
    }
});
```
