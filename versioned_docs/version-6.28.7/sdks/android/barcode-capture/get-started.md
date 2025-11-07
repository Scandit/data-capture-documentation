---
sidebar_position: 2
pagination_prev: null
framework: android
keywords:
  - android
---

# Get Started

This page describes the step-by-step instructions that helps you to add Barcode Capture to your application.

The general steps are:

- Include the *ScanditBarcodeCapture* library and its dependencies to your project, if any
- Create a new [data capture context](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) instance, initialized with your license key
- Create your [barcode capture settings](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and enable the [barcode symbologies](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read
- Create a new [barcode capture mode](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance and initialize it
- Register a [barcode capture listener](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) to receive scan events
- Process successful scans according to your application’s needs and decide whether more codes will be scanned or the scanning process should be stopped
- Obtain a [camera](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context
- Display the camera preview by creating a [data capture view](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView)
- If displaying a preview, optionally create a new [overlay](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) and add it to [data capture view](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for better visual feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/docs/sdks/android/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### External Dependencies

The Scandit Data Capture SDK modules depend on a few standard libraries that you can find listed below.

If you are including the Scandit Data Capture SDK through **Gradle** or **Maven**, all of these dependencies are automatically pulled in and there is no need for you to do anything further.

If you directly add the AAR files to the project, you need to add these dependencies yourself.

| Module      | Dependencies |
| ----------- | ----------- |
| *ScanditCaptureCore.aar*      | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]; com.squareup.okhttp3:okhttp:4.9.2       |
| *ScanditBarcodeCapture.aar*   | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]        |
| *ScanditParser.aar*      | No dependencies       |

### Internal Dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module      | Dependencies |
| ----------- | ----------- |
| *ScanditCaptureCore*      | No dependencies       |
| *ScanditBarcodeCapture*   | *ScanditCaptureCore*        |
| *ScanditParser*      | No dependencies       |

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure Barcode Scanning Settings

Barcode scanning is orchestrated by the [BarcodeCapture data capture mode](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). This class is the main entry point for scanning barcodes. It is configured through [BarcodeCaptureSettings](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) that will get informed whenever new codes have been recognized.

For this task, we setup barcode scanning for a small list of barcode types, called [symbologies](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is application specific. We recommend that you only enable the symbologies your application requires. If you are not familiar with the symbologies that are relevant for your use case, you can use [capture presets](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/capture-preset.html#enum-scandit.datacapture.barcode.CapturePreset) that are tailored for different verticals (for instance, retail, logistics, and so on).

```java
BarcodeCaptureSettings settings = new BarcodeCaptureSettings();
settings.enableSymbology(Symbology.CODE128, true);
settings.enableSymbology(Symbology.CODE39, true);
settings.enableSymbology(Symbology.QR, true);
settings.enableSymbology(Symbology.EAN8, true);
settings.enableSymbology(Symbology.UPCE, true);
settings.enableSymbology(Symbology.EAN13_UPCA, true);
```

:::note
If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [BarcodeCaptureSettings.codeDuplicateFilter](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around `500` or even `-1` if you do not want codes to be scanned more than once.
:::

Next, create a [BarcodeCapture](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance with the settings initialized in the previous step:

```java
barcodeCapture = BarcodeCapture.forDataCaptureContext(dataCaptureContext, settings);
```

## Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through [BarcodeCapture.addListener()](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `BarcodeCaptureListener` interface. For example:

```java
@Override
public void onBarcodeScanned(@NonNull BarcodeCapture barcodeCapture,
        @NonNull BarcodeCaptureSession session, @NonNull FrameData frameData) {
    List<Barcode> recognizedBarcodes = session.getNewlyRecognizedBarcode();
    // Do something with the barcodes.
}
```

Then add the listener:

```java
barcodeCapture.addListener(this);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications use the built-in camera of the device.

:::note
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the *AndroidManifest.xml* file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the `android.permission.CAMERA` permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These must be used to achieve the best performance and user experience for the respective mode. The following code shows how to get the recommended settings and create the camera:

```java
CameraSettings cameraSettings = BarcodeCapture.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.

Camera camera = Camera.getDefaultCamera();

if (camera != null) {
    camera.applySettings(cameraSettings);
}
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync)

```java
dataCaptureContext.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.ON](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```java
if (camera != null) {
  camera.switchToDesiredState(FrameSourceState.ON);
}
```

:::note
On Android, the Scandit Data Capture SDK is not lifecycle aware which means it is not able to turn off the camera when the app goes in the background. This has to be done so the camera is not locked for other apps and is left to the implementer. Make sure that you turn the camera off in the activity’s **onPause lifecycle** method. Often this means that you want to (re)start it in **onResume**. You can see a way of doing this in all of the [samples](https://github.com/Scandit/datacapture-android-samples).
:::

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you may want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. 

To do that, add a [DataCaptureView](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```java
DataCaptureView dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);
setContentView(dataCaptureView);
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```java
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.newInstance(barcodeCapture, dataCaptureView);
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set [BarcodeCapture.isEnabled](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture.html#property-scandit.datacapture.barcode.BarcodeCapture.IsEnabled) to `FALSE`.

The effect is immediate: no more frames are processed after the change. However, if a frame is currently being processed, this frame is completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
