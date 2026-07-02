---
description: "In this guide you will learn step-by-step how to add Smart Label Capture to your application.                                                                                    "

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Initialize the Data Capture Context
- Configure the LabelCapture mode
- Define a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/kmp/add-sdk.mdx).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

The `label` module is the only one required for Smart Label Capture. It optionally combines with these Maven / Swift Package products:

| Module | Required for Feature |
| ----------- | ----------- |
| `label` | Always required |
| `label-text` | Required for capturing arbitrary text fields (e.g. `CustomText`, `ExpiryDateText`) |
| `price-label` | Required for capturing price and weight fields (e.g. `TotalPriceText`, `UnitPriceText`) |

See [Modules](/sdks/kmp/add-sdk.mdx#modules) for the exact Gradle coordinates and Swift Package products.

:::warning
Recognizing any text field without wiring in `label-text` crashes at model-load time rather than failing gracefully. If your label definition uses a text field, add the module before you run the app.
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

## Configure the Label Capture Mode

The main entry point for the Label Capture Mode is the `LabelCapture` object. It is configured through `LabelCaptureSettings` and allows you to register one or more listeners that get informed whenever a new frame has been processed.

:::tip
You can use Label Definitions provided in Smart Label Capture to set pre-built label types or define your label using pre-built fields. For more information, see the [Label Definitions](label-definitions.md) section.
:::

`LabelCaptureSettings` can be built with a Kotlin DSL:

```kotlin
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.label.capture.LabelCapture
import com.kmp.datacapture.label.capture.labelCaptureSettings
import com.kmp.datacapture.label.definition.LabelDateComponentFormat
import com.kmp.datacapture.label.definition.LabelDateFormat

// Build LabelCaptureSettings with the Kotlin DSL.
val settings = labelCaptureSettings {
    label("<your-label-name>") {
        // Add a barcode field with the expected symbologies.
        customBarcode("<your-barcode-field-name>") {
            setSymbologies(Symbology.EAN13_UPCA, Symbology.CODE128)
        }
        // Add a text field for capturing expiry dates.
        expiryDateText("<your-expiry-date-field-name>") {
            isOptional(true)
            setLabelDateFormat(LabelDateFormat(LabelDateComponentFormat.MDY, false))
        }
    }
}

// Create the label capture mode with the settings and data capture context.
val labelCapture = LabelCapture.forContext(dataCaptureContext, settings)
```

## Define a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a `LabelCaptureListener` through `LabelCapture.addListener()` and implement `onSessionUpdated`, which is called for every processed frame.

```kotlin
import com.kmp.datacapture.core.data.FrameData
import com.kmp.datacapture.core.feedback.Feedback
import com.kmp.datacapture.label.capture.LabelCapture
import com.kmp.datacapture.label.capture.LabelCaptureListener
import com.kmp.datacapture.label.capture.LabelCaptureSession

labelCapture.addListener(object : LabelCaptureListener {
    override fun onSessionUpdated(
        labelCapture: LabelCapture,
        session: LabelCaptureSession,
        frameData: FrameData,
    ) {
        // The session update callback is called for every processed frame.
        // Check if the session contains any captured labels; if not, continue capturing.
        val capturedLabel = session.capturedLabels.firstOrNull() ?: return

        // Given the label capture settings defined above, barcode data will always be present.
        val barcodeData = capturedLabel.fields
            .find { it.name == "<your-barcode-field-name>" }?.barcode?.data

        // The expiry date field is optional. Check for null in your result handling.
        val expiryDate = capturedLabel.fields
            .find { it.name == "<your-expiry-date-field-name>" }?.asDate()

        // Disable the label capture mode after a label has been captured
        // to prevent it from capturing the same label multiple times.
        labelCapture.isEnabled = false

        handleResults(barcodeData, expiryDate)
    }
})
```

## Visualize the Scan Process

The capture process can be visualized by adding a `DataCaptureView` to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `label-compose` module provides a declarative `LabelCaptureView` composable that bundles the `DataCaptureContext`, the `LabelCapture` mode, the chosen overlay, the camera, and listener registration into one call:

```kotlin
import com.kmp.datacapture.label.compose.LabelCaptureView
import com.kmp.datacapture.label.compose.LabelOverlayStyle

@Composable
fun LabelScanningScreen() {
    LabelCaptureView(
        settings = settings,
        overlayStyle = LabelOverlayStyle.Basic,
        onCapture = { capturedLabels ->
            // Handle the recognized labels for this frame.
        },
    )
}
```

`LabelOverlayStyle` also has `Advanced`, `ValidationFlow`, and `AdaptiveRecognition` variants — see [Advanced Configurations](advanced.md) for what each one is for.

### Imperative View API

If you need full control over the view and its lifecycle, use two overlays to visualize the results of Label Capture:

- `LabelCaptureBasicOverlay`
- `LabelCaptureAdvancedOverlay`

:::tip
The overlays can be used independently of each other, but you can also use both at the same time as each can serve to extend the functionality of the other.
:::

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

```kotlin
import com.kmp.datacapture.core.ui.DataCaptureView
import com.kmp.datacapture.core.ui.viewfinder.RectangularViewfinder
import com.kmp.datacapture.core.ui.viewfinder.RectangularViewfinderStyle
import com.kmp.datacapture.label.ui.overlay.LabelCaptureBasicOverlay

// Create the data capture view and attach it to the data capture context created earlier.
val dataCaptureView = DataCaptureView(context, dataCaptureContext)

// Create the overlay with the label capture mode and data capture view created earlier.
val overlay = LabelCaptureBasicOverlay.withLabelCaptureForView(labelCapture, dataCaptureView)
overlay.viewfinder = RectangularViewfinder.withStyle(RectangularViewfinderStyle.SQUARE)
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary native views.
:::

## Start the Camera

Next, you need to create a new instance of the `Camera` class to indicate the camera to stream previews and to capture images.

When initializing the camera, you can pass the recommended camera settings for Label Capture.

```kotlin
import com.kmp.datacapture.core.source.Camera
import com.kmp.datacapture.core.source.FrameSourceState
import com.kmp.datacapture.label.capture.LabelCapture

val camera = Camera.getDefaultCamera(LabelCapture.createRecommendedCameraSettings())
if (camera == null) {
    throw IllegalStateException("Failed to init camera!")
}
dataCaptureContext.setFrameSource(camera)
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels. Typically, this is done on resuming the view and when the user granted permission to use the camera, or once the user pressed continue scanning after handling a previous scan.

```kotlin
camera.switchToDesiredState(FrameSourceState.ON)
```

## Provide Feedback

Smart Label Capture provides customizable feedback, emitted automatically when a label is recognized and successfully processed, configurable via `LabelCapture.feedback`.

You can use the default feedback, or configure your own sound or vibration.

:::tip
If you already have a `Feedback` instance implemented in your application, remove it to avoid double feedback.
:::

```kotlin
import com.kmp.datacapture.label.capture.LabelCaptureFeedback

labelCapture.feedback = LabelCaptureFeedback.defaultFeedback()
```

:::note
Audio feedback is only played if the device is not muted.
:::
