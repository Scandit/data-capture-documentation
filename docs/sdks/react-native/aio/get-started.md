---
description: "Build a scanner in React Native with the Scandit AIO components: ScanditProvider, SparkScanAioView, camera control, and permissions."
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

Use an AIO view for a standard scanning screen. Use the classic
[Barcode Capture](../barcode-capture/get-started.md) path when you need to build the
capture pipeline yourself, for example to drive the camera or compose overlays your own
way. Both are supported.

In this guide you will learn step-by-step how to build a scanner with them. The
general steps are:

1. Wrap your app in `ScanditProvider`.
2. Add a scanning view and handle the barcodes it reads.
3. Navigate between two scanning screens.
4. Set the camera position and torch, and handle camera permissions.

## Prerequisites

- The latest stable version of [React Native CLI and other related tools and dependencies](https://reactnative.dev/docs/environment-setup).
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).
- If you have not already done so, see [this guide](../add-sdk.md) for information on how to add the Scandit Data Capture SDK to your project. This guide imports from two packages, so install both: `scandit-react-native-datacapture-core` and `scandit-react-native-datacapture-barcode`.
- Navigation is your own choice of library, and is not part of the Scandit SDK. The examples here use [React Navigation](https://reactnavigation.org/), which needs `@react-navigation/native` and `@react-navigation/stack`.

## Add the Provider

[ScanditProvider](https://docs.scandit.com/data-capture-sdk/react-native/core/api/scandit-provider.html) creates the
[DataCaptureContext](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-context.html) and the single
[Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html) that the AIO scanning views share, and tracks camera permission.
Every AIO view needs one above it.

It ships in the core package. Mount one at the root of your app and pass your license
key, which is the key from your Scandit dashboard or the test account linked above:

```js
import { NavigationContainer } from '@react-navigation/native';
import { ScanditProvider } from 'scandit-react-native-datacapture-core';

const LICENSE_KEY = 'YOUR_LICENSE_KEY_HERE';

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
      // Lets the view stop scanning when this screen loses focus, and start
      // again when it comes back. See Navigate Between Scanning Screens below.
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

`EAN13UPCA` and `Code128` are two common retail symbologies. Enable whichever ones you
need: the full list is in the
[Symbology](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/symbology.html) reference.

Render the screen inside the provider from the previous section, and you have a working
scanner:

```js
export default function App() {
  return (
    <ScanditProvider licenseKey={LICENSE_KEY}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Scan" component={ScanScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScanditProvider>
  );
}
```

`didScan` is called for each newly recognized barcode. If you need to do asynchronous work
before the next scan is processed, such as looking the barcode up, return a promise and
the view waits for it:

```js
didScan={async (barcodes) => {
  await lookupProduct(barcodes[0].data);
}}
```

:::tip
Declare `SYMBOLOGIES` outside the component, as above. A new array on every render is a
new value, which makes the view re-apply its settings more often than it needs to.
:::

### Calling the View Directly

Every AIO view exposes a **handle** through a `ref`. The handle carries the imperative
methods for that view, and every AIO view has `enable()` and `disable()` on it for turning
scanning on and off yourself:

```js
import { useRef } from 'react';

function ScanScreen({ navigation }) {
  const view = useRef(null);

  return (
    <>
      <SparkScanAioView
        ref={view}
        style={{ flex: 1 }}
        navigation={navigation}
        symbologies={SYMBOLOGIES}
        didScan={(barcodes) => console.log(barcodes[0]?.data)}
      />
      <Button title="Stop scanning" onPress={() => view.current?.disable()} />
    </>
  );
}
```

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
`torchState` and `cameraPosition` to the same camera the root owns. Nesting one around a
single screen is the supported way to control the camera for that screen only:

```js
import { CameraPosition, TorchState } from 'scandit-react-native-datacapture-core';

function TorchScreen({ navigation }) {
  return (
    <ScanditProvider
      torchState={TorchState.On}
      cameraPosition={CameraPosition.WorldFacing}>
      <ScanScreen navigation={navigation} />
    </ScanditProvider>
  );
}
```

:::note
`torchState` and `cameraPosition` are set-only. A nested provider does not restore the
previous values when it unmounts, so set what you need on the screen that needs it.
:::

:::warning
These props do not reach `SparkScanAioView`, because it drives its own camera. Set its
starting state through `SparkScanViewSettings.defaultTorchState` and
`SparkScanViewSettings.defaultCameraPosition`, and let the user change it with the view's
built-in controls: `torchControlVisible` and `cameraSwitchButtonVisible`.
:::

:::tip
Please refer to [ScanditProvider](https://docs.scandit.com/data-capture-sdk/react-native/core/api/scandit-provider.html) for the full list of parameters.
:::

## Camera Permissions

`useCameraPermission` reports the current permission state and asks for it:

```js
import { useEffect } from 'react';
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

## Troubleshooting

**Nothing happens when you point at a barcode.** The symbology is probably not enabled.
Only the symbologies in the array you pass are read, so a QR code is ignored by the
example above. Add it to `SYMBOLOGIES`, or check the
[Symbology](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/symbology.html) reference for the name you need.

**The preview is black, or freezes when you come back to a screen.** Two scanning views
are competing for the camera. Pass every view the screen's `navigation` object so that a
blurred screen releases the camera, and read
[Navigating Between Screens](./navigating-between-screens.md).

**The camera never starts and no permission dialog appears.** On Android, call
`requestPermission()` from `useCameraPermission`: the system prompt does not appear on its
own. On iOS the dialog is shown the first time the camera is used, so if it never appears,
no view has claimed the camera yet.

## Scan Some Barcodes

Now that you're up and running, go find some barcodes to scan. Don't feel like getting up
from your desk? Here's a [handy pdf of barcodes](https://github.com/Scandit/.github/blob/main/images/PrintTheseBarcodes.pdf) you can print out.

## Where to Go Next

- [Navigating Between Screens](./navigating-between-screens.md): the camera ownership model and the lifecycle props that control when each view scans.
- [ScanditProvider API reference](https://docs.scandit.com/data-capture-sdk/react-native/core/api/scandit-provider.html): every provider prop, in full.
- [Barcode Capture](../barcode-capture/get-started.md): the classic path, for when you need to build the capture pipeline yourself.
- [React Native samples](https://github.com/Scandit/datacapture-react-native-samples): complete applications you can build and run.
