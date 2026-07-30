---
title: Testing
sidebar_label: Testing
description: "Unit-test your Scandit Data Capture SDK listener and callback logic on Web without a live camera, and verify real decoding without physical hardware."
framework: web
keywords:
  - web
  - testing
  - unit testing
  - mocking
---

# Testing

Scanning happens against live camera frames delivered through the browser's `getUserMedia` API, which is not available in most unit test environments (Node, jsdom, headless CI runners). The capture modes, sessions, and result objects the SDK hands to your listeners are also produced internally during a live scan, so they cannot be constructed with real data directly.

Unlike on iOS and Android, the SDK's public types on Web are plain TypeScript classes and interfaces with no native bridge behind them, so there is no dedicated mocking framework to add — a plain object literal is enough to stand in for anything the SDK would otherwise hand your listener. There are two recommended approaches, which you can use on their own or combine:

- **[Isolate the SDK behind your own abstraction](#isolate-the-sdk-behind-your-own-abstraction).** Keep your application logic independent of the SDK and test that logic directly, without any SDK objects.
- **[Test with the SDK's own types directly](#test-with-the-sdks-own-types-directly).** Build plain objects that stand in for the capture mode, session, and result objects, then drive your listener with controlled values.

Choose based on what you want to verify: your own logic in isolation, or your code's behavior against the SDK's own types.

Both approaches test your callback logic in isolation. To verify the full pipeline end to end — the real, licensed engine actually decoding a frame — see [Integration testing your pipeline](#integration-testing-your-pipeline).

:::note
The examples on this page use BarcodeCapture. The same techniques apply to every capture mode; work with the corresponding listener and result types, for example `SparkScanListener`, `BarcodeBatchListener` (MatrixScan), or ID Capture's `Listener`.
:::

## Isolate the SDK Behind Your Own Abstraction

With this approach the SDK is confined to a thin adapter, and your application logic depends only on an abstraction that you own. The example below routes every scan into a plain, testable type, so your tests never reference an SDK object.

### Define the abstraction and your application logic

Declare an interface that exposes only the data your application needs from a scan, and put your logic in a type that depends on that interface. It never references `BarcodeCapture`, `BarcodeCaptureSession`, or `Barcode`.

```ts
// The app-facing abstraction — only what your logic needs.
export interface BarcodeScanReceiver {
  onScan(data: string, symbology: string): void;
}

// Your testable application logic.
export class CartModel implements BarcodeScanReceiver {
  readonly scannedItems: string[] = [];

  onScan(data: string, symbology: string): void {
    this.scannedItems.push(data);
  }
}
```

### Confine the SDK to a thin adapter

Create a single adapter that implements `BarcodeCaptureListener`. This is the only piece of code that touches the capture session. It extracts plain values from the result and forwards them to your interface.

```ts
import type { BarcodeCapture, BarcodeCaptureListener, BarcodeCaptureSession } from '@scandit/web-datacapture-barcode';
import type { FrameData } from '@scandit/web-datacapture-core';
import type { BarcodeScanReceiver } from './cart-model';

// The only code that depends on the live capture session.
export function createBarcodeCaptureAdapter(receiver: BarcodeScanReceiver): BarcodeCaptureListener {
  return {
    didScan(barcodeCapture: BarcodeCapture, session: BarcodeCaptureSession, frameData: FrameData) {
      const barcode = session.newlyRecognizedBarcode;
      if (barcode?.data) {
        receiver.onScan(barcode.data, barcode.symbology);
      }
    },
  };
}
```

### Set up the scanner

Wire up the context, settings, capture mode, and camera as usual — this mirrors the standard integration in the [Get Started](./barcode-capture/get-started.md) guide; the only difference is that the listener comes from the adapter above.

```ts
import { Camera, DataCaptureContext, FrameSourceState } from '@scandit/web-datacapture-core';
import { BarcodeCapture, BarcodeCaptureSettings, barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';
import { CartModel } from './cart-model';
import { createBarcodeCaptureAdapter } from './barcode-capture-adapter';

async function setupScanner(): Promise<void> {
  const context = await DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --', {
    libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
    moduleLoaders: [barcodeCaptureLoader()],
  });

  const settings = new BarcodeCaptureSettings();
  settings.enableSymbologies(['ean13Upca', 'code128']);

  const barcodeCapture = await BarcodeCapture.forContext(context, settings);

  // Route results into your own logic through the adapter.
  const cartModel = new CartModel();
  barcodeCapture.addListener(createBarcodeCaptureAdapter(cartModel));

  const camera = Camera.pickBestGuess();
  await camera.applySettings(BarcodeCapture.recommendedCameraSettings);
  await context.setFrameSource(camera);
  await camera.switchToDesiredState(FrameSourceState.On);
}
```

### Test your application logic

Because the logic only depends on your interface, the test calls it directly. No camera, no capture session, and no capture mode are involved.

```ts
import { describe, expect, it } from 'vitest';
import { CartModel } from './cart-model';

describe('CartModel', () => {
  it('adds a scanned item to the cart', () => {
    const cart = new CartModel();

    cart.onScan('0123456789012', 'ean13Upca');

    expect(cart.scannedItems).toEqual(['0123456789012']);
  });
});
```

:::note
The adapter and the scanner setup are intentionally minimal and are not covered by unit tests, since they depend on a live capture session. Exercise them through [integration testing](#integration-testing-your-pipeline) instead.
:::

This pattern (applied to a real sample, with the SDK-touching dependencies injected rather than closed over) is used, with a passing test, in [`BarcodeCaptureSimpleSample`](https://github.com/Scandit/datacapture-web-samples/blob/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimpleSample) — see `scanResult.ts` and `scanResult.test.ts`.

## Test With the SDK's Own Types Directly

If you would rather test your existing code without restructuring it, build a plain object that stands in for whatever the SDK would hand your listener, and call the listener directly.

### What to build, and how

| Type group | Examples | In a unit test |
|---|---|---|
| Listeners | `BarcodeCaptureListener`, `BarcodeBatchListener`, `SparkScanListener`, ID Capture's `Listener` | Implement directly with a plain object |
| `FrameData` | `FrameData` | Plain object implementing the interface |
| Modes | `BarcodeCapture`, `BarcodeBatch`, `SparkScan` | Not needed for listener tests — call the listener directly, no mode instance required |
| Sessions | `BarcodeCaptureSession`, `BarcodeBatchSession`, `SparkScanSession` | Plain object with the properties your code reads |
| Results | `Barcode`, `CapturedId` | Plain object with the properties your code reads |
| Settings | `BarcodeCaptureSettings`, `IdCaptureSettings`, `SparkScanSettings` | Construct the real object — these have public constructors |

:::note
`BarcodeCaptureSession`, `BarcodeBatchSession`, and `Barcode` have no public way to populate real data — their fields are private and set only internally while processing an active scan. Build a plain object literal with the properties your code reads instead of trying to construct one of these classes; in TypeScript, cast it (`as unknown as BarcodeCaptureSession`) if the compiler objects to the shape. `SparkScanSession` is the one exception — its fields are public and can be assigned to directly, with no cast.
:::

### Barcode Capture

```ts
import { describe, expect, it, vi } from 'vitest';
import type { BarcodeCaptureListener, BarcodeCaptureSession } from '@scandit/web-datacapture-barcode';

function createScanHandler(onScan: (data: string) => void): BarcodeCaptureListener {
  return {
    didScan(barcodeCapture, session, frameData) {
      const barcode = session.newlyRecognizedBarcode;
      if (barcode) {
        onScan(barcode.data);
      }
    },
  };
}

describe('createScanHandler', () => {
  it('forwards the scanned barcode data', () => {
    const onScan = vi.fn();
    const listener = createScanHandler(onScan);

    const fakeSession = {
      newlyRecognizedBarcode: { data: '0123456789012', symbology: 'ean13Upca' },
    } as unknown as BarcodeCaptureSession;

    listener.didScan(undefined, fakeSession, undefined);

    expect(onScan).toHaveBeenCalledWith('0123456789012');
  });
});
```

### MatrixScan (Barcode Batch)

`BarcodeBatchListener.didUpdateSession` receives a session exposing `trackedBarcodes`, `addedTrackedBarcodes`, and `removedTrackedBarcodes`. Stub the ones your code reads:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { BarcodeBatchListener, BarcodeBatchSession } from '@scandit/web-datacapture-barcode';

function createBatchHandler(onSeen: (values: string[]) => void): BarcodeBatchListener {
  return {
    didUpdateSession(barcodeBatch, session) {
      const values = session.addedTrackedBarcodes.map((tracked) => tracked.barcode.data);
      onSeen(values);
    },
  };
}

describe('createBatchHandler', () => {
  it('reports newly added tracked barcodes', () => {
    const onSeen = vi.fn();
    const listener = createBatchHandler(onSeen);

    const fakeSession = {
      addedTrackedBarcodes: [{ barcode: { data: 'SKU-42' } }],
    } as unknown as BarcodeBatchSession;

    listener.didUpdateSession(undefined, fakeSession);

    expect(onSeen).toHaveBeenCalledWith(['SKU-42']);
  });
});
```

### ID Capture

ID Capture's `Listener` methods mostly receive only the captured or rejected data, not the `IdCapture` instance itself, so most callbacks can be tested without an `IdCapture` at all:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { Listener } from '@scandit/web-datacapture-id';
import type { CapturedId } from '@scandit/web-datacapture-id';

function createIdHandler(onCaptured: (name: string) => void): Listener {
  return {
    didCaptureId(capturedId) {
      if (capturedId.fullName) {
        onCaptured(capturedId.fullName);
      }
    },
  };
}

describe('createIdHandler', () => {
  it('forwards the captured name', () => {
    const onCaptured = vi.fn();
    const listener = createIdHandler(onCaptured);

    const fakeCapturedId = { fullName: 'Jane Doe' } as unknown as CapturedId;

    listener.didCaptureId?.(fakeCapturedId);

    expect(onCaptured).toHaveBeenCalledWith('Jane Doe');
  });
});
```

:::note
`IdCapture` itself has a private constructor: it can only be produced via the asynchronous `IdCapture.forContext(context, settings)` factory, so it cannot be instantiated directly in a test. This does not block testing the listener above — only `didFailWithError(idCapture, error)` receives the `IdCapture` instance, and it is only passed through rather than called into, so a stub value is enough there.
:::

### SparkScan

`SparkScanSession`'s fields are public, so — unlike the other session types — it can be constructed with `new SparkScanSession()` and assigned to directly, with no cast:

```ts
import { describe, expect, it, vi } from 'vitest';
import { SparkScanSession, type SparkScanListener } from '@scandit/web-datacapture-barcode';

function createSparkScanHandler(onScan: (data: string) => void): SparkScanListener {
  return {
    didScan(sparkScan, session) {
      const barcode = session.newlyRecognizedBarcode;
      if (barcode) {
        onScan(barcode.data);
      }
    },
  };
}

describe('createSparkScanHandler', () => {
  it('forwards the scanned barcode data', () => {
    const onScan = vi.fn();
    const listener = createSparkScanHandler(onScan);

    const fakeSession = new SparkScanSession();
    fakeSession.newlyRecognizedBarcode = { data: '9782873334629' } as any;

    listener.didScan(undefined, fakeSession, undefined);

    expect(onScan).toHaveBeenCalledWith('9782873334629');
  });
});
```

### FrameData

`FrameData` is a plain interface (`width`, `height`, `isFrameSourceMirrored`, `getData()`, `toBlob()`), so a fake is a plain object implementing it:

```ts
const fakeFrameData = {
  width: 1920,
  height: 1080,
  isFrameSourceMirrored: false,
  getData: async () => null,
  toBlob: async () => null,
};
```

## Integration Testing Your Pipeline

The two approaches above are unit tests of your callback logic. To also confirm the whole pipeline works — your symbologies are enabled, your listener is registered, and the real, licensed engine actually decodes a frame — feed a real image instead of the camera. There are two ways to do this on Web, depending on what you want to exercise:

### Feed a static image directly with `ImageFrameSource`

[`ImageFrameSource`](https://docs.scandit.com/data-capture-sdk/web/core/api/image-frame-source.html) is a frame source built into the SDK for exactly this purpose: it bypasses the camera and `getUserMedia` entirely and feeds a static image directly into the same pipeline the camera would otherwise feed. This is the lightest-weight integration test, since it does not need a `Camera` at all:

```ts
import { DataCaptureContext, ImageFrameSource, FrameSourceState } from '@scandit/web-datacapture-core';
import { BarcodeCapture, BarcodeCaptureSettings, barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';

async function scanKnownImage(licenseKey: string, imageUrl: string): Promise<string[]> {
  const context = await DataCaptureContext.forLicenseKey(licenseKey, {
    libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
    moduleLoaders: [barcodeCaptureLoader()],
  });

  const settings = new BarcodeCaptureSettings();
  settings.enableSymbologies(['ean13Upca']);
  const barcodeCapture = await BarcodeCapture.forContext(context, settings);

  const scanned: string[] = [];
  barcodeCapture.addListener({
    didScan(_mode, session) {
      const barcode = session.newlyRecognizedBarcode;
      if (barcode?.data) {
        scanned.push(barcode.data);
      }
    },
  });

  const response = await fetch(imageUrl);
  const file = new File([await response.blob()], 'known-barcode.png');
  const frameSource = await ImageFrameSource.fromFile(file);
  await context.setFrameSource(frameSource);
  await frameSource.switchToDesiredState(FrameSourceState.On);

  return scanned;
}
```

### Mock the camera with `@eatsjobs/media-mock`

When your code specifically drives `navigator.mediaDevices.getUserMedia` — for example you want to exercise your own camera-permission handling, or run the exact same `Camera` frame source your production code uses rather than swap in `ImageFrameSource` — [`@eatsjobs/media-mock`](https://github.com/eatsjobs/media-mock) fakes `getUserMedia` at the browser API level. Your application code, the `Camera` frame source, and the real engine all run unmodified; only the physical webcam is replaced with a static image, video, or canvas:

```ts
import { MediaMock, devices } from '@eatsjobs/media-mock';
import { Camera, DataCaptureContext, FrameSourceState } from '@scandit/web-datacapture-core';
import { BarcodeCapture, BarcodeCaptureSettings, barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';

MediaMock.mock(devices['Mac Desktop']);
await MediaMock.setSource('./assets/barcode-1234567890128.png');

const context = await DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --', {
  libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
  moduleLoaders: [barcodeCaptureLoader()],
});

const settings = new BarcodeCaptureSettings();
settings.enableSymbologies(['ean13Upca']);
const barcodeCapture = await BarcodeCapture.forContext(context, settings);

const scanned: string[] = [];
barcodeCapture.addListener({
  didScan(_mode, session) {
    const barcode = session.newlyRecognizedBarcode;
    if (barcode?.data) {
      scanned.push(barcode.data);
    }
  },
});

const camera = Camera.pickBestGuess();
await camera.applySettings(BarcodeCapture.recommendedCameraSettings);
await context.setFrameSource(camera);
await camera.switchToDesiredState(FrameSourceState.On);
```

`@eatsjobs/media-mock` also has `simulateGetUserMediaError` for testing permission-denied or no-camera error paths, and runs equally well under Playwright for headless CI (its `TimerMode.SetInterval`, the default, is the most reliable choice under a virtual display).

:::note
Both techniques run against the real, licensed WebAssembly engine, so they need a valid license key and are slower than the unit tests above — keep them in a separate integration-test suite. `ImageFrameSource` skips the camera layer entirely, so it is the lighter-weight choice when you only need to verify decoding; use `@eatsjobs/media-mock` when the code path you want to test goes through `getUserMedia` and `Camera` itself.
:::

### Driving an already-built app with Playwright

The example above works because every line runs in one script, in order. Testing an **already-built app** with Playwright is different: your mock setup and the app's own entry script are two separate pieces of code racing each other, and `page.addInitScript()` does not block the page's own `<script>` tag from running while an async init script is still awaiting something.

Concretely: `@eatsjobs/media-mock`'s `getUserMedia` falls back to loading its default placeholder image if `setSource()` has not finished when `getUserMedia()` is first called. If your app calls `getUserMedia` early on load (most do), a plain `addInitScript` that calls `MediaMock.mock(...)` then `await MediaMock.setSource(...)` can lose the race, and the app ends up scanning the placeholder instead of your image.

Gate the app's entry script on your mock setup finishing, using `page.route()` to hold the request until a readiness flag is set, and package it as a reusable fixture so more than one spec can use it:

```ts
// e2e/fixtures.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type * as MediaMockModule from '@eatsjobs/media-mock';
import { test as base } from '@playwright/test';

declare global {
  interface Window {
    MediaMock: typeof MediaMockModule;
    scanditTestMediaMockReady: boolean;
  }
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaMockUmdSource = readFileSync(
  path.resolve(dirname, '../node_modules/@eatsjobs/media-mock/dist/main.umd.js'),
  'utf8'
);

export type MediaMockDeviceName = keyof typeof MediaMockModule.devices;

export interface MockedCameraFixtures {
  // Which media-mock device profile to emulate. Set per-project in playwright.config.ts (via
  // `use: { mediaMockDevice: ... }`) to match the real device the browser/engine combination is
  // standing in for -- media-mock only ships "iPhone 12", "Samsung Galaxy M53", and "Mac Desktop".
  mediaMockDevice: MediaMockDeviceName;
  mockCameraStream: (imageUrl: string) => Promise<void>;
}

export const test = base.extend<MockedCameraFixtures>({
  mediaMockDevice: ['Mac Desktop', { option: true }],

  mockCameraStream: async ({ page, mediaMockDevice }, use) => {
    async function mockCameraStream(imageUrl: string): Promise<void> {
      await page.route('**/index.ts', async (route) => {
        await page.waitForFunction(() => window.scanditTestMediaMockReady);
        await route.continue();
      });

      await page.addInitScript({ content: mediaMockUmdSource });
      await page.addInitScript(
        async ({ url, device }: { url: string; device: MediaMockDeviceName }) => {
          // Playwright also runs init scripts against its internal about:blank setup navigation,
          // before the real page loads. There is no valid origin there to resolve a relative
          // image URL against, so skip it -- the script re-runs correctly on the real navigation.
          if (window.location.protocol !== 'https:' && window.location.protocol !== 'http:') {
            return;
          }
          window.scanditTestMediaMockReady = false;
          const { MediaMock, devices } = window.MediaMock;
          MediaMock.mock(devices[device]);
          try {
            await MediaMock.setSource(url);
          } catch (error) {
            console.error('Failed to set media-mock source:', error);
            throw error;
          } finally {
            window.scanditTestMediaMockReady = true;
          }
        },
        { url: imageUrl, device: mediaMockDevice }
      );
    }

    await use(mockCameraStream);
  },
});

export { expect } from '@playwright/test';
```

```ts
// e2e/scan.spec.ts
import { expect, test } from './fixtures';

test('scans a real barcode image through a mocked camera', async ({ page, mockCameraStream }) => {
  await mockCameraStream('/ean13Upca_1234567890128.png');
  await page.goto('/');

  await expect(page.locator('.result-text')).toContainText('1234567890128', { timeout: 20_000 });
});
```

Replace `'**/index.ts'` with whatever glob matches your app's own entry script request, and `.result-text`/`ean13Upca_1234567890128.png` with your app's own DOM and test image.

### Testing across browser engines and form factors

media-mock ships exactly three device profiles: `"iPhone 12"`, `"Samsung Galaxy M53"`, and `"Mac Desktop"`. Map each Playwright project to whichever is the closest real device for that browser engine and form factor, using `mediaMockDevice` as a per-project option:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import type { MockedCameraFixtures } from './e2e/fixtures';

export default defineConfig<MockedCameraFixtures>({
  testDir: './e2e',
  projects: [
    // WebKit stands in for Safari: iPhone on mobile, Mac on desktop.
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'], mediaMockDevice: 'iPhone 12' } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'], mediaMockDevice: 'Mac Desktop' } },
    // Chromium and Firefox on mobile both stand in for Android -- media-mock has no separate
    // Firefox-for-Android profile.
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'], mediaMockDevice: 'Samsung Galaxy M53' } },
    {
      name: 'Mobile Firefox',
      // Playwright has no mobile-Firefox device preset (Firefox for Android isn't a distinct
      // rendering engine Playwright can drive) -- approximate it with desktop Firefox at a phone
      // viewport and a Firefox-for-Android user agent.
      use: {
        browserName: 'firefox',
        viewport: { width: 412, height: 915 },
        userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
        mediaMockDevice: 'Samsung Galaxy M53',
      },
    },
  ],
});
```

`scan.spec.ts` needs no changes — the same test runs once per project, each with its own emulated device.

This exact fixture, config, and test run against the real SDK build in [`BarcodeCaptureSimpleSample`](https://github.com/Scandit/datacapture-web-samples/blob/master/01_Single_Scanning_Samples/02_Barcode_Scanning_with_Low-level_API/BarcodeCaptureSimpleSample/e2e) (`pnpm run e2e`, once `SCANDIT_LICENSE_KEY` is set and `npx playwright install` has run for the browsers you target).

## Tips and Pitfalls

- Keep camera, `DataCaptureContext`, and view setup out of your unit tests — build only the plain objects your listener logic actually reads.
- The SDK delivers listener callbacks asynchronously in production. Calling the listener directly in a test is synchronous, so if your own code hands work to another queue or awaits a promise, await it before asserting.
- Prefer the isolation approach for new code — it keeps your tests independent of the SDK's types entirely. Reach for testing the SDK's types directly when retrofitting tests onto code that already implements a listener.
