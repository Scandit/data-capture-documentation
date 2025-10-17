---
description: "MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.                                                                     "

sidebar_position: 3
pagination_next: null
framework: ios
keywords:
  - ios
---

# Advanced Configurations

MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.

## Scanning Against a List

There is a function to set a list of expected barcodes if you are scanning against a manifest or item list. If this is used, a progress bar is added to the UI so you can keep track of the process while scanning.

When scanning against a list, the UI will also show red icons to mark scanned barcodes that aren’t present on the list. To set the list of expected barcodes, use the following code:

```swift
let targetBarcodes = Set(arrayLiteral: TargetBarcode(data: "data", quantity: 1))
let captureList = BarcodeCountCaptureList(listener: self, targetBarcodes: targetBarcodes)
barcodeCount.setCaptureList(captureList)
```

## Barcode Count Status

This feature is used to provide users with more details regarding the items they’re scanning in order to aid effective handling. The icons appear as an AR overlay after tapping the “Status Mode” button and can be used to highlight the following:

![Barcode Count Status](/img/matrixscan-count/barcode_count_status.png)

See the [Expiry Management Sample](https://github.com/Scandit/datacapture-ios-samples/tree/master/03_Advanced_Batch_Scanning_Samples/02_Counting_and_Receiving/ExpiryManagementSample)

<ReactPlayer playing controls url="/img/samples/ss-expiry.mp4" /> for an example of how to use this feature.

## Clustering

import Clustering from '../../../partials/count/_clustering.mdx'

<Clustering />

## Tote Mapping

import Totes from '../../../partials/count/_tote-mapping.mdx'

<Totes />

## Strap Mode

It can be difficult to reach the shutter button if the smart device is attached to the user’s wrist by a strap or similar.

You can enable a floating shutter button that can be positioned by the end user in a more ergonomically suitable position:

```swift
barcodeCountView.shouldShowFloatingShutterButton = true
```

## Filtering

If there several types of barcodes on your label you may want to scan only one of them. In this case, you can filter the others out by symbology, symbol count, or setting a regex.

For example, you might want to scan only Code 128 barcodes and no PDF417 barcodes. You can do this by setting the following:

```swift
let filterSettings = BarcodeFilterSettings()
filterSettings.excludedSymbologies = [.pdf417]

let barcodeCountSettings = BarcodeCountSettings()
barcodeCountSettings.set(symbology: .code128, enabled: true))
barcodeCountSettings.set(symbology: .pdf417, enabled: true))
barcodeCountSettings.filterSettings = filterSettings
```

Or to exclude all the barcodes starting with 4 numbers:

```swift
let filterSettings = BarcodeFilterSettings()
settings.excludedCodesRegex = "^1234.*"

let barcodeCountSettings = BarcodeCountSettings()
barcodeCountSettings.filterSettings = filterSettings
```

By default the filters applied to the relevant barcodes are transparent, but you can use [`BarcodeFilterHighlightSettings`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-filter-highlight-settings.html#barcode-filter-highlight-settings) to change the color and level of transparency.

![Different Filters in MatrixScan Count](/img/matrixscan-count/filtering_styles.png)

## Clear Screen Button

There are situations in which the user may find it helpful to clean up their screen (i.e. clear all the AR overlays) but keep the list of barcodes scanned.

For this you can enable the “Clear screen” button:

```swift
barcodeCountView.shouldShowClearHighlightsButton = true
```

## Customizing the AR Overlays

MatrixScan Count comes with recommended and user-tested AR overlays. You can customize the overlay colors once the overlay has been added according to the [`SDCBarcodeCountViewDelegate`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view-listener.html#interface-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener) protocol.

The methods [`SDCBarcodeCountViewDelegate.barcodeCountView:brushForRecognizedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForRecognizedBarcode) and [`SDCBarcodeCountViewDelegate.barcodeCountView:brushForUnrecognizedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForUnrecognizedBarcode) are invoked every time a new recognized or unrecognized barcode appears. These can be used to set a brush that will highlight that specific barcode in the overlay. Keep in mind that these methods are relevant only when using the style [`SDCBarcodeCountViewStyleDot`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#value-scandit.datacapture.barcode.count.ui.BarcodeCountViewStyle.Dot).

```swift
func barcodeCountView(_ view: BarcodeCountView,
                      brushForRecognizedBarcode trackedBarcode: TrackedBarcode) -> Brush? {
    // Return a custom brush
}

func barcodeCountView(_ view: BarcodeCountView,
                      brushForUnrecognizedBarcode trackedBarcode: TrackedBarcode) -> Brush? {
    // Return a custom brush
}
```

## Notifications

To be notified when a user taps on an overlay, you need to implement the [`SDCBarcodeCountViewDelegate.barcodeCountView:didTapRecognizedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnRecognizedBarcodeTapped) and [`SDCBarcodeCountViewDelegate.barcodeCountView:didTapUnrecognizedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnUnrecognizedBarcodeTapped) methods:

```swift
func barcodeCountView(_ view: BarcodeCountView,
                      didTapRecognizedBarcode trackedBarcode: TrackedBarcode) {
    // Do something with the tapped barcode
}

func barcodeCountView(_ view: BarcodeCountView,
                      didTapUnrecognizedBarcode trackedBarcode: TrackedBarcode) {
    // Do something with the tapped barcode
}
```

## Disable UI Elements

The UI is an integral part of MatrixScan Count and we do not recommend that you use it without it. However, if you wish to disable UI elements you can so as follows.

To disable buttons:

```swift
barcodeCountView.shouldShowListButton = false
barcodeCountView.shouldShowExitButton = false
barcodeCountView.shouldShowShutterButton = false
```

To disable feedback and hints:

```swift
barcodeCountView.shouldShowHints = false
barcodeCountView.shouldShowUserGuidanceView = false
```
