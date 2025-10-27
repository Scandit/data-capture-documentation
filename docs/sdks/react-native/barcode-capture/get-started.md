---
sidebar_position: 2
pagination_prev: null
framework: react
keywords:
  - react
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Get Started

In this guide you will learn step-by-step how to add Barcode Capture to your application.

The general steps are:

- Include the ScanditBarcodeCapture library and its dependencies to your project, if any.
- Create a new [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) instance, initialized with your license key.
- Create a [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings) and enable the [BarcodeSymbologies](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology) you want to read in your application.
- Create a new [BarcodeCaptureMode](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) instance and initialize it with the settings created above.
- Register a [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) to receive scan events. Process the successful scans according to your application’s needs, e.g. by looking up information in a database. After a successful scan, decide whether more codes will be scanned, or the scanning process should be stopped.
- Obtain a [Camera](https://docs.scandit.com/data-capture-sdk/react-native/core/api/camera.html#class-scandit.datacapture.core.Camera) instance and set it as the frame source on the data capture context.
- Display the camera preview by creating a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView).
- If displaying a preview, optionally create a new [BarcodeCaptureOverlay](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) and add it to [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) for a better visual feedback.

## 1. Obtain a Scandit License Key

A valid Scandit Data Capture SDK license key is required enable any capture mode. Sign into your Scandit account and create a new Scandit license key or copy an existing one.

:::tip
You can create or copy your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

For new projects, create a new _cross-platform_ license key. Depending on the type of license key, it may require entering an iOS Bundle ID and/or Android App ID. If these values are not identical between platforms, the Bundle ID and App ID can both be entered separated by a comma.

## 2. Download the Scandit SDK
Add the Scandit SDK dependencies to your current project. Lean more about the [installation requirements](/sdks/react-native/add-sdk).

 <Tabs defaultValue="npm" values={[
	{label: 'npm', value: 'npm'},
	{label: 'Yarn', value: 'yarn'},
	{label: 'pnpm', value: 'pnpm'},
	{label: 'Bun', value: 'bun'}
]}>
	<TabItem value="npm">
	```sh
	npm i scandit-react-native-datacapture-core scandit-react-native-datacapture-barcode
	```
	</TabItem>
	<TabItem value="yarn">
	```sh
	yarn add scandit-react-native-datacapture-core scandit-react-native-datacapture-barcode
	```
	</TabItem>
	<TabItem value="pnpm">
	```sh
	pnpm add scandit-react-native-datacapture-core scandit-react-native-datacapture-barcode
	```
	</TabItem>
	<TabItem value="bun">
	```sh
	bun add scandit-react-native-datacapture-core scandit-react-native-datacapture-barcode
	```
	</TabItem>
</Tabs>

## 3. Create the Data Capture Context

import DataCaptureContextReactNative from '../../../partials/get-started/_create-data-capture-context-react-native.mdx';

<DataCaptureContextReactNative/>

## 4. Configure the Barcode Scanning Behavior

[BarcodeCapture](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) is one of the [DataCaptureMode](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-mode.html#interface-scandit.datacapture.core.IDataCaptureMode) options within the Scandit SDK which scans individual barcodes. 

This mode is attached to a [DataCaptureContext](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) and configured by applying the [BarcodeCaptureSettings](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#class-scandit.datacapture.barcode.BarcodeCaptureSettings). Then, attaching the [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) will provide new [Barcode](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode.html#class-scandit.datacapture.barcode.Barcode) values when recognized.

For this tutorial, we will setup barcode scanning for a small list of different barcode types, called a [Symbology](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/symbology.html#enum-scandit.datacapture.barcode.Symbology). The list of symbologies to enable is highly application specific. 

Each additional Symbology may reduce recognition speed, therefore only enable the symbologies your application requires.

<Tabs defaultValue="ts" values={[
	{label: 'TypeScript', value: 'ts'},
	{label: 'JavaScript', value: 'js'}
]}>
	<TabItem value="ts">
	```ts
	const settings = new BarcodeCaptureSettings();
	settings.codeDuplicateFilter = 300; // optionally add a 300ms timeout between scanning identical barcodes
	settings.enableSymbologies([
		Symbology.Code128,
		Symbology.Code39,
		Symbology.QR,
		Symbology.EAN8,
		Symbology.UPCE,
		Symbology.EAN13UPCA,
	]);

	// Create a BarcodeCapture instance with the BarcodeCaptureSettings applied.
	const barcodeCapture = BarcodeCapture.forContext(context, settings);
	```
	</TabItem>
	<TabItem value="js">
	```js
	const settings = new BarcodeCaptureSettings();
	settings.codeDuplicateFilter = 300; // optionally add a 300ms timeout between scanning identical barcodes
	settings.enableSymbologies([
		Symbology.Code128,
		Symbology.Code39,
		Symbology.QR,
		Symbology.EAN8,
		Symbology.UPCE,
		Symbology.EAN13UPCA,
	]);

	// Create a BarcodeCapture instance with the BarcodeCaptureSettings applied.
  const barcodeCapture = BarcodeCapture.forContext(context, settings);
	```
	</TabItem>
</Tabs>

If you are not disabling barcode capture immediately after having scanned the first code, consider setting the [BarcodeCaptureSettings.codeDuplicateFilter](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-settings.html#property-scandit.datacapture.barcode.BarcodeCaptureSettings.CodeDuplicateFilter) to around 500 or even \-1 if you do not want codes to be scanned more than once.

## 5. Register the Barcode Capture Listener

To get informed whenever a new code has been recognized, add a [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) through
[BarcodeCapture.addListener()](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture.html#method-scandit.datacapture.barcode.BarcodeCapture.AddListener) and implement the listener methods to suit your application’s needs.

First implement the [BarcodeCaptureListener](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-listener.html#interface-scandit.datacapture.barcode.IBarcodeCaptureListener) interface. For example:

<Tabs defaultValue="ts" values={[
	{label: 'TypeScript', value: 'ts'},
	{label: 'JavaScript', value: 'js'}
]}>
	<TabItem value="ts">
	```ts
	const barcodeCaptureListener: BarcodeCaptureListener = {
		didScan: async (
			barcodeCapture: BarcodeCapture,
			session: BarcodeCaptureSession,
			getFrameData: () => Promise<FrameData>
		) => {
			const barcode = session.newlyRecognizedBarcode;
			// Do something with the barcodes
		},
	};

	// Add the BarcodeCaptureListener to the BarcodeCapture mode.
	barcodeCapture.addListener(barcodeCaptureListener);
	```
	</TabItem>
	<TabItem value="js">
	```js
	const barcodeCaptureListener = {
		didScan: async (
			barcodeCapture,
			session,
			getFrameData
		) => {
			const barcode = session.newlyRecognizedBarcode;
			// Do something with the barcodes
		},
	};

	// Add the BarcodeCaptureListener to the BarcodeCapture mode.
	barcodeCapture.addListener(barcodeCaptureListener);
	```
	</TabItem>
</Tabs>

### Rejecting Barcodes

To prevent scanning unwanted codes, you can reject them by adding the desired logic to the `didScan` method. This will prevent the barcode from being added to the session and will not trigger the `didUpdateSession` method.

The example below will only scan barcodes beginning with the digits `09` and ignore all others, using a transparent brush to distinguish a rejected barcode from a recognized one:

```js
if (!barcode.data?.startsWith('09:')) {
	overlay.brush = Brush.transparent;
	return;
}
```

## Use the Built-in Camera

The `DataCaptureContext` supports using different frame sources to perform recognition on. Most applications will use the built-in camera of the device, e.g. the world-facing camera of a device. The remainder of this tutorial will assume that you use the built-in camera.

:::important
In iOS, the user must explicitly grant permission for each app to access cameras. Your app needs to provide static messages to display to the user when the system asks for camera permission. To do that include the [NSCameraUsageDescription](https://developer.apple.com/documentation/bundleresources/information%5Fproperty%5Flist/nscamerausagedescription)
key in your app’s Info.plist file.
:::

:::important
In Android, the user must explicitly grant permission for each app to access cameras. Your app needs to declare the use of the Camera permission in the AndroidManifest.xml file and request it at runtime so the user can grant or deny the permission. To do that follow the guidelines from [Request app permissions](https://developer.android.com/training/permissions/requesting) to request the android.permission.CAMERA permission.
:::

When using the built-in camera there are recommended settings for each capture mode. These should be used to achieve the best performance and user experience for the respective mode. The following couple of lines show how to get the recommended settings and create the camera from it:

<Tabs defaultValue="ts" values={[
	{label: 'TypeScript', value: 'ts'},
	{label: 'JavaScript', value: 'js'}
]}>
	<TabItem value="ts">
	```ts
	const cameraSettings = BarcodeCapture.recommendedCameraSettings;
	// cameraSettings.preferredResolution = VideoResolution.FullHD; // or adjust default camera settings

	const camera = Camera.withSettings(cameraSettings);

	// Attaches the Camera object as FrameSource to the DataCaptureContext
	context.setFrameSource(camera);

	... // Setup the BarcodeCaptureMode, BarcodeCaptureListener, etc.

	camera.switchToDesiredState(FrameSourceState.On);
	```
	</TabItem>
	<TabItem value="js">
	```js
	const cameraSettings = BarcodeCapture.recommendedCameraSettings;
	// cameraSettings.preferredResolution = VideoResolution.FullHD; // or adjust default camera settings

	const camera = Camera.withSettings(cameraSettings);

	// Attaches the Camera object as FrameSource to the DataCaptureContext
	context.setFrameSource(camera);

	... // Setup the BarcodeCaptureMode, BarcodeCaptureListener, etc.

	camera.switchToDesiredState(FrameSourceState.On);
	```
	</TabItem>
</Tabs>

The FrameSource for the `DataCaptureContext` configurable by calling [DataCaptureContext.setFrameSource()](https://docs.scandit.com/data-capture-sdk/react-native/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.SetFrameSourceAsync):

The camera is off by default. To turn it on, call [FrameSource.switchToDesiredState()](https://docs.scandit.com/data-capture-sdk/react-native/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) with a value of [FrameSourceState.On](https://docs.scandit.com/data-capture-sdk/react-native/core/api/frame-source.html#value-scandit.datacapture.core.FrameSourceState.On).

## Use a Capture View to Visualize the Scan Process

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

```js
<DataCaptureView context={this.dataCaptureContext} ref={this.viewRef}>
```

To visualize the results of barcode scanning, the following [overlay](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/ui/barcode-capture-overlay.html#class-scandit.datacapture.barcode.ui.BarcodeCaptureOverlay) can be added:

```js
const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(
	barcodeCapture,
	view
);
```

## Disabling Barcode Capture

To disable barcode capture, for instance as a consequence of a barcode being recognized, set [BarcodeCapture.isEnabled](https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api/barcode-capture.html#property-scandit.datacapture.barcode.BarcodeCapture.IsEnabled) to _false_.

The effect is immediate: no more frames will be processed _after_ the change. However, if a frame is currently being processed, this frame will be completely processed and deliver any results/callbacks to the registered listeners. Note that disabling the capture mode does not stop the camera, the camera continues to stream frames until it is turned off.
