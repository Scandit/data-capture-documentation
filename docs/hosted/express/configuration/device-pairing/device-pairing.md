---
framework: express
tags: [express]
sidebar_label: Overview
keywords:
  - express
---

# Device Pairing

**Device Pairing** in Scandit Express allows you to transfer scanned barcode data from one smart device (the sender) to another (the receiver) where your system application is running. This enables fast, flexible, and reliable data transfer between devices in real time—without needing to use additional hardware.

Data can be transferred via Bluetooth for Native iOS apps and online connection for Web apps:

- **Online Connection**
   - Works with web-based applications
   - Requires a stable internet connection

- **Bluetooth**
   - Works with native iOS applications
   - No internet connection required

## Device Pairing Workflow

Device Pairing connects two devices:

- **Sender:** An iOS or Android device running Scandit Express to capture barcodes.
- **Receiver:** A system device (iOS only) running a compatible app to receive data.

1. **Pairing**
   - On the receiver device, display a QR code (generated by your application through our SDK).
   - On the sender, open the native camera app and scan the QR code to pair the devices.

2. **Scanning**
   - Use the sender device to scan barcodes
   - Through the configuration you can choose to:
     - Automatically send each scan; or
     - Tap **“Send data to device”** to send all captured data at once

3. **Transfer**
   - Data is transmitted via Bluetooth or online connection
   - It is instantly entered into the target application on the receiver

## System Requirements

* Sender Device
    * iOS or Android device running the Scandit Express app
* Receiver Device
    - iOS (for Bluetooth)
    - Browser-based apps
    - Must support light integration with Scandit’s SDK

## Setup & Configuration

- Scandit Express runs as a no-code scanning application on the sender device.
- For Device Pairing to work, the **receiver application must integrate a lightweight SDK module** to enable data reception.

:::note
Apps that cannot be modified are **not supported** for pairing.
:::

Only the receiving side needs code-level integration. Scandit Express remains a no-code scanning app.

## Try It Now

[Online Connection Web Demo](https://barcode-link.demos.scandit.com/)
