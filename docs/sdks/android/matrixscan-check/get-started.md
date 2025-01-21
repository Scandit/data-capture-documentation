---
sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan Check to your application. Implementing MatrixScan Check involves two primary elements:

- Barcode Check: The data capture mode that is used for scan and check functionality.
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

import DataCaptureContextAndroid from '../../../partials/get-started/_create-data-capture-context-android.mdx';

<DataCaptureContextAndroid/>

## Configure the Barcode Check Mode

The main entry point for the Barcode Check Mode is the `BarcodeCheck` object. You can configure the supported Symbologies through its [`BarcodeCheckSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-check-settings.html), and set up the list of items that you want MatrixScan Check to highlight.

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```java
BarcodeCheckSettings settings = new BarcodeCheckSettings();
settings.enableSymbology(Symbology.EAN13_UPCA, true);
```

Then you have to create the product provider for the Barcode Check mode. This provider is responsible for providing the items that should be highlighted in the AR view. Note that in this example we are using a hardcoded list of items, but in a real-world scenario, you would fetch this list from your backend.

```java
List<ProductDatabaseEntry> productDatabase = new ArrayList<>();
        productDatabase.add(
            new ProductDatabaseEntry(
                /*product identifier*/"product_1",
                /*quantity to check*/2,
                /*items for the product*/new HashSet<String>() {{
                    add("9783598215438");
                    add("9783598215414");
                    add("9783598215441");
                    add("9783598215412");
                }})
        );
        productDatabase.add(
            new ProductDatabaseEntry(
                /*product identifier*/"product_2",
                /*quantity to check*/3,
                /*items for the product*/new HashSet<String>() {{
                    add("9783598215471");
                    add("9783598215481");
                    add("9783598215458");
                    add("9783598215498");
                    add("9783598215421");
                }})
        );

        // Map the database products to create the Scandit product provider input.
        Set<BarcodeCheckProduct> items = new HashSet<>();
        for (ProductDatabaseEntry productDatabaseEntry : productDatabase) {
            items.add(
                new BarcodeCheckProduct(
                    productDatabaseEntry.productIdentifier,
                    productDatabaseEntry.quantityToCheck
                )
            );
        }

        // Finally, create the product provider itself
        BarcodeCheckProductProvider productProvider = new BarcodeCheckAsyncMapperProductProvider(
            items,
            new BarcodeCheckAsyncMapperProductProviderCallback() {
                @Override
                public void productIdentifierForItems(
                    @NonNull List<String> itemsData,
                    @NonNull BarcodeCheckProductProviderCallback callback
                ) {
                    ArrayList<BarcodeCheckProductProviderCallbackItem> results = new ArrayList<>();

                    // Use the scanned itemsData list to retrieve the identifier of the product they belong to.
                    // This should be an async query in real world scenarios if there are a lot of products/items to loop.
                    for (String itemData : itemsData) {
                        for (ProductDatabaseEntry entry : productDatabase) {
                            if (entry.items.contains(itemData)) {
                                results.add(
                                    new BarcodeCheckProductProviderCallbackItem(
                                        /*item data*/itemData,
                                        /*product identifier*/entry.productIdentifier
                                    )
                                );
                                break;
                            }
                        }
                    }
                    callback.onData(results);
                }
            }
        );
```

Create the mode with the previously created settings:

```java
BarcodeCheck mode = new BarcodeCheck(dataCaptureContext, settings, productProvider);
```

## Setup the `BarcodeCheckView`

MatrixScan Check’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeCheckView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckView), the scanning interface is added automatically to your application.

The `BarcodeCheckView` appearance can be customized through [`BarcodeCheckViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckViewSettings) to match your application’s look and feel. The following settings can be customized:

* Colors of dots in augmented reality overlay
* Enable sound and haptic alerts
* Guidelines text
* Showing hints
* Finish button
* Pause button
* Zoom button
* Loading Dialog

```java
BarcodeCheckViewSettings viewSettings = new BarcodeCheckViewSettings();
// ...
```

Next, create a `BarcodeCheckView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeCheckView` is automatically added to the provided parent view.

```java
BarcodeCheckView barcodeCheckView = BarcodeCheckView.newInstance(parentView, dataCaptureContext, mode, viewSettings);
```

Connect the `BarcodeCheckView` to the Android lifecycle. The view is dependent on calling `BarcodeCheckView.onPause()`, `BarcodeCheckView.onResume()`, and `BarcodeCheckView.onDestroy()` to set up the camera and its overlays properly.

```java
@Override
public void onResume() {
    super.onResume();
    barcodeCheckView.onResume();
}

@Override
public void onPause() {
    super.onPause();
    barcodeCheckView.onPause();
}

@Override
public void onDestroyView() {
    super.onDestroyView(); 
    barcodeCheckView.onDestroy();
}
```

## Register the Listener

The `BarcodeCheckView` displays a **Finish** button next to its shutter button button. 

Register a [BarcodeCheckViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeCheckViewUiListener) to be notified what items have been found once the finish button is pressed.

In this tutorial, we will then navigate back to the previous screen to finish the find session.

```java
barcodeCheckView.setUiListener(new BarcodeCheckViewUiListener() {
    @Override
    public void onFinishButtonTapped(@NonNull BarcodeCheckView view) {
        requireActivity().onBackPressed();
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeCheckView.start()`.

```java
barcodeCheckView.start();
```

This is the equivalent of pressing the Play button programmatically. It will start the search process, turn on the camera, and hide the item carousel.
