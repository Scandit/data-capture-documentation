---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Count to your application.

:::note
MatrixScan Count is implemented via [`SDCBarcodeCount`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount).
:::

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Count Mode
- Obtaining the camera instance and set frame source
- Registering the listener to be informed when scan phase is complete
- Setting the capture view and AR overlays
- Configuring the camera for scanning view
- Storing and retrieving the captured barcodes
- Resetting the Barcode Count Mode
- List and exit callbacks

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

## Configure the Barcode Count Mode

The main entry point for the Barcode Count Mode is the `SDCBarcodeCount` object. It is configured through [`SDCBarcodeCountSettings`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-settings.html#class-scandit.datacapture.barcode.count.BarcodeCountSettings) and allows you to register one or more listeners that are informed whenever a scan phase has finished.

Here we will set up Barcode Count for tracking EAN13 codes, but you should change this to the correct symbologies for your use case. If you are sure that your environment will only have unique barcodes, you can also enable [`SDCBarcodeCountSettings.expectsOnlyUniqueBarcodes`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-settings.html#property-scandit.datacapture.barcode.count.BarcodeCountSettings.ExpectsOnlyUniqueBarcodes). This option improves scanning performance as long as you are sure that no duplicates will be present.

```swift
let settings = BarcodeCountSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
```

Next, create a `SDCBarcodeCount` instance with the Data Capture Context and the settings initialized in the previous step:

```swift
let barcodeCount = BarcodeCount(context: context, settings: settings)
```

## Camera Instance And Set Frame Source

Our recommended camera settings should be used to achieve the best performance and user experience. The following code shows how to get the recommended settings for MatrixScan Count and create the camera from it:

```swift
let cameraSettings = BarcodeCount.recommendedCameraSettings

let camera = Camera.default
camera?.apply(cameraSettings)
```

Because the frame source is configurable the data capture context must be told which frame source to use. This is done with a call to [`SDCDataCaptureContext.setFrameSource:completionHandler:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```swift
context.setFrameSource(camera)
```

## Registering the Listener

To keep track of the barcodes that have been scanned, implement the [`SDCBarcodeCountListener`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) protocol and register the listener.

```swift
// Register self as a listener to monitor the barcode count session.
barcodeCount.add(self)
```

[`SDCBarcodeCountListener.barcodeCount:didScanInSession:frameData:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan) is called when the scan phase has finished and results can be retrieved from [`SDCBarcodeCountSession`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession).

## Setting the Capture View and AR Overlays

MatrixScan Count’s built-in AR user interface includes buttons and overlays that guide the user through the capturing process. By adding a [`SDCBarcodeCountView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) the scanning interface will be added automatically to your application.

Add a `SDCBarcodeCountView` to your view hierarchy:

```swift
let barcodeCountView = BarcodeCountView(frame: view.bounds, context: context, barcodeCount: barcodeCount)
barcodeCountView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(barcodeCountView)
```

## Configuring the Camera for Scanning View

The camera is not automatically turned on when you are in a scanning view. You need to set up the camera so that it switches on when needed and it switches off when not needed anymore.

Similarly `SDCBarcodeCount` should also be enabled and disabled. For example, you should switch off the camera when the `SDCBarcodeCountView` is not visible and switch on the camera when the `SDCBarcodeCountView` is visible. For example:

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    camera?.switch(toDesiredState: .on)
}

override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    camera?.switch(toDesiredState: .off)
}
```

## Store And Retrieve Scanned Barcodes

The values captured as part of the scanning process are part of the [`session`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession), and the session is not accessible outside `SDCBarcodeCountListener.barcodeCount:didScanInSession:frameData:`.

We recommend you store the values to present a list, for example when the user taps the list icon. To do this, make a copy of [`SDCBarcodeCountSession.recognizedBarcodes`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count-session.html#property-scandit.datacapture.barcode.count.BarcodeCountSession.RecognizedBarcodes):

```swift
extension ViewController: BarcodeCountListener {
    func barcodeCount(_ barcodeCount: BarcodeCount,
                      didScanIn session: BarcodeCountSession,
                      frameData: FrameData) {
        // Gather all the recognized barcodes
        let allRecognizedBarcodes = session.recognizedBarcodes.map({ $0.value })
        // This method is invoked from a recognition internal thread.
        // Dispatch to the main thread to update the internal barcode list.
        DispatchQueue.main.async {
            // Update the internal list
            self.allRecognizedBarcodes = allRecognizedBarcodes
        }
    }
}
```

## Resetting the Barcode Count Mode

When the scanning process is over, you need to reset the mode to make it ready for the next process. This clears the list of barcodes scanned and all the AR overlays.

To reset Barcode Count’s scanning process, call the [`SDCBarcodeCount.reset`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-count.html#method-scandit.datacapture.barcode.count.BarcodeCount.Reset) method:

```swift
barcodeCount.reset()
```

## List and Exit Callbacks

The UI includes two icons (buttons): “List” and “Exit”. The SDK provides the callbacks so you can add the desired action when those icons are tapped by the user:

```swift
extension ViewController: BarcodeCountViewUIDelegate {
    func listButtonTapped(for view: BarcodeCountView) {
        // Show the current progress but the order is not completed
    }

    func exitButtonTapped(for view: BarcodeCountView) {
        // The order is completed
    }
}
```
