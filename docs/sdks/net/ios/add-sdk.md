---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
framework: netIos
keywords:
  - netIos
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

This guide shows you how to add the Scandit Data Capture SDK to current existing project.

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A [.NET SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0).
- A .NET for iOS project with minimum iOS deployment target of 15.0 or higher.

  :::note
  ID Capture requires a minimum iOS deployment target of 15.0.
  :::
  
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::tip
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

### Internal Dependencies

import InternalDependencies from '../../../partials/get-started/_internal-deps-no-label-capture.mdx';

<InternalDependencies/>

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
| Barcode Capture | [ScanditBarcodeCapture API](https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api.html) if you want to use barcode-related functionality, such as barcode capture or MatrixScan. | _com.scandit.datacapture:barcode_ |
| Parser | [ScanditParser API](https://docs.scandit.com/data-capture-sdk/dotnet.ios/parser/api.html) if you want to parse data strings, for instance, as found in barcodes, into a set of key-value mappings. | _com.scandit.datacapture:parser_ |
| ID Capture | [ScanditIdCapture API](https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api.html) if you want to scan personal identification documents, such as identity cards, passports or visas. | _com.scandit.datacapture:id_ |

:::tip
You can safely remove `Scandit.DataCapture.Barcode`, `Scandit.DataCapture.Parser`, or `Scandit.DataCapture.IdCapture` dependencies if you are not going to use their features.
:::

## Additional Information

### Camera Permissions

When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. On .NET for iOS, you have to set the “Privacy - Camera Usage Description” field in the Info.plist file.

When using the Scandit Data Capture SDK in MAUI application additionally you have to request camera permissions in your own application before starting scanning. To see how you can achieve this, take a look at our [samples](https://github.com/Scandit/datacapture-dotnet-samples/tree/master).

import OSSLicense from '../../../partials/_third-party-licenses-csharp.mdx';

<OSSLicense/>
