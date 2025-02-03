---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
framework: titanium
keywords:
  - titanium
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your Titanium project.

## Prerequisites

- The latest stable version of the [Titanium SDK and other related tools and dependencies](https://titaniumsdk.com/guide/Titanium%5FSDK/Titanium%5FSDK%5FGetting%5FStarted/).
- A project with minimum iOS deployment target of 11.0 or higher. Or an Android project with target SDK version 23 (Android 6, Marshmallow) or higher.
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

Currently we support adding the Scandit Data Capture SDK Titanium modules to your project in two ways. The simplest way is to use the npm registry, alternatively you can manually download the modules and add them to your project.

### Create a new project (optional)

If you do not have a Titanium project yet that you’ll use, you should create a new one.

```sh
ti create -t app -n <PROJECT_NAME>
```

### 2a. Add the Scandit Data Capture SDK from the npm registry

To add our plugins from the npm registry, you can run these commands from your project’s root folder. In the following snippet we’re adding [ScanditBarcodeCapture API](https://docs.scandit.com/6.28/data-capture-sdk/titanium/barcode-capture/api.html)

```sh
npm install scandit-titanium-datacapture-core
npm install scandit-titanium-datacapture-barcode
```

:::note
You can also specify a version `@<version>`.
:::

### 2b. Add the Scandit Data Capture SDK manually

You need to declare the modules you want to use in the app’s tiapp.xml file, e.g. for barcode capture, declare the scandit-titanium-datacapture-barcode module:

```xml
<modules>
  <module platform="android">com.scandit.ti.datacapture.core</module>
  <module platform="android">com.scandit.ti.datacapture.barcode</module>
  <module platform="iphone">com.scandit.ti.datacapture.barcode</module>
  <module platform="iphone">com.scandit.ti.datacapture.core</module>
</modules>
```

After you download the archive containing all the modules at [ssl.scandit.com/dashboard/downloads](https://ssl.scandit.com/dashboard/downloads), unzip the archive. It includes the available Titanium modules, including the scandit-titanium-datacapture-core module that all other modules depend on. Now you need to copy the the reqired modules to the root folder of the application. Sticking with the current example, it means that you need to copy:

- The barcode module for Android.
- The core module for Android.
- The barcode module for iOS.
- The core module for iOS.

## Additional Information

- Camera Permissions: When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. On Android, you have to request camera permissions in your own application before starting scanning. To see how you can achieve this, take a look at our [samples](https://github.com/Scandit/datacapture-titanium-samples).
- Remember that, if you want to use the camera as the frame source for barcode capture you need to set the “Privacy - Camera Usage Description” field in the Info.plist file for iOS.
