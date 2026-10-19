---
description: "Set up online device pairing in Scandit Express to send scanned data to a web application."
framework: hosted
product: express
keywords:
  - express
---

# Device Pairing for Web Apps

## Prerequisites

- A valid **Scandit License Key**
- Access to the **Scandit Express** app on the sender device (iOS or Android)
- A web application (receiver) where scanned data will be received
- Node.js and npm installed on your development machine

## Installation

Install the SDK via npm:

```bash
npm install @scandit/web-barcode-link
```

## Implementation

1. Import the SDK

```javascript
import {
  BarcodeLink,
  BarcodeLinkMode,
  BarcodeLinkSymbology,
  BarcodeLinkUiFlow
} from '@scandit/web-barcode-link';
```

2. Create a BarcodeLink Instance

```javascript
const barcodeLink = BarcodeLink.forLicenseKey('YOUR_SCANDIT_LICENSE_KEY');
```

3. Set the Barcode Link Mode

```javascript
barcodeLink.setBarcodeLinkMode(BarcodeLinkMode.ContinuousScanning);
```

4. Configure Symbologies (Optional)

```javascript
barcodeLink.setSymbologies({
  [BarcodeLinkSymbology.EAN13UPCA]: { enabled: true },
  [BarcodeLinkSymbology.Code128]: { enabled: true },
  [BarcodeLinkSymbology.QR]: { enabled: true }
});
```

5. Add Event Listeners

```javascript
barcodeLink.addListener({
  onCapture: (barcodes, finished) => {
    barcodes.forEach((barcode) => {
      console.log('Scanned:', barcode.data);
      // Handle the scanned data here
    });
    if (finished) {
      // The scanning session has ended
    }
  }
});
```

6. Start the UI Flow

```javascript
await barcodeLink.initialize(new BarcodeLinkUiFlow());
```

## Terminate the Session

```javascript
barcodeLink.dispose();
```

## API Reference

The `BarcodeLink` class is used to configure and initialize your Barcode Link instance.

### Creating an Instance

```ts
const barcodeLink = BarcodeLink.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

Use `forLicenseKey(licenseKey: string): BarcodeLink` to create a new `BarcodeLink` instance with your Scandit license key.

### Configuration Methods

#### `setBarcodeLinkMode(barcodeLinkMode: BarcodeLinkMode): BarcodeLink`

```ts
barcodeLink.setBarcodeLinkMode(BarcodeLinkMode.ContinuousListBuilding);
```

Sets the Barcode Link mode.

**Available values:**

| Value                    | Description                                                |
|-------------------------|------------------------------------------------------------|
| `SingleScanning`        | (Default) Scan one barcode and close the session           |
| `ContinuousScanning`    | Send barcodes in real-time and manually close the session  |
| `SingleListBuilding`    | Send a list of barcodes and close the session              |
| `ContinuousListBuilding`| Send multiple lists and manually close the session         |

#### `setListBehavior(listBehavior: BarcodeLinkListBehavior): BarcodeLink`

```ts
barcodeLink.setListBehavior(BarcodeLinkListBehavior.Count);
```

Sets the behavior for how barcodes are listed.

**Available values:**

| Value   | Description                                         |
|---------|-----------------------------------------------------|
| `Unique`| (Default) Each barcode appears only once per list   |
| `Count` | Tracks how many times a barcode was scanned         |

:::note
Only used in `SingleListBuilding` and `ContinuousListBuilding` modes.
:::

#### `setDisconnectionTimeout(disconnectionTimeout: number): BarcodeLink`

```ts
barcodeLink.setDisconnectionTimeout(30 * 60 * 1000);
```

Sets how long Barcode Link keeps trying to reconnect after the desktop and the smartphone lose their connection to each other. If the connection is not restored within this window, the session is aborted on both devices.

Added in `@scandit/web-barcode-link` 1.2.0.

The value is in milliseconds. It defaults to 15 minutes (`900000`) and is clamped between 1 minute (`60000`) and 60 minutes (`3600000`).

#### `setPlatform(platform: BarcodeLinkPlatform): BarcodeLink`

```ts
barcodeLink.setPlatform(BarcodeLinkPlatform.Web);
```

Sets the platform used for scanning.

**Available values:**

| Value     | Description                                               |
|-----------|-----------------------------------------------------------|
| `Express` | (Default) Launches the Scandit Express app             |
| `Web`     | Opens a browser tab using the Scandit Web SDK            |

#### `setBarcodeRegexValidation(barcodeRegexValidation: RegExp): BarcodeLink`

```ts
barcodeLink.setBarcodeRegexValidation(/\d+/);
```

Defines a regex to validate barcodes. Only matching barcodes are processed.
By default no validation is applied.

:::warning
Don't add flags such as `i`, `g` or `u` to the regex. Barcode Link removes only the first and last character of the regex, so `/abc/i` becomes the pattern `abc/` and valid barcodes no longer match. For case-insensitive matching, list both cases in the pattern, for example `/^[A-Za-z0-9]+$/`. Patterns that need the `u` flag, such as `\p{L}`, don't work.
:::

#### `setBarcodeTransformations(barcodeTransformations: unknown): BarcodeLink`

```ts
barcodeLink.setBarcodeTransformations({ ... });
```

Sets barcode transformation logic. Only used when `platform` is `BarcodeLinkPlatform.Express`.

#### `setSymbologies(symbologies: BarcodeLinkConfiguration['symbologies']): BarcodeLink`

```ts
barcodeLink.setSymbologies({
  [BarcodeLinkSymbology.EAN13UPCA]: {
    enabled: true,
  },
});
```

Enables specific symbologies for scanning. Use the `BarcodeLinkSymbology` constants as keys. They hold the exact key strings Barcode Link expects, such as `ean13Upca`.

**[See all supported symbologies](https://docs.scandit.com/barcode-symbologies/)**

### Event Listeners

#### `addListener(listener: BarcodeLinkListener): BarcodeLink`

```ts
barcodeLink.addListener({
  onCapture(barcodes) {
    console.log("Scanned:", barcodes);
  },
});
```

Adds a listener for session events.

**Available callbacks:**

##### `onCancel`

```ts
barcodeLink.addListener({
  onCancel() {
    console.log("Session closed.");
  },
});
```

Called when the desktop closes the scanning session. Only available in `BarcodeLinkUiFlow`.

##### `onCapture`

```ts
barcodeLink.addListener({
  onCapture(barcodes: BarcodeLinkBarcode[], finished: boolean) {
    // Handle captured barcodes
  },
});
```

Called when the remote device sends barcodes.  
- `finished`: `true` when the scanning session on the remote device has ended. Check it in every mode to know when to clean up.

##### `onConnectionStateChanged`

```ts
barcodeLink.addListener({
  onConnectionStateChanged(connectionState: BarcodeLinkConnectionState) {
    switch (connectionState) {
      // Handle state changes
    }
  },
});
```

Tracks connection state changes. Only available in `BarcodeLinkHeadlessFlow`.

**Available connection states:**

| Value                        | Description                                    |
|-----------------------------|------------------------------------------------|
| `MainDeviceDisconnected`    | Desktop disconnected from session              |
| `MainDeviceReconnected`     | Desktop reconnected to session                 |
| `MainDeviceConnectionFailed`| Reconnection failed repeatedly                 |
| `RemoteDeviceConnected`     | Smartphone connected to session                |
| `RemoteDeviceDisconnected`  | Smartphone disconnected from session           |

#### `removeListener(listener: BarcodeLinkListener): BarcodeLink`

```ts
barcodeLink.removeListener(myListener);
```

Removes a previously added listener.

### Initialization

#### `initialize<T>(flow: BarcodeLinkFlow<T>): Promise<T>`

```ts
await barcodeLink.initialize(new BarcodeLinkUiFlow());
```

Initializes Barcode Link using a specific flow.

**Flow types:**

##### `BarcodeLinkUiFlow`

- Initializes with a pre-built UI.
- Shows a QR code for smartphone connection.

##### `BarcodeLinkHeadlessFlow`

- Initializes a headless session.
- Requires custom UI.
- Provides a QR code object for manual rendering.

Example:

```ts
import { BarcodeLinkHeadlessFlow } from "@scandit/web-barcode-link";

const qrcode = await barcodeLink.initialize(new BarcodeLinkHeadlessFlow());

const img = document.createElement("img");
img.src = qrcode.src;

const a = document.createElement("a");
a.href = qrcode.href;
a.append(img);

document.body.append(a);
```

### Disposing

#### `dispose(): void`

```ts
barcodeLink.dispose();
```

Closes the Barcode Link session, useful when unmounting components or ending a session manually.
