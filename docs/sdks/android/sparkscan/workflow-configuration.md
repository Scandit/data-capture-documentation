---
title: Configuring Workflow Options
framework: android
keywords:
  - android
---

# Configuring Scanning and Preview Behavior

SparkScan can be customized to fit a wide range of scanning workflows through the combination of **Scanning Mode**, **Scanning Behavior**, and **Preview Behavior**.

This guide explains all valid combinations and when to use them, along with code examples to help you configure your SparkScan setup.

## Scanning Modes

The following scanning modes are available:

| Mode  | Description   |
| ----------- | --------------------------------------------------- |
| **Default** | Optimized for close-range, fast-paced scanning. Shows a small camera preview for aiming.       |
| **Target**  | Best for precise scanning when many barcodes are in view. Adds an aimer to the camera preview. |

Each scanning mode can be configured to work with different scanning behaviors and preview behaviors.

### Scanning Behaviors

| Behavior  | Description  |
| ------------------- | ---------------------------------------------------------- |
| **Single scan**     | Scans one barcode at a time. Requires user interaction before each scan. Ideal for controlled scanning and saving battery. |
| **Continuous scan** | Scans barcodes continuously after being triggered once. Ideal for scanning multiple barcodes quickly.  |

### Preview Behaviors

| Behavior  | Description    |
| -------------- | -------------------------- |
| **Default**    | Preview fades out when scanner is off. Helps with battery conservation and allows full view of the app interface.                 |
| **Persistent** | Preview remains darkened when scanner is off. Useful for environments where visual context or barcode selection is always needed. |

## Available Configurations

The combination of scanning mode, scanning behavior, and preview behavior allows for flexible configurations to suit different scanning needs.

### Default Mode + Single Scan + Default Preview

Ideal for basic, one-barcode-at-a-time scanning with minimal power usage.

```kotlin
val settings = SparkScanSettings()
settings.scanningBehavior = ScanningBehavior.SINGLE

val sparkViewSettings = SparkScanViewSettings()
sparkViewSettings.scanningMode = SparkScanScanningMode.DEFAULT
sparkViewSettings.previewBehavior = PreviewBehavior.DEFAULT

val sparkView = SparkScanView(context, sparkViewSettings)
```

### Default Mode + Single Scan + Persistent Preview

Suitable for single scans where some visual context is needed between scans.

```kotlin
settings.scanningBehavior = ScanningBehavior.SINGLE
sparkViewSettings.scanningMode = SparkScanScanningMode.DEFAULT
sparkViewSettings.previewBehavior = PreviewBehavior.PERSISTENT
```

### Default Mode + Continuous Scan + Default Preview

Best for high-speed, repetitive scanning tasks where interface clarity is still needed after scanning.

```kotlin
settings.scanningBehavior = ScanningBehavior.CONTINUOUS
sparkViewSettings.scanningMode = SparkScanScanningMode.DEFAULT
sparkViewSettings.previewBehavior = PreviewBehavior.DEFAULT
```

### Default Mode + Continuous Scan + Persistent Preview

Good for rapid scanning when the user needs ongoing visual alignment.

```kotlin
settings.scanningBehavior = ScanningBehavior.CONTINUOUS
sparkViewSettings.scanningMode = SparkScanScanningMode.DEFAULT
sparkViewSettings.previewBehavior = PreviewBehavior.PERSISTENT
```

### Target Mode + Single Scan + Default Preview

Useful for precision tasks with isolated barcode scanning and less frequent visual alignment.

```kotlin
settings.scanningBehavior = ScanningBehavior.SINGLE
sparkViewSettings.scanningMode = SparkScanScanningMode.TARGET
sparkViewSettings.previewBehavior = PreviewBehavior.DEFAULT
```

### Target Mode + Single Scan + Persistent Preview

Ideal when barcodes are close together and must be carefully selected, even before activating scanning.

```kotlin
settings.scanningBehavior = ScanningBehavior.SINGLE
sparkViewSettings.scanningMode = SparkScanScanningMode.TARGET
sparkViewSettings.previewBehavior = PreviewBehavior.PERSISTENT
```

### Target Mode + Continuous Scan + Default Preview

Enables high-speed scanning in cluttered barcode environments, with reduced visual distraction between scans.

```kotlin
settings.scanningBehavior = ScanningBehavior.CONTINUOUS
sparkViewSettings.scanningMode = SparkScanScanningMode.TARGET
sparkViewSettings.previewBehavior = PreviewBehavior.DEFAULT
```

### Target Mode + Continuous Scan + Persistent Preview

Perfect for scanning many barcodes in busy layouts where visual alignment must be constant.

```kotlin
settings.scanningBehavior = ScanningBehavior.CONTINUOUS
sparkViewSettings.scanningMode = SparkScanScanningMode.TARGET
sparkViewSettings.previewBehavior = PreviewBehavior.PERSISTENT
```
