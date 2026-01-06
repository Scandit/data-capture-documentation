---
description: "SparkScan can be customized to fit a wide range of scanning workflows through the combination of **Scanning Mode**, **Scanning Behavior**, and **Preview Behavior**.                                                                             "

title: Configuring Workflow Options
framework: netIos
keywords:
  - netIos
---

# Configuring Scanning and Preview Behavior

The workflow here is based on the default configuration of SparkScan, carefully picked as a result of extensive user testing and customer feedback from the field.

But not all workflows look the same, and your needs may differ. That's why SparkScan comes with a set of options to configure the scanner and to best fit in the desired workflow.

SparkScan can be customized to fit a wide range of scanning workflows through the combination of **Scanning Mode**, **Scanning Behavior**, and **Preview Behavior**.

This guide explains all valid combinations and when to use them, along with code examples to help you configure your SparkScan setup.

## Workflow Options

Scanning modes:

- **Default mode**: Ideal for close-range and fast paced scanning. This mode will display a small camera preview to aid with aiming. The preview size and zoom level can be adjusted as needed.
- **Target mode**: Ideal for scanning scenarios where precision is important. This mode will add an aimer to the preview, to precisely select the barcode to scan. This is useful when multiple barcodes are in view (e.g. long range scanning).

:::tip
Users can enable the target mode by toggling the dedicated icon in the setting toolbar, shown when `SparkScanView.TargetModeButtonVisible` is enabled.

The Settings toolbar itself is only visible if at least one of the buttons is enabled.
:::

Scanning behaviors:

- **Single scan**: Scan one barcode at a time. The user needs to trigger the scanner every time to scan a barcode. This allows for a more controlled scanning and lower battery consumption.
- **Continuous scan**: Scan barcodes consecutively. The user needs to trigger the scanner once and barcodes will be scanned without any further interaction before each scan. This allows for a smoother experience when multiple barcodes need to be scanned consecutively.
    - Users can enable continuous scanning by holding down the trigger button (`SDCSparkScanViewSettings.HoldToScanEnabled`). This gesture can be disabled.
    - Developers can show a dedicated setting in the toolbar to let the user enable continuous scan mode (`SDCSparkScanView.ScanningBehaviorButtonVisible`), which is hidden by default.

Camera preview behaviors:

- **Default**: Preview fades away when the scanner is off. This lets the user check important information displayed by the app and reduces battery consumption.
- **Persistent**: Preview remains visible, but darkened, even when the scanner is off. This is useful for scenarios where you want to select a barcode (among many) or need to look through the preview at all times (to ensure the right scan) - especially if used in conjunction with the target mode.

Developers can set a combination of scanning mode, scanning behavior and camera preview behavior - defining the initial state of the scanner. This can be done by setting the default scanning mode (SDCSparkScanViewSettings.DefaultScanningMode).

## Scanning Modes

The following scanning modes are available:

| Mode  | Description   |
| ----------- | --------------------------------------------------- |
| **Default** | Optimized for close-range, fast-paced scanning. User can aim easily at the intended barcode.       |
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

```csharp
var settings = new SparkScanSettings();
settings.ScanningBehavior = ScanningBehavior.Single;

var sparkViewSettings = new SparkScanViewSettings();
sparkViewSettings.ScanningMode = SparkScanScanningMode.Default;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Default;

var sparkView = new SparkScanView(sparkViewSettings);
```

### Default Mode + Single Scan + Persistent Preview

Suitable for single scans where some visual context is needed between scans.

```csharp
settings.ScanningBehavior = ScanningBehavior.Single;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Default;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Persistent;
```

### Default Mode + Continuous Scan + Default Preview

Best for high-speed, repetitive scanning tasks where interface clarity is still needed after scanning.

```csharp
settings.ScanningBehavior = ScanningBehavior.Continuous;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Default;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Default;
```

### Default Mode + Continuous Scan + Persistent Preview

Good for rapid scanning when the user needs ongoing visual alignment.

```csharp
settings.ScanningBehavior = ScanningBehavior.Continuous;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Default;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Persistent;
```

### Target Mode + Single Scan + Default Preview

Useful for precision tasks with isolated barcode scanning and less frequent visual alignment.

```csharp
settings.ScanningBehavior = ScanningBehavior.Single;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Target;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Default;
```

### Target Mode + Single Scan + Persistent Preview

Ideal when barcodes are close together and must be carefully selected, even before activating scanning.

```csharp
settings.ScanningBehavior = ScanningBehavior.Single;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Target;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Persistent;
```

### Target Mode + Continuous Scan + Default Preview

Enables high-speed scanning in cluttered barcode environments, with reduced visual distraction between scans.

```csharp
settings.ScanningBehavior = ScanningBehavior.Continuous;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Target;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Default;
```

### Target Mode + Continuous Scan + Persistent Preview

Perfect for scanning many barcodes in busy layouts where visual alignment must be constant.

```csharp
settings.ScanningBehavior = ScanningBehavior.Continuous;
sparkViewSettings.ScanningMode = SparkScanScanningMode.Target;
sparkViewSettings.PreviewBehavior = PreviewBehavior.Persistent;
```

