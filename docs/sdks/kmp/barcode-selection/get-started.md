---
description: "Step-by-step instructions to add Barcode Selection to your Kotlin Multiplatform application."

sidebar_position: 2
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Get Started

:::warning
We recommend using **SparkScan** or the **Barcode Capture API** instead of Barcode Selection. With the new [AI-powered features](../ai-powered-barcode-scanning.md), barcode selection in crowded environments is done without the need of a dedicated API. This API will be deprecated.
:::

This page describes the step-by-step instructions that helps you to add Barcode Selection to your application:

- Initialize the Data Capture Context
- Configure the Barcode Selection Mode
- Obtain a camera and set it as the frame source
- Host the Data Capture View and bind it to your app's lifecycle
- Register the listener to be informed when barcodes are selected

## Prerequisites

- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.mdx) for information on how to add the Scandit Data Capture SDK to your project.

## Initialize the Data Capture Context

The first step to add capture capabilities to your application is to initialize the `DataCaptureContext` with a valid Scandit Data Capture SDK license key. This is typically done once, in shared (`commonMain`) code, so both Android and iOS reuse the same instance:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext

val dataCaptureContext = DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode Selection Mode

Barcode Selection is orchestrated by the `BarcodeSelection` mode, configured through `BarcodeSelectionSettings`. As with Barcode Capture, only enable the symbologies your application needs:

```kotlin
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.barcode.selection.BarcodeSelectionSettings

val settings = BarcodeSelectionSettings.barcodeSelectionSettings().also {
    it.enableSymbologies(
        setOf(
            Symbology.EAN13_UPCA,
            Symbology.EAN8,
            Symbology.UPCE,
            Symbology.CODE39,
            Symbology.CODE128,
            Symbology.QR,
        ),
    )
}
```

### Selection Types

`BarcodeSelectionSettings.selectionType` defines the method `BarcodeSelection` uses to select codes.

If you want the user to select barcodes with a tap, use `BarcodeSelectionTapSelection`. It can automatically freeze the camera preview to make the selection easier — configure the freezing behavior with `freezeBehavior`, and whether a second tap on a barcode unselects it or selects it again with `tapBehavior`:

```kotlin
import com.kmp.datacapture.barcode.selection.BarcodeSelectionFreezeBehavior
import com.kmp.datacapture.barcode.selection.BarcodeSelectionTapBehavior
import com.kmp.datacapture.barcode.selection.BarcodeSelectionTapSelection

val tapSelection = BarcodeSelectionTapSelection.tapSelection().also {
    it.freezeBehavior = BarcodeSelectionFreezeBehavior.MANUAL_AND_AUTOMATIC
    it.tapBehavior = BarcodeSelectionTapBehavior.TOGGLE_SELECTION
}
settings.selectionType = tapSelection
```

If you want selection to happen automatically based on where the user points the camera, use `BarcodeSelectionAimerSelection`. Choose between two selection strategies: `BarcodeSelectionAutoSelectionStrategy` selects a barcode automatically once the aiming intention is understood, and `BarcodeSelectionManualSelectionStrategy` selects the aimed barcode when the user taps anywhere on the screen:

```kotlin
import com.kmp.datacapture.barcode.selection.BarcodeSelectionAimerBehavior
import com.kmp.datacapture.barcode.selection.BarcodeSelectionAimerSelection
import com.kmp.datacapture.barcode.selection.BarcodeSelectionManualSelectionStrategy

val aimerSelection = BarcodeSelectionAimerSelection.aimerSelection().also {
    it.aimerBehavior = BarcodeSelectionAimerBehavior.TOGGLE_SELECTION
    it.selectionStrategy = BarcodeSelectionManualSelectionStrategy()
}
settings.selectionType = aimerSelection
```

### Single Barcode Auto Detection

If you want to automatically select a barcode when it's the only one visible, turn on `BarcodeSelectionSettings.singleBarcodeAutoDetection`:

```kotlin
settings.singleBarcodeAutoDetection = true
```

### Create the Mode

Create the `BarcodeSelection` mode with the settings configured above:

```kotlin
import com.kmp.datacapture.barcode.selection.BarcodeSelection

val barcodeSelection = BarcodeSelection.forContext(dataCaptureContext, settings)
```

## Use the Built-in Camera

Barcode Selection needs a frame source to process — most applications use the device's built-in camera. `BarcodeSelection.createRecommendedCameraSettings()` returns camera settings tuned for the mode.

:::important
On iOS, add the `NSCameraUsageDescription` key to your app's `Info.plist`. On Android, declare and request the `android.permission.CAMERA` permission at runtime.
:::

## Host the Data Capture View

To display the camera preview together with the selection UI, host a `DataCaptureView` bound to the `dataCaptureContext`. There are two ways to do it: the declarative Compose Multiplatform `core-compose` helpers (recommended), or the imperative platform view.

### Compose (recommended)

The `core-compose` module's `DataCaptureView` composable and `rememberCamera` helper manage the camera and view lifecycle declaratively. Attach a `BarcodeSelectionBasicOverlay` through the composable's `overlays` parameter to visualize aimed/selected/tracked barcodes.

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.kmp.datacapture.barcode.selection.BarcodeSelection
import com.kmp.datacapture.barcode.selection.BarcodeSelectionBasicOverlay
import com.kmp.datacapture.barcode.selection.BarcodeSelectionListener
import com.kmp.datacapture.barcode.selection.BarcodeSelectionSession
import com.kmp.datacapture.core.compose.DataCaptureView
import com.kmp.datacapture.core.compose.rememberCamera
import com.kmp.datacapture.core.data.FrameData

@Composable
fun SelectionScreen() {
    // dataCaptureContext, settings and barcodeSelection are the shared instances created above.
    rememberCamera(dataCaptureContext)

    val overlay = remember(barcodeSelection) { BarcodeSelectionBasicOverlay.withBarcodeSelection(barcodeSelection) }

    DisposableEffect(barcodeSelection) {
        val listener = object : BarcodeSelectionListener {
            override fun onSelectionUpdated(
                barcodeSelection: BarcodeSelection,
                session: BarcodeSelectionSession,
                frameData: FrameData?,
            ) {
                val newlySelected = session.newlySelectedBarcodes
                // Do something with the newly selected barcodes
            }

            override fun onSessionUpdated(
                barcodeSelection: BarcodeSelection,
                session: BarcodeSelectionSession,
                frameData: FrameData?,
            ) = Unit
        }
        barcodeSelection.addListener(listener)
        barcodeSelection.isEnabled = true
        onDispose {
            barcodeSelection.isEnabled = false
            barcodeSelection.removeListener(listener)
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
`rememberCamera(dataCaptureContext)` uses the default world-facing camera without custom `CameraSettings`. If you need `BarcodeSelection.createRecommendedCameraSettings()`, wire the camera imperatively as in the next section.
:::

### Imperative View API

If you need full control over the view and camera lifecycle — or you are not using the `-compose` companion modules — construct the base-module `DataCaptureView` directly and drive the camera/mode lifecycle from shared `commonMain` code. The camera is switched on as the *last* step of `start()`, and switched off as the *first* step of `stop()`:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext
import com.kmp.datacapture.core.source.Camera
import com.kmp.datacapture.core.source.FrameSourceState

class BarcodeSelectionController(
    private val dataCaptureContext: DataCaptureContext,
    private val barcodeSelection: BarcodeSelection,
    private val camera: Camera?,
) {
    fun start() {
        barcodeSelection.isEnabled = true
        camera?.switchToDesiredState(FrameSourceState.ON)
    }

    fun stop() {
        camera?.switchToDesiredState(FrameSourceState.OFF)
        barcodeSelection.isEnabled = false
    }
}

val camera = Camera.getDefaultCamera(BarcodeSelection.createRecommendedCameraSettings())
camera?.let { dataCaptureContext.setFrameSource(it) }

val controller = BarcodeSelectionController(dataCaptureContext, barcodeSelection, camera)
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the activity lifecycle to the controller:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.core.ui.DataCaptureView
import com.kmp.datacapture.core.ui.toAndroidView

val dataCaptureView = DataCaptureView(context, dataCaptureContext)
val overlay = BarcodeSelectionBasicOverlay.withBarcodeSelectionForView(barcodeSelection, dataCaptureView)

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

On iOS, wrap the same shared `dataCaptureView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and call the shared `controller` from `onAppear`/`onDisappear`:

```swift
struct DataCaptureViewRepresentable: UIViewRepresentable {
    let dataCaptureView: DataCaptureView

    func makeUIView(context: Context) -> UIView {
        dataCaptureView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct SelectionHost: View {
    let dataCaptureView: DataCaptureView
    let controller: BarcodeSelectionController

    var body: some View {
        DataCaptureViewRepresentable(dataCaptureView: dataCaptureView)
            .onAppear { controller.start() }
            .onDisappear { controller.stop() }
    }
}
```

## Register the Listener

To keep track of the barcodes that have been selected outside of Compose (for example, from shared `commonMain` code), implement the `BarcodeSelectionListener` interface and register it on the `BarcodeSelection` mode:

```kotlin
import com.kmp.datacapture.barcode.selection.BarcodeSelection
import com.kmp.datacapture.barcode.selection.BarcodeSelectionListener
import com.kmp.datacapture.barcode.selection.BarcodeSelectionSession
import com.kmp.datacapture.core.data.FrameData

class MyBarcodeSelectionListener : BarcodeSelectionListener {
    override fun onSelectionUpdated(
        barcodeSelection: BarcodeSelection,
        session: BarcodeSelectionSession,
        frameData: FrameData?,
    ) {
        val newlySelected = session.newlySelectedBarcodes
        // Do something with the newly selected barcodes
    }

    override fun onSessionUpdated(
        barcodeSelection: BarcodeSelection,
        session: BarcodeSelectionSession,
        frameData: FrameData?,
    ) = Unit
}

barcodeSelection.addListener(MyBarcodeSelectionListener())
```

## Disabling Barcode Selection

To disable Barcode Selection, for instance when selection is complete, set `BarcodeSelection.isEnabled` to `false`:

```kotlin
barcodeSelection.isEnabled = false
```

The effect is immediate: no more frames are processed after the change. A frame that is already being processed still completes and delivers its results to registered listeners. Disabling the mode does not stop the camera — the camera keeps streaming frames until it is turned off with `switchToDesiredState(FrameSourceState.OFF)`.
