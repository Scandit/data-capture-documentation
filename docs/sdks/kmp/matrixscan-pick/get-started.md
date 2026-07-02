---
description: "Step-by-step instructions to add MatrixScan Pick to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that help you add MatrixScan Pick to your application. Implementing MatrixScan Pick involves two primary elements:

- `BarcodePick`: the data capture mode used for scan-and-pick functionality.
- `BarcodePickView`: the pre-built UI that highlights items to be picked.

The general steps are:

- Initialize the Data Capture Context
- Configure the Barcode Pick Mode
- Host the BarcodePickView and bind it to your app's lifecycle
- Register the listener to be informed when the built-in Finish button is tapped

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

## Configure the Barcode Pick Mode

The Barcode Pick mode is configured through `BarcodePickSettings`, which lets you enable the symbologies you need. For this tutorial we enable EAN13/UPC-A, but you should change this to the symbologies relevant to your use case.

```kotlin
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.barcode.pick.BarcodePickSettings

val settings = BarcodePickSettings.barcodePickSettings().also {
    it.enableSymbology(Symbology.EAN13_UPCA, true)
}
```

Next, define the products you want MatrixScan Pick to highlight — each one identified by the barcode data and a target quantity to pick:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickProduct

val productsToPick = setOf(
    BarcodePickProduct("9783598215438", 3),
    BarcodePickProduct("9783598215414", 3),
)
```

`BarcodePick` resolves scanned barcodes to products asynchronously through a `BarcodePickAsyncMapperProductProvider`. Implement `BarcodePickAsyncMapperProductProviderCallback.mapItems` to map the scanned barcode data to a product identifier — here the barcode data doubles as the product identifier, but in your app this is typically a backend/catalog lookup:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickAsyncMapperProductProvider
import com.kmp.datacapture.barcode.pick.BarcodePickAsyncMapperProductProviderCallback
import com.kmp.datacapture.barcode.pick.BarcodePickProductProviderCallback
import com.kmp.datacapture.barcode.pick.BarcodePickProductProviderCallbackItem

val productProviderCallback = object : BarcodePickAsyncMapperProductProviderCallback {
    override fun mapItems(itemsData: Set<String>, callback: BarcodePickProductProviderCallback) {
        // Called on a background thread. Resolve each scanned barcode to a product
        // identifier (or null if it isn't one of your products) and invoke onData.
        val mapped = itemsData.map { data -> BarcodePickProductProviderCallbackItem(data, data) }.toSet()
        callback.onData(mapped)
    }
}

val productProvider = BarcodePickAsyncMapperProductProvider(productsToPick, productProviderCallback)
```

## Host the BarcodePickView

MatrixScan Pick's built-in user interface includes the camera preview, augmented-reality highlights, and buttons that guide the user through the scan-and-pick process. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `barcode-compose` module provides a declarative `BarcodePickView` composable that manages the picking lifecycle automatically — it builds the `BarcodePick` mode from `settings` and `productProvider`, starts picking when it enters the composition, and stops when it leaves, via `DisposableEffect`.

```kotlin
import com.kmp.datacapture.barcode.compose.BarcodePickView

@Composable
fun PickingScreen() {
    BarcodePickView(
        settings = settings,
        productProvider = productProvider,
        onFinishTap = {
            // Called when the user taps the built-in Finish button.
        },
    )
}
```

### Imperative View API

If you need full control over the view and its lifecycle — or you are not using the `-compose` companion modules — construct the `BarcodePick` mode and a `BarcodePickView` from the base `barcode` module directly, and drive the start/pause/stop lifecycle yourself.

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePick
import com.kmp.datacapture.barcode.pick.BarcodePickViewSettings

val barcodePick = BarcodePick.forContext(dataCaptureContext, settings, productProvider)

val barcodePickViewSettings = BarcodePickViewSettings.barcodePickViewSettings()
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`, as in a typical Compose Multiplatform app) and forward the lifecycle events. `stop()` is a terminal teardown — call it only when the view is removed from the screen for good; use `pause()`/`start()` for backgrounding/foregrounding.

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.pick.BarcodePickView
import com.kmp.datacapture.barcode.ui.toAndroidView

val barcodePickView = BarcodePickView(
    context,
    barcodePick,
    barcodePickViewSettings,
)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> barcodePickView.start()
            Lifecycle.Event.ON_PAUSE -> barcodePickView.pause()
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    barcodePickView.start()
    onDispose {
        barcodePickView.stop()
        lifecycleOwner.lifecycle.removeObserver(observer)
    }
}

AndroidView(factory = { barcodePickView.toAndroidView() })
```

On iOS, wrap the same shared `barcodePickView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and start/stop it from `onAppear`/`onDisappear`:

```swift
struct BarcodePickViewRepresentable: UIViewRepresentable {
    let barcodePickView: BarcodePickView

    func makeUIView(context: Context) -> UIView {
        barcodePickView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct PickingHost: View {
    let barcodePickView: BarcodePickView

    var body: some View {
        BarcodePickViewRepresentable(barcodePickView: barcodePickView)
            .onAppear { barcodePickView.start() }
            .onDisappear { barcodePickView.stop() }
    }
}
```

## Register the Listener

The `BarcodePickView` displays a Finish button. To be notified when the user taps it (for example, to navigate back once the session is done), implement `BarcodePickViewUiListener` and assign it to `uiListener`:

```kotlin
import com.kmp.datacapture.barcode.pick.BarcodePickViewUiListener

barcodePickView.uiListener = object : BarcodePickViewUiListener {
    override fun onFinishButtonTapped(view: BarcodePickView) {
        // Called when the user taps the Finish button.
    }
}
```

:::note
If you are using the Compose `BarcodePickView`'s `onFinishTap` callback instead, you don't need to set `uiListener` separately — the composable wires it up for you.
:::

## Start Searching

With everything configured, the view starts the scan-and-pick session as soon as it's mounted — this is the last step of `start()` in the imperative flow above, or automatic in the Compose flow. This is the equivalent of pressing the Play button: it turns on the camera and begins highlighting items to pick.
