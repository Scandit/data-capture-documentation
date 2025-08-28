---
description: "MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: react
keywords:
  - react
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## Set up a listener on the BarcodeFind mode

You may want more fine-grained knowledge over the different events happening during the life of the BarcodeFind mode, such as when the search starts, pauses and stops. To do this, you can directly register a [BarcodeFindListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself.

Be aware that these listeners will be called from a background thread.

```js
mode.addListener({
	didStartSearch() {
		// The mode was started
	},

	didPauseSearch(foundItems: BarcodeFindItem[]) {
		// The mode was paused
	},

	didStopSearch(foundItems: BarcodeFindItem[]) {
		// The mode was stopped after the finish button was clicked
	},
});
```

## UI configuration

The [BarcodeFindView](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) will by default show a set of UI elements, which can be optionally hidden:

- A play/pause button
- A finish button
- A searched items carousel
- Guidance hints

There is also a progress bar but this is hidden by default.

Each of these elements can be shown or hidden at will.

```js
barcodeFindView.shouldShowCarousel = false;
barcodeFindView.shouldShowProgressBar = true;
// …
```
