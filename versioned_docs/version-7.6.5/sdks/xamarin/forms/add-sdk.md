---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
framework: xamarinForms
keywords:
  - xamarinForms
title: Installation
---

import DeprecationNotice from '/versioned_docs/version-7.6.5/partials/_xamarin-deprecation-notice.mdx';

<DeprecationNotice/>


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your Xamarin Forms project.

## Prerequisites

- The latest stable version of [Visual Studio](https://visualstudio.microsoft.com/).
- A Xamarin.iOS project with minimum iOS deployment target of 14.0 or higher. Or a Xamarin.Android project with target SDK version 23 (Android 6, Marshmallow) or higher.

  :::note
  ID Capture requires a minimum iOS deployment target of 15.0 or Android SDK version of 24.
  :::

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

You will always need to add the Scandit.DataCapture.Core.Xamarin.Forms package, which contains the core functionality used by the other data capture packages. In addition, depending on the data capture task, you will need a reference to:

- Scandit.DataCapture.Barcode.Xamarin.Forms if you want to use barcode-related functionality such as barcode capture.

You can safely remove Scandit.DataCapture.Barcode.Xamarin.Forms dependency if you are not going to use its features.

## Additional Information

### Content Providers

On Android, the Scandit SDK uses content providers to initialize the scanning capabilities properly. If your own content providers depend on the Scandit SDK, choose an **initOrder** lower than 10 to make sure the SDK is ready first.

If not specified, **initOrder** is zero by default and you have nothing to worry about.

Check [the official `<provider>` documentation](https://developer.android.com/guide/topics/manifest/provider-element).

### Camera Permissions

When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. On Xamarin.Android, you have to request camera permissions in your own application before starting scanning. To see how you can achieve this, take a look at our [samples](/sdks/xamarin/forms/samples.md).

import OSSLicense from '../../../partials/_third-party-licenses-csharp.mdx';

<OSSLicense/>
