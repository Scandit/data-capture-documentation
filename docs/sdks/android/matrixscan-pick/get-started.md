---
description: "In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:                                                                              "

sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:

- Barcode Pick: The data capture mode that is used for scan and pick functionality.
- A Barcode Pick View: The pre-built UI elements used to highlight items to be picked.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the Barcode Pick Mode
- Setup the Barcode Pick View
- Registering the Listener to notify about found items

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### External Dependencies

import ExternalDependencies from '../../../partials/get-started/_external-deps-android.mdx';

<ExternalDependencies/>

### Internal Dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

## Create a Data Capture Context

import DataCaptureContextAndroid from '../../../partials/get-started/_create-data-capture-context-android.mdx';

<DataCaptureContextAndroid/>

## Configure the Barcode Pick Mode

The main entry point for the Barcode Pick Mode is the `BarcodePick` object. You can configure the supported Symbologies through its [`BarcodePickSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-pick-settings.html), and set up the list of items that you want MatrixScan Pick to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```kotlin
val settings = BarcodePickSettings().apply {
    enableSymbology(Symbology.EAN13_UPCA, true)
}
```

Then you have to create the product provider for the Barcode Pick mode. This provider is responsible for providing the items that should be highlighted in the AR view. Note that in this example we are using a hardcoded list of items, but in a real-world scenario, you would fetch this list from your backend.

```kotlin
val productDatabase = listOf(
    ProductDatabaseEntry(
        /*product identifier*/"product_1",
        /*quantity to pick*/2,
        /*items for the product*/setOf {
            "9783598215438",
            "9783598215414",
            "9783598215441",
            "9783598215412",
        }
    ),
    ProductDatabaseEntry(
        /*product identifier*/"product_2",
        /*quantity to pick*/3,
        /*items for the product*/setOf {
            "9783598215471",
            "9783598215481",
            "9783598215458",
            "9783598215498",
            "9783598215421",
        }
    ),
)

// Map the database products to create the Scandit product provider input.
val items = mutableSetOf<BarcodePickProduct>()
productDatabase.forEach { productDatabaseEntry ->
    items.add(
        BarcodePickProduct(
            productDatabaseEntry.productIdentifier,
            productDatabaseEntry.quantityToPick,
        )
    )
}

// Finally, create the product provider itself
val productProvider = BarcodePickAsyncMapperProductProvider(
    items,
    object : BarcodePickAsyncMapperProductProviderCallback {
        override fun productIdentifierForItems(
            itemsData: List<String>,
            callback: BarcodePickProductProviderCallback,
        ) {
            val results = mutableListOf<BarcodePickProductProviderCallbackItem>()

            // Use the scanned itemsData list to retrieve the identifier of the product they belong to.
            // This should be an async query in real world scenarios if there are a lot of products/items to loop.
            itemsData.forEach { itemData ->
                for (entry in productDatabase) {
                    if (entry.items.contains(itemData)) {
                        results.add(
                            BarcodePickProductProviderCallbackItem(
                                /*item data*/itemData,
                                /*product identifier*/entry.productIdentifier
                            )
                        )
                        break
                    }
                }
            }
            callback.onData(results)
        }
    }
)
```

Create the mode with the previously created settings:

```kotlin
val barcodePick = BarcodePick(dataCaptureContext, settings, productProvider)
```

## Setup the `BarcodePickView`

MatrixScan Pick’s built-in AR user interface includes buttons and overlays that guide the user through the scan and pick process. By adding a [`BarcodePickView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickView), the scanning interface is added automatically to your application.

The `BarcodePickView` appearance can be customized through [`BarcodePickViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view-settings.html#class-scandit.datacapture.barcode.pick.ui.BarcodePickViewSettings) to match your application’s look and feel. The following settings can be customized:

* Colors of dots in augmented reality overlay
* Enable sound and haptic alerts
* Guidelines text
* Showing hints
* Finish button
* Pause button
* Zoom button
* Loading Dialog

```kotlin
val viewSettings = BarcodePickViewSettings()
// ...
```

Next, create a `BarcodePickView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodePickView` is automatically added to the provided parent view.

```kotlin
val barcodePickView = BarcodePickView.newInstance(parentView, dataCaptureContext, barcodePick, viewSettings)
```

Connect the `BarcodePickView` to the Android lifecycle. The view is dependent on calling `BarcodePickView.onPause()`, `BarcodePickView.onResume()`, and `BarcodePickView.onDestroy()` to set up the camera and its overlays properly.

```kotlin
override fun onResume() {
    super.onResume()
    barcodePickView.onResume()
}

override fun onPause() {
    super.onPause()
    barcodePickView.onPause()
}

override fun onDestroy() {
    super.onDestroy(); 
    barcodePickView.onDestroy()
}
```

## Register the Listener

The `BarcodePickView` displays a **Finish** button next to its shutter button. 

Register a [BarcodePickViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-pick-view.html#interface-scandit.datacapture.barcode.pick.ui.IBarcodePickViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```kotlin
barcodePickView.uiListener = object : BarcodePickViewUiListener {
    override fun onFinishButtonTapped(view: BarcodePickView) {
        requireActivity().onBackPressed()
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodePickView.start()`.

```kotlin
barcodePickView.start()
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
