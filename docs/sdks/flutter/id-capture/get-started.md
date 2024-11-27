---
sidebar_position: 2
framework: flutter
keywords:
  - flutter
---

# Get Started

This page will guide you through the process of adding ID Capture to your Flutter application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/flutter/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Internal dependencies

import InternalDependencies from '../../../partials/_internal-deps.mdx';

When adding `ScanditIdCapture` to a Flutter project, certain native dependencies need to be added manually to your project, depending on the documents you want to scan.

<InternalDependencies/>

### Initialize the ID Plugin

:::warning
Without initializing the ID plugin, runtime crashes will occur. However, you don’t have to initialize the core plugin, as initializing the ID plugin already does that.
:::

Before accessing anything of the Scandit Data Capture SDK functionality. You have to initialize the id plugin.

```dart
void main() async {
WidgetsFlutterBinding.ensureInitialized();
await ScanditFlutterDataCaptureId.initialize();
runApp(MyApp());
}
```
## Create the Data Capture Context

The first step to add capture capabilities to your application is to create a new [data capture context](https://docs.scandit.com/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var context = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Add the Camera

You need to also create the [Camera](https://docs.scandit.com/data-capture-sdk/flutter/core/api/camera.html#class-scandit.datacapture.core.Camera):

```dart
Camera? camera = Camera.defaultCamera;

if (camera != null) {
// Use the settings recommended by id capture.
camera.applySettings(IdCapture.recommendedCameraSettings);
context.setFrameSource(camera);
}
```

## Create ID Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type and the accepted and rejected documents.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/id-capture-document.html) for all the available options.

```dart
var settings = IdCaptureSettings();
settings.scannerType(
    SingleSideScanner // To scan only one-sided documents
    // or
    FullDocumentScanner // To scan both sides of the document
);

settings.acceptedDocuments.addAll([PASSPORT, DRIVER_LICENSE]);
settings.rejectedDocuments.addAll([ID_CARD]);
```

## Implement the Listener

To receive scan results, implement [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). 

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

```dart
@override
void didCaptureId(IdCapture idCapture, IdCaptureSession session) {
CapturedId? capturedId = session.newlyCapturedId;
// Do something in case the capturedId is not null.
}
```

Create a new ID Capture mode with the chosen settings. Then register the listener:

```dart
idCapture = IdCapture.forContext(context, settings);
idCapture.addListener(this)
```

## Set up Capture View and Overlay

When using the built-in camera as [frameSource](https://docs.scandit.com/data-capture-sdk/flutter/core/api/frame-source.html#interface-scandit.datacapture.core.IFrameSource), you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process.

To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```dart
var dataCaptureView = DataCaptureView.forContext(dataCaptureContext);
// Add the dataCaptureView to your widget tree
```

Then create an instance of [IdCaptureOverlay](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) attached to the view:

```dart
overlay = IdCaptureOverlay.withIdCaptureForView(idCapture, dataCaptureView);
```

The overlay chooses the displayed UI automatically, based on the selected [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings).

If you prefer to show a different UI or to temporarily hide it, set the appropriate [IdCaptureOverlay.idLayout](https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api/ui/id-capture-overlay.html#property-scandit.datacapture.id.ui.IdCaptureOverlay.IdLayout).

## Start the Capture Process

Finally, turn on the camera to start scanning:

```dart
camera.switchToDesiredState(FrameSourceState.on);
```
