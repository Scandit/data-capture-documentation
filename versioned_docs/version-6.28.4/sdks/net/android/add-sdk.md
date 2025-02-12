---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
framework: netAndroid
keywords:
  - netAndroid
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

This guide shows you how to add the Scandit Data Capture SDK to current existing project.

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A [.NET SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0).
- A .NET for iOS project with minimum iOS deployment target of 13.0 or higher. Or a .NET for Android project with target SDK version 23 (Android 6, Marshmallow) or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::note
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

## Get a License Key

1. [Sign up](https://ssl.scandit.com/dashboard/sign-up?p=test) or [Sign in](https://ssl.scandit.com/dashboard/sign-in) to your Scandit account
2. Create a project
3. Create a license key

If you have a paid subscription, please reach out to [Scandit Support](mailto:support@scandit.com) if you need a new license key.

## Add the SDK

The Scandit Data Capture SDK is distributed as [NuGet packages](https://www.nuget.org/packages?q=scandit).

You will always need to add the `Scandit.DataCapture.Core` package, which contains the core functionality used by the other data capture packages. When developing MAUI applications you will also need to add the `Scandit.DataCapture.Core.Maui` package. 

In addition, depending on the data capture task, you will need a reference to:

| Functionality | Description | Required Module(s) |
| --- | --- | --- |
| Barcode Capture | [ScanditBarcodeCapture API](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/barcode-capture/api.html) if you want to use barcode-related functionality, such as barcode capture or MatrixScan. | _com.scandit.datacapture:barcode_ |
| Parser | [ScanditParser API](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/parser/api.html) if you want to parse data strings, for instance, as found in barcodes, into a set of key-value mappings. | _com.scandit.datacapture:parser_ |
| ID Capture | [ScanditIdCapture API](https://docs.scandit.com/6.28/data-capture-sdk/dotnet.android/id-capture/api.html) if you want to scan personal identification documents, such as identity cards, passports or visas. | _com.scandit.datacapture:id_ |

:::tip
You can safely remove `Scandit.DataCapture.Barcode`, `Scandit.DataCapture.Parser`, or `Scandit.DataCapture.IdCapture` dependencies if you are not going to use their features.
:::


## Additional Information

:::note
On Android, the Scandit SDK uses content providers to initialize the scanning capabilities properly. If your own content providers depend on the Scandit SDK, choose an **initOrder** lower than 10 to make sure the SDK is ready first.

If not specified, **initOrder** is zero by default and you have nothing to worry about.

Check [the official `<provider>` documentation](https://developer.android.com/guide/topics/manifest/provider-element).
:::

### Camera Permissions

When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. On .NET for Android or MAUI, you have to request camera permissions in your own application before starting scanning. To see how you can achieve this, take a look at our [samples](./samples.md).
