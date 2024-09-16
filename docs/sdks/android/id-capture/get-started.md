---
sidebar_position: 2
framework: android
tags: [android]
keywords:
  - android
---

# Get Started

This page describes the steps to add ID Capture to your application.

:::note
Using ID Capture at the same time as other modes (e.g. Barcode Capture or Text Capture) is not supported.
:::

The general steps are:

- Create a new Data Capture Context instance
- Access a Camera
- Configure the Capture Settings
- Implement a Listener to Receive Scan Results
- Set-up the Capture View and Overlay
- Start the Capture Process

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### External Dependencies

The Scandit Data Capture SDK modules depend on a few standard libraries that you can find listed below. If you are including the Scandit Data Capture SDK through **Gradle** or **Maven**, all of these dependencies are automatically pulled in and there is no need for you to do anything further.

If you directly add the AAR files to the project, you need to add these dependencies yourself.

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

:::note
Note that your license may support only a subset of ID Capture features. If you need to use additional features, [contact us](mailto:support@scandit.com).
:::

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```java
DataCaptureContext dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Access a Camera

Next, you need to create a new instance of the [Camera](https://docs.scandit.com/data-capture-sdk/android/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera to stream previews and to capture images.

```java
camera = Camera.getDefaultCamera(IdCapture.createRecommendedCameraSettings());

if (camera == null) {
    throw new IllegalStateException("Failed to init camera!");
}

dataCaptureContext.setFrameSource(camera);
```

## Configure the Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the types of documents you need to scan. Check [IdDocumentType](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-document-type.html#enum-scandit.datacapture.id.IdDocumentType) for all the available options.

:::warning
Using `IdDocumentType.DL_VIZ` or `IdDocumentType.ID_CARD_VIZ` for configuration together with any MRZ document (`IdDocumentType.ID_CARD_MRZ`, `IdDocumentType.VISA_MRZ`, `IdDocumentType.PASSPORT_MRZ`, `IdDocumentType.SWISS_DL_MRZ`) while [SupportedSides.FRONT_AND_BACK is enabled](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-supported-document-sides.html#value-scandit.datacapture.id.SupportedSides.FrontAndBack) **is not** supported.
:::

```java
IdCaptureSettings settings = new IdCaptureSettings();
settings.setSupportedDocuments(
        IdDocumentType.ID_CARD_VIZ,
        IdDocumentType.DL_VIZ,
        IdDocumentType.AAMVA_BARCODE
);
```

## Implement a Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener).

A result is delivered as an [CapturedId](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents. For more specific information, use its non-null result properties (for example [CapturedId.aamvaBarcode](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.AamvaBarcode)).

```java
class MyListener implements IdCaptureListener {
    @Override
    public void onIdCaptured(
            @NotNull IdCapture mode,
            @NotNull IdCaptureSession session,
            @NotNull FrameData data
    ) {
        CapturedId capturedId = session.getNewlyCapturedId();

        // The recognized fields of the captured Id can vary based on the type.
        if (capturedId.getMrz() != null) {
            // Handle the information extracted.
        } else if (capturedId.getViz() != null) {
            // Handle the information extracted.
        } else if (capturedId.getAamvaBarcode() != null) {
            // Handle the information extracted.
        } else if (capturedId.getUsUniformedServicesBarcode() != null) {
            // Handle the information extracted.
        }
    }

    @Override
    public void onErrorEncountered(
            @NotNull IdCapture mode,
            @NotNull Throwable error,
            @NotNull IdCaptureSession session,
            @NotNull FrameData data
    ) {
      // Handle the error
    }
}
```

Create a new ID Capture mode with the chosen settings. Then register the listener:

```java
idCapture = IdCapture.forDataCaptureContext(dataCaptureContext, settings);
idCapture.addListener(this);
```

## Set up Capture View and Overlay

When using the built-in camera as frame source, you may typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```java
DataCaptureView dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);
setContentView(dataCaptureView);
```

Then, add an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to the view:

```java
IdCaptureOverlay overlay = IdCaptureOverlay.newInstance(idCapture, dataCaptureView);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings). If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/android/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```java
camera.switchToDesiredState(FrameSourceState.ON);
```
