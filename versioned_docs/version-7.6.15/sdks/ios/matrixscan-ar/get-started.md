---
description: "In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:                                                                              "

sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:

- Barcode AR: The data capture mode that is used for scan and check functionality.
- A Barcode AR View: The pre-built UI elements used to highlight items to be checked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode AR Mode
- Setup the Barcode AR View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/barcode-ar-settings.html).

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```swift
let settings = BarcodeArSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
```

Then create the mode with the previously created settings:

```swift
let barcodeAr = BarcodeAr(context: context,
                     settings: settings)
```

## Setup the `BarcodeArView`

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.ar.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.ar.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.ar.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.ar.ui.BarcodeArViewSettings), properties on the`BarcodeArView`, and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Camera position
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlights and annotations

```swift
let viewSettings = BarcodeArViewSettings()
viewSettings.hapticEnabled = false
viewSettings.soundEnabled = false
viewSettings.defaultCameraPosition = .userFacing
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```swift
let barcodeArView = BarcodeArView(parentView: parentView,
                                  barcodeAr: barcodeAr,
                                  settings: viewSettings,
                                  cameraSettings: BarcodeAr.recommendedCameraSettings)
barcodeArView.shouldShowCameraSwitchControl = true
barcodeArView.shouldShowTorchControl = true
barcodeArView.shouldShowZoomControl = true
barcodeArView.cameraSwitchControlPosition = .topRight
barcodeArView.torchControlPosition = .bottomRight
barcodeArView.zoomControlPosition = .topLeft
```

Configure the [`highlightProvider`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.ar.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.ar.ui.BarcodeArView.AnnotationProvider).

```swift
extension ViewController: BarcodeArAnnotationProvider {
    func annotation(for barcode: Barcode,
                    completionHandler: @escaping ((any UIView & BarcodeArAnnotation)?) -> Void) {
        let annotation = BarcodeArStatusIconAnnotation(barcode: barcode)
        annotation.text = "Example annotation"
        completionHandler(annotation)
    }
}

extension ViewController: BarcodeArHighlightProvider {
    func highlight(for barcode: Barcode,
                   completionHandler: @escaping ((any UIView & BarcodeArHighlight)?) -> Void) {
        let highlight = BarcodeArRectangleHighlight(barcode: barcode)
        completionHandler(highlight)
    }
}
```

And set them to the view:

```swift
barcodeArView.annotationProvider = self
barcodeArView.highlightProvider = self
```

Connect the `BarcodeArView` to the iOS lifecycle. The view is dependent on calling `BarcodeArView.start()` and `BarcodeArView.stop()` to set up the camera and its overlays properly.

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    barcodeArView.start()
}

override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    barcodeArView.stop()
}
```

## Register the Listener

If you want a callback when a highlight is tapped, register a [BarcodeArViewUIDelegate](https://docs.scandit.com/7.6/data-capture-sdk/ios/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.ar.ui.IBarcodeArViewUiListener).

```swift
extension ViewController: BarcodeArViewUIDelegate {
    func barcodeAr(_ barcodeAr: BarcodeAr,
                   didTapHighlightFor barcode: Barcode,
                   highlight: any UIView & BarcodeArHighlight) {
        // Handle tap
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeArView.start()`.

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    barcodeArView.start()
}
```
