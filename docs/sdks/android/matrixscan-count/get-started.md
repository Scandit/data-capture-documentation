---
description: "This page describes the steps to add MatrixScan Count to your application.                                                                                        "

sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

This page describes the steps to add MatrixScan Count to your application.

:::note
MatrixScan Count is implemented via [BarcodeCount](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count.html#class-scandit.datacapture.barcode.count.BarcodeCount).
:::

The general steps are:

- Create a new Data Capture Context instance
- Configure the Barcode Count Mode
- Obtain the camera instance and set frame source
- Register the listener to be informed when scan phase is complete
- Set the capture view and AR overlays
- Configure the camera for scanning view
- Store and retrieve the captured barcodes
- Reset the Barcode Count Mode
- List and exit callbacks

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

## Configure the Barcode Count Mode

The main entry point for the Barcode Count Mode is the `BarcodeCount` object. It is configured through [BarcodeCountSettings](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-settings.html) and allows you to register one or more listeners that are informed whenever a scan phase has finished.

Here we set up Barcode Count for tracking EAN13 codes, however you must change this to the appropriate symbologies for your use case. If you are sure that your environment has only unique barcodes, you can also enable `BarcodeCountSettings.expectsOnlyUniqueBarcodes`. This option improves scanning performance as long as you are sure that no duplicates are present.

```kotlin
val settings = BarcodeCountSettings().apply {
    setSymbologyEnabled(Symbology.EAN13_UPCA, true)
}
```

Next, create a `BarcodeCount` instance with the Data Capture Context and the settings initialized in the previous step:

```kotlin
val barcodeCount = BarcodeCount.forDataCaptureContext(dataCaptureContext, settings)
```

## Camera Instance And Set Frame Source

Our recommended camera settings should be used to achieve the best performance and user experience. The following code shows how to get the recommended settings for MatrixScan Count and create the camera from it:

```kotlin
val cameraSettings = BarcodeCount.createRecommendedCameraSettings()

val camera = Camera.getDefaultCamera(cameraSettings)
```

Because the frame source is configurable the data capture context must be told which frame source to use. This is done with a call to [`DataCaptureContext.setFrameSource()`](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```kotlin
dataCaptureContext.setFrameSource(camera)
```

## Registering the Listener

To keep track of the barcodes that have been scanned, implement the [BarcodeCountListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-listener.html#interface-scandit.datacapture.barcode.count.IBarcodeCountListener) interface and register the listener.

```kotlin
// Register self as a listener to monitor the barcode count session.
barcodeCount.addListener(this)
```

[`BarcodeCountListener.onScan()`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan) is called when the scan phase has finished and results can be retrieved from [`BarcodeCountSession`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-session.html#class-scandit.datacapture.barcode.count.BarcodeCountSession).

## Setting the Capture View and AR Overlays

MatrixScan Count’s built-in AR user interface includes buttons and overlays that guide the user through the capturing process. By adding a [`BarcodeCountView`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-count-view.html#class-scandit.datacapture.barcode.count.ui.BarcodeCountView) the scanning interface will be added automatically to your application.

Add a `BarcodeCountView` to your view hierarchy:

```kotlin
val barcodeCountView = BarcodeCountView.newInstance(context, captureView, barcodeCount)
```

## Configuring the Camera for Scanning View

The camera is not automatically turned on when you are in a scanning view. You need to set up the camera so that it switches on when needed and it switches off when not needed anymore.

Similarly `BarcodeCount` should also be enabled and disabled. For example, you should switch off the camera when the `BarcodeCountView` is not visible and switch on the camera when the `BarcodeCountView` is visible. For example:

```kotlin
override fun onPause() {
    camera.switchToDesiredState(FrameSourceState.OFF)
    super.onPause()
}

override fun onResume() {
    super.onResume()
    camera.switchToDesiredState(FrameSourceState.ON)
}
```

## Store And Retrieve Scanned Barcodes

The values captured as part of the scanning process are part of the session, and the session is not accessible outside [`BarcodeCountListener.onScan`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-listener.html#method-scandit.datacapture.barcode.count.IBarcodeCountListener.OnScan).

We recommend you store the values to present a list, for example when the user taps the list icon. To do this, make a copy of [`BarcodeCountSession.recognizedBarcodes`](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-count-session.html#property-scandit.datacapture.barcode.count.BarcodeCountSession.RecognizedBarcodes):

```kotlin
override fun onScan(
    mode: BarcodeCount,
    session: BarcodeCountSession,
    data: FrameData,
) {
    val allRecognizedBarcodes = session.recognizedBarcodes
}
```

## Resetting the Barcode Count Mode

When the scanning process is over, you need to reset the mode to make it ready for the next process. This clears the list of barcodes scanned and all the AR overlays.

To reset Barcode Count’s scanning process, call the `BarcodeCount.reset` method:

```kotlin
barcodeCount.reset()
```

## List and Exit Callbacks

The UI includes two icons (buttons): “List” and “Exit”. The SDK provides the callbacks so you can add the desired action when those icons are tapped by the user:

```kotlin
override fun onListButtonTapped() {
    // Show the current progress but the order is not completed
}

override fun onExitButtonTapped(view: BarcodeCountView) {
    // The order is completed
}
```
