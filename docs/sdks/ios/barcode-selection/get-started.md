---
description: "In this guide you will learn step-by-step how to add Barcode Selection to your application.                                                                                     "

sidebar_position: 2
pagination_next: null
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Selection to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Selection settings
- Creating a new Barcode Selection mode instance
- Registering the listener to receive scan events:
    - Processing the successful scans according to your application’s needs, e.g. by looking up information in a database
    - Deciding whether more codes will be scanned, or the scanning process should be stopped
- Obtaining the camera instance and set as frame source

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Configure the Barcode Selection Mode

Barcode selection is orchestrated by the [`SDCBarcodeSelection`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) data capture mode. It is configured via [`SDCBarcodeSelectionSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and allows you to register one or more listeners for when new codes have been selected.

Here we setup barcode scanning for the desired barcode [symbologies](/docs/barcode-symbologies.md). The list of symbologies to enable is highly application specific, and we recommend that you **only enable the list of symbologies your application requires**:

```swift
let settings = BarcodeSelectionSettings()
settings.set(symbology: .code128, enabled: true)
settings.set(symbology: .ean8, enabled: true)
settings.set(symbology: .upce, enabled: true)
settings.set(symbology: .ean13UPCA, enabled: true)
```

And then create a `SDCBarcodeSelection` instance with the Data Capture Context and the settings initialized in the previous step:

```swift
let barcodeSelection = BarcodeSelection(context: context, settings: settings)
```

### Selection Types

The behavior of Barcode Selection can be changed by using a different [selection type](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-type.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionType). This defines the method used by `SDCBarcodeSelection` to select codes. There are two types:

- [`SDCBarcodeSelectionTapSelection`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection): Allows the user to select barcodes by tapping on them. Requires the MatrixScan add-on.
- [`SDCBarcodeSelectionAimerSelection`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-aimer-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAimerSelection): Allows the user to select barcodes by aiming at them.

#### `SDCBarcodeSelectionTapSelection`

You can select to automatically freeze the camera preview to make the selection easier via [`SDCBarcodeSelectionTapSelection.freezeBehavior`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.FreezeBehavior).

Using [`SDCBarcodeSelectionTapSelection.tapBehavior`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.TapBehavior) you can further decide if a second tap on a barcode means that the barcode is unselected or if it is selected another time (increasing the counter).

#### `SDCBarcodeSelectionAimerSelection`

With this selection mode it is possible to choose between two different [selection strategies](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-strategy.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionStrategy):

- [`SDCBarcodeSelectionAutoSelectionStrategy`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionAutoSelectionStrategy): Barcodes are selected automatically when aiming at them.
- [`SDCBarcodeSelectionManualSelectionStrategy`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionManualSelectionStrategy): Barcodes are selected when aiming at them and tapping anywhere on the screen.

### Single Barcode Selection

If you want to automatically select a barcode when it is the only one on screen, turn on [`SDCBarcodeSelectionSettings.singleBarcodeAutoDetection`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-settings.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionSettings.SingleBarcodeAutoDetection):

```swift
settings.singleBarcodeAutoDetection = true
```

## Registering the Listener

To get informed whenever a new code has been recognized, add a [`SDCBarcodeSelectionListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener), implementing the listener methods to suit your application’s needs.

First conform to the `SDCBarcodeSelectionListener` protocol. For example:

```swift
extension ScanViewController: BarcodeSelectionListener {
  func barcodeSelection(_ barcodeSelection: BarcodeSelection,
                        didUpdateSelection session: BarcodeSelectionSession,
                        frameData: FrameData?) {
      let newlySelectedBarcodes = session.newlySelectedBarcodes
      // Do something with the newly selected barcodes.
  }
}
```

Then register the listener to the `SDCBarcodeSelection` instance:

```swift
barcodeSelection.addListener(self)
```

## Obtaining the Camera Instance and Set as Frame Source

The data capture context supports using different frame sources to perform recognition, here we assume that you will use the built-in camera of the device.

:::note
In iOS, the user must explicitly grant permission for each app to access the camera. Your app needs to provide static messages to display when the system asks for camera permission. To do that include the [`NSCameraUsageDescription`](https://developer.apple.com/documentation/bundleresources/information_property_list/nscamerausagedescription) key in your app’s `Info.plist` file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode:

```swift
let cameraSettings = BarcodeSelection.recommendedCameraSettings

// Depending on the use case further camera settings adjustments can be made here.

let camera = Camera.default
camera?.apply(cameraSettings)
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [`SDCDataCaptureContext.setFrameSource:completionHandler:`](https://docs.scandit.com/data-capture-sdk/ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```swift
context.setFrameSource(camera)
```

The camera is off by default and must be turned on. This is done by calling:

```swift
camera?.switch(toDesiredState: .on)
```

## Disabling Barcode Selection

To disable barcode selection, for instance when the selection is complete, set [`SDCBarcodeSelection.enabled`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelection.IsEnabled) to `NO`.

The effect is immediate, no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off:

```swift
camera?.switch(toDesiredState: .off)
```
