---
sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-listener.html#interface-scandit.datacapture.barcode.pick.IBarcodePickListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```java
mode.addListener(new BarcodePickListener() {
    @Override
    public void onObservationStopped(@NonNull Set<BarcodePickProduct> foundItems) {
        // The mode was paused
    }

    @Override
    public void onObservationStarted() {
        // The mode was started
    }
});
```
