---
description: "Overview of the configuration options available in Scandit Express and how to set them up."

toc_max_heading_level: 4
framework: hosted
product: express
keywords:
  - express
topic_type: concept
canonical_id: scandit.express.configuration.index
---

# Available Configurations

There are many configuration options and functionalities available in Scandit Express. This section provides an overview of the different configuration options and how to set them up.

## Configuration Options

### Recognized Symbologies

You can configure which [barcode symbologies](../../../barcode-symbologies) Scandit Express should recognize. By default, all symbologies are enabled. You can disable symbologies that are not needed to improve scanning performance.

1. Login to your [Scandit Dashboard](https://ssl.scandit.com/).
2. Click on the Project card you want to configure.
3. For each symbology, you can enable or disable it via the corresponding toggle.
    ![Symbology Configuration](/img/express/enabled_symbology.png)
4. [Reload the configuration](/hosted/express/getting-started/rollout.md#updating-configuration) in your app to apply the changes.

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
4. [Reload the configuration](/hosted/express/getting-started/rollout.md#updating-configuration) in your app to apply the changes.

### Scanning Options

Scandit Express has two scanning modes: Single and Batch. You can also turn on list building to collect your scans in a list.

#### Single

Use Single mode to scan one barcode at a time. Point the camera at a barcode and Scandit Express scans it. If several barcodes are close together, choose the one you want.

Single mode, also called Smart Scan Selection, is available from Scandit Express 4.3.0 on iOS and 4.4.0 on Android. It replaces the Accuracy and Speed modes of earlier versions.

#### Batch

Use Batch mode to scan all visible barcodes at once, for example when you have many barcodes in view.

To use Batch mode, you need a MatrixScan license and list building turned on.

<img src="/img/express/batch.gif" alt="Batch Mode" width="250px" />

#### List Building

List building collects your scans in a list. You check the list, and then Scandit Express types the barcodes into the field. List building works in Single and Batch mode. It doesn't need a MatrixScan license, but Batch mode does.

### Activate via Hardware Button

This feature is only supported for Android devices, and must be enabled by the Scandit Support team on your account. Contact us using this [webform](https://support.scandit.com/hc/en-us/requests/new) and include the following information:

* Your Scandit account email address.
* The project name you want to enable the feature for.
* The device models you want to enable the feature for.
* The key codes you want to use to trigger the barcode scanner.

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