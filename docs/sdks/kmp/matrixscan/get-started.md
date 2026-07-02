---
description: "Step-by-step instructions to add MatrixScan Batch to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that help you add MatrixScan Batch to your application:

- Initialize the Data Capture Context
- Configure the Barcode Batch Mode
- Use the built-in camera
- Host a Data Capture View and visualize the tracked barcodes
- Track the results
- Disable Barcode Batch

## Prerequisites

- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.mdx) for information on how to add the Scandit Data Capture SDK to your project.

:::note
Devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
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

## Configure the Barcode Batch Mode

The main entry point for MatrixScan Batch is the `BarcodeBatch` mode, configured through `BarcodeBatchSettings`. For this tutorial, we enable a generous set of symbologies — in your own app, only enable the ones you require, since every extra symbology impacts processing time.

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatch
import com.kmp.datacapture.barcode.batch.BarcodeBatchSettings
import com.kmp.datacapture.barcode.data.Symbology

val settings = BarcodeBatchSettings.barcodeBatchSettings().also {
    it.enableSymbologies(
        setOf(
            Symbology.EAN13_UPCA,
            Symbology.EAN8,
            Symbology.UPCE,
            Symbology.CODE39,
            Symbology.CODE128,
        ),
    )
}

val barcodeBatch = BarcodeBatch.forContext(dataCaptureContext, settings)
```

`BarcodeBatch.forContext(...)` attaches the mode to `dataCaptureContext` for you — there is no separate step to add it.

## Use the Built-in Camera

When using the built-in camera, use the settings recommended for MatrixScan Batch:

```kotlin
import com.kmp.datacapture.core.source.Camera

val cameraSettings = BarcodeBatch.createRecommendedCameraSettings()
val camera = Camera.getDefaultCamera(cameraSettings)

dataCaptureContext.setFrameSource(camera)
```

:::important
On iOS, the user must explicitly grant permission for each app to access the camera. Add the `NSCameraUsageDescription` key to your app's `Info.plist`.

On Android, declare the `android.permission.CAMERA` permission in `AndroidManifest.xml` and request it at runtime.
:::

## Host a Data Capture View and Visualize the Tracked Barcodes

MatrixScan Batch has no prebuilt Compose composable — host a `DataCaptureView` from the `core` module directly and add a `BarcodeBatchBasicOverlay` to it, which highlights every tracked barcode with a default dot or frame.

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the lifecycle events, keeping camera-on as the last step of mounting and camera-off as the first step of teardown:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.batch.BarcodeBatchBasicOverlay
import com.kmp.datacapture.core.source.FrameSourceState
import com.kmp.datacapture.core.ui.DataCaptureView
import com.kmp.datacapture.core.ui.toAndroidView

val dataCaptureView = DataCaptureView(context, dataCaptureContext)
val overlay = BarcodeBatchBasicOverlay.withBarcodeBatchForView(barcodeBatch, dataCaptureView)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> {
                barcodeBatch.isEnabled = true
                camera?.switchToDesiredState(FrameSourceState.ON)
            }
            Lifecycle.Event.ON_PAUSE -> {
                camera?.switchToDesiredState(FrameSourceState.OFF)
                barcodeBatch.isEnabled = false
            }
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    barcodeBatch.isEnabled = true
    camera?.switchToDesiredState(FrameSourceState.ON)
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
        camera?.switchToDesiredState(FrameSourceState.OFF)
        barcodeBatch.isEnabled = false
    }
}

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

struct ScanningHost: View {
    let dataCaptureView: DataCaptureView
    let barcodeBatch: BarcodeBatch
    let camera: Camera?

    var body: some View {
        DataCaptureViewRepresentable(dataCaptureView: dataCaptureView)
            .onAppear {
                barcodeBatch.isEnabled = true
                camera?.switchToDesiredState(state: .on)
            }
            .onDisappear {
                camera?.switchToDesiredState(state: .off)
                barcodeBatch.isEnabled = false
            }
    }
}
```

### Customize the Highlights

Implement `BarcodeBatchBasicOverlayListener` to customize the brush used for a tracked barcode, or to react to taps on a highlight:

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatchBasicOverlay
import com.kmp.datacapture.barcode.batch.BarcodeBatchBasicOverlayListener
import com.kmp.datacapture.barcode.batch.TrackedBarcode
import com.kmp.datacapture.core.ui.style.Brush

class MyOverlayListener : BarcodeBatchBasicOverlayListener {
    override fun brushForTrackedBarcode(
        overlay: BarcodeBatchBasicOverlay,
        trackedBarcode: TrackedBarcode,
    ): Brush? {
        // Return a custom Brush based on the tracked barcode, or null for the overlay's default.
        return null
    }

    override fun onTrackedBarcodeTapped(
        overlay: BarcodeBatchBasicOverlay,
        trackedBarcode: TrackedBarcode,
    ) {
        // A tracked barcode was tapped.
    }
}

overlay.setListener(MyOverlayListener())
```

## Track the Results

Implement `BarcodeBatchListener` to be notified whenever a frame has been processed. The `BarcodeBatchSession` parameter contains the barcodes that were added, updated, or removed in the current frame:

```kotlin
import com.kmp.datacapture.barcode.batch.BarcodeBatch
import com.kmp.datacapture.barcode.batch.BarcodeBatchListener
import com.kmp.datacapture.barcode.batch.BarcodeBatchSession
import com.kmp.datacapture.core.data.FrameData
import com.kmp.datacapture.core.feedback.Feedback

class MyBatchListener : BarcodeBatchListener {
    private val feedback = Feedback.defaultFeedback()

    override fun onSessionUpdated(
        barcodeBatch: BarcodeBatch,
        session: BarcodeBatchSession,
        frameData: FrameData,
    ) {
        if (session.addedTrackedBarcodes.isNotEmpty()) {
            // MatrixScan Batch doesn't emit feedback for you; emit it yourself when desired.
            feedback.emit()
        }
    }
}

barcodeBatch.addListener(MyBatchListener())
```

## Disable Barcode Batch

To stop tracking, set `BarcodeBatch.isEnabled` to `false`. The effect is immediate: no more frames are processed after the change, though a frame already being processed still completes and delivers its results to registered listeners.

```kotlin
barcodeBatch.isEnabled = false
```

Disabling the mode does not stop the camera — turn it off separately with `camera.switchToDesiredState(FrameSourceState.OFF)` if you no longer need the preview.
