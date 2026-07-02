---
description: "Step-by-step instructions to add MatrixScan AR to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that help you add MatrixScan AR to your application:

- Initialize the Data Capture Context
- Configure the Barcode AR Mode
- Host the Barcode AR view and bind it to your app's lifecycle
- Customize highlights and annotations
- Register the listener to be informed when barcode highlights are tapped
- Configure feedback

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

## Configure the Barcode AR Mode

The main entry point for MatrixScan AR is the `BarcodeAr` mode, configured through `BarcodeArSettings`. For this tutorial, we track EAN-13 codes — change this to the symbologies your use case requires.

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeAr
import com.kmp.datacapture.barcode.ar.BarcodeArSettings
import com.kmp.datacapture.barcode.data.Symbology

val settings = BarcodeArSettings.barcodeArSettings().also {
    it.enableSymbology(Symbology.EAN13_UPCA, true)
}

val barcodeAr = BarcodeAr.forContext(dataCaptureContext, settings)
```

`BarcodeAr.forContext(...)` attaches the mode to `dataCaptureContext` for you.

## Host the Barcode AR View

The `BarcodeArView` built-in user interface includes the camera preview, highlights, annotations, and controls (torch, zoom, camera switch) that guide the user through the scan-and-check process. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `barcode-compose` module provides a declarative `BarcodeArView` composable. Combine it with `core-compose`'s `rememberCamera` to wire up the camera; both manage their piece of the lifecycle automatically — camera-on and AR-scanning-start happen as composition mounts, camera-off and AR-scanning-stop happen when it leaves. See [Customize Highlights and Annotations](#customize-highlights-and-annotations) below for how to pass `annotationProvider`/`highlightProvider` to this same composable.

```kotlin
import androidx.compose.runtime.Composable
import com.kmp.datacapture.barcode.ar.BarcodeArSettings
import com.kmp.datacapture.barcode.compose.BarcodeArView
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.core.compose.rememberCamera
import com.kmp.datacapture.core.compose.rememberDataCaptureContext

@Composable
fun ScanAndCheckScreen(licenseKey: String) {
    val context = rememberDataCaptureContext(licenseKey)
    rememberCamera(context)

    val settings = BarcodeArSettings.barcodeArSettings().also {
        it.enableSymbology(Symbology.EAN13_UPCA, true)
    }

    BarcodeArView(settings = settings)
}
```

### Imperative View API

If you need full control over the view and its lifecycle — or you are not using the `-compose` companion modules — construct a `BarcodeArView` from the base `barcode` module directly. In this case you also create and drive the camera yourself, and control the resume/pause/stop lifecycle:

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArViewSettings

val barcodeArViewSettings = BarcodeArViewSettings.barcodeArViewSettings()
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the lifecycle events, keeping camera-on as the last step of mounting and camera-off as the first step of teardown:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.ar.BarcodeAr
import com.kmp.datacapture.barcode.ar.BarcodeArView
import com.kmp.datacapture.barcode.ui.toAndroidView
import com.kmp.datacapture.core.source.Camera
import com.kmp.datacapture.core.source.FrameSourceState

val cameraSettings = BarcodeAr.recommendedCameraSettings()
val camera = Camera.getDefaultCamera(cameraSettings)
dataCaptureContext.setFrameSource(camera)

val barcodeArView = BarcodeArView(context, barcodeAr, barcodeArViewSettings)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> {
                barcodeArView.start()
                camera?.switchToDesiredState(FrameSourceState.ON)
            }
            Lifecycle.Event.ON_PAUSE -> {
                camera?.switchToDesiredState(FrameSourceState.OFF)
                barcodeArView.pause()
            }
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    barcodeArView.start()
    camera?.switchToDesiredState(FrameSourceState.ON)
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
        camera?.switchToDesiredState(FrameSourceState.OFF)
        barcodeArView.stop()
    }
}

AndroidView(factory = { barcodeArView.toAndroidView() })
```

On iOS, wrap the same shared `barcodeArView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and drive the camera and view lifecycle from `onAppear`/`onDisappear`:

```swift
struct BarcodeArViewRepresentable: UIViewRepresentable {
    let barcodeArView: BarcodeArView

    func makeUIView(context: Context) -> UIView {
        barcodeArView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct ScanAndCheckHost: View {
    let barcodeArView: BarcodeArView
    let camera: Camera?

    var body: some View {
        BarcodeArViewRepresentable(barcodeArView: barcodeArView)
            .onAppear {
                barcodeArView.start()
                camera?.switchToDesiredState(state: .on)
            }
            .onDisappear {
                camera?.switchToDesiredState(state: .off)
                barcodeArView.pause()
            }
    }
}
```

## Customize Highlights and Annotations

`BarcodeArView` asks a `BarcodeArHighlightProvider` and a `BarcodeArAnnotationProvider` for the highlight and annotation to show for each barcode. If you don't provide one, a default highlight is used and no annotation is shown.

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArCircleHighlight
import com.kmp.datacapture.barcode.ar.BarcodeArCircleHighlightPreset
import com.kmp.datacapture.barcode.ar.BarcodeArHighlight
import com.kmp.datacapture.barcode.ar.BarcodeArHighlightProvider
import com.kmp.datacapture.barcode.data.Barcode

val myHighlightProvider = object : BarcodeArHighlightProvider {
    override fun highlightForBarcode(barcode: Barcode, callback: (BarcodeArHighlight?) -> Unit) {
        callback(BarcodeArCircleHighlight(barcode, BarcodeArCircleHighlightPreset.ICON))
    }
}
```

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArAnnotation
import com.kmp.datacapture.barcode.ar.BarcodeArAnnotationProvider
import com.kmp.datacapture.barcode.ar.BarcodeArInfoAnnotation
import com.kmp.datacapture.barcode.ar.BarcodeArInfoAnnotationHeader

val myAnnotationProvider = object : BarcodeArAnnotationProvider {
    override fun annotationForBarcode(barcode: Barcode, callback: (BarcodeArAnnotation?) -> Unit) {
        val annotation = BarcodeArInfoAnnotation(barcode).also {
            it.header = BarcodeArInfoAnnotationHeader().also { header ->
                header.text = barcode.data
            }
        }
        callback(annotation)
    }
}
```

When hosting the imperative view, assign the providers directly:

```kotlin
barcodeArView.highlightProvider = myHighlightProvider
barcodeArView.annotationProvider = myAnnotationProvider
```

When hosting the Compose composable, pass them as parameters instead — remember them so they aren't recreated (and re-subscribed) on every recomposition:

```kotlin
import androidx.compose.runtime.remember

@Composable
fun ScanAndCheckScreen(licenseKey: String) {
    val context = rememberDataCaptureContext(licenseKey)
    rememberCamera(context)

    val settings = remember {
        BarcodeArSettings.barcodeArSettings().also {
            it.enableSymbology(Symbology.EAN13_UPCA, true)
        }
    }
    val highlightProvider = remember { myHighlightProvider }
    val annotationProvider = remember { myAnnotationProvider }

    BarcodeArView(
        settings = settings,
        highlightProvider = highlightProvider,
        annotationProvider = annotationProvider,
    )
}
```

## Register the Listener

Register a `BarcodeArViewUiListener` to be notified when the user taps a barcode's highlight:

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArHighlight
import com.kmp.datacapture.barcode.ar.BarcodeArViewUiListener

class MyArViewUiListener : BarcodeArViewUiListener {
    override fun onHighlightForBarcodeTapped(
        barcodeAr: BarcodeAr,
        barcode: Barcode,
        highlight: BarcodeArHighlight,
    ) {
        // The user tapped this barcode's highlight.
    }
}

barcodeArView.uiListener = MyArViewUiListener()
```

To keep track of the barcodes tracked across frames from shared `commonMain` code, implement `BarcodeArListener` and register it on the mode:

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArListener
import com.kmp.datacapture.barcode.ar.BarcodeArSession
import com.kmp.datacapture.core.data.FrameData

class MyArListener : BarcodeArListener {
    override fun onSessionUpdated(barcodeAr: BarcodeAr, session: BarcodeArSession, frameData: FrameData) {
        // session.addedTrackedBarcodes / session.trackedBarcodes reflect the current frame.
    }
}

barcodeAr.addListener(MyArListener())
```

## Configure Feedback

`BarcodeAr.feedback` controls the sound and vibration emitted when a barcode is scanned or its highlight is tapped. It defaults to a scan click plus a short vibration on scan, and silence on tap:

```kotlin
import com.kmp.datacapture.barcode.ar.BarcodeArFeedback

barcodeAr.feedback = BarcodeArFeedback.defaultFeedback()
```

Assign your own `BarcodeArFeedback` instance to customize the `scanned` and/or `tapped` sound/vibration.
