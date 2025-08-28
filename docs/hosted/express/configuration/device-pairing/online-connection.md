---
description: "Guide to integrating and configuring online device pairing using the Scandit Express app."
framework: express
tags: [express]
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
  BarcodeLinkUiFlow
} from '@scandit/web-barcode-link';
```

2. Initialize BarcodeLink

```javascript
const barcodeLink = BarcodeLink.forLicenseKey('YOUR_SCANDIT_LICENSE_KEY');
```

3. Set the Scanning Mode

```javascript
barcodeLink.setBarcodeLinkMode(BarcodeLinkMode.ContinuousScanning);
```

4. Configure Symbologies (Optional)

```javascript
barcodeLink.setSymbologies({
  ean13Upca: { enabled: true },
  code128: { enabled: true },
  qr: { enabled: true }
});
```

5. Add Event Listeners

```javascript
barcodeLink.addListener({
  onCapture: (barcodes) => {
    barcodes.forEach((barcode) => {
      console.log('Scanned:', barcode.data);
      // Handle the scanned data here
    });
  }
});
```

6. Start the UI Flow

```javascript
await barcodeLink.initialize(new BarcodeLinkUiFlow());
```

## Terminate the Session

```javascript
await barcodeLink.dispose();
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

Sets the scanning mode.

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

#### `setBarcodeTransformations(barcodeTransformations: unknown): BarcodeLink`

```ts
barcodeLink.setBarcodeTransformations({ ... });
```

Sets barcode transformation logic. Only used when `platform` is `BarcodeLinkPlatform.Express`.

#### `setSymbologies(symbologies: BarcodeLinkConfiguration['symbologies']): BarcodeLink`

```ts
barcodeLink.setSymbologies({
  ean13upca: {
    enabled: true,
  },
});
```

Enables specific symbologies for scanning.

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
- `finished`: Indicates if scanning has finished (used in continuous modes).

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

Tracks connection state changes. Only available in `BarcodeLinkUilessFlow`.

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

#### `initialize(flow: BarcodeLinkFlow): Promise`

```ts
await barcodeLink.initialize(new BarcodeLinkUiFlow());
```

Initializes Barcode Link using a specific flow.

**Flow types:**

##### `BarcodeLinkUiFlow`

- Initializes with a pre-built UI.
- Shows a QR code for smartphone connection.

##### `BarcodeLinkUilessFlow`

- Initializes a headless session.
- Requires custom UI.
- Provides a QR code object for manual rendering.

Example:

```ts
const qrcode = await barcodeLink.initialize(new BarcodeLinkUilessFlow());

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
await barcodeLink.dispose();
```

Closes the Barcode Link session, useful when unmounting components or ending a session manually.
