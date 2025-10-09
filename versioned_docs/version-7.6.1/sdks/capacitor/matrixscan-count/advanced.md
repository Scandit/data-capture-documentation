---
description: "MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: capacitor
keywords:
  - capacitor
---

# Advanced Configurations

MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.

## Scanning Against A List

There is a function to set a list of expected barcodes if you are scanning against a manifest or item list. If this is used, a progress bar is added to the UI, so you can keep track of the process while scanning.

When scanning against a list, the UI will also show red icons to mark scanned barcodes that aren’t present on the list.

```js
const barcodeCountCaptureListListener = {
	didUpdateSession: (barcodeCountCaptureList, session) => {
		// Handling the session
	},
};

const targetBarcodes = [TargetBarcode.create('data', 1)];
const barcodeCountCaptureList = BarcodeCountCaptureList.create(
	barcodeCountCaptureListListener,
	targetBarcodes
);
barcodeCount.setBarcodeCountCaptureList(barcodeCountCaptureList);
```

## Clustering

import Clustering from '../../../partials/count/_clustering.mdx'

<Clustering />

## Tote Mapping

import Totes from '../../../partials/count/_tote-mapping.mdx'

<Totes />

## Strap Mode

It can be difficult to reach the shutter button if the smart device is attached to the user’s wrist by a strap or similar. In this instance, you can enable a floating shutter button that can be positioned by the end user in a more ergonomically suitable position.

```js
const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.shouldShowFloatingShutterButton = true;
			}
		}}
	/>
);
```

## Filtering

If you have several types of barcodes on your label/package, you may want to scan only one of them.

In this case, you can filter the others out. This can be done by symbology, symbol count, or setting a regex.

For example, you might want to scan only Code 128 barcodes and no PDF417 ones.

```js
const settings = new BarcodeCountSettings();
barcodeCountSettings.enableSymbologies(enabledSymbologies);

const excludedSymbologies = [Symbology.PDF417];
const filterSettings = settings.filterSettings;
filterSettings.excludedSymbologies = excludedSymbologies;
```

Or, you want to exclude all the barcodes starting with 4 numbers:

```js
const settings = new BarcodeCountSettings();

const filterSettings = settings.filterSettings;
filterSettings.excludedCodesRegex = '^1234.*';
```

By default the filters applied to the relevant barcodes are transparent, but you can use [`BarcodeFilterHighlightSettings`](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-filter-highlight-settings.html#barcode-filter-highlight-settings) to change the color and level of transparency.

![Different Filters in MatrixScan Count](/img/matrixscan-count/filtering_styles.png)

## Clear Screen Button

There are situations in which the user may find it helpful to clean up their screen (i.e. clear all the AR overlays) but keep the list of barcodes scanned.

If this is the case, you can enable the “Clear screen” button.

```js
const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.shouldShowClearHighlightsButton = true;
			}
		}}
	/>
);
```

## Customize Overlay Colors

MatrixScan Count comes with recommended and user-tested AR overlays. However, if you wish to customize the overlay colors, once the overlay has been added, you can conform to the [BarcodeCountViewListener](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view-listener.html#interface-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener) interface. The methods [BarcodeCountViewListener.brushForRecognizedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForRecognizedBarcode) and [BarcodeCountViewListener.brushForUnrecognizedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForUnrecognizedBarcode) are invoked every time a new recognized or unrecognized barcode appears. These can be used to set a brush that will be used to highlight that specific barcode in the overlay. Keep in mind that these methods are relevant only when using the style [BarcodeCountViewStyle.Dot](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view.html#value-scandit.datacapture.barcode.count.ui.BarcodeCountViewStyle.Dot).

```js
const viewListener = {
	brushForRecognizedBarcode(view, trackedBarcode) {
		// Return a custom brush
	},

	brushForUnrecognizedBarcode(view, trackedBarcode) {
		// Return a custom brush
	},
};

const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.listener = viewListener;
			}
		}}
	/>
);
```

## Notifications

If you want to be notified when a user taps on an overlay, you need to implement the[BarcodeCountViewListener.didTapRecognizedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnRecognizedBarcodeTapped) and [BarcodeCountViewListener.didTapUnrecognizedBarcode()](https://docs.scandit.com/7.6/data-capture-sdk/capacitor/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnUnrecognizedBarcodeTapped) methods.

```js
const viewListener = {
	didTapRecognizedBarcode: (view, trackedBarcode) => {
		console.log(
			`Tapped recognized barcode with data ${trackedBarcode.barcode.data}`
		);
	},
	didTapUnrecognizedBarcode: (view, trackedBarcode) => {
		console.log(
			`Tapped unrecognized barcode with data ${trackedBarcode.barcode.data}`
		);
	},
};

const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.listener = viewListener;
			}
		}}
	/>
);
```

## Disable UI Elements

The UI is an integral part of MatrixScan Count and we do not recommend that you use it without it.
However, if you wish to disable UI elements you can do it as follows.

Disable buttons:

```js
const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.shouldShowListButton = false;
				view.shouldShowExitButton = false;
				view.shouldShowShutterButton = false;
			}
		}}
	/>
);
```

Disable feedback and hints:

```js
const barcodeCountViewComponent = (
	<BarcodeCountView
		ref={(view) => {
			if (view) {
				view.shouldShowUserGuidanceView = false;
				view.shouldShowHints = false;
			}
		}}
	/>
);
```
