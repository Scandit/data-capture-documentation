---
description: "Step-by-step instructions to add MatrixScan Find to your Kotlin Multiplatform application."

sidebar_position: 2
framework: kmp
keywords:
  - kmp
---

# Get Started

This page describes the step-by-step instructions that help you add MatrixScan Find to your application. Implementing MatrixScan Find involves two primary elements:

- `BarcodeFind`: the data capture mode used for search and find functionality.
- `BarcodeFindView`: the pre-built UI used to highlight found items.

The general steps are:

1. Initialize the Data Capture Context
2. Configure the Barcode Find Mode and the items to search for
3. Host the Barcode Find view and bind it to your app's lifecycle
4. Register the listener to be notified with found items
5. Start searching

## Prerequisites

- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.mdx) for information on how to add the Scandit Data Capture SDK to your project.

:::note
Devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Initialize the Data Capture Context

The first step to add find capabilities to your application is to initialize the `DataCaptureContext` with a valid Scandit Data Capture SDK license key. This is typically done once, in shared (`commonMain`) code, so both Android and iOS reuse the same instance:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext

val dataCaptureContext = DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
```

:::note
`DataCaptureContext` should be initialized only once. Use `DataCaptureContext.sharedInstance` to access it afterwards.
:::

## Configure the Barcode Find Mode

The Barcode Find mode is configured through `BarcodeFindSettings`, which lets you enable the symbologies you need. For this tutorial, we enable a generous set of symbologies — in your own app, only enable the ones you require, since every extra symbology impacts processing time.

```kotlin
import com.kmp.datacapture.barcode.data.Symbology
import com.kmp.datacapture.barcode.find.BarcodeFindSettings

val settings = BarcodeFindSettings.barcodeFindSettings().also {
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
```

Then create the list of items that will be actively searched for. In this tutorial, let's look up two items based on their EAN13 codes. We attach display information to the first item, which `BarcodeFindView` uses to render its item carousel:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindItem
import com.kmp.datacapture.barcode.find.BarcodeFindItemContent
import com.kmp.datacapture.barcode.find.BarcodeFindItemSearchOptions

val itemsToFind = setOf(
    BarcodeFindItem(
        searchOptions = BarcodeFindItemSearchOptions("9783598215438"),
        content = BarcodeFindItemContent("Mini Screwdriver Set", "(6-Piece)", image = null),
    ),
    // Item information is optional; used for display only.
    BarcodeFindItem(searchOptions = BarcodeFindItemSearchOptions("9783598215414"), content = null),
)
```

Finally, create the mode with the settings and register it on the context:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFind

val barcodeFind = BarcodeFind(settings)
dataCaptureContext.addMode(barcodeFind)
barcodeFind.setItemList(itemsToFind)
```

## Host the View

MatrixScan Find's built-in AR user interface includes the camera preview and searching UI elements that guide the user through the process. There are two ways to host it: the declarative Compose Multiplatform composable (recommended), or the imperative platform view.

### Compose (recommended)

The `barcode-compose` module provides a declarative `BarcodeFindView` composable that owns the `BarcodeFind` mode, applies `itemsToFind` reactively, and manages the searching lifecycle automatically — `startSearching()` is the final mount step and `stopSearching()` runs first on dispose:

```kotlin
import com.kmp.datacapture.barcode.compose.BarcodeFindView

@Composable
fun FindingScreen() {
    BarcodeFindView(
        settings = settings,
        itemsToFind = itemsToFind,
        onFinishTap = { foundItems ->
            // Navigate back with the items found during the session
        },
    )
}
```

### Imperative View API

If you need full control over the view and its lifecycle — or you are not using the `-compose` companion modules — construct a `BarcodeFindView` from the base `barcode` module directly, configure `BarcodeFindViewSettings`, and drive the resume/pause and searching lifecycle yourself.

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindViewSettings
import com.kmp.datacapture.core.common.Color

val viewSettings = BarcodeFindViewSettings(
    inListItemColor = Color.fromRgba(0, 255, 0),
    notInListItemColor = Color.fromRgba(255, 0, 0),
    soundEnabled = true,
    hapticEnabled = true,
)
```

On Android, embed the view in your UI (shown here hosted from Compose via `AndroidView`) and forward the lifecycle events. As with the Compose wrapper, `startSearching()` must be the last call on mount, and `stopSearching()` the first call on teardown:

```kotlin
import androidx.compose.ui.viewinterop.AndroidView
import com.kmp.datacapture.barcode.find.BarcodeFindView
import com.kmp.datacapture.barcode.ui.toAndroidView

val barcodeFindView = BarcodeFindView(context, barcodeFind, viewSettings)

DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_RESUME -> barcodeFindView.onResume()
            Lifecycle.Event.ON_PAUSE -> barcodeFindView.onPause()
            else -> Unit
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    barcodeFindView.onResume()
    barcodeFindView.startSearching()
    onDispose {
        barcodeFindView.stopSearching()
        barcodeFindView.onPause()
        lifecycleOwner.lifecycle.removeObserver(observer)
    }
}

AndroidView(factory = { barcodeFindView.toAndroidView() })
```

On iOS, wrap the same shared `barcodeFindView` instance in a SwiftUI `UIViewRepresentable`, calling `toUIView()` to get the native `UIView`, and resume/pause and start/stop searching from `onAppear`/`onDisappear`:

```swift
struct BarcodeFindViewRepresentable: UIViewRepresentable {
    let barcodeFindView: BarcodeFindView

    func makeUIView(context: Context) -> UIView {
        barcodeFindView.toUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

struct FindingHost: View {
    let barcodeFindView: BarcodeFindView

    var body: some View {
        BarcodeFindViewRepresentable(barcodeFindView: barcodeFindView)
            .onAppear {
                barcodeFindView.onResume()
                barcodeFindView.startSearching()
            }
            .onDisappear {
                barcodeFindView.stopSearching()
                barcodeFindView.onPause()
            }
    }
}
```

## Register the Listener

The `BarcodeFindView` displays a "finish" button next to its shutter button. Register a `BarcodeFindViewUiListener` to be notified of the items found once the finish button is pressed:

```kotlin
import com.kmp.datacapture.barcode.find.BarcodeFindItem
import com.kmp.datacapture.barcode.find.BarcodeFindViewUiListener

barcodeFindView.uiListener = object : BarcodeFindViewUiListener {
    override fun onFinishButtonTapped(foundItems: Set<BarcodeFindItem>) {
        // This is called when the user presses the finish button; foundItems contains
        // every item found during the session.
    }
}
```

:::note
If you are using the Compose `BarcodeFindView`'s `onFinishTap` callback instead, you don't need a separate `BarcodeFindViewUiListener` — both are notified from the same underlying finish event.
:::

## Start Searching

If you constructed the view imperatively without going through the lifecycle wiring above, you can control searching directly. This is the equivalent of pressing the "Play" button programmatically — it starts the camera and hides the item carousel:

```kotlin
barcodeFindView.startSearching()
```
