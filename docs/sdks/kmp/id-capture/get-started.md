---
description: "Add ID Capture to your Kotlin Multiplatform application: context setup, IdCapture mode configuration, overlays, and result handling."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page will guide you through the process of adding ID Capture to your Kotlin Multiplatform application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Initializing the Data Capture Context
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](/sdks/kmp/add-sdk.mdx).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

The `id` module is the only one required for ID Capture. It optionally combines with these Maven / Swift Package products for specific verification features:

| Module | Required for Feature |
| ----------- | ----------- |
| `id` | Always required |
| `id-aamva-barcode-verification` | Detect forged AAMVA barcodes on US/Canada driver's licenses (`IdCaptureSettings.rejectForgedAamvaBarcodes`) |
| `id-europe-driving-license` | Decode the back of European driving licenses (`IdCaptureSettings.decodeBackOfEuropeanDrivingLicense`) |
| `id-voided-detection` | Reject voided/altered documents |

See [Modules](/sdks/kmp/add-sdk.mdx#modules) for the exact Gradle coordinates and Swift Package products.

:::tip
Note that your license may support only a subset of ID Capture capabilities. If you need to use additional features, [contact us](mailto:support@scandit.com).
:::

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the `DataCaptureContext` with a valid Scandit Data Capture SDK license key. This is typically done once, in shared (`commonMain`) code, so both Android and iOS reuse the same instance:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext

val dataCaptureContext = DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Access a Camera

You need to also create the `Camera`, applying the settings recommended by ID Capture:

```kotlin
import com.kmp.datacapture.core.source.Camera
import com.kmp.datacapture.id.capture.IdCapture

val camera = Camera.getDefaultCamera(IdCapture.createRecommendedCameraSettings())

if (camera == null) {
    throw IllegalStateException("Failed to init camera!")
}

dataCaptureContext.setFrameSource(camera)
```

## Configure the Capture Settings

Use `IdCaptureSettings` to configure the scanner type and the accepted and rejected documents.

Check `IdCaptureDocumentType` for all the available document types, and `IdCaptureRegion` to restrict them by issuing region.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

```kotlin
import com.kmp.datacapture.id.capture.IdCaptureSettings
import com.kmp.datacapture.id.data.DriverLicense
import com.kmp.datacapture.id.data.IdCard
import com.kmp.datacapture.id.data.IdCaptureRegion
import com.kmp.datacapture.id.data.Passport
import com.kmp.datacapture.id.scanner.SingleSideScanner

val settings = IdCaptureSettings.idCaptureSettings().also {
    // To scan only one-sided documents, reading the barcode and the VIZ:
    it.scannerType = SingleSideScanner(barcode = true, machineReadableZone = false, visualInspectionZone = true)
    // To scan both sides of the document instead:
    // it.scannerType = FullDocumentScanner()

    it.acceptedDocuments = listOf(
        IdCard(IdCaptureRegion.ANY),
        DriverLicense(IdCaptureRegion.ANY),
        Passport(IdCaptureRegion.ANY),
    )
}
```

Create a new ID Capture mode with the chosen settings and register it on the context:

```kotlin
import com.kmp.datacapture.id.capture.IdCapture

val idCapture = IdCapture.forContext(dataCaptureContext, settings)
```

## Implement a Listener

To receive scan results, implement `IdCaptureListener`. Results are delivered directly to the listener, not through a session object:

```kotlin
import com.kmp.datacapture.id.capture.IdCapture
import com.kmp.datacapture.id.capture.IdCaptureListener
import com.kmp.datacapture.id.data.CapturedId
import com.kmp.datacapture.id.scanner.RejectionReason

idCapture.addListener(object : IdCaptureListener {
    override fun onIdCaptured(mode: IdCapture, id: CapturedId) {
        // Success! Handle extracted data here.
    }

    override fun onIdRejected(mode: IdCapture, id: CapturedId?, reason: RejectionReason) {
        // Something went wrong. Inspect the reason to determine the follow-up action.
    }
})
```

### Handling Success

Capture results are delivered as a `CapturedId`. This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. `CapturedId.barcode`, `CapturedId.mrz`, `CapturedId.viz`).

```kotlin
override fun onIdCaptured(mode: IdCapture, id: CapturedId) {
    val fullName = id.fullName
    val dateOfBirth = id.dateOfBirth
    val dateOfExpiry = id.dateOfExpiry
    val documentNumber = id.documentNumber

    // Process data:
    processData(fullName, dateOfBirth, dateOfExpiry, documentNumber)
}
```

:::tip
All data fields are optional, so it's important to verify whether the required information is present, as some accepted documents may not contain certain data.
:::

### Handling Rejection

Inspect `RejectionReason` to understand why a document was rejected:

```kotlin
override fun onIdRejected(mode: IdCapture, id: CapturedId?, reason: RejectionReason) {
    when (reason) {
        RejectionReason.TIMEOUT -> {
            // Ask the user to retry, or offer an alternative input method.
        }
        RejectionReason.DOCUMENT_EXPIRED -> {
            // Ask the user to provide an alternative document.
        }
        RejectionReason.HOLDER_UNDERAGE -> {
            // Reject the process.
        }
        else -> {
            // Deal with the default case.
        }
    }
}
```

## Set up the Capture View and Overlay

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. There are two ways to host the view: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `id-compose` module provides a declarative `IdCaptureView` composable that bundles the `DataCaptureContext`, the `IdCapture` mode, its overlay, the camera, and listener registration into one call:

```kotlin
import com.kmp.datacapture.id.compose.IdCaptureView

@Composable
fun IdScanningScreen() {
    IdCaptureView(
        settings = settings,
        onCapture = { capturedId ->
            // Handle the recognized document.
        },
        onReject = { capturedId, reason ->
            // Handle the rejected document.
        },
    )
}
```

### Imperative View API

If you need full control over the view and its lifecycle, add a `DataCaptureView` to your view hierarchy and attach an `IdCaptureOverlay` to it:

```kotlin
import com.kmp.datacapture.core.ui.DataCaptureView
import com.kmp.datacapture.id.capture.IdCaptureOverlay

val dataCaptureView = DataCaptureView(context, dataCaptureContext)

val overlay = IdCaptureOverlay.withIdCaptureForView(idCapture, dataCaptureView)
```

The overlay chooses the displayed UI automatically, based on the selected `IdCaptureSettings`. If you prefer to customize the appearance, or to temporarily hide it, set `IdCaptureOverlay.idLayoutStyle`, `idLayoutLineStyle`, or `showTextHints`.

On Android, embed the native view returned by `toAndroidView()` (shown here hosted from Compose via `AndroidView`, as in a typical Compose Multiplatform app):

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.core.ui.toAndroidView

AndroidView(factory = { dataCaptureView.toAndroidView() })
```

On iOS, wrap the same shared `dataCaptureView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`:

```swift
struct DataCaptureViewRepresentable: UIViewRepresentable {
    let dataCaptureView: DataCaptureView

    func makeUIView(context: Context) -> UIView {
        dataCaptureView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}
```

## Start the Capture Process

Finally, turn on the camera to start scanning:

```kotlin
import com.kmp.datacapture.core.source.FrameSourceState

camera.switchToDesiredState(FrameSourceState.ON)
```
