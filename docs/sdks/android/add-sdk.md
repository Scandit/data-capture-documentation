---
description: "Guide to integrating the Scandit Data Capture SDK into your project."
sidebar_position: 1
toc_max_heading_level: 4
pagination_prev: null
framework: android
keywords:
  - android
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your Android project.

The Scandit Data Capture SDK is distributed as [AAR libraries](https://developer.android.com/studio/projects/android-library#aar-contents) in the official Scandit Maven repository.

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

- Latest version of the Android SDK (for example through the latest Android Studio)
- Android project with target SDK version 23 (Android 6, Marshmallow) or higher

  :::note
  ID Capture requires a minimum target SDK version of 24.
  :::
  
- Valid Scandit Data Capture SDK license key

:::tip
Devices running the Scandit Data Capture SDK need a GPU. Otherwise, you can see a significant decrease in performance.
:::

### Internal Dependencies

import InternalDependencies from '../../partials/get-started/_internal-deps.mdx';

<InternalDependencies/>

### External Dependencies

import ExternalDependencies from '../../partials/get-started/_external-deps-android.mdx';

<ExternalDependencies/>

## Install via Package Manager

<Tabs groupId="managers">

<TabItem value="gradle" label="Gradle">

Add _mavenCentral()_ repository in your _build.gradle_ file:

```gradle
repositories {
  mavenCentral()
}
```

See [Internal Dependencies](#internal-dependencies) to identify the artifacts needed based on your desired functionality. Then add the necessary dependencies to your app’s _build.gradle_ file:

```gradle
dependencies {
  implementation "com.scandit.datacapture:[dependency]:[version]"
}
```

You can find the latest version on [Sonatype](https://s01.oss.sonatype.org/content/repositories/releases/com/scandit/datacapture/).

</TabItem>

<TabItem value="maven" label="Maven">

Add the _mavenCentral_ repository in _pom.xml_ file:

```xml
<repositories>
  <repository>
      <snapshots>
        <enabled>false</enabled>
      </snapshots>
      <id>central</id>
      <name>Maven Central</name>
      <url>https://repo1.maven.org/maven2</url>
  </repository>
</repositories>
```

See [Internal Dependencies](#internal-dependencies) to identify the artifacts needed based on your desired functionality. Then add the necessary dependencies:

```xml
...

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>[required_dependency]</artifactId>
  <version>[version]</version>
</dependency>

...
```

</TabItem>

</Tabs>

## Install Manually

You need to add a reference to `ScanditCaptureCore.aar`, which contains the shared functionality used by the other data capture modules.

Depending on the data capture task, you also need to reference the specific module(s) needed as detailed in [Internal Dependencies](#internal-dependencies).

If your project already has a local `flatDir` repository, add the AAR files to that folder. If you do not have a `flatDir` repository yet, create a new one in your _build.gradle_ file as illustrated below:

```gradle
repositories {
  flatDir {
    dirs '/path/to/folder/containing/the/aar/file'
  }
}
```

Add the .aar libraries as dependencies to your `build.gradle` file:

```gradle
dependencies {
  api(name:'ScanditBarcodeCapture', ext:'aar')
}
```

## Additional Information

### Incompatible Modes Error

If you’re using _androidx.fragments_ dependency and have the situation where a scanning fragment navigates to another scanning fragment with an incompatible mode, make sure you’re using version 1.3.0+ of the dependency.

If not, you may run into an incompatible modes error as the new fragment gets resumed before the previous is paused and for some time incompatible modes may be enabled in the `DataCaptureContext` at the same time. This results in sessions being empty of any result.

### Content Providers

On Android, the Scandit SDK uses content providers to initialize the scanning capabilities properly. If your own content providers depend on the Scandit SDK, choose an **initOrder** lower than 10 to make sure the SDK is ready first.

If not specified, **initOrder** is zero by default and you have nothing to worry about.

Check [the official provider documentation](https://developer.android.com/guide/topics/manifest/provider-element).

import OSSLicense from '../../partials/_third-party-licenses.mdx';

<OSSLicense/>