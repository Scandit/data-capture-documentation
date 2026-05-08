---
description: "In this guide you will learn step-by-step how to add MatrixScan to your application.                                                                                      "

sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the MatrixScan mode
- Using the built-in camera
- Visualizing the scan process
- Providing feedback
- Disabling barcode tracking

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Configure the Barcode Batch Mode

The main entry point for the Barcode Batch Mode is the [`SDcBarcodeBatch`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) object. It is configured through [`SDCBarcodeBatchSettings`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch-settings.html#class-scandit.datacapture.barcode.batch.BarcodeBatchSettings) and allows to register one or more listeners that will get informed whenever a new frame has been processed.

:::note
Typically you will not need to conform to a [`SDCBarcodeBatchListener`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener), instead you will add a [`SDCBarcodeBatchBasicOverlay`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-batch-basic-overlay.html#class-scandit.datacapture.barcode.batch.ui.BarcodeBatchBasicOverlay) and conform to a [`SDCBarcodeBatchBasicOverlayDelegate`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener).
:::

Here we will setup Barcode Batch for tracking QR codes:

```swift
let settings = BarcodeBatchSettings()
settings.set(symbology: .qr, enabled: true)
```

Next, create a [`SDcBarcodeBatch`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance with the data capture context and the settings initialized in the previous steps:

```swift
barcodeBatch = BarcodeBatch(context: context, settings: settings)
```

## Use the Built-in Camera

:::note
In iOS the user must explicitly grant permission to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission by including the [`NSCameraUsageDescription`](https://developer.apple.com/documentation/bundleresources/information_property_list/nscamerausagedescription) key in your app’s `Info.plist` file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode.

```swift
let cameraSettings = BarcodeBatch.recommendedCameraSettings

// Depending on the use case further camera settings adjustments can be made here.

let camera = Camera.default
camera?.apply(cameraSettings)
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [`SDCDataCaptureContext.setFrameSource:completionHandler:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```swift
context.setFrameSource(camera)
```

The camera is off by default and must be turned on. This is done by calling [`SDCFrameSource.switchToDesiredState:completionHandler:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [`SDCFrameSourceStateOn`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```swift
camera?.switch(toDesiredState: .on)
```

## Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. 

To do that, add a [`SDCDataCaptureView`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```swift
let captureView = DataCaptureView(context: context, frame: view.bounds)
captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(captureView)
```

To visualize the results of Barcode Batch, first you need to add the following overlay:

```swift
let overlay = BarcodeBatchBasicOverlay(barcodeBatch: barcodeBatch, view: captureView)
```

Once the overlay has been added, you should conform to the [`SDCBarcodeBatchBasicOverlayDelegate`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#interface-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener) protocol. The method [`SDCBarcodeBatchBasicOverlayDelegate.barcodeBatchBasicOverlay:brushForTrackedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a brush used to highlight that specific barcode in the overlay.

```swift
extension ViewController: BarcodeBatchBasicOverlayDelegate {
    func barcodeBatchBasicOverlay(_ overlay: BarcodeBatchBasicOverlay,
                                brushFor trackedBarcode: TrackedBarcode) -> Brush? {
        // Return a custom Brush based on the tracked barcode.
    }
}
```

If you would like to make the highlights tappable, you need to implement the [`SDCBarcodeBatchBasicOverlayDelegate.barcodeBatchBasicOverlay:didTapTrackedBarcode:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-batch-basic-overlay-listener.html#method-scandit.datacapture.barcode.batch.ui.IBarcodeBatchBasicOverlayListener.OnTrackedBarcodeTapped) method.

```swift
extension ViewController: BarcodeBatchBasicOverlayDelegate {
    func barcodeBatchBasicOverlay(_ overlay: BarcodeBatchBasicOverlay,
                                didTap trackedBarcode: TrackedBarcode) {
        // A tracked barcode was tapped.
    }
}
```

## Barcode Batch Feedback

Barcode Batch, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [`SDCBarcodeBatchListener`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch-listener.html#interface-scandit.datacapture.barcode.batch.IBarcodeBatchListener) to provide a similar experience.

Here, we use the default [`SDCFeedback`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    feedback = Feedback.default
}
```

Next, use this feedback in a `SDCBarcodeBatchListener`:

```swift
extension ViewController: BarcodeBatchListener {
    func barcodeBatch(_ barcodeBatch: BarcodeBatch,
                            didUpdate session: BarcodeBatchSession,
                            frameData: FrameData) {
        if !session.addedTrackedBarcodes.isEmpty {
            feedback?.emit()
        }
    }
}
```

[`SDCBarcodeBatchListener.barcodeBatch:didUpdate:frameData:`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch-listener.html#method-scandit.datacapture.barcode.batch.IBarcodeBatchListener.OnSessionUpdated) is invoked for every processed frame. The session parameter contains information about the currently tracked barcodes. We check if there are any newly recognized barcodes and emit the feedback if so.

As the last step, register the delegate responsible for emitting the feedback with the [`SDcBarcodeBatch`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#class-scandit.datacapture.barcode.batch.BarcodeBatch) instance.

```swift
barcodeBatch.addListener(self)
```

## Disable Barcode Batch

To disable barcode tracking set [`SDCBarcodeBatch.enabled`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-batch.html#property-scandit.datacapture.barcode.batch.BarcodeBatch.IsEnabled) to `NO`.

The effect is immediate, no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [`SwitchToDesiredState`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of `StandBy`.