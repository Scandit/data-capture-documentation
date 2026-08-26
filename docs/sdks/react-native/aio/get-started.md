---
description: "Build a scanner in React Native with the Scandit AIO components: ScanditProvider, SparkScanAioView, and navigating between scanning screens."
sidebar_label: 'Get Started'
title: 'Get Started'
sidebar_position: 2
framework: react
keywords:
  - react
---

# Get Started

The AIO ("all-in-one") components are React scanning views that own their own capture
mode, overlay, camera claim and lifecycle. You render one component instead of
assembling a context, a mode, a view and an overlay by hand.

They are available from version 8.7.

In this guide you will learn step-by-step how to build a scanner with them. The
general steps are:

1. Wrap your app in `ScanditProvider`.
2. Add a scanning view and handle the barcodes it reads.
3. Navigate between two scanning screens.
4. Set the camera position and torch, and handle camera permissions.

## Prerequisites

- The latest stable version of [React Native CLI and other related tools and dependencies](https://reactnative.dev/docs/environment-setup).
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.md) for information on how to add the Scandit Data Capture SDK to your project.

## Add the Provider

[ScanditProvider](https://docs.scandit.com/data-capture-sdk/react-native/core/api/scandit-provider.html) creates the
[DataCaptureContext](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-context.html) and the single
[Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html) that the AIO scanning views share, and tracks camera permission.
Every AIO view needs one above it.

It ships in the core package. Mount one at the root of your app and pass your license
key:

```js
import { ScanditProvider } from 'scandit-react-native-datacapture-core';

export default function App() {
  return (
    <ScanditProvider licenseKey={LICENSE_KEY}>
      <NavigationContainer>{/* your screens */}</NavigationContainer>
    </ScanditProvider>
  );
}
```

That is all the setup a first scanner needs.

## Add a Scanning View

`SparkScanAioView` is the quickest view to start with: it brings its own scanning UI,
including the trigger button and the mini preview.

Pass the symbologies you want to read, and a `didScan` callback to receive them:

```js
import { SparkScanAioView, Symbology } from 'scandit-react-native-datacapture-barcode';

const SYMBOLOGIES = [Symbology.EAN13UPCA, Symbology.Code128];

function ScanScreen({ navigation }) {
  return (
    <SparkScanAioView
      style={{ flex: 1 }}
      navigation={navigation}
      symbologies={SYMBOLOGIES}
      didScan={(barcodes) => {
        for (const barcode of barcodes) {
          console.log(barcode.data);
        }
      }}
    />
  );
}
```

`didScan` is called for each newly recognized barcode. Return a `Promise` from it to keep
the frame alive while asynchronous work runs.

:::tip
Declare `SYMBOLOGIES` outside the component, as above. A new array on every render is a
new value, which makes the view re-apply its settings more often than it needs to.
:::

## Navigate Between Scanning Screens

Two scanning screens cannot both drive the camera. The newest view to claim it takes
ownership, and passing each view the screen's `navigation` object suspends scanning while
that screen is blurred.

See [Navigating Between Screens](./navigating-between-screens.md) for the ownership model
and the lifecycle props that control when each view scans.

## Camera Position and Torch

For the views that share the provider's camera, set the torch and camera position on the
provider. The outermost provider is the **root**: it creates the context and the camera,
and disposes of both when it unmounts. `licenseKey` is required there and ignored, with a
warning, anywhere else.

A provider mounted below another is **nested**. It creates nothing, and applies its own
`frameSourceState`, `torchState` and `cameraPosition` to the same camera the root owns.
Nesting one around a single screen is the supported way to control the camera for that
screen only:

```js
import { CameraPosition, TorchState } from 'scandit-react-native-datacapture-core';

<ScanditProvider
  torchState={TorchState.On}
  cameraPosition={CameraPosition.WorldFacing}>
  <CaptureScreen />
</ScanditProvider>;
```

:::note
`torchState`, `cameraPosition` and `cameraSettings` are set-only. A nested provider does
not restore the previous values when it unmounts, so set what you need on the screen that
needs it. `frameSourceState` behaves differently: `On` holds a camera claim only while
that provider stays mounted, and the claim is released when it unmounts.
:::

:::warning
These props do not reach `SparkScanAioView`, because it drives its own camera. Set its
starting state through `SparkScanViewSettings.defaultTorchState` and
`SparkScanViewSettings.defaultCameraPosition`, and let the user change it with the view's
built-in controls — `torchControlVisible` and `cameraSwitchButtonVisible`.
:::

:::tip
Please refer to [ScanditProvider](https://docs.scandit.com/data-capture-sdk/react-native/core/api/scandit-provider.html) for the full list of parameters.
:::

## Camera Permissions

`useCameraPermission` reports the current permission state and asks for it:

```js
import { useCameraPermission } from 'scandit-react-native-datacapture-core';

function CameraGate({ children }) {
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return hasPermission ? children : null;
}
```

:::note
The two platforms behave differently. On Android the hook reports the real status,
`requestPermission()` shows the system prompt, and the status is re-checked when your app
returns to the foreground. On iOS the system shows its own dialog the first time the
camera is used, so the hook reports `not-determined` until that happens.
:::

## React Native Architecture Support

The AIO components run on both React Native architectures.

The new architecture is the default for new applications, and React Native 0.82 and later
run it exclusively. The legacy ("Paper") architecture is also supported: every AIO view
has been verified rendering on it, on both iOS and Android, on React Native 0.81.4 and
0.74.7.

:::note
React Native 0.74 is the lowest version verified against this SDK. Older releases are not
supported.
:::

## Scan Some Barcodes

Now that you're up and running, go find some barcodes to scan. Don't feel like getting up
from your desk? Here's a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can print out.

## Where to Go Next

- [Navigating Between Screens](./navigating-between-screens.md): the camera ownership model and the lifecycle props that control when each view scans.
- [React Native samples](https://github.com/Scandit/datacapture-react-native-samples): complete applications you can build and run.
