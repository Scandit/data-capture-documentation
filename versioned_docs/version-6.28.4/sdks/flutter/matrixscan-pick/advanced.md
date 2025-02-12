---
sidebar_position: 3
pagination_next: null
framework: flutter
keywords:
  - flutter
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickListener`](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-pick-listener.html#interface-scandit.datacapture.barcode.pick.IBarcodePickListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```dart
mode.addListener(this)

    class BarcodePickListenerImpl implements BarcodePickListener
    {
        @override
        void onObservationStarted() {
          // The mode was started
        }

        @override
        void onObservationStopped {
          // The mode was stopped
        }
    }
```
