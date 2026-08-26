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

Every AIO view also exposes `enable()` and `disable()` on its handle for a single
imperative change. Prefer `disabled` for state your render already knows about: the prop
and the handle can otherwise disagree about whether scanning is on.

## Where to Go Next

- [Get Started](./get-started.md): mount the provider and add your first scanning view.
