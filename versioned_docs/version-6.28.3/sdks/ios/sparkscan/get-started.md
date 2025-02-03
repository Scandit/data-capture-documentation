---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add SparkScan to your application by:

- Creating a new Data Capture Context instance
- Configuring the Spark Scan Mode
- Creating the SparkScanView with the desired settings and binding it to the application’s lifecycle
- Registering the listener to be informed when new barcodes are scanned and updating the UI accordingly

:::note
If you’re looking to integrate SparkScan into a SwiftUI view hierarchy, there are additional steps you need to follow:
    - Create a custom `UIViewController` subclass for managing SparkScan, as described in the rest of this section.
    - Add `import ScanditBarcodeCapture` to your SwiftUI view file.
    - Use the `withSparkScan` view modifier to incorporate SparkScan into your SwiftUI view. Pass an instance of the SparkScan view controller as demonstrated below:

    ```swift
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .withSparkScan(sparkScanViewController)
    }
    ```
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```swift
self.context = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

## Configure the SparkScan Mode

The SparkScan Mode is configured through SparkScanSettings and allows you to register one or more listeners that are informed whenever a new barcode is scanned.

For this tutorial, we will set up SparkScan for scanning EAN13 codes. Change this to the correct symbologies for your use case (for example, Code 128, Code 39…).

```swift
let settings = SparkScanSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
sparkScan.apply(settings, completionHandler: nil)
```

Next, create a SparkScan instance with the settings initialized in the previous step:

```swift
let sparkScan = SparkScan(settings: settings)
```

## Create the SparkScan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements. These guide the user through the scanning process.

The [`SparkScanView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html) appearance can be customized through [`SparkScanViewSettings`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view-settings.html).

```swift
let viewSettings = SparkScanViewSettings()
// setup the desired settings by updating the viewSettings object
```

By adding a [`SparkScanView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html), the scanning interface (camera preview and scanning UI elements) will be added automatically to your application.

Add a [`SparkScanView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html) to your view hierarchy: 

Construct a new [`SparkScanView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html), and it is automatically added to the provided parentView:

```swift
let sparkScanView = SparkScanView(parentView: view, context: context, sparkScan: sparkScan, settings: viewSettings)
```

See the [SparkScan Workflow Options](./intro.md#workflow-options) section for more information.

Additionally, make sure to call [`SDCSparkScanView.prepareScanning`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.PrepareScanning) and [`SDCSparkScanView.stopScanning`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.StopScanning) in your UIViewController’s [`viewWillAppear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621510-viewwillappear) and [`viewWillDisappear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621485-viewwilldisappear) callbacks, to make sure that start up time is optimal and scanning is stopped when the app is going in the background.

```swift
override func viewWillAppear(animated: Bool) {
    super.viewWillAppear(animated)
    sparkScanView.prepareScanning()
}

override func viewWillDisappear(animated: Bool) {
    super.viewWillDisappear(animated)
    sparkScanView.stopScanning()
}
```

## Register the Listener

To keep track of the barcodes that have been scanned, implement the [`SDCSparkScanListener`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) protocol and register the listener to the SparkScan mode.

```swift
// Register self as a listener to monitor the spark scan session.
sparkScan.addListener(self)
```

[`SDCSparkScanListener.sparkScan:didScanInSession:frameData:`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/spark-scan-listener.html#method-scandit.datacapture.barcode.spark.ISparkScanListener.OnBarcodeScanned) is called when a new barcode has been scanned. This result can be retrieved from the first object in the provided barcodes list: [`SDCSparkScanSession.newlyRecognizedBarcode`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/spark-scan-session.html#property-scandit.datacapture.barcode.spark.SparkScanSession.NewlyRecognizedBarcode).

Please note that this list only contains one barcode entry.

```swift
extension ViewController: SparkScanListener {
    func sparkScan(_ sparkScan: SparkScan,
                      didScanIn session: SparkScanSession,
                      frameData: FrameData?) {
        // Gather the recognized barcode
        let barcode = session.newlyRecognizedBarcode.first
        // This method is invoked from a recognition internal thread.
        // Dispatch to the main thread to update the internal barcode list.
        DispatchQueue.main.async {
            // Update the internal list and the UI with the barcode retrieved above
            self.latestBarcode = barcode

            // Handle the barcode
        }
    }
}
```
