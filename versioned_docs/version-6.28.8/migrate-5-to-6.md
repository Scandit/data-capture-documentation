---
title: Migrate from Barcode Scanner 5.x
description: Migrate from Barcode Scanner 5.x to version 6.x of the Scandit Smart Data Capture SDK.
sidebar_label: From 5.x to 6.x
---

# Migrate from Barcode Scanner 5.x

This guide will help you migrate from Barcode Scanner 5.x to  version 6.x of the Scandit Smart Data Capture SDK. Version 6.0 introduces all new APIs that are not backwards compatible with apps using ScanditSDK 5.x. To migrate your code to SDK 6.0 and newer, you will need to modify your app.

If you are unsure about how to perform the migration or the feature you are using is not covered in this migration guide, please reach out to our [support team](mailto:support@scandit.com).

## Replace the BarcodePicker

In 5.x, the BarcodePicker (SBSBarcodePicker on iOS) was the central class that manages recognition, renders the video preview and provides means to configure what barcodes get scanned. In 6.0 and newer, there is no direct equivalent to the BarcodePicker. Instead this functionality is covered by multiple classes:

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/android/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```java
dataCaptureContext = DataCaptureContext.forLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.getDefaultCamera();
dataCaptureContext.setFrameSource(camera, null);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = new BarcodeCaptureSettings();
barcodeCaptureSettings.enableSymbology(Symbology.EAN13_UPCA);

barcodeCapture = BarcodeCapture.forDataCaptureContext(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.addListener(this);
barcodeCapture.setEnabled(true);

BarcodeCaptureOverlay overlay = new BarcodeCaptureOverlay(barcodeCapture);

dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);
dataCaptureView.addOverlay(overlay);

setContentView(dataCaptureView);
```

</TabItem>

<TabItem value="ios" label="iOS">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/ios/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```swift
// Create data capture context using your license key.
context = DataCaptureContext(licenseKey: yourLicenseKey)

// Set the back (world)-facing camera as the frame source of the context.
camera = Camera.default
context.setFrameSource(camera, completionHandler: nil)

// See below for differences between 5.x and 6.x.
let settings = BarcodeCaptureSettings()
settings.set(symbology: .ean13UPCA, enabled: true)

// Create new barcode capture mode with the settings from above.
barcodeCapture = BarcodeCapture(context: context, settings: settings)

// Register self as a listener to get informed whenever a new barcode got recognized.
barcodeCapture.addListener(self)

captureView = DataCaptureView(frame: view.bounds)
captureView.context = context
captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
view.addSubview(captureView)

overlay = BarcodeCaptureOverlay(barcodeCapture: barcodeCapture)
captureView.addOverlay(overlay)
```

</TabItem>

<TabItem value="web" label="Web">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/web/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/web/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```javascript
import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";

// Create data capture context.
context = await SDCCore.DataCaptureContext.create();

// The device camera will serve as a frame source.
camera = SDCCore.Camera.default;
await context.setFrameSource(camera);

// See below for differences between 5.x and 6.x.
const settings = new SDCBarcode.BarcodeCaptureSettings();
settings.enableSymbology(SDCBarcode.Symbology.EAN13UPCA, true);

barcodeCapture = await SDCBarcode.BarcodeCapture.forContext(context, settings);

// Add a listener to get informed whenever a new barcode is recognized.
barcodeCapture.addListener(listener)

view = await SDCCore.DataCaptureView.forContext(context);
// Connect the data capture view to the HTML element, so it can fill up its size and follow its position.
view.connectToElement(element);
```

</TabItem>

<TabItem value="cordova" label="Cordova">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```javascript
// Create data capture context using your license key.
context = Scandit.DataCaptureContext.forLicenseKey(SCANDIT_LICENSE_KEY);

// The device camera will serve as a frame source.
camera = Scandit.Camera.default;
context.setFrameSource(camera);

// See below for differences between 5.x and 6.x.
const settings = new Scandit.BarcodeCaptureSettings();
settings.enableSymbology(Scandit.Symbology.EAN13UPCA, true);

barcodeCapture = Scandit.BarcodeCapture.forContext(context, settings);

// Add a listener to get informed whenever a new barcode is recognized.
barcodeCapture.addListener(listener)

view = Scandit.DataCaptureView.forContext(context);
// Connect the data capture view to the HTML element, so it can fill up its size and follow its position.
view.connectToElement(element);
```

</TabItem>

<TabItem value="reactNative" label="React Native">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```javascript
// Create data capture context using your license key.
context = DataCaptureContext.forLicenseKey(SCANDIT_LICENSE_KEY);

// Set the back (world-facing) camera as the frame source of the context.
camera = Camera.default;
context.setFrameSource(camera);

// See below for differences between 5.x and 6.x.
const settings = new BarcodeCaptureSettings();
settings.enableSymbology(Symbology.EAN13UPCA, true);

// Create new barcode capture mode with the settings from above.
barcodeCapture = BarcodeCapture.forContext(context, settings);

// Add a listener to get informed whenever a new barcode is recognized.
barcodeCapture.addListener(listener)

// Render the capture view in the render method.
<DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef}>

// Back in the application code, add a barcode capture overlay.
const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(this.barcodeCaptureMode, null);
this.viewRef.current.addOverlay(overlay);
```

</TabItem>

<TabItem value="flutter" label="Flutter">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
var camera = Camera.defaultCamera;
dataCaptureContext.setFrameSource(camera);

// See below for differences between 5.x and 6.x.
var barcodeCaptureSettings = BarcodeCaptureSettings()
..enableSymbology(Symbology.ean13Upca, true);

var barcodeCapture = BarcodeCapture.forContext(dataCaptureContext, barcodeCaptureSettings)
..addListener(this)
..isEnabled = true;

var overlay = BarcodeCaptureOverlay(barcodeCapture);

var dataCaptureView = DataCaptureView.forContext(dataCaptureContext)
..addOverlay(overlay);
// Add the dataCaptureView to your widget tree
```

</TabItem>

<TabItem value="xamarinIos" label="Xamarin iOS">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```csharp
dataCaptureContext = DataCaptureContext.ForLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.GetDefaultCamera();
dataCaptureContext.SetFrameSourceAsync(camera);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = BarcodeCaptureSettings.Create();
barcodeCaptureSettings.EnableSymbology(Symbology.Ean13Upca, true);

barcodeCapture = BarcodeCapture.Create(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.AddListener(this);

dataCaptureView = DataCaptureView.Create(dataCaptureContext, View.Bounds);
dataCaptureView.AutoresizingMask = UIViewAutoresizing.FlexibleHeight |
                                    UIViewAutoresizing.FlexibleWidth;
View.AddSubview(dataCaptureView);
```

</TabItem>

<TabItem value="xamarinAndroid" label="Xamarin Android">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```csharp
dataCaptureContext = DataCaptureContext.ForLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.GetDefaultCamera();
dataCaptureContext.SetFrameSourceAsync(camera);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = BarcodeCaptureSettings.Create();
barcodeCaptureSettings.EnableSymbology(Symbology.Ean13Upca, true);

barcodeCapture = BarcodeCapture.Create(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.AddListener(this);

dataCaptureView = DataCaptureView.Create(this, dataCaptureContext);
SetContentView(dataCaptureView);
```

</TabItem>

<TabItem value="xamarinForms" label="Xamarin Forms">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```csharp
dataCaptureContext = DataCaptureContext.ForLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.GetDefaultCamera();
dataCaptureContext.SetFrameSourceAsync(camera);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = BarcodeCaptureSettings.Create();
barcodeCaptureSettings.EnableSymbology(Symbology.Ean13Upca, true);

barcodeCapture = BarcodeCapture.Create(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.AddListener(this);

dataCaptureView = new DataCaptureView();
dataCaptureView.DataCaptureContext = dataCaptureContext;
dataCaptureView.HorizontalOptions = LayoutOptions.StartAndExpand;
dataCaptureView.HorizontalOptions = LayoutOptions.StartAndExpand;
// Add the datacapture view to the container
containerView.Children.Add(dataCaptureView);
```

</TabItem>

<TabItem value="dotnetIos" label=".NET iOS">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```csharp
dataCaptureContext = DataCaptureContext.ForLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.GetDefaultCamera();
dataCaptureContext.SetFrameSourceAsync(camera);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = BarcodeCaptureSettings.Create();
barcodeCaptureSettings.EnableSymbology(Symbology.Ean13Upca, true);

barcodeCapture = BarcodeCapture.Create(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.AddListener(this);

dataCaptureView = DataCaptureView.Create(dataCaptureContext, View.Bounds);
dataCaptureView.AutoresizingMask = UIViewAutoresizing.FlexibleHeight |
                                    UIViewAutoresizing.FlexibleWidth;
View.AddSubview(dataCaptureView);
```

</TabItem>

<TabItem value="dotnetAndroid" label=".NET Android">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```csharp
dataCaptureContext = DataCaptureContext.ForLicenseKey(SCANDIT_LICENSE_KEY);

// Device's camera will serve as a frame source.
camera = Camera.GetDefaultCamera();
dataCaptureContext.SetFrameSourceAsync(camera);

// See below for differences between 5.x and 6.x.
BarcodeCaptureSettings barcodeCaptureSettings = BarcodeCaptureSettings.Create();
barcodeCaptureSettings.EnableSymbology(Symbology.Ean13Upca, true);

barcodeCapture = BarcodeCapture.Create(dataCaptureContext, barcodeCaptureSettings);
barcodeCapture.AddListener(this);

dataCaptureView = DataCaptureView.Create(this, dataCaptureContext);
SetContentView(dataCaptureView);
```

</TabItem>

<TabItem value="titanium" label="Titanium">

* The [`DataCaptureContext`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/data-capture-context.html#class-scandit.datacapture.core.DataCaptureContext) is the central object that manages the data capture/recognition process.
* The [`Camera`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/camera.html#class-scandit.datacapture.core.Camera) class wraps the native camera on |platform|.
* The [`ui.DataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) displays the camera preview as well as augmentations on top of the camera preview.
* The [`barcode.BarcodeCapture`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/barcode-capture/api/barcode-capture.html#class-scandit.datacapture.barcode.BarcodeCapture) manages the barcode scanning/capturing process, exposes [`listeners<barcode.IBarcodeCaptureListener>`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/barcode-capture/api/barcode-capture-listener.html) and ways to configure-barcodes.

In your app you will need to use all of these classes to implement the functionality offered by the BarcodePicker. The following sample code shows you how to do this:

```javascript
// Create data capture context using your license key.
context = ScanditCore.DataCaptureContext.forLicenseKey(SCANDIT_LICENSE_KEY);

// The device camera will serve as a frame source.
camera = ScanditCore.Camera.default;
context.setFrameSource(camera);

// See below for differences between 5.x and 6.x.
const settings = new ScanditBarcode.BarcodeCaptureSettings();
settings.enableSymbology(ScanditBarcode.Symbology.EAN13UPCA, true);

barcodeCapture = ScanditBarcode.BarcodeCapture.forContext(context, settings);

// Add a listener to get informed whenever a new barcode is recognized.
barcodeCapture.addListener(listener)

view = ScanditCore.DataCaptureView.forContext(context);
// Connect the data capture view to the window, so it can fill up its size and follow its position.
view.addToContainer(window);
```

</TabItem>

</Tabs>

## Start/Stop the Capture Process

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```java
barcodeCapture.setEnabled(true);
camera.switchToDesiredState(FrameSourceState.ON, null);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```java
barcodeCapture.setEnabled(false);
camera.switchToDesiredState(FrameSourceState.OFF, null);
```

</TabItem>

<TabItem value="ios" label="iOS">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```swift
barcodeCapture.isEnabled = true
camera?.switch(toDesiredState: .on)
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```swift
barcodeCapture.isEnabled = false
camera?.switch(toDesiredState: .off)
```

</TabItem>

<TabItem value="web" label="Web">

In 5.x the scan process was started by calling resumeScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```javascript
await barcodeCapture.setEnabled(true);
await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.SetEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.SetEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```javascript
await barcodeCapture.setEnabled(false);
await camera.switchToDesiredState(SDCCore.FrameSourceState.Off);
```

</TabItem>

<TabItem value="cordova" label="Cordova">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```javascript
barcodeCapture.isEnabled = true;
camera.switchToDesiredState(Scandit.FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```javascript
barcodeCapture.isEnabled = false;
camera.switchToDesiredState(Scandit.FrameSourceState.Off);
```

</TabItem>

<TabItem value="reactNative" label="React Native">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```javascript
barcodeCapture.isEnabled = true;
camera.switchToDesiredState(FrameSourceState.On);
```
To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```javascript
barcodeCapture.isEnabled = false;
camera.switchToDesiredState(FrameSourceState.Off);
```

</TabItem>

<TabItem value="flutter" label="Flutter">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```dart
barcodeCapture.isEnabled = true;
camera.switchToDesiredState(FrameSourceState.on);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```dart
barcodeCapture.isEnabled = false;
camera.switchToDesiredState(FrameSourceState.off);
```

</TabItem>

<TabItem value="xamarinIos" label="Xamarin iOS">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```csharp
barcodeCapture.Enabled = true;
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```csharp
barcodeCapture.Enabled = false;
camera?.SwitchToDesiredStateAsync(FrameSourceState.Off);
```

</TabItem>

<TabItem value="xamarinAndroid" label="Xamarin Android">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```csharp
barcodeCapture.Enabled = true;
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```csharp
barcodeCapture.Enabled = false;
camera?.SwitchToDesiredStateAsync(FrameSourceState.Off);
```

</TabItem>

<TabItem value="xamarinForms" label="Xamarin Forms">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```csharp
barcodeCapture.Enabled = true;
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```csharp
barcodeCapture.Enabled = false;
camera?.SwitchToDesiredStateAsync(FrameSourceState.Off);
```

</TabItem>

<TabItem value="dotnetIos" label=".NET iOS">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```csharp
barcodeCapture.Enabled = true;
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```csharp
barcodeCapture.Enabled = false;
camera?.SwitchToDesiredStateAsync(FrameSourceState.Off);
```

</TabItem>

<TabItem value="dotnetAndroid" label=".NET Android">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```csharp
barcodeCapture.Enabled = true;
camera?.SwitchToDesiredStateAsync(FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```csharp
barcodeCapture.Enabled = false;
camera?.SwitchToDesiredStateAsync(FrameSourceState.Off);
```

</TabItem>

<TabItem value="titanium" label="Titanium">

In 5.x the scan process was started by calling startScanning on the BarcodePicker. In 6.0+, the equivalent functionality is to [`switch the frame source from off to on<IFrameSource.SwitchToDesiredStateAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/frame-source.html#method-scandit.datacapture.core.IFrameSource.SwitchToDesiredStateAsync) and to [`enable the capture mode<IDataCaptureMode.IsEnabled>`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/data-capture-mode.html#property-scandit.datacapture.core.IDataCaptureMode.IsEnabled).

Capture modes are enabled by default, the first line to enable the capture mode is only required when you are reusing a previously disabled data capture mode.

```javascript
barcodeCapture.isEnabled = true;
camera.switchToDesiredState(ScanditCore.FrameSourceState.On);
```

To **pause** the barcode capture process, simply set the `barcode.BarcodeCapture.IsEnabled` property to `false` (without turning the camera off). To **resume** the capture process, set the  `barcode.BarcodeCapture.IsEnabled` property back to `true`.

To **stop** the barcode capture process and turn the camera off, disable the capture mode and turn the camera off, as shown below:

```javascript
barcodeCapture.isEnabled = false;
camera.switchToDesiredState(ScanditCore.FrameSourceState.Off);
```

</TabItem>

</Tabs>

## Barcode Scanner Changes

* The default code duplicate filter has been changed from _500ms_ to _0ms_. This means that a barcode that gets scanned in two consecutive scans will get reported twice. When you pause/stop the scanning as soon as one code gets scanned, the code duplicate filtering setting does not affect you. However if you continue scanning further codes without pausing/stopping recognition, you may want to change the `barcode.BarcodeCaptureSettings.CodeDuplicateFilter` property back to _500ms_.
* EAN13 and UPCA used to be separate symbologies in 5.x but have now been merged into one symbology called [`Ean13Upca`](../barcode-symbologies#european-article-number-ean).
* The leading zero of UPCA codes is no longer removed by default. If you rely on this behavior in your app, you can either remove the leading zero yourself, or enable the _remove_leading_upca_zero_ extension:

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

```java
settings.getSymbologySettings(Symbology.EAN13_UPCA)
            .setExtensionEnabled("remove_leading_upca_zero", true)
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="ios" label="iOS">

```swift
settings.settings(for: .ean13UPCA)?.set(extension: "remove_leading_upca_zero", enabled: true)
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="web" label="Web">

```javascript
settings.settingsForSymbology(SDCBarcode.Symbology.EAN13UPCA).setExtensionEnabled("remove_leading_upca_zero", true);
```

* The Scanner class functionality is not provided anymore.

</TabItem>

<TabItem value="cordova" label="Cordova">

```javascript
settings.settingsForSymbology(Scandit.Symbology.EAN13UPCA).setExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/cordova/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="reactNative" label="React Native">

```javascript
settings.settingsForSymbology(Symbology.EAN13UPCA).setExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="flutter" label="Flutter">

```dart
settings.settingsForSymbology(Symbology.ean13Upca)
        .setExtensionEnabled("remove_leading_upca_zero", enabled: true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/flutter/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="xamarinIos" label="Xamarin iOS">

```csharp
barcodeCaptureSettings.GetSymbologySettings(Symbology.Ean13Upca)
                      .SetExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.ios/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="xamarinAndroid" label="Xamarin Android">

```csharp
barcodeCaptureSettings.GetSymbologySettings(Symbology.Ean13Upca)
                      .SetExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.android/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="xamarinForms" label="Xamarin Forms">

```csharp
barcodeCaptureSettings.GetSymbologySettings(Symbology.Ean13Upca)
                      .SetExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/xamarin.forms/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="dotnetIos" label=".NET iOS">

```csharp
barcodeCaptureSettings.GetSymbologySettings(Symbology.Ean13Upca)
                      .SetExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.ios/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="dotnetAndroid" label=".NET Android">

```csharp
barcodeCaptureSettings.GetSymbologySettings(Symbology.Ean13Upca)
                      .SetExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

<TabItem value="titanium" label="Titanium">

```javascript
settings.settingsForSymbology(ScanditBarcode.Symbology.EAN13UPCA).setExtensionEnabled("remove_leading_upca_zero", true);
```

* The API to configure the active scan area has been overhauled and simplified. If you were changing the active scan area to match the visible part of the preview, the good news is that the active scan area is now automatically restricted to the visible part of the preview.
* The camera-related settings have been moved from `ScanSettings` to [`CameraSettings`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/camera-settings.html). For example, if you want to change the preview resolution from 720p to 1080p, set the `CameraSettings.PreferredResolution` to `VideoResolution.FullHd` and [`apply the new settings<Camera.ApplySettingsAsync>`](https://docs.scandit.com/6.28/data-capture-sdk/titanium/core/api/camera.html#method-scandit.datacapture.core.Camera.ApplySettingsAsync) to the camera.

</TabItem>

</Tabs>

## MatrixScan Changes

:::important
Not applicable for Web and Titanium.
:::

The features that you know under the name MatrixScan are now bundled under `barcode.tracking.BarcodeTracking`, the overall concept is still referred to as MatrixScan.

In 5.x `setMaxNumberOfCodesPerFrame` was used to adjust MatrixScan to specific use cases where more or less codes had to be tracked. In 6.x it is no longer needed to set this number, instead it is selected automatically depending on the license, use case, and enabled symbologies.

## Migrate the Scan UI

Without any further configuration, the default UI renders the _Scanning by Scandit_ logo in the bottom-right corner of the data capture view. To replicate the default look from 5.x, you need to create a viewfinder.

:::note
This functionality is only available for barcode capture, but not barcode tracking (MatrixScan).
:::

### Enable the Rectangular Viewfinder

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```java
BarcodeCaptureOverlay overlay = new BarcodeCaptureOverlay(barcodeCapture);
RectangularViewfinder viewfinder = new RectangularViewfinder();
overlay.setViewfinder(viewfinder);

dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);
dataCaptureView.addOverlay(overlay);
```

</TabItem>

<TabItem value="ios" label="iOS">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```swift
let overlay = BarcodeCaptureOverlay(barcodeCapture: barcodeCapture)
let viewfinder = RectangularViewfinder()
overlay.viewfinder = viewfinder
captureView.addOverlay(overlay)
```

</TabItem>

<TabItem value="web" label="Web">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/web/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```javascript
const overlay = await SDCBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);
const viewfinder = new SDCCore.RectangularViewfinder();
await overlay.setViewfinder(viewfinder);
await view.addOverlay(overlay);
```

</TabItem>

<TabItem value="cordova" label="Cordova">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```javascript
const overlay = Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);
const viewfinder = new Scandit.RectangularViewfinder();
overlay.viewfinder = viewfinder;
```

</TabItem>

<TabItem value="reactNative" label="React Native">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```javascript
const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);
const viewfinder = new RectangularViewfinder();
overlay.viewfinder = viewfinder;
view.addOverlay(overlay);
```

</TabItem>

<TabItem value="flutter" label="Flutter">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```dart
var overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view)
..viewfinder = RectangularViewfinder();
view.addOverlay(overlay);
```

</TabItem>

<TabItem value="xamarinIos" label="Xamarin iOS">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```csharp
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.Create(barcodeCapture, dataCaptureView);
RectangularViewfinder viewfinder = RectangularViewfinder.Create();
overlay.Viewfinder = viewfinder;
```

</TabItem>

<TabItem value="xamarinAndroid" label="Xamarin Android">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```csharp
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.Create(barcodeCapture, dataCaptureView);
RectangularViewfinder viewfinder = RectangularViewfinder.Create();
overlay.Viewfinder = viewfinder;
```

</TabItem>

<TabItem value="xamarinForms" label="Xamarin Forms">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```csharp
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.Create(barcodeCapture, dataCaptureView);
RectangularViewfinder viewfinder = RectangularViewfinder.Create();
overlay.Viewfinder = viewfinder;
```

</TabItem>

<TabItem value="dotnetIos" label=".NET iOS">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```csharp
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.Create(barcodeCapture, dataCaptureView);
RectangularViewfinder viewfinder = RectangularViewfinder.Create();
overlay.Viewfinder = viewfinder;
```

</TabItem>

<TabItem value="dotnetAndroid" label=".NET Android">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```csharp
BarcodeCaptureOverlay overlay = BarcodeCaptureOverlay.Create(barcodeCapture, dataCaptureView);
RectangularViewfinder viewfinder = RectangularViewfinder.Create();
overlay.Viewfinder = viewfinder;
```

</TabItem>

<TabItem value="titanium" label="Titanium">

To enable the [`rectangular viewfinder<ui.RectangularViewfinder>`](https://docs.scandit.com/6.28/data-capture-sdk/android/core/api/rectangular-viewfinder.html#class-scandit.datacapture.core.ui.RectangularViewfinder) (previously called the default viewfinder), use the following lines of code:

```javascript
const overlay = Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);
const viewfinder = new Scandit.RectangularViewfinder();
overlay.viewfinder = viewfinder;
```

</TabItem>

</Tabs>

### Change the Viewfinder Size

To change the size of the viewfinder using sizes relative to the data capture view (same as in 5.x), you can use the following lines of code:

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

```java
viewfinder.setSize(new SizeWithUnit(new FloatWithUnit(0.8f, MeasureUnit.FRACTION),
                                new FloatWithUnit(0.4f, MeasureUnit.FRACTION)));
```

</TabItem>

<TabItem value="ios" label="iOS">

```swift
viewfinder.setSize(SizeWithUnit(width: FloatWithUnit(value: 0.8, unit: .fraction),
                            height: FloatWithUnit(value: 0.4, unit: .fraction)))
```

</TabItem>

<TabItem value="web" label="Web">

```javascript
viewfinder.setSize(new Scandit.SizeWithUnit(
    new SDCCore.NumberWithUnit(0.8, SDCCore.MeasureUnit.Fraction),
    new SDCCore.NumberWithUnit(0.4, SDCCore.MeasureUnit.Fraction)
  ));
```

</TabItem>

<TabItem value="cordova" label="Cordova">

```javascript
viewfinder.setSize(new Scandit.SizeWithUnit(
    new Scandit.NumberWithUnit(0.8, Scandit.MeasureUnit.Fraction),
    new Scandit.NumberWithUnit(0.4, Scandit.MeasureUnit.Fraction)
  ));
```

</TabItem>

<TabItem value="reactNative" label="React Native">

```javascript
viewfinder.setSize(new SizeWithUnit(
    new NumberWithUnit(0.8, MeasureUnit.Fraction),
    new NumberWithUnit(0.4, MeasureUnit.Fraction)
  ));
```

</TabItem>

<TabItem value="flutter" label="Flutter">

```dart
viewfinder.setSize(SizeWithUnit(DoubleWithUnit(0.8, MeasureUnit.fraction), DoubleWithUnit(0.4, MeasureUnit.fraction)));
```

</TabItem>

<TabItem value="xamarinIos" label="Xamarin iOS">

```csharp
viewfinder.SetSize(new SizeWithUnit
  {
      Width = new FloatWithUnit { Value = 0.8f, Unit = MeasureUnit.Fraction },
      Height = new FloatWithUnit { Value = 0.4f, Unit = MeasureUnit.Fraction }
  });
```

</TabItem>

<TabItem value="xamarinAndroid" label="Xamarin Android">

```csharp
viewfinder.SetSize(new SizeWithUnit
  {
      Width = new FloatWithUnit { Value = 0.8f, Unit = MeasureUnit.Fraction },
      Height = new FloatWithUnit { Value = 0.4f, Unit = MeasureUnit.Fraction }
  });
```

</TabItem>

<TabItem value="xamarinForms" label="Xamarin Forms">

```csharp
viewfinder.SetSize(new SizeWithUnit
  {
      Width = new FloatWithUnit { Value = 0.8f, Unit = MeasureUnit.Fraction },
      Height = new FloatWithUnit { Value = 0.4f, Unit = MeasureUnit.Fraction }
  });
```

</TabItem>

<TabItem value="dotnetIos" label=".NET iOS">

```csharp
viewfinder.SetSize(new SizeWithUnit
  {
      Width = new FloatWithUnit { Value = 0.8f, Unit = MeasureUnit.Fraction },
      Height = new FloatWithUnit { Value = 0.4f, Unit = MeasureUnit.Fraction }
  });
```

</TabItem>

<TabItem value="dotnetAndroid" label=".NET Android">

```csharp
viewfinder.SetSize(new SizeWithUnit
  {
      Width = new FloatWithUnit { Value = 0.8f, Unit = MeasureUnit.Fraction },
      Height = new FloatWithUnit { Value = 0.4f, Unit = MeasureUnit.Fraction }
  });
```

</TabItem>

<TabItem value="titanium" label="Titanium">

```javascript
viewfinder.setSize(new ScanditCore.SizeWithUnit(
    new ScanditCore.NumberWithUnit(0.8, ScanditCore.MeasureUnit.Fraction),
    new ScanditCore.NumberWithUnit(0.4, ScanditCore.MeasureUnit.Fraction)
  ));
```

</TabItem>

</Tabs>

## Other Changes

:::important
Not applicable for Web.
:::

The short 43 character legacy app keys supported in 4.x and 5.x have been deprecated and are not compatible with 6.0+ anymore. Please [contact support](mailto:support@scandit.com) to get your new license keys.