---
description: "Step-by-step instructions to add Barcode Capture to your Kotlin Multiplatform application."

sidebar_position: 2
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that helps you to add Barcode Capture to your application:

- Initialize the Data Capture Context
- Configure the Barcode Capture Mode
- Obtain a camera and set it as the frame source
- Host the Data Capture View and bind it to your app's lifecycle
- Register the listener to be informed when new barcodes are scanned

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

## Configure the Barcode Capture Mode

Barcode scanning is orchestrated by the `BarcodeCapture` mode, configured through `BarcodeCaptureSettings`. For this tutorial, we enable a generous set of symbologies — in your own app, only enable the ones you require, since every extra symbology impacts processing time. See [Configure Barcode Symbologies](configure-barcode-symbologies.md) for the full set of configuration options.

```kotlin
import com.kmp.datacapture.barcode.capture.BarcodeCapture
import com.kmp.datacapture.barcode.capture.BarcodeCaptureSettings
import com.kmp.datacapture.barcode.data.Symbology

val settings = BarcodeCaptureSettings.barcodeCaptureSettings().also {
    it.enableSymbologies(
        setOf(
            Symbology.EAN13_UPCA,
            Symbology.EAN8,
            Symbology.UPCE,
            Symbology.CODE39,
            Symbology.CODE128,
            Symbology.QR,
            Symbology.DATA_MATRIX,
        ),
    )
}

val barcodeCapture = BarcodeCapture.forContext(dataCaptureContext, settings)
```

If you don't disable Barcode Capture immediately after scanning the first code, consider setting `BarcodeCaptureSettings.codeDuplicateFilter` (in milliseconds) so the same code isn't reported repeatedly.

Barcode Capture needs a frame source to process — most applications use the device's built-in camera. `BarcodeCapture.createRecommendedCameraSettings()` returns camera settings tuned for the mode (preferred resolution, focus range, autofocus mode), which cut scan latency compared to the framework defaults, especially on iOS. The camera setup differs slightly depending on whether you host the view via Compose or imperatively — see below.

:::important
On iOS, add the `NSCameraUsageDescription` key to your app's `Info.plist`. On Android, declare and request the `android.permission.CAMERA` permission at runtime.
:::

## Host the Data Capture View

To display the camera preview together with the scanning UI, host a `DataCaptureView` bound to the `dataCaptureContext`. There are two ways to do it: the declarative Compose Multiplatform `core-compose` helpers (recommended), or the imperative platform view.

### Compose (recommended)

The `core-compose` module's `DataCaptureView` composable and `rememberCamera` helper manage the camera and view lifecycle declaratively — `rememberCamera` sets the frame source and turns the camera on as the final step of entering composition, and off as the first step on leaving it. Attach the `BarcodeCaptureOverlay` through the composable's `overlays` parameter so scanned codes get visual feedback.

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.kmp.datacapture.barcode.capture.BarcodeCapture
import com.kmp.datacapture.barcode.capture.BarcodeCaptureListener
import com.kmp.datacapture.barcode.capture.BarcodeCaptureOverlay
import com.kmp.datacapture.barcode.capture.BarcodeCaptureSession
import com.kmp.datacapture.core.compose.DataCaptureView
import com.kmp.datacapture.core.compose.rememberCamera
import com.kmp.datacapture.core.data.FrameData

@Composable
fun ScanningScreen() {
    // dataCaptureContext and settings are the shared instances created above.
    rememberCamera(dataCaptureContext)

    val barcodeCapture = remember(dataCaptureContext) { BarcodeCapture.forContext(dataCaptureContext, settings) }
    val overlay = remember(barcodeCapture) { BarcodeCaptureOverlay.withBarcodeCapture(barcodeCapture) }

    DisposableEffect(barcodeCapture) {
        val listener = object : BarcodeCaptureListener {
            override fun onBarcodeScanned(
                barcodeCapture: BarcodeCapture,
                session: BarcodeCaptureSession,
                data: FrameData,
            ) {
                val barcode = session.newlyRecognizedBarcode ?: return
                // Do something with the recognized barcode
            }

            override fun onSessionUpdated(
                barcodeCapture: BarcodeCapture,
                session: BarcodeCaptureSession,
                data: FrameData,
            ) = Unit
        }
        barcodeCapture.addListener(listener)
        barcodeCapture.isEnabled = true
        onDispose {
            barcodeCapture.isEnabled = false
            barcodeCapture.removeListener(listener)
        }
    }

    DataCaptureView(
        context = dataCaptureContext,
        modifier = Modifier.fillMaxSize(),
        overlays = listOf(overlay),
    )
}
```

:::note
`rememberCamera(dataCaptureContext)` uses the default world-facing camera without custom `CameraSettings`. If you need `BarcodeCapture.createRecommendedCameraSettings()`, wire the camera imperatively as in the next section.
:::

### Imperative View API

If you need full control over the view and camera lifecycle — or you are not using the `-compose` companion modules — construct the base-module `DataCaptureView` directly and drive the camera/mode lifecycle from shared `commonMain` code, so both Android and iOS hosts call the same two functions instead of duplicating `switchToDesiredState`/`isEnabled` calls per platform. The camera is switched on as the *last* step of `start()`, and switched off as the *first* step of `stop()`:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext
import com.kmp.datacapture.core.source.Camera
import com.kmp.datacapture.core.source.FrameSourceState

class BarcodeScannerController(
    private val dataCaptureContext: DataCaptureContext,
    private val barcodeCapture: BarcodeCapture,
    private val camera: Camera?,
) {
    fun start() {
        barcodeCapture.isEnabled = true
        camera?.switchToDesiredState(FrameSourceState.ON)
    }

    fun stop() {
        camera?.switchToDesiredState(FrameSourceState.OFF)
        barcodeCapture.isEnabled = false
    }
}

val camera = Camera.getDefaultCamera(BarcodeCapture.createRecommendedCameraSettings())
camera?.let { dataCaptureContext.setFrameSource(it) }

val controller = BarcodeScannerController(dataCaptureContext, barcodeCapture, camera)
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the activity lifecycle to the controller:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.core.ui.DataCaptureView
import com.kmp.datacapture.core.ui.toAndroidView

val dataCaptureView = DataCaptureView(context, dataCaptureContext)
val overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, dataCaptureView)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> controller.start()
            Lifecycle.Event.ON_PAUSE -> controller.stop()
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    controller.start()
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
        controller.stop()
    }
}

AndroidView(factory = { dataCaptureView.toAndroidView() })
```

On iOS, wrap the same shared `dataCaptureView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and call the shared `controller` from `onAppear`/`onDisappear` — the SDK objects and their lifecycle stay in Kotlin, Swift only drives `start()`/`stop()`:

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
    let controller: BarcodeScannerController

    var body: some View {
        DataCaptureViewRepresentable(dataCaptureView: dataCaptureView)
            .onAppear { controller.start() }
            .onDisappear { controller.stop() }
    }
}
```

## Register the Listener

To keep track of the barcodes that have been scanned outside of Compose (for example, from shared `commonMain` code), implement the `BarcodeCaptureListener` interface and register it on the `BarcodeCapture` mode:

```kotlin
import com.kmp.datacapture.barcode.capture.BarcodeCapture
import com.kmp.datacapture.barcode.capture.BarcodeCaptureListener
import com.kmp.datacapture.barcode.capture.BarcodeCaptureSession
import com.kmp.datacapture.core.data.FrameData

class MyBarcodeCaptureListener : BarcodeCaptureListener {
    override fun onBarcodeScanned(
        barcodeCapture: BarcodeCapture,
        session: BarcodeCaptureSession,
        data: FrameData,
    ) {
        val barcode = session.newlyRecognizedBarcode ?: return
        // Do something with the recognized barcode
    }

    override fun onSessionUpdated(
        barcodeCapture: BarcodeCapture,
        session: BarcodeCaptureSession,
        data: FrameData,
    ) = Unit
}

barcodeCapture.addListener(MyBarcodeCaptureListener())
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set `BarcodeCapture.isEnabled` to `false`:

```kotlin
barcodeCapture.isEnabled = false
```

The effect is immediate: no more frames are processed after the change. A frame that is already being processed still completes and delivers its results to registered listeners. Disabling the mode does not stop the camera — the camera keeps streaming frames until it is turned off with `switchToDesiredState(FrameSourceState.OFF)`.

## Scan Some Barcodes

Now that you're up and running, go find some barcodes to scan. Don't feel like getting up from your desk? Here's a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can print out.
