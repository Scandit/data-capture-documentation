---
sidebar_position: 2
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Create your barcode capture settings and enable the barcode symbologies you want to read
- Create a new barcode capture mode instance and initialize it
- Register a barcode capture listener to receive scan events
- Process successful scans according to your application’s needs and decide whether more codes will be scanned or the scanning process should be stopped
- Obtain a camera instance and set it as the frame source on the data capture context
- Display the camera preview by creating a data capture view
- If displaying a preview, optionally create a new overlay and add it to data capture view for better visual feedback

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

## Configure Barcode Scanning Settings

Barcode scanning is orchestrated by the [`SDCBarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) [data capture mode](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [`SDCBarcodeCaptureSettings`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

Here we will setup barcode scanning for a small list of barcode types, called [symbologies](../../../barcode-symbologies.md). The list of symbologies to enable is application specific. We recommend that you only enable the symbologies your application requires. If you are not familiar with the symbologies that are relevant for your use case, you can use [capture presets](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/capture-preset.html#enum-scandit.datacapture.barcode.CapturePreset) that are tailored for different verticals (e.g. retail, logistics).

```swift
let settings = BarcodeCaptureSettings()
settings.set(symbology: .code128, enabled: true)
settings.set(symbology: .code39, enabled: true)
settings.set(symbology: .qr, enabled: true)
settings.set(symbology: .ean8, enabled: true)
settings.set(symbology: .upce, enabled: true)
settings.set(symbology: .ean13UPCA, enabled: true)
```

:::note
If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [`SDCBarcodeCaptureSettings.codeDuplicateFilter`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around `500` or even `-1` if you do not want codes to be scanned more than once.
:::

Next, create a `SDCBarcodeCapture` instance with the settings initialized in the previous step:

```swift
barcodeCapture = BarcodeCapture(context: context, settings: settings)
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [`SDCBarcodeCaptureListener`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [`SDCBarcodeCapture.addListener:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `SDCBarcodeCaptureListener` protocol. For example:

```swift
extension ViewController: BarcodeCaptureListener {
  func barcodeCapture(_ barcodeCapture: BarcodeCapture,
                   didScanIn session: BarcodeCaptureSession,
                   frameData: FrameData) {
        let recognizedBarcodes = session.newlyRecognizedBarcode
        for barcode in recognizedBarcodes {
            // Do something with the barcode.
        }
    }
}
```

Then add the listener:

```swift
barcodeCapture.addListener(self)
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device.

:::note
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [`NSCameraUsageDescription`](https://developer.apple.com/documentation/bundleresources/information_property_list/nscamerausagedescription) key in your app’s `Info.plist` file.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```swift
let cameraSettings = BarcodeCapture.recommendedCameraSettings

// Depending on the use case further camera settings adjustments can be made here.

let camera = Camera.default
camera?.apply(cameraSettings)
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [`SDCDataCaptureContext.setFrameSource:completionHandler:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync).

The camera is off by default and must be turned on. This is done by calling [`SDCFrameSource.switchToDesiredState:completionHandler:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [`SDCFrameSourceStateOn`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```swift
context.setFrameSource(camera)


camera?.switch(toDesiredState: .on)
```

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a `SDCDataCaptureView` to your view hierarchy:

```swift
let captureView = DataCaptureView(for: context, frame: view.bounds)
captureView.dataCaptureContext = context
captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(captureView)
To visualize the results of barcode scanning, the following overlay can be added:

let overlay = BarcodeCaptureOverlay(barcodeCapture: barcodeCapture, view: captureView)
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set [`SDCBarcodeCapture.enabled`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#property-scandit.datacapture.barcode.BarcodeCapture.IsEnabled) to `NO`.

The effect is immediate: no more frames will be processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
