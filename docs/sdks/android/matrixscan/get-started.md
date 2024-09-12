---
sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add MatrixScan to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the MatrixScan mode
- Using the built-in camera
- Visualizing the scan process
- Providing feedback
- Disabling barcode tracking

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### External Dependencies

The Scandit Data Capture SDK modules depend on a few standard libraries that you can find listed below. If you are including the Scandit Data Capture SDK through **Gradle** or **Maven**, all of these dependencies are automatically pulled in and there is no need for you to do anything further. On the other hand, if you directly add the AAR files to the project, you need to add these dependencies yourself.

| Module      | Dependencies |
| ----------- | ----------- |
| *ScanditCaptureCore.aar*      | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]; com.squareup.okhttp3:okhttp:4.9.2       |
| *ScanditBarcodeCapture.aar*   | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]        |
| *ScanditParser.aar*      | No dependencies       |
| *ScanditIdCapture.aar*      | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]       |

### Internal Dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module      | Dependencies |
| ----------- | ----------- |
| *ScanditCaptureCore*      | No dependencies       |
| *ScanditBarcodeCapture*   | *ScanditCaptureCore*        |
| *ScanditParser*      | No dependencies       |
| *ScanditIdCapture*      | *ScanditCaptureCore*; *ScanditIdCaptureBackend (VIZ documents)*       |
| *ScanditIdCaptureBackend*      | No dependencies       |

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Barcode Tracking Mode

The main entry point for the Barcode Tracking Mode is the [BarcodeTracking](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking.html#class-scandit.datacapture.barcode.tracking.BarcodeTracking) object. It is configured through [BarcodeTrackingSettings](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-settings.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSettings) and allows to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-listener.html#interface-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener) that  gets informed whenever a new frame has been processed.

:::note
Typically you do not need to implement to a `BarcodeTrackingListener`, instead you may add a [BarcodeTrackingBasicOverlay](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay) and implement to a [BarcodeTrackingBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener).
:::

For this task, we setup Barcode Tracking for tracking QR codes:

```java
BarcodeTrackingSettings settings = new BarcodeTrackingSettings();
settings.enableSymbology(Symbology.QR, true);
```

Next, create a `BarcodeTracking` instance with the data capture context and the settings initialized in the previous steps:

```java
BarcodeTracking barcodeTracking = BarcodeTracking.forDataCaptureContext(dataCaptureContext, settings);
```

## Use the Built-in Camera

The data capture context supports using different frame sources to perform recognition on. Most applications uses the built-in camera of the device, for instance, the world-facing camera of a device. The remainder of this tutorial assumes that you use the built-in camera.

:::note
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the *AndroidManifest.xml* file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the android.permission.CAMERA permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These must be used to achieve the best performance and user experience for the respective mode.

The following lines show how to get the recommended settings and create the camera from it:

```java
CameraSettings cameraSettings = BarcodeTracking.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.

Camera camera = Camera.getDefaultCamera();
if (camera != null) {
  camera.applySettings(cameraSettings, null);
}
```

Because the frame source is configurable, the data capture context must be told which frame source to use. This is done with a call to [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

```java
dataCaptureContext.setFrameSource(camera);
```

The camera is off by default and must be turned on. This is done by calling [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.ON](https://docs.scandit.com/data-capture-sdk/android/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On):

```java
if (camera != null) {
  camera.switchToDesiredState(FrameSourceState.ON);
}
```

## Visualize the Scan Process

When using the built-in camera as frame source, you typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```java
DataCaptureView dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);
setContentView(dataCaptureView);
```

To visualize the results of Barcode Tracking, first you need to add the following [overlay](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay):

```java
BarcodeTrackingBasicOverlay overlay = BarcodeTrackingBasicOverlay.newInstance(barcodeTracking, dataCaptureView);
```

Once the overlay has been added, you must conform to the [BarcodeTrackingBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#interface-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener) interface. The method [BarcodeTrackingBasicOverlayListener.brushForTrackedBarcode()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay-listener.html#method-scandit.datacapture.barcode.tracking.ui.IBarcodeTrackingBasicOverlayListener.BrushForTrackedBarcode) is invoked every time a new tracked barcode appears and it can be used to set a brush used to highlight that specific barcode in the [overlay](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/ui/barcode-tracking-basic-overlay.html#class-scandit.datacapture.barcode.tracking.ui.BarcodeTrackingBasicOverlay).

```java
@Override
public Brush brushForTrackedBarcode(@NonNull BarcodeTrackingBasicOverlay overlay,
                                    @NonNull TrackedBarcode trackedBarcode) {
    // Return a custom Brush based on the tracked barcode.
}
```

If you want to make the highlights tappable, you need to implement the [BarcodeTrackingBasicOverlayListener.onTrackedBarcodeTapped()] method.

```java
@Override
public void onTap(@NonNull BarcodeTrackingBasicOverlay overlay,
                  @NonNull TrackedBarcode trackedBarcode) {
    // A tracked barcode was tapped.
}
```

## Barcode Tracking Feedback

Barcode Tracking, unlike Barcode Capture, doesn’t emit feedback (sound or vibration) when a new barcode is recognized. However, you may implement a `BarcodeTrackingListener` to provide a similar experience.

Here, we use the default [Feedback](https://docs.scandit.com/data-capture-sdk/android/core/api/feedback.html#class-scandit.datacapture.core.Feedback), but you may configure it with your own sound or vibration.

First, we create a feedback and release it after it is no longer used, to avoid resources being unnecessarily held.

```java
override func viewDidLoad() {
    super.viewDidLoad()
    feedback = Feedback.default
}
```

Next, use this `feedback` in a `BarcodeTrackingListener`:

```java
public class FeedbackListener implements BarcodeTrackingListener {
    @Override
    public void onObservationStarted(@NotNull BarcodeTracking barcodeTracking) {
        // Called when Barcode Tracking is started.
        // We don't use this callback in this guide.
    }

    @Override
    public void onObservationStopped(@NotNull BarcodeTracking barcodeTracking) {
        // Called when Barcode Tracking is stopped.
        // We don't use this callback in this guide.
    }

    @Override
    public void onSessionUpdated(
            @NotNull BarcodeTracking mode,
            @NotNull BarcodeTrackingSession session,
            @NotNull FrameData data
    ) {
        if (!session.getAddedTrackedBarcodes().isEmpty()) {
            feedback.emit();
        }
    }
}
```

[BarcodeTrackingListener.onSessionUpdated()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-listener.html#method-scandit.datacapture.barcode.tracking.IBarcodeTrackingListener.OnSessionUpdated) is invoked for every processed frame. The [session](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-tracking-session.html#class-scandit.datacapture.barcode.tracking.BarcodeTrackingSession) parameter contains information about the currently tracked barcodes, in particular, the newly recognized ones. We check if there are any and if so, we emit the feedback.

As the last step, register the listener responsible for emitting the feedback with the `BarcodeTracking` instance.

```java
barcodeTracking.addListener(feedbackListener);
```

## Disable Barcode Tracking

To disable barcode tracking, set `BarcodeTracking.isEnabled` to `FALSE`.

The effect is immediate, no more frames get processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off or put it in standby calling [SwitchToDesiredState](https://docs.scandit.com/data-capture-sdk/android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [StandBy](https://docs.scandit.com/data-capture-sdk/android/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.Standby).
