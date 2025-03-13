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

## Configure the Barcode Check Mode

The main entry point for the Barcode Check Mode is the `BarcodeCheck` object. You can configure the supported Symbologies through its [`BarcodeCheckSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-check-settings.html).

Here we configure it for tracking EAN13 codes, but you should change this to the correct symbologies for your use case.

```java
BarcodeCheckSettings settings = new BarcodeCheckSettings();
settings.enableSymbology(Symbology.EAN13_UPCA, true);
```

Then create the mode with the previously created settings:

```java
BarcodeCheck mode = new BarcodeCheck(dataCaptureContext, settings);
```

## Setup the `BarcodeCheckView`

MatrixScan Check’s built-in AR user interface includes buttons and overlays that guide the user through the scan and check process. By adding a [`BarcodeCheckView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckView), the scanning interface is added automatically to your application.

The `BarcodeCheckView` is where you provide the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.AnnotationProvider) to supply the highlight and annotation information for the barcodes to be checked. If *null*, a default highlight is used and no annotations are provided.

The `BarcodeCheckView` appearance can be customized through [`BarcodeCheckViewSettings`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view-settings.html#class-scandit.datacapture.barcode.check.ui.BarcodeCheckViewSettings), properties on the`BarcodeCheckView`, and the corresponding settings for your desired highlights and/or annotations, to match your application’s look and feel. The following settings can be customized:

* Audio and haptic feedback
* Camera position
* Torch button visibility and its position
* Switch camera button visibility and its position
* Zoom control visibility and its position
* The size, colors, and styles of the highlights and annotations

```java
BarcodeCheckViewSettings viewSettings = new BarcodeCheckViewSettings();
viewSettings.setHapticEnabled(false);
viewSettings.setSoundEnabled(false);
viewSettings.setDefaultCameraPosition(CameraPosition.USER_FACING);
```

Next, create a `BarcodeCheckView` instance with the Data Capture Context and the settings initialized in the previous step. The `BarcodeCheckView` is automatically added to the provided parent view.

```java
BarcodeCheckView barcodeCheckView = BarcodeCheckView(parentView, barcodeCheck, dataCaptureContext, viewSettings);
barcodeCheckView.setShouldShowCameraSwitchControl(true);
barcodeCheckView.setShouldShowTorchControl(true);
barcodeCheckView.setShouldShowZoomControl(true);
barcodeCheckView.setCameraSwitchControlPosition(Anchor.TOP_RIGHT);
barcodeCheckView.setTorchControlPosition(Anchor.BOTTOM_RIGHT);
barcodeCheckView.setZoomControlPosition(Anchor.TOP_LEFT);
```

Configure the [`highlightProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.HighlightProvider) and/or [`annotationProvider`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#property-scandit.datacapture.barcode.check.ui.BarcodeCheckView.AnnotationProvider).

```java
private class AnnotationProvider implements BarcodeCheckAnnotationProvider {

    @Override
    public void annotationForBarcode(@NonNull Context context, @NonNull Barcode barcode, @NonNull Callback callback) {
        BarcodeCheckStatusIconAnnotation annotation = new BarcodeCheckStatusIconAnnotation(context, barcode);
        annotation.setText("Example annotation");
        callback.onData(annotation);
    }
}

private class HighlightProvider implements BarcodeCheckHighlightProvider {

    @Override
    public void highlightForBarcode(@NonNull Context context, @NonNull Barcode barcode, @NonNull Callback callback) {
        callback.onData(new BarcodeCheckRectangleHighlight(context, barcode));
    }
}
```

And set them to the view:

```java
barcodeCheckView.setHighlightProvider(new HighlightProvider());
barcodeCheckView.setAnnotationProvider(new AnnotationProvider());
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

If you want a callback when a highlight is tapped, register a [BarcodeCheckViewUiListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-check-view.html#interface-scandit.datacapture.barcode.check.ui.IBarcodeCheckViewUiListener).

```java
barcodeCheckView.setUiListener(new BarcodeCheckViewUiListener() {
    @Override
    public void onHighlightForBarcodeTapped(@NonNull BarcodeCheck barcodeCheck, @NonNull Barcode barcode, @NonNull BarcodeCheckHighlight highlight, @NonNull View highlightView) {
        // handle tap
    }
});
```

## Start Searching

With everything configured, you can now start searching for items. This is done by calling `barcodeCheckView.start()`.

```java
barcodeCheckView.start();
```
