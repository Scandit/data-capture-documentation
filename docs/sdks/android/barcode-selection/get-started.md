---
description: "This page describes the steps to add Barcode Selection to your application.                                                                                        "

sidebar_position: 2
pagination_next: null
framework: android
keywords:
  - android
---

# Get Started

This page describes the steps to add Barcode Selection to your application.

The general steps are:

- Create a new Data Capture Context instance, initialized with your license key
- Configure the Barcode Selection settings
- Create a new Barcode Selection mode instance
- Register the listener to receive scan events:
    - Process the successful scans according to your application’s needs, e.g. by looking up information in a database
    - Decide whether more codes will be scanned, or the scanning process must be stopped
- Obtain the camera instance and set as frame source
- Display the camera preview by creating a data capture view
- Create (optionally) a new overlay and add it to data capture view for a better visual feedback, if displaying a preview

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/docs/sdks/android/add-sdk.md).

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

## Configure the Barcode Selection Mode

Barcode selection is orchestrated by the [BarcodeSelection](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) [data capture mode](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode). It is configured via [BarcodeSelectionSettings](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-settings.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) for when new codes have been selected.

For this task, we setup barcode scanning for a small list of different barcode types, called [symbologies](/docs/barcode-symbologies.md). The list of symbologies to enable is highly application specific. It is recommended that you **only enable the list of symbologies your application requires**.

```java
BarcodeSelectionSettings settings = new BarcodeSelectionSettings();
settings.enableSymbology(Symbology.QR, true);
settings.enableSymbology(Symbology.EAN8, true);
settings.enableSymbology(Symbology.UPCE, true);
settings.enableSymbology(Symbology.EAN13_UPCA, true);
```

### Selection Types

The behavior of Barcode Selection can be changed by using a different [selection type](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-type.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionType). This defines the method used by [BarcodeSelection](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelection) to select codes.

There are two types:

- If you want the user to select barcodes with a tap, use [BarcodeSelectionTapSelection](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-tap-selection.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection).
    - This selection type can automatically freeze the camera preview to make the selection easier. You can configure the freezing behavior via [BarcodeSelectionTapSelection.freezeBehavior](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.FreezeBehavior). 
    - With [BarcodeSelectionTapSelection.tapBehavior](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-tap-selection.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionTapSelection.TapBehavior) you can decide if a second tap on a barcode means that the barcode is unselected or if it is selected another time (increasing the counter).

:::note
Using BarcodeSelectionTapSelection requires the MatrixScan add-on.
:::

- If you want the selection to happen automatically based on where the user points the camera, then use [BarcodeSelectionAimerSelection](https://docs.scandit.com/data-capture-sdk/android/selecting-one-of-many.html#:~:text=BarcodeSelectionAimerSelection). It is possible to choose between two different [selection strategies](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-strategy.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionStrategy):
    - Use [BarcodeSelectionAutoSelectionStrategy](https://docs.scandit.com/data-capture-sdk/android/selecting-one-of-many.html#:~:text=BarcodeSelectionAutoSelectionStrategy) if you want the barcodes to be selected automatically when aiming at them as soon as the intention is understood by our internal algorithms.
    - Use [BarcodeSelectionManualSelectionStrategy](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-strategy.html#class-scandit.datacapture.barcode.selection.BarcodeSelectionManualSelectionStrategy) if you want the barcodes to be selected when aiming at them and tapping anywhere on the screen.

### Single Barcode Auto Detection

If you want to automatically select a barcode when it is the only one on screen, turn on [BarcodeSelectionSettings.singleBarcodeAutoDetection](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-settings.html#property-scandit.datacapture.barcode.selection.BarcodeSelectionSettings.SingleBarcodeAutoDetection).

### Creating the Mode

Next, create a `BarcodeSelection` instance with the settings initialized in the previous step:

```java
BarcodeSelection barcodeSelection = BarcodeSelection.forDataCaptureContext(dataCaptureContext, settings);
```

## Registering the Listener

To get informed whenever a new code has been recognized, add a [BarcodeSelectionListener](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection-listener.html#interface-scandit.datacapture.barcode.selection.IBarcodeSelectionListener) through [BarcodeSelection.addListener()](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api/barcode-selection.html#method-scandit.datacapture.barcode.selection.BarcodeSelection.AddListener) and implement the listener methods to suit your application’s needs.

First implement the `BarcodeSelectionListener` interface. For example:

```java
public class MyBarcodeSelectionListener implements BarcodeSelectionListener {
    @Override
    public void onObservationStarted(@NonNull BarcodeSelection barcodeSelection) {
        // Called when Barcode Selection is started.
        // We don't use this callback in this guide.
    }

    @Override
    public void onObservationStopped(@NonNull BarcodeSelection barcodeSelection) {
        // Called when Barcode Selection is stopped.
        // We don't use this callback in this guide.
    }

    @Override
    public void onSessionUpdated(
            @NonNull BarcodeSelection barcodeSelection,
            @NonNull BarcodeSelectionSession session,
            @Nullable FrameData data
    ) {
        // Called every new frame.
        // We don't use this callback in this guide.
    }

    @Override
    public void onSelectionUpdated(
            @NonNull BarcodeSelection barcodeSelection,
            @NonNull BarcodeSelectionSession session,
            @Nullable FrameData frameData
    ) {
        List<Barcode> newlySelectedBarcodes = session.getNewlySelectedBarcodes();
        List<Barcode> selectedBarcodes = session.getSelectedBarcodes();
        List<Barcode> newlyUnselectedBarcodes = session.getNewlyUnselectedBarcodes();
        // Do something with the retrieved barcodes.
    }
}
```

Then add the listener to the `BarcodeSelection` instance:

```java
barcodeSelection.addListener(new MyBarcodeSelectionListener());
```

## Obtaining the Camera Instance and Set as Frame Source

The data capture context supports using different frame sources to perform recognition, here we assume that you will use the built-in camera of the device.

:::note
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the *AndroidManifest.xml* file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the android.permission.CAMERA permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These must be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

```java
CameraSettings cameraSettings = BarcodeSelection.createRecommendedCameraSettings();

// Depending on the use case further camera settings adjustments can be made here.

Camera camera = Camera.getDefaultCamera();
if (camera != null) {
    camera.applySettings(cameraSettings);
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

## Disabling Barcode Selection

To disable barcode selection, for instance when the selection is complete, set `BarcodeSelection.isEnabled` to `FALSE`.

The effect is immediate, no more frames get processed after the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners.

Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
