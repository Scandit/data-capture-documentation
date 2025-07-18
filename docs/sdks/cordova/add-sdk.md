---
sidebar_position: 1
toc_max_heading_level: 4
pagination_next: null
framework: cordova
keywords:
  - cordova
---

# Installation

This guide shows you how to add the Scandit Data Capture SDK to your existing project.

## Prerequisites

- The latest stable version of [Cordova](https://github.com/apache/cordova-cli#installation), [Node.js and npm](https://nodejs.org/en/download/).
- A project with:
  - minimum iOS deployment target of 14.0 or higher (15.0 or higher for ID Capture)
  - an Android project with target SDK version 23 (Android 6, Marshmallow) or higher (version 24 or higher for ID Capture)
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

:::warning
Android devices running the Scandit Data Capture SDK need to have a GPU or the performance will drastically decrease.
:::

### Internal Dependencies

import InternalDependencies from '../../partials/get-started/_internal-deps-no-label-capture.mdx';

<InternalDependencies/>

## Get a License Key

1. [Sign up](https://ssl.scandit.com/dashboard/sign-up?p=test) or [Sign in](https://ssl.scandit.com/dashboard/sign-in) to your Scandit account
2. Create a project
3. Create a license key

If you have a paid subscription, please reach out to [Scandit Support](mailto:support@scandit.com) if you need a new license key.

## Add the SDK

Currently we support adding the Scandit Data Capture SDK Cordova plugins to your project in two ways. The simplest way is to use npm, alternatively you can manually download the plugins and add them to your Cordova project.

:::tip
You should first always add the `scandit-cordova-datacapture-core` plugin, as all other plugins depend on it.
:::

### Create a new project

If you do not have a Cordova project yet that you’ll use, you should create a new one.

```sh
> cordova create helloscandit --id "com.scandit.helloscandit"
> cd helloscandit
> cordova platform add [ios | android]
```

### Add dependencies

The Scandit Data Capture SDK depends on WKWebView on iOS, so you’ll manually have to add this dependency if your project doesn’t use WKWebView yet.

:::tip
The `cordova-plugin-wkwebview-engine` is only supported in `cordova-ios`  `>=4`-`<6` but is now [default in new versions](https://github.com/apache/cordova-plugin-wkwebview-engine?tab=readme-ov-file#deprecation-notice).
:::

```sh
> cordova plugin add cordova-plugin-wkwebview-engine
```

### Install via npm or GitHub repo

To add Scandit plugins via npm or GitHub repo, run the corresponding commands from your project’s root folder.

In the following snippet we’re adding multiple plugins for different functionalities, but you can add only the ones you need as described in the [Internal Dependencies](#internal-dependencies) section.

```sh
# npm package
cordova plugin add scandit-cordova-datacapture-core
cordova plugin add scandit-cordova-datacapture-barcode
cordova plugin add scandit-cordova-datacapture-parser
cordova plugin add scandit-cordova-datacapture-id

# git repo
cordova plugin add https://github.com/Scandit/scandit-cordova-datacapture-core.git
cordova plugin add https://github.com/Scandit/scandit-cordova-datacapture-barcode.git
cordova plugin add https://github.com/Scandit/scandit-cordova-datacapture-parser.git
cordova plugin add https://github.com/Scandit/scandit-cordova-datacapture-id.git
```

:::note
For npm dependencies, you can also specify a version using `@<version>`.
For GitHub dependencies, you can specify the version using `#<version>`.
:::

### Add the Scandit Data Capture SDK manually

After you download the [archive containing all the plugins](https://ssl.scandit.com/dashboard/downloads), unzip the archive. It includes the available Cordova plugins, including the `scandit-cordova-datacapture-core` plugin that all other plugins depend on.

### Add the plugin to your project

Use the Cordova CLI to add the plugin(s) to your already existing project.

First add `scandit-cordova-datacapture-core` plugin:

```sh
cordova plugin add <path to scandit-cordova-datacapture-core plugin>
```

If your project is not yet configured to use Swift on iOS, you’ll need to add the following lines to your _config.xml_ file to specify the iOS version targeted and the Swift version you’d like to use:

```jsx
<platform name="ios">
	...
	<preference name="deployment-target" value="14.0" />
  	<preference name="SwiftVersion" value="5" />
	...
</platform>
```

Once this is done, you can continue with adding the plugin for your desired functionality, e.g. for barcode capture, add the `scandit-cordova-datacapture-barcode` plugin:

```sh
cordova plugin add <path to scandit-cordova-datacapture-barcode plugin>
```

To update plugins, make sure to follow Cordova best practices and remove the plugin before adding the new version:

```sh
cordova plugin remove <id of the plugin being updated>
cordova plugin add <local path, id or GitHub repo url of the plugin being updated>
```

## Additional Information

### Android Configuration


On Android, the Scandit SDK uses content providers to initialize the scanning capabilities properly. If your own content providers depend on the Scandit SDK, choose an **initOrder** lower than 10 to make sure the SDK is ready first.

If not specified, **initOrder** is zero by default and you have nothing to worry about.

Check [the official `<provider>` documentation](https://developer.android.com/guide/topics/manifest/provider-element).

### Camera Permissions

When using the Scandit Data Capture SDK you will want to set the camera as the frame source for various capture modes. The camera permissions are handled by the plugins, so you don’t need to specify anything explicitly.

import OSSLicense from '../../partials/_third-party-licenses-js.mdx';

<OSSLicense/>
