---
title: Migrate from Barcode Scanner 7.x
description: Migrate from Barcode Scanner 7.x to version 8.x of the Scandit Smart Data Capture SDK.
sidebar_label: From 7.x to 8.x
toc_max_heading_level: 4
---

# Migrate to Data Capture SDK 8.x

This guide will help you migrate from versions 7.x of the Scandit Smart Data Capture SDK to version 8.x.

Version 8.0 deprecates and removes many APIs from versions 7.x, as well as making many of the existing APIs more intuitive, resulting in a simpler and quicker integration experience.

While not all features and functionalities are impacted, it is likely you will need to modify your app. If you are unsure about how to perform the migration or the feature you are using is not covered in this migration guide, please reach out to our [support team](mailto:support@scandit.com).

## Updating for Deprecated APIs

:::tip[Version 5.x/6.x Users]
If your app is still using version 5.x or 6.x of the Scandit Barcode Scanner SDK, you will need to first migrate to version 6.x and/or 7.x before migrating to version 8.x. Please refer to the [migration guide from 5.x to 6.x](/migrate-5-to-6.md) and [migration guide from 6.x to 7.x](/migrate-6-to-7.md) for more information.
:::

Version 8.0 includes the removal of all APIs that were deprecated throughout the 7.x series. For the simplest migration process, we recommend you:

- Update your app to the latest 7.6.x version. This version includes warnings for all deprecated APIs.
- Address all deprecation warnings in your app.
- Update to version 8.0.

## Barcode Capture Changes

### Core

In this release, `VideoResolution::Auto` has been now deprecated. Please use the respective capture mode's `recommendedCameraSettings` for the best results.

### Smart Label Capture

The properties of the `LabelFieldDefinition` API have been renamed to better reflect their purpose:

| Old Property Name      | New Property Name        |
|------------------------|--------------------------|
| `pattern`           | `valueRegex`                   |
| `patterns`        | `valueRegexes`              |
| `dataTypePattern`     | `anchorRegex`  |
| `dataTypePatterns`    | `anchorRegexes` |

### SparkScan

In version 7.0, we are introducing the second generation of our ready-to-use barcode scanning UI, SparkScan. This new UI is more intuitive and provides a more modern look and feel, as well as bringing more customization options.

As part of these changes, there have been various deprecations, modifications, and additions to the SparkScan APIs, as detailed below.

Building on the second generation of SparkScan, version 8.0 expands SparkScan beyond barcode scanning to include support for scanning any combination of barcodes and text present on a target. The feature is available in beta at the moment, please contact [Scandit Support](mailto:support@scandit.com) if you are interested in trying it out.

### Cross-Platform Frameworks (Capacitor, Cordova, React Native, Flutter)

In version 8.0, the `forContext` factory method has been deprecated in favor of using constructor initialization for all capture modes. This change affects Capacitor, Cordova, React Native, and Flutter frameworks.

**Before (deprecated):**

```js
const barcodeCapture = BarcodeCapture.forContext(context, settings);
```

**After:**

```js
const barcodeCapture = new BarcodeCapture(settings);
context.addMode(barcodeCapture);
```

Alternatively, you can use the new `setMode` API, which automatically removes all existing modes from the context before adding the new mode:

```js
const barcodeCapture = new BarcodeCapture(settings);
context.setMode(barcodeCapture);
```

:::note

This change applies to all capture modes (e.g., `BarcodeCapture`, `TextCapture`, `IdCapture`, `LabelCapture`, etc.), not just `BarcodeCapture`. Replace `forContext` calls with the constructor pattern for all modes you use in your application.

For Flutter (Dart), use the constructor syntax without the `new` keyword:

```dart
var barcodeCapture = BarcodeCapture(settings);
context.addMode(barcodeCapture);
```

Or using `setMode`:

```dart
var barcodeCapture = BarcodeCapture(settings);
context.setMode(barcodeCapture);
```

:::

## ID Capture Changes

The ID Capture and Validation API was completely redesigned in version 7.0, and version 8.0 builds on those changes with the following improvements:

* Added `ElementsToRetain` to `MobileDocumentScanner`: The set of data elements that the application intends to retain from scanned mobile documents. This information is used to set the `IntentToRetain` flag in ISO 18013-5 mdoc requests, which is required for legal compliance with data protection standards. An empty set indicates no elements will be retained, and `IntentToRetain` will be set to `false` for all fields.
* ID Capture now supports full-frame anonymization.
* The result of `decodeMobileDriverLicenseViz`, which is currently returned as part of the `VizResult` within `CapturedId`, will now be provided through a new field named `mobileDocumentOcr`.
* Added `CapturedId::isCitizenPassport`, which indicates whether the passport was issued to a citizen of the issuing country. Returns `false` for travel documents such as refugee, stateless, or alien passports, and for any passports issued by organizations rather than states.
* Removed the deprecated API `DateResult::toDate`. You should use `DateResult::toLocalDate` or `DateResult::toUtcDate` instead.

## Web SDK Changes

Starting with version 8.0, there are some critical changes in the Web SDK that you should be aware of:

- The `Camera` API has been completely redesigned, see the [API reference](https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html#camera) for complete details.
- The `DataCaptureContext.create`, `createWithOptions` and `configure` methods have been removed in favor of [`DataCaptureContext.forLicenseKey`](https://docs.scandit.com/data-capture-sdk/web/core/api/data-capture-context.html#method-scandit.datacapture.core.DataCaptureContext.ForLicenseKey). See the Web SDK [installation guide](/sdks/web/add-sdk.md) for more information.

## .NET SDK Changes

In version 8.0 we have fundamentally redesigned the Scandit .NET SDK's architecture to better align with the modern .NET ecosystem. This redesign brings several key benefits:

The SDK now includes generic `.net8.0` and `.net9.0` targets. This allows you to reference `Scandit.DataCapture.Core` and related packages directly from non-UI projects, such as class libraries or unit test projects, making it significantly easier to build modular, testable applications following principles like Clean Architecture.

Due to the architectural changes, the SDK now requires explicit initialization at application startup. The public API has not changed, but you must add the corresponding initialization code to your application for the SDK to function correctly.

<Tabs groupId="frameworks">

<TabItem value="android" label="Android">

In your `MainApplication.cs`, add the initialization calls within the `OnCreate` method.

```csharp
[Application]
public class MainApplication(IntPtr handle, JniHandleOwnership ownership) : Application(handle, ownership)
{
    public override void OnCreate()
    {
        base.OnCreate();

        // Initialize Scandit libraries
        ScanditCaptureCore.Initialize();
        ScanditBarcodeCapture.Initialize();
    }
}
```

:::tip
When using additional components like `ScanditIdCapture` or `ScanditParser` in your MAUI application, you must initialize them as well. Please add the required `Initialize()` call within your startup file following the pattern shown in the example above.
:::

</TabItem>

<TabItem value="ios" label="iOS">

In your `AppDelegate.cs`, add the initialization calls within the `FinishedLaunching` method.

```csharp
[Register("AppDelegate")]
public class AppDelegate : UIApplicationDelegate
{
    public override UIWindow Window { get; set; }

    public override bool FinishedLaunching(UIApplication application, NSDictionary launchOptions)
    {
        // Initialize Scandit libraries
        ScanditCaptureCore.Initialize();
        ScanditBarcodeCapture.Initialize();
        
        // Your existing window setup code
        (...)

        return true;
    }
}
```

:::tip
When using additional components like `ScanditIdCapture` or `ScanditParser` in your MAUI application, you must initialize them as well. Please add the required `Initialize()` call within your startup file following the pattern shown in the example above.
:::

</TabItem>

<TabItem value="maui" label="MAUI">

In your `MauiProgram.cs`, chain the new `UseScanditCore()` and `UseScanditBarcodeCapture()` extension methods to the `MauiApp` builder.

```csharp
public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            })
            // Add the Scandit Core and Barcode Capture initializers
            .UseScanditCore(configure =>
            {
                configure.AddDataCaptureView();
            })
            .UseScanditBarcode();

        return builder.Build();
    }
}
```

:::tip
When using additional components like `ScanditIdCapture` or `ScanditParser` in your MAUI application, you must initialize them as well. Please add the required `Initialize()` call within your startup file following the pattern shown in the example above.
:::

</TabItem>

</Tabs>



## Xamarin SDK Changes

Starting this release we are no longer upgrading Xamarin and Forms solutions for the Data Capture SDK. Microsoft ended support for these frameworks on the 1st of May 2024, which locks them into discontinued tooling. You may continue to use the latest releases of SDK version 7.x as per our support policy.