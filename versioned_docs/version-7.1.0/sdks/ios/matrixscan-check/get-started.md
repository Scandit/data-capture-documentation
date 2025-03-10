---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Check to your application. Implementing MatrixScan Check involves two primary elements:

- Barcode Check: The data capture mode that is used for scan and pick functionality.
- A Barcode Check View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Check Mode
- Setup the Barcode Check View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Configure the Barcode Check Mode

The main entry point for the Barcode Check Mode is the `BarcodePick` object. You can configure the supported Symbologies through its [`BarcodeCheckSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-check-settings.html), and set up the list of items that you want MatrixScan Check to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```swift
let settings = BarcodeCheckSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
```

Then create the mode with the previously created settings:

```swift
let mode = BarcodePick(context: context,
                        settings: settings,
                        productProvider: productProvider)
```

## Setup the `BarcodeCheckView`

MatrixScan Check’s built-in AR user interface includes buttons and overlays that guide the user through the scan and pick process. By adding a [`BarcodeCheckView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-check-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodeCheckView), the scanning interface is added automatically to your application.

The `BarcodeCheckView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeCheckView` appearance can be customized through [`BarcodeCheckViewSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-check-view-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodeCheckViewSettings), and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlight and annotation overlays

```swift
let viewSettings = BarcodeCheckViewSettings()
// setup the desired appearance settings by updating the fields in the object above
```

Next, create a `BarcodeCheckView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeCheckView` is automatically added to the provided parent view.

```swift
let BarcodeCheckView = BarcodeCheckView(parentView: view, context: context, BarcodePick: mode, settings: viewSettings)
```

Connect the `BarcodeCheckView` to the iOS view controller lifecycle. In particular, make sure to call `BarcodeCheckView.prepareSearching()` on your UIViewController’s [`viewWillAppear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621510-viewwillappear) method to make sure that start up time is optimal.

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    BarcodeCheckView.start()
}

override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    BarcodeCheckView.pause()
    if isMovingFromParent {
        BarcodeCheckView.stop()
    }
}
```

And the `BarcodeCheckViewUIDelegate`:

```swift
extension ViewController: BarcodeCheckViewUIDelegate {
    func BarcodeCheckViewDidTapFinishButton(_ view: BarcodeCheckView) {
        navigationController?.popViewController(animated: true)
    }
}
```

## Register the Listener

The `BarcodeCheckView` displays a **Finish** button next to its shutter button. 

Register a [BarcodeCheckViewListener](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-check-view-listener.html#interface-scandit.datacapture.barcode.pick.ui.BarcodeCheckViewListener) to be notified what items have been found once the finish button is pressed.

```swift
extension ViewController: BarcodeCheckViewListener {
    func BarcodeCheckViewDidStartScanning(_ view: BarcodeCheckView) {}

    func BarcodeCheckViewDidFreezeScanning(_ view: BarcodeCheckView) {}

    func BarcodeCheckViewDidPauseScanning(_ view: BarcodeCheckView) {}

    func BarcodeCheckViewDidStopScanning(_ view: BarcodeCheckView) {}
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `BarcodeCheckView.start()`.

```swift
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    BarcodeCheckView.start()
}
```
