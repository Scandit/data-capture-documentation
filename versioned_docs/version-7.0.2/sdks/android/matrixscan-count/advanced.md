---
sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

MatrixScan Count is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Count to best fit your needs.

## Scanning Against a List

There is a function to set a list of expected barcodes if you are scanning against a manifest or item list. If this is used, a progress bar is added to the UI so you can keep track of the process while scanning.

When scanning against a list, the UI will also show red icons to mark scanned barcodes that aren’t present on the list. To set the list of expected barcodes, use the following code:

```java
List<TargetBarcode> targetBarcodes = new ArrayList<>();
targetBarcodes.add(TargetBarcode.create("data", 1));
BarcodeCountCaptureList captureList = BarcodeCountCaptureList.create(this, targetBarcodes);
barcodeCount.setBarcodeCountCaptureList(captureList);
```

## Barcode Count Status

This feature is used to provide users with more details regarding the items they’re scanning in order to aid effective handling. The icons appear as an AR overlay after tapping the “Status Mode” button and can be used to highlight the following:

![Barcode Count Status](/img/matrixscan-count/barcode_count_status.png)

See the [Expiry Management Sample](https://github.com/Scandit/datacapture-android-samples/tree/master/ExpiryManagementSample)

<ReactPlayer playing controls url="/img/samples/ss-expiry.mp4" /> for an example of how to use this feature.

## Strap Mode

It can be difficult to reach the shutter button if the smart device is attached to the user’s wrist by a strap or similar.

You can enable a floating shutter button that can be positioned by the end user in a more ergonomically suitable position:

```java
barcodeCountView.setShouldShowFloatingShutterButton(true);
```

## Filtering

If there several types of barcodes on your label you may want to scan only one of them. In this case, you can filter the others out by symbology, symbol count, or setting a regex.

For example, you might want to scan only Code 128 barcodes and no PDF417 barcodes. You can do this by setting the following:

```java
BarcodeCountSettings settings = new BarcodeCountSettings();
barcodeCountSettings.enableSymbologies(enabledSymbologies);

Set<Symbology> excludedSymbologies = new HashSet<>();
excludedSymbologies.add(Symbology.PDF417);
BarcodeFilterSettings filterSettings = settings.getFilterSettings();
filterSettings.setExcludedSymbologies(excludedSymbologies);
```

Or to exclude all the barcodes starting with 4 numbers:

```java
BarcodeCountSettings settings = new BarcodeCountSettings();

BarcodeFilterSettings filterSettings = settings.getFilterSettings();
filterSettings.setExcludedCodesRegex("^1234.*");
```

## Clear Screen Button

There are situations in which the user may find it helpful to clean up their screen (i.e. clear all the AR overlays) but keep the list of barcodes scanned.

For this you can enable the “Clear screen” button:

```java
barcodeCountView.setShouldShowClearHighlightsButton(true);
```

## Customizing the AR Overlays

MatrixScan Count comes with recommended and user-tested AR overlays. However, if you wish to customize the overlay colors, once the overlay has been added, you can conform to the [BarcodeCountViewListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view-listener.html#interface-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener) interface.

The methods [BarcodeCountViewListener.brushForRecognizedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForRecognizedBarcode) and [BarcodeCountViewListener.brushForUnrecognizedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.BrushForUnrecognizedBarcode) are invoked every time a new recognized or unrecognized barcode appears. These can be used to set a brush that will be used to highlight that specific barcode in the overlay. Keep in mind that these methods are relevant only when using the style [BarcodeCountViewStyle.DOT](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view.html#value-scandit.datacapture.barcode.count.ui.BarcodeCountViewStyle.Dot).

```java
@Nullable
@Override
public Brush brushForRecognizedBarcode(
        @NonNull BarcodeCountView view, @NonNull TrackedBarcode trackedBarcode) {
    // Return a custom brush
}

@Nullable
@Override
public Brush brushForUnrecognizedBarcode(
        @NonNull BarcodeCountView view, @NonNull TrackedBarcode trackedBarcode) {
    // Return a custom brush
}
```

## Notifications

If you want to be notified when a user taps on an overlay, you need to implement the [BarcodeCountViewListener.onRecognizedBarcodeTapped()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnRecognizedBarcodeTapped) and [BarcodeCountViewListener.onUnrecognizedBarcodeTapped()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view-listener.html#method-scandit.datacapture.barcode.count.ui.IBarcodeCountViewListener.OnUnrecognizedBarcodeTapped) methods.

```java
@Override
public void onRecognizedBarcodeTapped(
        @NonNull BarcodeCountView view, @NonNull TrackedBarcode trackedBarcode) {
    // Do something with the tapped barcode
}

@Override
public void onUnrecognizedBarcodeTapped(
        @NonNull BarcodeCountView view, @NonNull TrackedBarcode trackedBarcode) {
    // Do something with the tapped barcode
}
```

## Disable UI Elements

The UI is an integral part of MatrixScan Count and we do not recommend that you use it without it. However, if you wish to disable UI elements you can so as follows.

To disable buttons:

```java
barcodeCountView.setShouldShowListButton(false);
barcodeCountView.setShouldShowExitButton(false);
barcodeCountView.setShouldShowShutterButton(false);
```

To disable feedback and hints:

```java
barcodeCountView.setShouldShowUserGuidanceView(false);
barcodeCountView.setShouldShowHints(false);
```
