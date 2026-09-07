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

Scanning happens against live camera frames delivered through the browser's `getUserMedia` API, then decoded internally using Web Workers, canvas, and WebAssembly. None of these are available in most unit test environments (Node, jsdom, happy-dom), so a unit test can never exercise the real decoding engine — only the code around it. The capture modes, sessions, and result objects the SDK hands to your listeners are also produced internally during a live scan, so they cannot be constructed with real data directly.

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
import type { Symbology } from '@scandit/web-datacapture-barcode';

// The app-facing abstraction — only what your logic needs.
export interface BarcodeScanReceiver {
  onScan(data: string, symbology: Symbology): void;
}

// Your testable application logic.
export class CartModel implements BarcodeScanReceiver {
  readonly scannedItems: string[] = [];

  onScan(data: string, symbology: Symbology): void {
    this.scannedItems.push(data);
  }
}
```

`Symbology` is a plain string enum, so it's safe to use in your abstraction and to construct directly in tests. Only the capture mode, session, and result objects need to be kept out of your logic.

### Confine the SDK to a thin adapter

Create a single adapter that implements `BarcodeCaptureListener`. This is the only piece of code that touches the capture session. It extracts plain values from the result and forwards them to your interface.

```ts
import type { BarcodeCapture, BarcodeCaptureListener, BarcodeCaptureSession } from '@scandit/web-datacapture-barcode';
import type { FrameData } from '@scandit/web-datacapture-core';
import type { BarcodeScanReceiver } from './cart-model';

// The only code that depends on the live capture session.
export function createBarcodeListener(receiver: BarcodeScanReceiver): BarcodeCaptureListener {
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

### Set up the scanner with your abstraction

Wire up the context, settings, capture mode, camera, and view as usual — this follows the same sequence as [`BarcodeCaptureSimpleSample`](https://github.com/Scandit/datacapture-web-samples) — the only difference is that the listener comes from the adapter above.

```ts
import { BarcodeCapture, BarcodeCaptureOverlay, BarcodeCaptureSettings, Symbology, barcodeCaptureLoader } from '@scandit/web-datacapture-barcode';
import { Camera, DataCaptureContext, DataCaptureView, FrameSourceState } from '@scandit/web-datacapture-core';
import { CartModel } from './cart-model';
import { createBarcodeListener } from './barcode-capture-adapter';

async function setupScanner(): Promise<void> {
  // To visualize the ongoing loading process on screen, the view must be connected before the SDK finishes loading.
  const view = new DataCaptureView();

  // Let the SDK select the best camera, and start the stream immediately so the preview appears as
  // soon as possible, without waiting for the SDK to finish loading.
  const camera = Camera.pickBestGuess();
  await camera.applySettings(BarcodeCapture.recommendedCameraSettings);
  void camera.switchToDesiredState(FrameSourceState.On);
  view.connectToElement(document.getElementById('data-capture-view')!, { camera });

  const context = await DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --', {
    libraryLocation: new URL('self-hosted-sdc-lib/', document.baseURI).toString(),
    moduleLoaders: [barcodeCaptureLoader()],
  });

  // The view must be connected to the data capture context once it's ready.
  await view.setContext(context);
  await context.setFrameSource(camera);

  const settings = new BarcodeCaptureSettings();
  settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128]);

  const barcodeCapture = await BarcodeCapture.forContext(context, settings);

  // Route results into your own logic through the adapter.
  const cartModel = new CartModel();
  const listener = createBarcodeListener(cartModel);
  barcodeCapture.addListener(listener);

  // Add a default overlay to the view to visualize the scan process.
  await BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);

  // Re-affirm the desired camera state now that it's wired to the context, matching the sample.
  await context.frameSource?.switchToDesiredState(FrameSourceState.On);
}
```

### Test your application logic

Because the logic only depends on your interface, the test calls it directly. No camera, no capture session, and no capture mode are involved.

```ts
import { describe, expect, it } from 'vitest';
import { Symbology } from '@scandit/web-datacapture-barcode';
import { CartModel } from './cart-model';

describe('CartModel', () => {
  it('adds a scanned item to the cart', () => {
    const cart = new CartModel();

    cart.onScan('0123456789012', Symbology.EAN13UPCA);

    expect(cart.scannedItems).toEqual(['0123456789012']);
  });
});
```

:::note
The adapter and the scanner setup are not covered by unit tests, since they depend on a live capture session. Exercise them through [integration testing](#integration-testing-your-pipeline) instead.
:::

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
import { Symbology, type BarcodeCaptureListener, type BarcodeCaptureSession } from '@scandit/web-datacapture-barcode';

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
      newlyRecognizedBarcode: { data: '0123456789012', symbology: Symbology.EAN13UPCA },
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

## Integration Testing Your Pipeline

Chromium has a built-in way to feed a real file into `getUserMedia` without any library: `--use-fake-device-for-media-stream` together with `--use-file-for-fake-video-capture=<path>.y4m` plays a `.y4m` video as the webcam. It only covers Chromium, though — Firefox and WebKit have no equivalent flag in Playwright — and it needs your test image pre-converted into a `.y4m` video rather than just pointing at a plain image file. [`@eatsjobs/media-mock`](https://github.com/eatsjobs/media-mock) covers the same need — a real image feeding the real decoding pipeline — consistently across all three engines, from a plain image URL:

```ts
// e2e/fixtures.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type * as MediaMockModule from '@eatsjobs/media-mock';
import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

declare global {
  interface Window {
    MediaMock: typeof MediaMockModule;
  }
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaMockUmdSource = readFileSync(
  path.resolve(dirname, '../node_modules/@eatsjobs/media-mock/dist/main.umd.js'),
  'utf8'
);

export type MediaMockDeviceName = keyof typeof MediaMockModule.devices;

// Wraps @eatsjobs/media-mock's setup for a Playwright page: injecting the library, picking the
// device profile to emulate, and pointing getUserMedia at a real image.
export class MediaMockFacade {
  private readonly page: Page;

  private readonly mediaMockDevice: MediaMockDeviceName;

  public constructor(page: Page, mediaMockDevice: MediaMockDeviceName) {
    this.page = page;
    this.mediaMockDevice = mediaMockDevice;
  }

  public async inject(): Promise<void> {
    await this.page.addInitScript({ content: mediaMockUmdSource });
  }

  public async mock(): Promise<void> {
    await this.page.addInitScript(
      async ({ device }: { device: MediaMockDeviceName }) => {
        // Playwright also runs init scripts against its internal about:blank setup navigation,
        // before the real page loads. There is no valid origin there to resolve a relative image
        // URL against, so skip it -- the script re-runs correctly on the real navigation.
        if (window.location.protocol !== 'https:' && window.location.protocol !== 'http:') {
          return;
        }
        const { MediaMock, devices } = window.MediaMock;
        MediaMock.mock(devices[device]);
      },
      { device: this.mediaMockDevice }
    );
  }

  public async setSource(imageUrl: string): Promise<void> {
    await this.page.addInitScript(async ({ url }) => {
      const { MediaMock } = window.MediaMock;
      try {
        await MediaMock.setSource(url);
      } catch (error) {
        console.error('Failed to set media-mock source:', error);
        throw error;
      }
    }, { url: imageUrl });
  }

  // Takes effect on the page's *next* navigation, like any addInitScript call -- call it before
  // a subsequent page.goto() within the same test, not after your assertions. Each Playwright
  // test already gets a fresh browser context by default, so most suites never need this between
  // tests; it matters only if you navigate more than once within a single test.
  public async unmock(): Promise<void> {
    await this.page.addInitScript(() => {
      const { MediaMock } = window.MediaMock;
      MediaMock.unmock();
    });
  }
}

export interface MockedCameraFixtures {
  // Which media-mock device profile to emulate. Set per-project in playwright.config.ts (via
  // `use: { mediaMockDevice: ... }`) to match the real device the browser/engine combination is
  // standing in for -- media-mock only ships "iPhone 12", "Samsung Galaxy M53", and "Mac Desktop".
  mediaMockDevice: MediaMockDeviceName;
  mediaMockFacade: MediaMockFacade;
}

export const test = base.extend<MockedCameraFixtures>({
  mediaMockDevice: ['Mac Desktop', { option: true }],

  mediaMockFacade: async ({ page, mediaMockDevice }, use) => {
    const mediaMockFacade = new MediaMockFacade(page, mediaMockDevice);
    await mediaMockFacade.inject();
    await use(mediaMockFacade);
  },
});

export { expect } from '@playwright/test';
```

```ts
// e2e/scan.spec.ts
import { expect, test } from './fixtures';

test.describe('scanning a barcode with a mocked camera', () => {
  test.beforeEach(async ({ mediaMockFacade }) => {
    await mediaMockFacade.mock();
    await mediaMockFacade.setSource('/ean13Upca_1234567890128.png');
  });

  test.afterEach(async ({ mediaMockFacade }) => {
    await mediaMockFacade.unmock();
  });

  test('scans a real barcode image through a mocked camera', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText("Loading the Scandit Sdk...")).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText("1234567890128")).toBeVisible({ timeout: 20_000 });

    await expect(page.locator("button", { hasText: "OK" })).toBeVisible({ timeout: 20_000 });
  });
});
```

Replace `ean13Upca_1234567890128.png` with your own test image, and the `getByText` assertion with whatever your app renders on a successful scan.

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

### Enabling WebGL Acceleration and Multithreading

The SDK's engine uses WebGL for GPU-accelerated frame processing and, where the browser supports it, multithreaded WebAssembly for a further speedup. Neither is on by default under Playwright: headless browsers commonly run without real GPU access, and multithreading additionally requires the page itself to be cross-origin isolated, which most dev/preview servers don't set up out of the box. Neither gap fails a test outright — the SDK falls back to a slower path — so a suite can pass while silently exercising a code path your users' browsers never take.

#### WebGL

Headless browsers typically disable or emulate the GPU rather than expose the real one, so WebGL needs to be forced on explicitly, through whatever mechanism your browser engine exposes via Playwright's `launchOptions`:

- **Chromium-based browsers** take command-line flags via `launchOptions.args` — for example `--enable-webgl`, `--ignore-gpu-blocklist`, and `--disable-software-rasterizer`. The exact set worth passing depends on your Chromium version and CI environment; [Chromium's command-line switches reference](https://peter.sh/experiments/chromium-command-line-switches/) documents what's available.
- **Firefox** doesn't take Chromium flags at all; use `launchOptions.firefoxUserPrefs` instead — e.g. `webgl.force-enabled` and `webgl.disable-fail-if-major-performance-caveat` — mirroring what you'd otherwise set in `about:config`.
- **WebKit** generally needs nothing extra in Playwright's bundled build.

```ts
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { launchOptions: { args: ['--enable-webgl', '--ignore-gpu-blocklist', '--disable-software-rasterizer'] } },
    },
    {
      name: 'firefox',
      use: {
        launchOptions: {
          firefoxUserPrefs: { 'webgl.force-enabled': true, 'webgl.disable-fail-if-major-performance-caveat': true },
        },
      },
    },
  ],
});
```

Treat this as a starting point rather than a fixed list — confirm what your specific Playwright/Chromium version needs by checking whether WebGL is actually active, the same way you'd verify cross-origin isolation below.

#### Multithreading

Multithreading needs the page to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated) (`SharedArrayBuffer` is otherwise unavailable). This is a property of the HTTP headers your web server sends, not something a Playwright launch option can turn on: configure whatever serves your app under test — your `webServer` command, or whatever it proxies to — with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (or `credentialless` if the engine is loaded from a CDN). See [Improve Runtime Performance by Enabling Browser Multithreading](/sdks/web/matrixscan/get-started/#improve-runtime-performance-by-enabling-browser-multithreading) for the exact configuration across common server technologies, including Vite, which most Playwright `webServer` setups build on.

Some engines gate `SharedArrayBuffer` behind an additional preference on top of the headers — for instance Firefox's `javascript.options.shared_memory`, set through `launchOptions.firefoxUserPrefs`. Check your target engine's equivalent if the check below confirms cross-origin isolation but multithreading still doesn't engage.

Verify the setup actually took effect from inside the test, rather than assuming the headers or flags worked. `window.crossOriginIsolated` is the one universal, engine-agnostic signal Playwright can read without depending on your app:

```ts
test('the page is cross-origin isolated', async ({ page }) => {
  await page.goto('/');

  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
});
```

The SDK itself checks more than that one flag — `BrowserHelper.checkMultithreadingSupport()` additionally confirms `SharedArrayBuffer` and nested Web Worker support, not just cross-origin isolation:

```ts
import { BrowserHelper } from '@scandit/web-datacapture-core';

const supportsMultithreading = await BrowserHelper.checkMultithreadingSupport();
```

This runs in the page, not in the Playwright test process, so call it from your own app code (the same way you would outside of testing) and surface the result somewhere your test can read it — a small on-page status element, a `data-*` attribute, or a value exposed on `window` for the test to pick up via `page.evaluate`.

## Tips and Pitfalls

- Keep camera, `DataCaptureContext`, and view setup out of your unit tests — build only the plain objects your listener logic actually reads.
- The SDK delivers listener callbacks asynchronously in production. Calling the listener directly in a test is synchronous, so if your own code hands work to another queue or awaits a promise, await it before asserting.
- Prefer the isolation approach for new code — it keeps your tests independent of the SDK's types entirely. Reach for testing the SDK's types directly when retrofitting tests onto code that already implements a listener.
