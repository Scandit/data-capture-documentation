---
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

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```swift
self.context = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

## Configure the Barcode Tracking Mode

The main entry point for the Barcode Tracking Mode is the [`SDcBarcodeTracking`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) object. It is configured through [`SDCBarcodeTrackingSettings`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-settings.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings) and allows to register one or more listeners that will get informed whenever a new frame has been processed.

:::note
Typically you will not need to conform to a [`SDCBarcodeTrackingListener`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener), instead you will add a [`SDCBarcodeTrackingBasicOverlay`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay) and conform to a [`SDCBarcodeTrackingBasicOverlayDelegate`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener).
:::

Here we will setup Barcode Tracking for tracking QR codes:

```swift
let settings = BarcodeTrackingSettings()
settings.set(symbology: .qr, enabled: true)
```

Next, create a [`SDcBarcodeTracking`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) instance with the data capture context and the settings initialized in the previous steps:

```swift
barcodeTracking = BarcodeTracking(context: context, settings: settings)
```

## Use the Built-in Camera

:::note
In iOS the user must explicitly grant permission to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission by including the [`NSCameraUsageDescription`](https://developer.apple.com/documentation/bundleresources/information_property_list/nscamerausagedescription) key in your app’s `Info.plist` file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode.

```swift
let cameraSettings = BarcodeTracking.recommendedCameraSettings

// Depending on the use case further camera settings adjustments can be made here.

let camera = Camera.default
camera?.apply(cameraSettings)
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [`SDCDataCaptureContext.setFrameSource:completionHandler:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```swift
context.setFrameSource(camera)
```

The camera is off by default and must be turned on. This is done by calling [`SDCFrameSource.switchToDesiredState:completionHandler:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [`SDCFrameSourceStateOn`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```swift
camera?.switch(toDesiredState: .on)
```

## Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. 

To do that, add a [`SDCDataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```swift
let captureView = DataCaptureView(for: context, frame: view.bounds)
captureView.dataCaptureContext = context
captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(captureView)
```

To visualize the results of Barcode Tracking, first you need to add the following overlay:

```swift
let overlay = BarcodeTrackingBasicOverlay(barcodeTracking: barcodeTracking, view: captureView)
```

Once the overlay has been added, you should conform to the [`SDCBarcodeTrackingBasicOverlayDelegate`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener) protocol. The method [`SDCBarcodeTrackingBasicOverlayDelegate.barcodeTrackingBasicOverlay:brushForTrackedBarcode:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a brush used to highlight that specific barcode in the overlay.

```swift
extension ViewController: BarcodeTrackingBasicOverlayDelegate {
    func barcodeTrackingBasicOverlay(_ overlay: BarcodeTrackingBasicOverlay,
                                brushFor trackedBarcode: TrackedBarcode) -> Brush? {
        // Return a custom Brush based on the tracked barcode.
    }
}
```

If you would like to make the highlights tappable, you need to implement the [`SDCBarcodeTrackingBasicOverlayDelegate.barcodeTrackingBasicOverlay:didTapTrackedBarcode:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.OnTrackedBarcodeTapped) method.

```swift
extension ViewController: BarcodeTrackingBasicOverlayDelegate {
    func barcodeTrackingBasicOverlay(_ overlay: BarcodeTrackingBasicOverlay,
                                didTap trackedBarcode: TrackedBarcode) {
        // A tracked barcode was tapped.
    }
}
```

## Barcode Tracking Feedback

Barcode Tracking, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a [`SDCBarcodeTrackingListener`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) to provide a similar experience.

Here, we use the default [`SDCFeedback`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    feedback = Feedback.default
}
```

Next, use this feedback in a `SDCBarcodeTrackingListener`:

```swift
extension ScanningViewController: BarcodeTrackingListener {
    func barcodeTracking(_ barcodeTracking: BarcodeTracking,
                            didUpdate session: BarcodeTrackingSession,
                            frameData: FrameData) {
        if !session.addedTrackedBarcodes.isEmpty {
            feedback?.emit()
        }
    }
}
```

[`SDCBarcodeTrackingListener.barcodeTracking:didUpdate:frameData:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) is invoked for every processed frame. The session parameter contains information about the currently tracked barcodes. We check if there are any newly recognized barcodes and emit the feedback if so.

As the last step, register the delegate responsible for emitting the feedback with the [`SDcBarcodeTracking`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) instance.

```swift
barcodeTracking.addListener(self)
```

## Disable Barcode Tracking

To disable barcode tracking set [`SDCBarcodeTracking.enabled`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-tracking.html#property-scandit.datacapture.barcode.tracking.BarcodeTracking.IsEnabled) to `NO`.

The effect is immediate, no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [`SwitchToDesiredState`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of `StandBy`.