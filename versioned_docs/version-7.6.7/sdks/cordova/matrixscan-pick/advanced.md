---
description: "MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickViewListener`](https://docs.scandit.com/7.6/data-capture-sdk/cordova/barcode-capture/api/ui/barcode-pick-view.html#interface-scandit.datacapture.barcode.pick.IBarcodePickViewListener) on the view itself, keeping in mind that these listeners are called from a background thread.

```js
const viewListener = {
	didStartScanning(view) {
		// The view started scanning
	},

	didFreezeScanning(view) {
		// The view was frozen
	},

	didPauseScanning(view) {
		// The view was paused
	},

	didStopScanning(view) {
		// The view stopped scanning
	},
};

barcodePickView.addListener(viewListener);
```
