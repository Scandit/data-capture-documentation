---
title: "Get started with SparkScan on iOS"
description: "Add SparkScan to your iOS app: create a data capture context, configure the mode, add the view, and handle scanned barcodes."
product: sparkscan
frameworks: [ios]
topic_type: get-started
version_status: current
canonical_id: scandit.sparkscan.get-started
related_products: [barcode-capture]
user_intents:
  - "add a ready-made barcode scanner to my iOS app"
  - "scan one barcode at a time on iOS"
  - "scan items one by one to build a list (inventory, receiving) on iOS"
not_for:
  - "scanning and counting many barcodes at once — use MatrixScan Count"
  - "a fully custom scanning UI — use Barcode Capture"
prerequisites:
  - scandit.get-a-license
  - scandit.add-sdk.ios
keywords:
  - ios
  - sparkscan
  - barcode
sidebar_position: 2
---

# Get started with SparkScan on iOS

SparkScan adds a prebuilt, drop-in scanning interface to your iOS app. Follow this guide to create a data capture context, configure the SparkScan mode, add the scanning view, and handle the barcodes you scan. By the end you have a working SparkScan integration and your first successful scan.

## Before you start

import Prerequisites from '../../../partials/get-started/_prerequisites.mdx';

<Prerequisites framework="ios" />

## Create a data capture context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';
import LicenseKeyInput from '@site/src/components/LicenseKeyInput';

<LicenseKeyInput/>

<DataCaptureContextIos/>

## Configure the SparkScan mode

Configure the mode through `SparkScanSettings`. The mode lets you register one or more listeners that are notified whenever a new barcode is scanned.

This guide sets up SparkScan to scan EAN-13 codes. Set the symbologies your use case needs instead — for example, Code 128 or Code 39:

```swift
let settings = SparkScanSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
```

Create a `SparkScan` instance with those settings:

```swift
let sparkScan = SparkScan(settings: settings)
```

## Add the SparkScan view

The [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html) provides the built-in interface — the camera preview and the scanning UI elements that guide the user through scanning. Customize its appearance through [`SparkScanViewSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view-settings.html):

```swift
let viewSettings = SparkScanViewSettings()
// Configure the desired settings by updating the viewSettings object.
```

Construct the view with your context, mode, and settings. Passing a `parentView` adds the view — and with it the camera preview and scanning UI — to your view hierarchy automatically:

```swift
let sparkScanView = SparkScanView(parentView: view, context: context, sparkScan: sparkScan, settings: viewSettings)
```

For the full set of view options, see [SparkScan workflow options](/sdks/ios/sparkscan/advanced/#workflow-options).

Call [`prepareScanning`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.PrepareScanning) and [`stopScanning`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.StopScanning) from your `UIViewController`'s [`viewWillAppear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621510-viewwillappear) and [`viewWillDisappear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621485-viewwilldisappear) callbacks. This keeps startup time optimal and stops scanning when the app moves to the background:

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    sparkScanView.prepareScanning()
}

override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    sparkScanView.stopScanning()
}
```

## Handle scanned barcodes

To track the barcodes you scan, implement the [`SparkScanListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) protocol and register the listener on the mode:

```swift
// Register self as a listener to monitor the SparkScan session.
sparkScan.addListener(self)
```

The SDK calls [`sparkScan(_:didScanIn:frameData:)`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) each time it scans a new barcode. Retrieve the result from [`session.newlyRecognizedBarcode`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode) — it holds the single barcode from this scan.

The SDK invokes this method on an internal recognition thread, so dispatch to the main thread before you update your UI:

```swift
extension ViewController: SparkScanListener {
    func sparkScan(_ sparkScan: SparkScan,
                      didScanIn session: SparkScanSession,
                      frameData: FrameData?) {
        // Gather the recognized barcode.
        let barcode = session.newlyRecognizedBarcode
        // This method is invoked from an internal recognition thread.
        // Dispatch to the main thread to update your barcode list.
        DispatchQueue.main.async {
            // Update your internal list and the UI with the barcode above.
            self.latestBarcode = barcode

            // Handle the barcode.
        }
    }
}
```

## Verify your first scan

Your integration works when:

- The app builds and runs.
- The camera preview opens.
- The SDK accepts your license key, with no license error.
- Scanning a test EAN-13 barcode triggers `sparkScan(_:didScanIn:frameData:)`.

## Next steps

- [Configure SparkScan for your workflow](/sdks/ios/sparkscan/advanced/)
- [About SparkScan](/sdks/ios/sparkscan/intro/)
