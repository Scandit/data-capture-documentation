---
sidebar_position: 3
pagination_next: null
---

# Advanced Configurations

MatrixScan Find is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Find to best fit your needs.

## BarcodeFind Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodeFind` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodeFindListener`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-find-listener.html#interface-scandit.datacapture.barcode.find.IBarcodeFindListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```typescript
barcodeFindMode.addListener({
    didStartSearch: () => {
        // The mode was started
    },
    didPauseSearch: (foundItems: BarcodeFindItem[]) => {
        // The mode was paused
    },
    didStopSearch: (foundItems: BarcodeFindItem[]) => {
        // The mode was stopped after the finish button was clicked
    }
});
```

## UI Customization

The `BarcodeFindView` by default shows a set of UI elements, any of which can be optionally hidden:

- Play/Pause button
- Finish button
- Searched items carousel
- Guidance hints
- Progress bar (hidden by default)

Each of these elements can be shown or hidden as needed. For example:

```typescript
barcodeFindView.setShouldShowCarousel(false);
barcodeFindView.setShouldShowProgressBar(true);
// …
```
