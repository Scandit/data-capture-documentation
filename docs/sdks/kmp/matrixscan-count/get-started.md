---
description: "Step-by-step instructions to add MatrixScan Count to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that help you add MatrixScan Count to your application:

- Initialize the Data Capture Context
- Configure the Barcode Count Mode
- Host the Barcode Count view and bind it to your app's lifecycle
- Register the listener to be informed when a scanning phase finishes
- Reset the mode to start a new counting session

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

## Configure the Barcode Count Mode

The Barcode Count mode is configured through `BarcodeCountSettings`, which lets you enable the symbologies you need and tune how counting behaves. For this tutorial, we enable a generous set of symbologies — in your own app, only enable the ones you require, since every extra symbology impacts processing time.

```kotlin
import com.kmp.datacapture.barcode.count.BarcodeCount
import com.kmp.datacapture.barcode.count.BarcodeCountSettings
import com.kmp.datacapture.barcode.data.Symbology

val settings = BarcodeCountSettings.barcodeCountSettings().also {
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

val barcodeCount = BarcodeCount.forContext(dataCaptureContext, settings)
```

If you are sure that your environment will only have unique barcodes (i.e. no duplicated values), you can also set `BarcodeCountSettings.expectsOnlyUniqueBarcodes = true`. This improves scanning performance as long as no duplicates are present.

## Host the View

MatrixScan Count's built-in AR user interface includes the camera preview and scanning UI elements that guide the user through the counting process. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `barcode-compose` module provides a declarative `BarcodeCountView` composable that owns the `BarcodeCount` mode, manages the resume/pause lifecycle automatically, and delivers session updates through `onScan`:

```kotlin
import com.kmp.datacapture.barcode.compose.BarcodeCountView

@Composable
fun CountingScreen() {
    BarcodeCountView(
        settings = settings,
        onScan = { recognizedBarcodes ->
            // Do something with the recognized barcodes
        },
        onExitTap = {
            // The order is completed
        },
        onListTap = {
            // Show the current progress but the order is not completed
        },
    )
}
```

### Imperative View API

If you need full control over the view and its lifecycle — or you are not using the `-compose` companion modules — construct a `BarcodeCountView` from the base `barcode` module directly and drive the resume/pause lifecycle yourself.

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the lifecycle events:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.count.BarcodeCountView
import com.kmp.datacapture.barcode.count.BarcodeCountViewStyle
import com.kmp.datacapture.barcode.ui.toAndroidView

val barcodeCountView = BarcodeCountView(
    context,
    barcodeCount,
    BarcodeCountViewStyle.ICON,
)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> barcodeCountView.onResume()
            Lifecycle.Event.ON_PAUSE -> barcodeCountView.onPause()
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    barcodeCountView.onResume()
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
        barcodeCountView.onPause()
    }
}

AndroidView(factory = { barcodeCountView.toAndroidView() })
```

On iOS, wrap the same shared `barcodeCountView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and resume/pause it from `onAppear`/`onDisappear`:

```swift
struct BarcodeCountViewRepresentable: UIViewRepresentable {
    let barcodeCountView: BarcodeCountView

    func makeUIView(context: Context) -> UIView {
        barcodeCountView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct CountingHost: View {
    let barcodeCountView: BarcodeCountView

    var body: some View {
        BarcodeCountViewRepresentable(barcodeCountView: barcodeCountView)
            .onAppear { barcodeCountView.onResume() }
            .onDisappear { barcodeCountView.onPause() }
    }
}
```

## Register the Listener

To keep track of the barcodes that have been scanned outside of Compose (for example, from shared `commonMain` code), implement the `BarcodeCountListener` interface and register it on the `BarcodeCount` mode. `onScan` is called when a scan phase has finished and results can be retrieved from the `BarcodeCountSession`:

```kotlin
import com.kmp.datacapture.barcode.count.BarcodeCount
import com.kmp.datacapture.barcode.count.BarcodeCountListener
import com.kmp.datacapture.barcode.count.BarcodeCountSession
import com.kmp.datacapture.core.data.FrameData

class MyCountListener : BarcodeCountListener {
    override fun onScan(barcodeCount: BarcodeCount, session: BarcodeCountSession, frameData: FrameData) {
        val allRecognizedBarcodes = session.recognizedBarcodes
        // Do something with the recognized barcodes, e.g. store them to present a list
    }
}

barcodeCount.addListener(MyCountListener())
```

:::note
If you are using the Compose `BarcodeCountView`'s `onScan` callback instead, you don't need a separate `BarcodeCountListener` — both are notified from the same underlying scan event.
:::

## Reset the Mode

When a counting process is over, reset the mode to make it ready for the next one. This clears the recognized barcodes and all the AR overlays:

```kotlin
barcodeCount.reset()
```
