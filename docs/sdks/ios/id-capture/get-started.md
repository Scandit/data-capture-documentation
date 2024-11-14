---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

This page will guide you through the process of adding ID Capture to your iOS application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. See the [installation guide](/sdks/ios/add-sdk.md) for details.

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Internal Dependencies

import InternalDependencies from '../../../partials/_id-internal-deps.mdx';

<InternalDependencies/>

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new [Data Capture Context](https://docs.scandit.com/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext). The context expects a valid Scandit Data Capture SDK license key during construction.

```swift
self.context = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

## Access a Camera

Next, you need to create a new instance of the [`SDCCamera`](https://docs.scandit.com/data-capture-sdk/ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera that will be used to stream previews and to capture images. The camera settings are also configured, in this case, we use the `recommendedCameraSettings` that come withe ID Capture SDK.

```swift
camera = Camera.default
context.setFrameSource(camera, completionHandler: nil)

// Use the recommended camera settings for the IdCapture mode.
let recommendedCameraSettings = IdCapture.recommendedCameraSettings
camera?.apply(recommendedCameraSettings)
```

## Configure the Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type to use and the documents that should be accepted and/or rejected.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all the available options.

```swift
let settings = IdCaptureSettings()
settings.scannerType = .SingleSideScanner // To scan only one-sided documents
// or
settings.scannerType = .FullDocumentScanner // To scan both sides of the document

settings.acceptedDocuments = [.passport, .driver_license]
settings.rejectedDocuments = [.id_card]
```

## Implement a Listener

To receive scan results, implement and [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener).

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

```swift
extension IdCaptureViewController: IdCaptureListener {
  func idCapture(_ idCapture: IdCapture, didCaptureIn session: IdCaptureSession, frameData: FrameData) {
    let capturedId = session.newlyCapturedId

    // The recognized fields of the captured Id can vary based on the type.
    if capturedId.isPassport = true {
        // Handle the information extracted.
    } else if capturedId.isDriverLicense = true {
        // Handle the information extracted.
    }
  }

  func idCapture(_ idCapture: IdCapture,
                didFailWithError error: Error,
                session: IdCaptureSession,
                frameData: FrameData) {
    // Handle the error.
  }
}
```

Create a new ID Capture mode with the chosen settings. Then register the listener:

```swift
idCapture = IdCapture(context: context, settings: idCaptureSettings)
idCapture.addListener(self)
```

## Set up Capture View and Overlay

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. 

To do that, add a [`SDCDataCaptureView`](https://docs.scandit.com/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```swift
let captureView = DataCaptureView(for: context, frame: view.bounds)
captureView.dataCaptureContext = context
captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(captureView)
```

Then, add a [`SDCIdCaptureOverlay`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to the view:

```swift
let overlay = IdCaptureOverlay(idCapture: idCapture, view: captureView)
```

The overlay chooses the displayed UI automatically, based on the selected `SDCIdCaptureSettings`.

## Start the Capture Process

Finally, turn on the camera to start scanning:

```swift
camera?.switch(toDesiredState: .on)
```