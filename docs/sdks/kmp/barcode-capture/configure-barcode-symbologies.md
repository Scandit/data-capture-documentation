---
description: "Learn about the available symbologies and the corresponding configurations available for Barcode Capture."

sidebar_position: 3
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Configure Barcode Symbologies

The Scandit Data Capture SDK is capable of reading a large number of 1D and 2D barcode symbologies. Not all symbologies are enabled by default, as scanning performance can be negatively affected by enabling many symbologies at once. Only enable the symbologies your application actually needs.

## Enable the Symbologies You Want to Read

`BarcodeCaptureSettings` exposes both a single-symbology and a batch method to enable the symbologies you want to read:

```kotlin
import com.kmp.datacapture.barcode.capture.BarcodeCaptureSettings
import com.kmp.datacapture.barcode.data.Symbology

val settings = BarcodeCaptureSettings.barcodeCaptureSettings()
settings.enableSymbology(Symbology.CODE128, true)
```

Or enable several symbologies at once:

```kotlin
settings.enableSymbologies(
    setOf(
        Symbology.EAN13_UPCA,
        Symbology.CODE128,
        Symbology.CODE39,
        Symbology.QR,
    ),
)
```

## Use a Capture Preset

Instead of enabling symbologies individually, you can create settings pre-tuned for a vertical with `BarcodeCaptureSettings.barcodeCaptureSettings(capturePresets)`:

```kotlin
import com.kmp.datacapture.barcode.data.CapturePreset

val settings = BarcodeCaptureSettings.barcodeCaptureSettings(setOf(CapturePreset.RETAIL))
```

Available presets are `CapturePreset.TRANSPORT`, `CapturePreset.LOGISTICS`, `CapturePreset.RETAIL`, `CapturePreset.HEALTHCARE`, and `CapturePreset.MANUFACTURING`.

## Configure the Active Symbol Count

Barcode symbologies (such as Code 128, Code 39, or Interleaved Two of Five) can store variable-length data. For performance reasons, the Scandit Data Capture SDK limits the possible symbol range for variable-length symbologies. Use `BarcodeCaptureSettings.getSymbologySettings()` to look up the per-symbology `SymbologySettings` and adjust `activeSymbolCounts` to the code lengths your application uses:

```kotlin
val symbologySettings = settings.getSymbologySettings(Symbology.CODE128)
symbologySettings.activeSymbolCounts = setOf<Short>(6, 7, 8)
```

## Read Bright-on-Dark Barcodes

Most barcodes are printed using dark ink on a bright background. Some symbologies allow the colors to be inverted and can also be printed using bright ink on a dark background. When you enable a symbology, only dark-on-bright codes are enabled by default — set `SymbologySettings.isColorInvertedEnabled` to also read bright-on-dark codes:

```kotlin
val symbologySettings = settings.getSymbologySettings(Symbology.CODE128)
symbologySettings.isColorInvertedEnabled = true
```

## Enforce Checksums

Some symbologies have a mandatory checksum that is always enforced, while others only have optional checksums. Enforcing an optional checksum reduces false positives. Set `SymbologySettings.checksums` to the `Checksum` values you want to require — make sure the data of your codes actually contains the calculated checksum, otherwise the codes are discarded:

```kotlin
import com.kmp.datacapture.barcode.data.Checksum

val symbologySettings = settings.getSymbologySettings(Symbology.CODE39)
symbologySettings.checksums = setOf(Checksum.MOD_43)
```

## Enable Symbology-Specific Extensions

Some symbologies allow further configuration through extensions that can be enabled or disabled individually. Some extensions affect how the data in the code is formatted; others allow for more relaxed recognition modes that are disabled by default to eliminate false reads. Use `SymbologySettings.setExtensionEnabled()`:

```kotlin
val symbologySettings = settings.getSymbologySettings(Symbology.CODE39)
symbologySettings.setExtensionEnabled("full_ascii", true)
```

This extension allows Code 39 to encode all 128 ASCII characters instead of only the 43 characters defined in the standard. It is disabled by default as it can lead to false reads when enabled.

Once configured, apply the settings to an existing `BarcodeCapture` mode with `BarcodeCapture.applySettings()`, or pass them to `BarcodeCapture.forContext()` when creating the mode — see [Get Started](get-started.md).
