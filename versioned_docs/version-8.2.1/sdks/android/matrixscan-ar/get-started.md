---
description: "In this guide you will learn step-by-step how to add MatrixScan AR to your application. Implementing MatrixScan AR involves two primary elements:                                                                              "

sidebar_position: 2
framework: android
keywords:
  - android
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

## Configure the Barcode AR Mode

The main entry point for the Barcode AR Mode is the `BarcodeAr` object. You can configure the supported Symbologies through its [`BarcodeArSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-ar-settings.html).

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```kotlin
val settings = BarcodeArSettings().apply {
    enableSymbology(Symbology.EAN13_UPCA, true)
}
```

Then create the mode with the previously created settings:

```kotlin
val barcodeAr = BarcodeAr(dataCaptureContext, settings)
```

## Setup the `BarcodeArView`

MatrixScan AR’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeArView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeArView), the scanning interface is added automatically to your application.

The `BarcodeArView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeArView` appearance can be customized through [`BarcodeArViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeArViewSettings), properties on the`BarcodeArView`, and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Camera position
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlights and annotations

```kotlin
val viewSettings = BarcodeArViewSettings().apply {
    hapticEnabled = false
    soundEnabled = false
    defaultCameraPosition = CameraPosition.USER_FACING
}
```

Next, create a `BarcodeArView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeArView` is automatically added to the provided parent view.

```kotlin
val barcodeArView = BarcodeArView(parentView, barcodeAr, dataCaptureContext, viewSettings).apply {
    shouldShowCameraSwitchControl = true
    shouldShowTorchControl = true
    shouldShowZoomControl = true
    cameraSwitchControlPosition = Anchor.TOP_RIGHT
    torchControlPosition = Anchor.BOTTOM_RIGHT
    zoomControlPosition = Anchor.TOP_LEFT
}
```

Configure the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeArView.AnnotationProvider).

```kotlin
private class AnnotationProvider: BarcodeArAnnotationProvider {

    override fun annotationForBarcode(context: Context, barcode: Barcode, callback: Callback) {
        val annotation = BarcodeArStatusIconAnnotation(context, barcode).apply {
            text = "Example annotation"
        }
        callback.onData(annotation)
    }
}

private class HighlightProvider: BarcodeArHighlightProvider {

    override fun highlightForBarcode(context: Context, barcode: Barcode, callback: Callback) {
        callback.onData(BarcodeArRectangleHighlight(context, barcode))
    }
}
```

And set them to the view:

```kotlin
barcodeArView.highlightProvider = HighlightProvider()
barcodeArView.annotationProvider = AnnotationProvider()
```

Connect the `BarcodeArView` to the Android lifecycle. The view is dependent on calling `BarcodeArView.onPause()`, `BarcodeArView.onResume()`, and `BarcodeArView.onDestroy()` to set up the camera and its overlays properly.

```kotlin
override fun onResume() {
    super.onResume()
    barcodeArView.onResume()
}

override fun onPause() {
    super.onPause()
    barcodeArView.onPause()
}

override fun onDestroy() {
    super.onDestroy(); 
    barcodeArView.onDestroy()
}
```

## Register the Listener

If you want a callback when a highlight is tapped, register a [BarcodeArViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-ar-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeArViewUiListener).

```kotlin
barcodeArView.uiListener = object : BarcodeArViewUiListener {
    override fun onHighlightForBarcodeTapped(barcodeAr: BarcodeAr, barcode: Barcode, highlight: BarcodeArHighlight, highlightView: View) {
        // handle tap
    }
}
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeArView.start()`.

```kotlin
barcodeArView.start()
```
