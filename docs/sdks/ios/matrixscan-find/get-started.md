---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- Barcode Find: The data capture mode that is used for search and find functionality.
- A Barcode Find View: The pre-built UI elements used to highlight found items.

:::note
MatrixScan Count is implemented via [`SDCBarcodeFind`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind).
:::

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Find Mode
- Setup the Barcode Find View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Configure the Barcode Count Mode

The main entry point for the Barcode Find Mode is the [`SDCBarcodeFind`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind) object. You can configure the supported Symbologies through its [`SDCBarcodeFindSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find-settings.html#class-scandit.datacapture.barcode.find.BarcodeFindSettings), and set up the list of items that you want MatrixScan Find to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```swift
let settings = BarcodeFindSettings()
settings.set(symbology: .ean13UPCA, enabled: true)
```

Next, create the list of items that will be actively searched for. We will also attach some optional information to the first item that can be used by the [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) to display extra information:

```swift
var items = Set<BarcodeFindItem>()
items.insert(BarcodeFindItem(
    searchOptions: BarcodeFindItemSearchOptions(barcodeData: "9783598215438"),
    content: BarcodeFindItemContent(
        info: "Mini Screwdriver Set",
        additionalInfo: "(6-Piece)",
        image: nil)
))
items.insert(BarcodeFindItem(
    searchOptions: BarcodeFindItemSearchOptions(barcodeData: "9783598215414"),
    content: nil // Content information is optional, used for display only
))
```

Finally, create a [`SDCBarcodeFind`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/barcode-find.html#class-scandit.datacapture.barcode.find.BarcodeFind) instance with the Data Capture Context and the settings initialized in the previous step:

```swift
let barcodeFind = BarcodeFind(context: context, settings: settings)
mode.setItemsList(items)
```

## Setup the `BarcodeFindView`

MatrixScan Find’s built-in AR user interface includes buttons and overlays that guide the user through the searching process. By adding a `SDCBarcodeFindView`, the scanning interface is added automatically to your application.

The [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) appearance can be customized through [`SDCBarcodeFindViewSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view-settings.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindViewSettings) to match your application’s look and feel. For example, you can change the color of the dots that are overlaid on top of the items that are found and enable sound and haptic alerts.

```swift
let viewSettings = BarcodeFindViewSettings()
viewSettings.inListItemColor = .green
viewSettings.notInListItemColor = .red
viewSettings.soundEnabled = true
viewSettings.hapticEnabled = true
```

Next, create a `SDCBarcodeFindView` instance with the Data Capture Context and the settings initialized in the previous step. he BarcodeFindView is automatically added to the provided parent view.

```swift
let barcodeFindView = BarcodeFindView(parentView: view, context: context, barcodeFind: mode, settings: viewSettings)
```

Last, connect the [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) to the iOS view controller lifecycle. 

:::note
Be sure to call `BarcodeFindView.prepareSearching()` on your `UIViewController`’s [`viewWillAppear`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621510-viewwillappear) method to ensure optimal start up time.
:::

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    barcodeFindView.prepareSearching()
}

override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    barcodeFindView.stopSearching()
}
```

## Register the Listener

The [`BarcodeFindView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#class-scandit.datacapture.barcode.find.ui.BarcodeFindView) displays a **Finish** button next to its shutter button button. 

Here we register a [`SDCBarcodeFindViewUIDelegate`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/barcode-find-view.html#interface-scandit.datacapture.barcode.find.ui.IBarcodeFindViewUiListener) to be notified what items have been found once the finish button is pressed, and then navigate back to the previous screen to finish the find session.

```swift
barcodeFindView.uiDelegate = self

extension ViewController: BarcodeFindViewUIDelegate {
    func barcodeFindView(_ view: BarcodeFindView,
                        didTapFinishButton foundItems: Set<BarcodeFindItem>) {
        navigationController?.popViewController(animated: true)
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeFindView.startSearching()`.

```swift
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    barcodeFindView.startSearching()
}
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
