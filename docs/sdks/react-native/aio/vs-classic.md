---
description: "Compare the AIO components with the classic API in React Native, and migrate an existing scanning screen across."
sidebar_label: 'vs. the Classic API'
title: 'AIO Components vs. the Classic API'
sidebar_position: 3
toc_max_heading_level: 3
framework: react
keywords:
  - react
---

# AIO Components vs. the Classic API

Version 8.7 adds a new, simplified way to build a scanning screen in React Native.

The AIO components internalize much of the complex logic in the classic components, leaving you to focus on your scanning workflow rather than on the component lifecycle.

Nothing was taken away. Every classic API still works exactly as it did, and existing screens keep running untouched. This page explains what the AIO components do for you, which API to reach for, and how to migrate a screen.

<!-- TODO(SDC-33129): link the getting-started guide once it is published. The page is
     docs/sdks/react-native/aio/get-started.md, so the link becomes:
     [Get Started](/sdks/react-native/aio/get-started)
     It is a comment rather than a live link because onBrokenLinks is "throw" for
     production builds, so linking an unpublished page fails CI. -->

If you are starting a new app, begin with the AIO components getting-started guide. For installing the SDK and setting your license key, see [Installation](/sdks/react-native/add-sdk).

## The classic API comes in two shapes

Both shapes share one thing: **you own the `DataCaptureContext`.** You initialize it, you attach modes to it, and you dispose of it when you are done scanning. You also decide when scanning starts and stops as the screen comes and goes.

```js
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';

DataCaptureContext.initialize(LICENSE_KEY);

export default DataCaptureContext.sharedInstance;
```

### Modes that need a `DataCaptureView`

`BarcodeCapture`, `BarcodeBatch`, `IdCapture` and `LabelCapture` have no view of their own. You assemble the screen: create the mode from its settings and attach it to the context, register a listener, build an overlay, create a `Camera` and set it as the context's frame source, render a `DataCaptureView`, add the overlay to it, and drive the camera as the screen gains and loses focus.

```js
// settings -> mode -> listener -> attach to the context
const settings = new BarcodeCaptureSettings();
settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.QR]);

const barcodeCapture = new BarcodeCapture(settings);
barcodeCapture.addListener({
  didScan: async (_, session) => onScan(session.newlyRecognizedBarcode),
});
dataCaptureContext.setMode(barcodeCapture);

// camera -> frame source -> on
const camera = Camera.withSettings(BarcodeCapture.createRecommendedCameraSettings());
await dataCaptureContext.setFrameSource(camera);
await camera.switchToDesiredState(FrameSourceState.On);

// overlay -> view, and removeMode on unmount
const overlay = new BarcodeCaptureOverlay(barcodeCapture);
```

This is where the AIO components change the most, because all of that scaffolding moves into the component.

:::note[These four are the modes with an AIO component]
Other modes also need a `DataCaptureView`—Barcode Selection is one. The four named above are the `DataCaptureView` modes that have an AIO equivalent in 8.7. Barcode Pick, Barcode Find and Barcode Selection have none, and stay on the classic API.
:::

### Modes that ship their own view

`SparkScanView`, `BarcodeCountView`, `BarcodeArView`, `BarcodePickView` and `BarcodeFindView` already render their own native view, so there is no `DataCaptureView` and no overlay to assemble. You still initialize the context, construct the mode, pass both to the view, and manage the context's lifetime.

To see what you were expected to own with these, look at one of the [public samples](https://github.com/Scandit/datacapture-react-native-samples): List Building for SparkScan, MatrixScan Count for Barcode Count, MatrixScan Simple for Barcode Batch.

## What the AIO components change

A single `ScanditProvider` near the root of your app initializes the context and owns the camera. Each `*AioView` below it owns its own mode, overlay and camera claim, takes its configuration as props, and reports results through callback props.

```jsx
<ScanditProvider licenseKey={LICENSE_KEY}>
  <NavigationContainer>{/* your screens */}</NavigationContainer>
</ScanditProvider>
```

**You no longer manage any lifecycle.** That is the difference that matters, and it covers all of it:

| You used to own | With an AIO component |
| --- | --- |
| The `DataCaptureContext`—initialize, attach modes, dispose | Owned by `ScanditProvider` |
| The capture mode—construct, attach, remove on unmount | Built from props |
| The camera—acquire, configure, turn off when hidden | Owned by `ScanditProvider` |
| The overlay—build it, add it to the view | A prop object |
| Listeners—register and unregister | Callback props |
| Screen focus and app background | Handled from your navigation object |

The context is a shared instance either way: `DataCaptureContext.initialize()` returns `DataCaptureContext.sharedInstance`, and so does the provider.

:::tip[Migrate one screen at a time]
Because there is only one context, the two APIs mix freely. You can wrap your whole app in a `ScanditProvider` and leave existing classic screens exactly as they are; they keep calling `DataCaptureContext.sharedInstance` and keep working.
:::

### The components

Seven capture modes have an AIO component in 8.7:

| Mode | Classic | AIO |
| --- | --- | --- |
| [Barcode Capture](/sdks/react-native/barcode-capture/get-started) | mode + `DataCaptureView` | `BarcodeCaptureAioView` |
| [Barcode Batch](/sdks/react-native/matrixscan/intro) | mode + `DataCaptureView` | `BarcodeBatchAioView` |
| [ID Capture](/sdks/react-native/id-capture/intro) | mode + `DataCaptureView` | `IdCaptureAioView` |
| [Label Capture](/sdks/react-native/label-capture/intro) | mode + `DataCaptureView` | `LabelCaptureAioView` |
| [SparkScan](/sdks/react-native/sparkscan/intro) | `SparkScanView` | `SparkScanAioView` |
| [Barcode Count](/sdks/react-native/matrixscan-count/intro) | `BarcodeCountView` | `BarcodeCountAioView` |
| [Barcode AR](/sdks/react-native/matrixscan-ar/intro) | `BarcodeArView` | `BarcodeArAioView` |

:::note[Each view exposes what its mode has]
An AIO view's props mirror its mode's own API. Barcode Capture, Barcode Batch, ID Capture and Label Capture have overlay objects in the SDK, so their views take `*Overlay` props. SparkScan, Barcode Count and Barcode AR have no overlay, so their visual properties—brushes, providers, view settings—sit directly on the view, exactly as on the classic components.
:::

### How you configure the mode

You never construct the mode. Each AIO view takes a `symbologies` array for the common case and a full settings object when you need more control. If you pass both, the settings object wins and the component warns that the shorthand was ignored.

```jsx
{/* shorthand */}
<BarcodeCaptureAioView symbologies={[Symbology.QR, Symbology.EAN13UPCA]} />

{/* full control */}
<BarcodeCaptureAioView barcodeCaptureSettings={settings} />
```

### How overlays are configured

This applies to the four modes that needed manual assembly. The overlay was a separate object you built and added to the `DataCaptureView`. On the AIO view it is a prop object instead: `basicOverlay`, plus `advancedOverlay` where the mode has one. SparkScan, Barcode Count and Barcode AR have no overlay, so this does not apply to them.

```jsx
<BarcodeBatchAioView
  symbologies={[Symbology.EAN13UPCA]}
  didScan={tracked => onTracked(tracked)}
  basicOverlay={{
    style: BarcodeBatchBasicOverlayStyle.Frame,
    shouldShowScanAreaGuides: true,
    brushForTrackedBarcode: tracked => brushFor(tracked),
  }}
/>
```

Pass `{ enabled: false }` to skip an overlay, or omit the prop to take the defaults.

### How you receive results

Instead of registering a listener on the mode, you pass callback props. Every AIO view exposes `didScan`, called with the newly recognized barcodes, the session, and a function that resolves the frame data. `didUpdateSession` fires on every session update, before `didScan` for the same update.

```jsx
<BarcodeCaptureAioView
  didScan={(barcodes, session, getFrameData) => onScan(barcodes)}
  didUpdateSession={session => track(session)}
/>
```

:::note[ID Capture reports differently]
`IdCaptureAioView` has no `didScan`. It reports through `didCaptureId` and `didRejectId` instead, which carry the captured or rejected document rather than a session.
:::

### Camera configuration

The provider owns the camera, so `frameSourceState`, `cameraPosition`, `torchState` and `cameraSettings` are props on `ScanditProvider` rather than on the view. A nested `ScanditProvider` around a single screen sets them for that screen only; values it applies are not reverted when it unmounts.

```jsx
<ScanditProvider
  frameSourceState={isFocused ? FrameSourceState.On : FrameSourceState.Off}
  torchState={torch}
  cameraPosition={CameraPosition.WorldFacing}>
  <BarcodeCaptureAioView
    style={{ flex: 1 }}
    symbologies={[Symbology.QR]}
    didScan={barcodes => onScan(barcodes)}
  />
</ScanditProvider>
```

:::warning[SparkScan drives its own camera]
`SparkScanAioView` claims the camera exclusively, so the provider's `torchState` and `cameraPosition` do not reach it. Set the starting state through `SparkScanViewSettings.defaultTorchState` and `defaultCameraPosition` instead, and let the user change it with the view's built-in torch and camera-switch controls.
:::

### Starting and stopping as screens change

The AIO views suspend scanning while a screen is blurred or the app is backgrounded, and resume when it returns. Pass your navigation object:

```jsx
<SparkScanAioView
  navigation={navigation}
  symbologies={[Symbology.EAN13UPCA]}
  didScan={barcodes => onScan(barcodes)}
/>
```

React Navigation works out of the box. The prop is typed structurally as `ScanditNavigationProp`, which asks only for `addListener('focus' | 'blur', callback)` returning an unsubscribe function, so any other navigation library, or your own code, can drive it by implementing that one method.

You do not have to use a navigation library at all. The `disabled` prop keeps scanning off regardless of focus, and every AIO view's handle exposes `enable()` and `disable()` for direct control. `SparkScanAioViewHandle` and `BarcodeCountAioViewHandle` additionally expose `reset()`, which clears the current scanning session; both warn and do nothing if the view is not attached, so they are safe to call during a screen transition.

```jsx
const ref = useRef(null);

<BarcodeCaptureAioView ref={ref} disabled={isPaused} />;

// or imperatively
await ref.current.disable();
```

Set `appStateHandlingDisabled` if you want to handle app-state changes yourself.

## Which one to use

**Use the AIO components for new code.** The plumbing they take over is the same on every screen, and the place it most often goes wrong is navigating between two scanning screens.

**Stay on the classic API** if you need Barcode Pick, Barcode Find or Barcode Selection, which have no AIO component yet, or if you need to build your own view: the hooks the AIO views use are internal in 8.7.

An existing screen that works does not need rewriting.

## Migrating a screen

The shape of every migration is the same:

1. Wrap your app in a `ScanditProvider` with your license key, once.
2. Delete the context initialization, the mode construction, the listener registration, the overlay construction and the camera setup from the screen.
3. Replace the classic component with its AIO equivalent, moving settings to props and the listener to `didScan`.
4. Move any per-screen camera or torch state to a nested `ScanditProvider`.

### `BarcodeCapture`

The largest change, because the classic path has no view component at all.

**Before:**

```jsx
function ScanPage() {
  const viewRef = useRef(null);
  const modeRef = useRef(null);
  const cameraRef = useRef(null);

  if (!modeRef.current) {
    modeRef.current = setupScanning();
  }

  const overlayRef = useRef(null);
  if (!overlayRef.current) {
    overlayRef.current = new BarcodeCaptureOverlay(modeRef.current);
  }

  useEffect(() => {
    const mode = modeRef.current;
    return () => dataCaptureContext.removeMode(mode);
  }, []);

  function setupScanning() {
    const settings = new BarcodeCaptureSettings();
    settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.QR]);

    const barcodeCapture = new BarcodeCapture(settings);
    barcodeCapture.addListener({
      didScan: async (_, session) => onScan(session.newlyRecognizedBarcode),
    });

    setupCamera();
    dataCaptureContext.setMode(barcodeCapture);
    return barcodeCapture;
  }

  async function setupCamera() {
    const camera = Camera.withSettings(
      BarcodeCapture.createRecommendedCameraSettings()
    );
    cameraRef.current = camera;
    await dataCaptureContext.setFrameSource(camera);
    await camera.switchToDesiredState(FrameSourceState.On);
  }

  return (
    <DataCaptureView
      style={{ flex: 1 }}
      context={dataCaptureContext}
      ref={view => {
        if (view && !viewRef.current) {
          view.addOverlay(overlayRef.current);
          viewRef.current = view;
        }
      }}
    />
  );
}
```

**After:**

```jsx
function ScanPage() {
  return (
    <BarcodeCaptureAioView
      style={{ flex: 1 }}
      symbologies={[Symbology.EAN13UPCA, Symbology.QR]}
      didScan={barcodes => onScan(barcodes[0])}
      basicOverlay={{ viewfinder: new RectangularViewfinder() }}
    />
  );
}
```

The context, the mode, the listener, the overlay, the camera and the unmount cleanup are all gone.

### `LabelCapture`

**Before:**

```jsx
const camera = Camera.withSettings(LabelCapture.createRecommendedCameraSettings());
dataCaptureContext.setFrameSource(camera);

const labelCapture = new LabelCapture(settings);
labelCapture.addListener({
  didUpdateSession: (_, session) => onLabels(session.capturedLabels),
});
dataCaptureContext.setMode(labelCapture);

// ...then, in the component, add one or both overlays to the view:
const basicOverlay = new LabelCaptureBasicOverlay(labelCapture);
const validationFlow = new LabelCaptureValidationFlowOverlay(labelCapture);
```

**After:**

```jsx
<LabelCaptureAioView
  style={{ flex: 1 }}
  labelCaptureSettings={settings}
  didScan={labels => onLabels(labels)}
  validationFlowOverlay={{
    settings: flowSettings,
    didCaptureLabelWithFields: fields => onFields(fields),
  }}
/>
```

`LabelCaptureAioView` also accepts `labelDefinitions` as a shorthand in place of a full `LabelCaptureSettings`.

:::warning[Three of its four overlays compete]
`basicOverlay` is independent, but `advancedOverlay`, `validationFlowOverlay` and `adaptiveRecognitionOverlay` are mutually exclusive with a fixed precedence: adaptive recognition wins over both others, and the validation flow wins over the advanced overlay. A losing overlay is silently skipped, so pass only the one you want.
:::

### The other modes

Barcode Batch and ID Capture follow the Barcode Capture shape above: drop the mode, the listener, the overlay and the camera, then move the overlay's options into `basicOverlay`.

SparkScan, Barcode Count and Barcode AR are simpler still, because their classic views already render their own native view. Drop the `context` prop and the constructed mode, and keep the rest of the props roughly as they were. Barcode AR loses one extra thing worth noting: the classic `BarcodeArView` needs an explicit `view.start()` through the ref, and the AIO view does not.

---

If you are unsure how to migrate a particular screen, reach out to our [support team](mailto:support@scandit.com).
