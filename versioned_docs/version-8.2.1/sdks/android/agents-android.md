# AGENTS.md — Scandit Data Capture SDK (Android: Java/Kotlin)

This file guides coding agents (and humans!) to install and integrate the **Scandit Smart Data Capture SDK** for Android using **Java/Kotlin**. It covers setup and how to add key Scandit products: **SparkScan**, **MatrixScan Find/Count**, **Smart Label Capture**, **Barcode Capture**, and **ID Capture**.

> Target: **Android (SDK v7.x)** — Gradle/Maven project.  
> Languages: **Kotlin** (primary) & **Java** (equivalents where helpful).

---

## Setup Commands

- **Install Android SDK deps**: use latest Android Studio and SDKs.  
- **Min/Target**: target/compile SDK ≥ **23** (ID Capture needs **24+**).  
- **Add Maven Central** to `settings.gradle`/`build.gradle`:
  ```gradle
  repositories { mavenCentral() }
  ```
- **Add Scandit modules** you need in `app/build.gradle` (choose from list below):
  ```gradle
  dependencies {
    implementation "com.scandit.datacapture:ScanditCaptureCore:[latest]"
    // Add feature modules as needed:
    implementation "com.scandit.datacapture:ScanditBarcodeCapture:[latest]"
    implementation "com.scandit.datacapture:ScanditLabelCapture:[latest]"
    implementation "com.scandit.datacapture:ScanditIdCapture:[latest]"
    // Optional extras depending on features:
    implementation "com.scandit.datacapture:ScanditIdCaptureBackend:[latest]"
    implementation "com.scandit.datacapture:ScanditIdEuropeDrivingLicense:[latest]"
    implementation "com.scandit.datacapture:ScanditIdAamvaBarcodeVerification:[latest]"
    implementation "com.scandit.datacapture:ScanditIdVoidedDetection:[latest]"
  }
  ```
  > Find the **latest version** and exact artifacts on Maven Central (Sonatype).

- **Android Manifest**:
  ```xml
  <uses-permission android:name="android.permission.CAMERA"/>
  <uses-feature android:name="android.hardware.camera" android:required="false"/>
  ```

- **ProGuard/R8**: no special rules typically required beyond the SDK’s defaults. If you shrink/obfuscate aggressively, keep Scandit packages as needed.

- **License key**: create in the Scandit Dashboard and inject via code or BuildConfig.

---

## Project Structure Hints

- `App.kt` / `MainActivity.kt`: create `DataCaptureContext` early (Application/Activity).  
- Fragments/Activities owning a Scandit *View* must forward lifecycle events (`onResume/onPause`).  
- Keep each product’s setup in its own class (e.g., `SparkScanManager`, `IdCaptureManager`, etc.).

---

## Initialize the SDK (Core)

```kotlin
import com.scandit.datacapture.core.DataCaptureContext

val dataCaptureContext = DataCaptureContext.forLicenseKey(BuildConfig.SCANDIT_LICENSE_KEY)
```

> Tip: The built‑in UI components (e.g., `SparkScanView`, `BarcodeFindView`) manage camera start/stop when you route lifecycle calls to them.

---

## SparkScan (pre‑built single‑scan UI)

**When to use**: fastest way to add ergonomic single‑item scanning with a floating trigger button.

**Dependencies**: `ScanditCaptureCore`, `ScanditBarcodeCapture`.

```kotlin
import com.scandit.datacapture.barcode.spark.ui.SparkScanView
import com.scandit.datacapture.barcode.spark.ui.SparkScanViewSettings
import com.scandit.datacapture.barcode.spark.SparkScan
import com.scandit.datacapture.barcode.spark.SparkScanSettings
import com.scandit.datacapture.barcode.data.Symbology

val settings = SparkScanSettings().apply {
    enableSymbologies(setOf(Symbology.EAN13_UPCA)) // adjust for your use case
}
val sparkScan = SparkScan(settings)

val viewSettings = SparkScanViewSettings() // customize as needed
val sparkView = SparkScanView.newInstance(parentView, dataCaptureContext, sparkScan, viewSettings)

override fun onResume() { super.onResume(); sparkView.onResume() }
override fun onPause() { sparkView.onPause(); super.onPause() }

// Listen for results
sparkScan.addListener(object : SparkScanListener {
    override fun onBarcodeScanned(spark: SparkScan, session: SparkScanSession, data: FrameData?) {
        val barcode = session.newlyRecognizedBarcode
        barcode?.let { /* handle on UI thread */ }
    }
})
```

---

## Barcode Capture (low‑level single scan)

**When to use**: full control without SparkScan’s prebuilt UI.

**Dependencies**: `ScanditCaptureCore`, `ScanditBarcodeCapture`.

```kotlin
val barcodeSettings = BarcodeCaptureSettings().apply {
    enableSymbologies(setOf(Symbology.CODE128, Symbology.QR))
}
val barcodeCapture = BarcodeCapture.forDataCaptureContext(dataCaptureContext, barcodeSettings)

// View + overlay
val captureView = DataCaptureView.newInstance(context, dataCaptureContext)
val overlay = BarcodeCaptureOverlay.newInstance(barcodeCapture, captureView)

barcodeCapture.addListener(object : BarcodeCaptureListener {
    override fun onBarcodeScanned(mode: BarcodeCapture, session: BarcodeCaptureSession, data: FrameData?) {
        val code = session.newlyRecognizedBarcode?.data
        // handle result
    }
})
```

---

## MatrixScan Find (search & find with AR UI) / MatrixScan Count

**When to use**: highlight items that match a *list*; quickly search shelves/containers.  
**Note**: MatrixScan Count/Find are powered by **BarcodeFind** + **BarcodeFindView**.

```kotlin
val findSettings = BarcodeFindSettings().apply {
    setSymbologyEnabled(Symbology.EAN13_UPCA, true)
}

val items = hashSetOf(
    BarcodeFindItem(BarcodeFindItemSearchOptions("9783598215438"),
        BarcodeFindItemContent("Mini Screwdriver Set", "(6‑Piece)", null)),
    BarcodeFindItem(BarcodeFindItemSearchOptions("9783598215414"), null)
)

val findMode = BarcodeFind(findSettings).apply { setItemList(items) }

val findViewSettings = BarcodeFindViewSettings().apply {
    // e.g., inListItemColor / notInListItemColor, soundEnabled, hapticEnabled
}

val findView = BarcodeFindView.newInstance(parentView, dataCaptureContext, findMode, findViewSettings)

override fun onResume() { super.onResume(); findView.onResume() }
override fun onPause() { findView.onPause(); super.onPause() }

findView.setListener(object : BarcodeFindViewUiListener {
    override fun onFinishButtonTapped(found: Set<BarcodeFindItem>) { /* navigate or consume */ }
})

// Programmatic start (same as tapping Play):
findView.startSearching()
```

---

## Smart Label Capture (barcodes + printed text in one shot)

**When to use**: read **multiple barcodes + OCR** fields from a label (e.g., expiry date, weight, serial).  
**Dependencies**: `ScanditCaptureCore`, `ScanditBarcodeCapture`, `ScanditLabelCapture` (+ optional `ScanditLabelCaptureText`, `ScanditPriceLabel` depending on your label definitions).

Typical flow:
1. Create `LabelCaptureSettings` and your **label definition** (fields layout + parsers).
2. Create `LabelCapture` for the `dataCaptureContext`.
3. Add a `LabelCaptureViewfinder/Overlay` (or **ValidationFlowOverlay** for guided steps).
4. Register `LabelCaptureListener` to receive structured results.
5. Start camera / provide user feedback.

Kotlin sketch:
```kotlin
val labelSettings = LabelCaptureSettings.builder()/* configure with your label definition */.build()
val labelCapture = LabelCapture.forDataCaptureContext(dataCaptureContext, labelSettings)

val captureView = DataCaptureView.newInstance(context, dataCaptureContext)
// Optional guided overlay for validation flows:
val validationOverlay = LabelCaptureValidationFlowOverlay.newInstance(
    requireContext(), labelCapture, captureView
)

labelCapture.addListener(object : LabelCaptureListener {
    override fun onLabelCaptured(capture: LabelCapture, session: LabelCaptureSession, data: FrameData?) {
        val fields = session.capturedLabels.firstOrNull()?.fields
        // Extract required field values
    }
})
```

> Author your label definitions to match the physical layout and desired outputs. Use the samples to bootstrap.

---

## ID Capture (ID scanning & data extraction)

**When to use**: read MRZ, PDF417 on DL/IDs, and visual zones on supported IDs.  
**Dependencies**: `ScanditCaptureCore`, `ScanditIdCapture` (+ optional backends per region/use case).  
**Important**: **Do not enable** ID Capture at the same time as other modes (e.g., Barcode Capture, Text Capture). Switch modes cleanly.

Kotlin outline:
```kotlin
val idSettings = IdCaptureSettings().apply {
    acceptedDocuments = listOf(IdCard(IdCaptureRegion.ANY), DriverLicense(IdCaptureRegion.ANY))
    // Configure sides/regions as required
}
val idCapture = IdCapture.forDataCaptureContext(dataCaptureContext, idSettings)

val captureView = DataCaptureView.newInstance(context, dataCaptureContext)
val overlay = IdCaptureOverlay.newInstance(idCapture, captureView)

idCapture.addListener(object : IdCaptureListener {
    override fun onIdCaptured(mode: IdCapture, id: CapturedId) {
        // Consume fields (name, DOB, document number, etc.)
    }
})
```

> For validation workflows, add corresponding verifiers (e.g., AAMVA, EU DL) as optional dependencies.

---

## Common Tasks for Agents

- **Symbologies**: enable only what you need (EAN‑13, Code 128, QR, etc.) to maximize speed.  
- **Lifecycle**: always forward `onResume/onPause` to Scandit *views* (SparkScanView, BarcodeFindView, DataCaptureView).  
- **Threading**: listener callbacks may be on background threads—post results to the UI thread.  
- **Performance**: keep overlays lean; disable unneeded features; use lists/sets for lookups (MatrixScan Find).  
- **Testing**: keep printable test sheets handy; exercise low light, glare, and motion.

---

## Samples & References

- **Android Samples**: [https://github.com/Scandit/datacapture-android-samples](https://github.com/Scandit/datacapture-android-samples) — multiple ready‑to‑run apps.  
- **Install guide** (Gradle, modules, requirements).  
- **SparkScan get started** (prebuilt UI).  
- **MatrixScan Find get started** (search & find).  
- **Smart Label Capture get started** (labels & OCR).  
- **ID Capture get started** (IDs & validation).

---

## Troubleshooting

- **Incompatible modes** error across fragments: ensure `androidx.fragment` **1.3.0+** and avoid having two incompatible modes active across fragment transitions.  
- **Content provider order**: if your `ContentProvider` depends on Scandit, set a lower `initOrder` than 10 so Scandit initializes first.  
- **GPU requirement**: devices must have a GPU for best performance.

---

## Checklists

**PR Checklist**
- [ ] Gradle modules added as needed
- [ ] License key wired via `BuildConfig`/secure source
- [ ] Correct symbologies enabled
- [ ] Lifecycles forwarded to Scandit views
- [ ] Listeners return results on UI thread
- [ ] Mode conflicts avoided (esp. with **IdCapture**)

**Release Checklist**
- [ ] Camera permission rationale & flows
- [ ] Shrink/obfuscate release build verified
- [ ] QA on device matrix (OEMs, lighting, cases)
- [ ] Legal notices page shows OSS attributions via `DataCaptureContext.openSourceSoftwareLicenseInfo()`

---

## Appendix — Typical Imports (Kotlin)

```kotlin
import com.scandit.datacapture.core.*
import com.scandit.datacapture.core.ui.*
import com.scandit.datacapture.core.ui.viewfinder.*
import com.scandit.datacapture.barcode.*
import com.scandit.datacapture.barcode.capture.*
import com.scandit.datacapture.barcode.capture.ui.*
import com.scandit.datacapture.barcode.spark.*
import com.scandit.datacapture.barcode.spark.ui.*
import com.scandit.datacapture.find.*
import com.scandit.datacapture.find.ui.*
import com.scandit.datacapture.label.*
import com.scandit.datacapture.label.ui.*
import com.scandit.datacapture.id.*
import com.scandit.datacapture.id.ui.*
```
