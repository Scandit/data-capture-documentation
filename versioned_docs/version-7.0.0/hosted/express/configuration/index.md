---
toc_max_heading_level: 4
framework: express
tags: [express]
keywords:
  - express
---

# Available Configurations

There are many configuration options and functionalities available in Scandit Express. This section provides an overview of the different configuration options and how to set them up.

## Configuration Options

### Recognized Symbologies

You can configure which [barcode symbologies](../../../barcode-symbologies.md) Scandit Express should recognize. By default, all symbologies are enabled. You can disable symbologies that are not needed to improve scanning performance.

1. Login to your [Scandit Dashboard](https://ssl.scandit.com/).
2. Click on the Project card you want to configure.
3. For each symbology, you can enable or disable it by checking the **enabled** checkbox.
    ![Symbology Configuration](/img/express/enabled_symbology.png)
4. [Reload the configuration](../getting-started/rollout/#updating-configuration) in your app to apply the changes.

If you want to further restrict what barcodes are accepted by Scandit Express, you can define a specific match as a regular expression. Only barcode data matching the specified regular expression will be accepted.

The corresponding field is in the `barcodeRegexValidation` section.

![Barcode Regex Validation](/img/express/regex_validation.png)

### Keystroke Injection

You can configure Scandit Express to inject additional keystrokes after a barcode is scanned. This is useful if you want to automate the process of entering data into a form or application.

1. Login to your [Scandit Dashboard](https://ssl.scandit.com/).
2. Click ont the Project card you want to configure.
3. Using the `appendKeyPress` section, you can define the keypresses that should be injected after a barcode is scanned.
    * `null` means no keypresses will be injected.
    * `enter` will inject an Enter keypress.
    * `\n` for Return Carriage.
    * `tab` for Tab.
4. [Reload the configuration](../getting-started/rollout/#updating-configuration) in your app to apply the changes.

### Scanning Modes

Scandit Express supports different scanning modes to optimize the scanning experience for different use cases. There are two scanning modes available by default: Accuracy and Speed. Two additional modes, Batch and List, are available if you have purchased MatrixScan.

#### Accuracy

Use this mode to select one barcode out of many. This mode detects all barcodes available, then gives visual feedback on the screen (an augmented-reality overlay) so the user can select the target barcode. This mode scans one barcode at a time.

#### Speed

Use this mode to scan barcodes consecutively at high speed. This mode scans successive items at high speed without the need to keep tapping on the screen.

<img src="/img/express/speed.gif" alt="Speed Mode" width="250px" />

#### Batch

Use this mode to scan a batch of barcodes all at once. This mode scans all visible barcodes instantly. It’s perfect when all barcodes are visible and the volume is high.

<img src="/img/express/batch.gif" alt="Batch Mode" width="250px" />

#### List

The list mode icon allows the user to see the list of barcodes that have been scanned. List mode, when activated, works for barcodes scanned in any mode (basic speed scanning, accuracy, and batch).

### Activate via Hardware Button

This feature is only supported for Android devices, and must be enabled by the Scandit Support team on your account. Contact us using this [webform](https://support.scandit.com/hc/en-us/requests/new) and include the following information:

* Your Scandit account email address.
* The project name you want to enable the feature for.
* The device model(s) you want to enable the feature for.
* The key code(s) you want to use to trigger the barcode scanner.

:::tip
You can identify the key code with key code identifier apps available in the Play Store, such as [KeyEvent Display](https://play.google.com/store/apps/details?id=aws.apps.keyeventdisplay).
:::

### Parse and Sort Data

Scandit Express gives you several options to parse the scanned data for such formats as:

* Health Industry Barcodes (HIBC)
* GS1 Application Identifiers
* VIN Numbers
* Swiss QR Codes

You can parse and sort the scanned data either directly from Scandit Express, using the **Scan barcodes** tile in the **Scan and Export** section, or through keyboard injection. All scanning modes will return parsed data.

Please contact [Scandit Support](mailto:support@scandit.com) if you would like to have parser capabilities enabled in your account and we will support you with the necessary details for your specific use case.