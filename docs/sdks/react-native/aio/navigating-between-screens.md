---
description: "Navigate between Scandit AIO scanning screens in React Native: the camera ownership model and the navigation prop."
sidebar_label: 'Navigating Between Screens'
title: 'Navigating Between Screens'
sidebar_position: 3
framework: react
keywords:
  - react
---

# Navigating Between Screens

A single scanning screen is straightforward. A second one is where applications go
wrong, because two screens cannot both drive the camera. This page covers what happens
when you navigate between AIO views.

It follows on from [Get Started](./get-started.md), which covers installing the packages
and mounting the provider. The examples below also use
[React Navigation](https://reactnavigation.org/), which is not part of the Scandit SDK.

## The Camera Has One Owner

The camera has exactly one owner at a time. The newest view to claim it takes ownership,
calls from a superseded owner are ignored, and the camera drops to standby when nothing
holds it.

Views differ in how they claim it:

- Most AIO views take a **shared** claim on the camera the provider owns:
  `BarcodeCaptureAioView`, `BarcodeBatchAioView`, `BarcodeCountAioView`,
  `BarcodeArAioView`, `IdCaptureAioView` and `LabelCaptureAioView`.
- `SparkScanAioView` takes an **exclusive** claim and drives its own camera.

Navigating from a shared view to `SparkScanAioView`, or back, hands the camera over.
That handover is what the ownership model exists to do, so it needs no code from you.

:::warning
Test this path on a real device. Camera handover is the one behavior that unit tests and
simulators will not tell you about, and it is where mistakes appear.
:::

## Pass the navigation Prop

Give each view the screen's `navigation` object. Scanning is then suspended while the
screen is blurred or the app is in the background, and resumed when it returns:

```js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ScanditProvider } from 'scandit-react-native-datacapture-core';
import {
  BarcodeCaptureAioView,
  SparkScanAioView,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';

const LICENSE_KEY = 'YOUR_LICENSE_KEY_HERE';
const SYMBOLOGIES = [Symbology.EAN13UPCA, Symbology.Code128];
const Stack = createStackNavigator();

function SparkScanScreen({ navigation }) {
  return (
    <SparkScanAioView
      style={{ flex: 1 }}
      navigation={navigation}
      symbologies={SYMBOLOGIES}
      didScan={(barcodes) => console.log('spark', barcodes[0]?.data)}
    />
  );
}

function CaptureScreen({ navigation }) {
  return (
    <BarcodeCaptureAioView
      style={{ flex: 1 }}
      navigation={navigation}
      symbologies={SYMBOLOGIES}
      didScan={(barcodes) => console.log('capture', barcodes[0]?.data)}
    />
  );
}

export default function App() {
  return (
    <ScanditProvider licenseKey={LICENSE_KEY}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Spark" component={SparkScanScreen} />
          <Stack.Screen name="Capture" component={CaptureScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScanditProvider>
  );
}
```

:::note
`navigation` only needs an object with an `addListener` method for `focus` and `blur`
events. React Navigation's `navigation` prop satisfies this, and so can your own
implementation.
:::

## Turn Scanning Off Yourself

Two more props sit alongside `navigation`, for the cases where focus and foreground are
not the whole story:

- `disabled` keeps scanning off whatever the screen's focus state is. Use it when your own
  logic decides that scanning should stop, such as while a confirmation sheet is open.
- `appStateHandlingDisabled` turns off the automatic suspend and resume when the app
  moves between the background and the foreground. Set it only if you manage that
  yourself.

`disabled` is a prop like any other, so drive it from state:

```js
<BarcodeCaptureAioView
  style={{ flex: 1 }}
  navigation={navigation}
  disabled={isSheetOpen}
  symbologies={SYMBOLOGIES}
  didScan={handleScan}
/>
```

Every AIO view also exposes `enable()` and `disable()` on its
[handle](./get-started.md#calling-the-view-directly), for a single imperative change.

:::warning
Prefer the `disabled` prop for anything your render already knows about. The focus and
foreground handlers read the current value of `disabled`, and an imperative `disable()`
does not change it. So a view you disabled by hand starts scanning again at the next
focus or foreground event, because the prop still says it is enabled.
:::

## Where to Go Next

- [Get Started](./get-started.md): mount the provider and add your first scanning view.
