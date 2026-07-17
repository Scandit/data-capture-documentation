---
description: "Step-by-step instructions to add SparkScan to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that helps you to add SparkScan to your application:

- Initialize the Data Capture Context
- Configure the SparkScan Mode
- Host the SparkScan view and bind it to your app's lifecycle
- Register the listener to be informed when new barcodes are scanned and update your data whenever this event occurs

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

## Configure the SparkScan Mode

The SparkScan Mode is configured through `SparkScanSettings`, which lets you enable the symbologies you need. For this tutorial, we enable a generous set of symbologies — in your own app, only enable the ones you require, since every extra symbology impacts processing time.

```kotlin
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.barcode.spark.SparkScan
import com.kmp.datacapture.barcode.spark.SparkScanSettings

val settings = SparkScanSettings.sparkScanSettings().also {
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

val sparkScan = SparkScan(settings)
```

## Host the SparkScan View

The SparkScan built-in user interface includes the camera preview and scanning UI elements that guide the user through the scanning process. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `barcode-compose` module provides a declarative `SparkScanView` composable that manages the scanning lifecycle automatically — it starts scanning when it enters the composition and stops when it leaves, via `DisposableEffect`.

```kotlin
import com.kmp.datacapture.barcode.compose.SparkScanView

@Composable
fun ScanningScreen() {
    SparkScanView(
        settings = settings,
        onScan = { barcodes ->
            // SparkScan delivers a single barcode per scan, wrapped in a one-element list.
            val barcode = barcodes.first()
            // Do something with the recognized barcode
        },
    )
}
```

### Imperative View API

If you need full control over the view and its lifecycle — or you are not using the `-compose` companion modules — construct a `SparkScanView` from the base `barcode` module directly and host it with the platform view APIs. In this case you create the view settings and drive the resume/pause lifecycle yourself:

```kotlin
import com.kmp.datacapture.barcode.spark.SparkScanViewSettings

val sparkScanViewSettings = SparkScanViewSettings.sparkScanViewSettings()
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`, as in a typical Compose Multiplatform app) and forward the lifecycle events:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.spark.SparkScanView
import com.kmp.datacapture.barcode.ui.toAndroidView

val sparkScanView = SparkScanView(
    context,
    dataCaptureContext,
    sparkScan,
    sparkScanViewSettings,
)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> sparkScanView.onResume()
            Lifecycle.Event.ON_PAUSE -> sparkScanView.onPause()
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    sparkScanView.onResume()
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
        sparkScanView.onPause()
    }
}

AndroidView(factory = { sparkScanView.toAndroidView() })
```

On iOS, wrap the same shared `sparkScanView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and resume/pause it from `onAppear`/`onDisappear`:

```swift
struct SparkScanViewRepresentable: UIViewRepresentable {
    let sparkScanView: SparkScanView

    func makeUIView(context: Context) -> UIView {
        sparkScanView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct ScanningHost: View {
    let sparkScanView: SparkScanView

    var body: some View {
        SparkScanViewRepresentable(sparkScanView: sparkScanView)
            .onAppear { sparkScanView.onResume() }
            .onDisappear { sparkScanView.onPause() }
    }
}
```

## Register the Listener

To keep track of the barcodes that have been scanned outside of Compose (for example, from shared `commonMain` code), implement the `SparkScanListener` interface and register it on the `SparkScan` mode:

```kotlin
import com.kmp.datacapture.barcode.spark.SparkScanListener
import com.kmp.datacapture.barcode.spark.SparkScanSession
import com.kmp.datacapture.core.data.FrameData

class MyScanListener : SparkScanListener {
    override fun onBarcodeScanned(
        sparkScan: SparkScan,
        session: SparkScanSession,
        frameData: FrameData,
    ) {
        val barcode = session.newlyRecognizedBarcode ?: return
        // Do something with the recognized barcode
    }

    override fun onSessionUpdated(
        sparkScan: SparkScan,
        session: SparkScanSession,
        frameData: FrameData,
    ) = Unit
}

sparkScan.addListener(MyScanListener())
```

:::note
If you are using the Compose `SparkScanView`'s `onScan` callback instead, you don't need a separate `SparkScanListener` — both are notified from the same underlying scan event.
:::

## Scan Some Barcodes

Now that you're up and running, go find some barcodes to scan. Don't feel like getting up from your desk? Here's a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can print out.
