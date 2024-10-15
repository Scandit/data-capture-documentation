---
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

The Scandit Data Capture SDK is distributed as [AAR libraries](https://developer.android.com/studio/projects/android-library#aar-contents) in the [official Scandit maven repository](https://s01.oss.sonatype.org/content/repositories/releases/com/scandit/datacapture/).

:::warning
You need to add a reference to _com.scandit.datacapture:core_, which contains the shared functionality used by the other data capture modules.
::: 

Depending on the data capture task, you need a reference to:

| Functionality | Description | Required Module(s) |
| --- | --- | --- |
| Barcode Capture | [ScanditBarcodeCapture API](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api.html) if you want to use barcode-related functionality, such as barcode capture or MatrixScan. | _com.scandit.datacapture:barcode_ |
| Parser | [ScanditParser API](https://docs.scandit.com/data-capture-sdk/android/parser/api.html) if you want to parse data strings, for instance, as found in barcodes, into a set of key-value mappings. | _com.scandit.datacapture:parser_ |
| ID Capture | [ScanditIdCapture API](https://docs.scandit.com/data-capture-sdk/android/id-capture/api.html) if you want to scan personal identification documents, such as identity cards, passports or visas. | _com.scandit.datacapture:id_ |

:::tip
You can safely remove _barcode_, _parser_, or _id_ dependencies if you are not going to use their features.
:::

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

- Latest version of the Android SDK (for example through the latest Android Studio)
- Android project with target SDK version 23 (Android 6, Marshmallow) or higher
- Valid Scandit Data Capture SDK license key

:::note
Devices running the Scandit Data Capture SDK need a GPU. Otherwise, you can see a significant decrease in performance.
:::

## Gradle

You can add _mavenCentral()_ repository in _build.gradle_ file:

```java
repositories {
  mavenCentral()
}
```

You can add the necessary artifacts as dependencies to the app’s _build.gradle_:

```java
dependencies {
  implementation "com.scandit.datacapture:core:[version]"
  implementation "com.scandit.datacapture:barcode:[version]"
  implementation "com.scandit.datacapture:parser:[version]"
  implementation "com.scandit.datacapture:text-base:[version]"
  implementation "com.scandit.datacapture:text:[version]"
  implementation "com.scandit.datacapture:id:[version]"
}
```

You can find the latest version on [Sonatype](https://s01.oss.sonatype.org/content/repositories/releases/com/scandit/datacapture/).

## Maven

You can add the _mavenCentral_ repository in _pom.xml_ file:

```java
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

You can add the necessary artifacts as dependencies:

```java
<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>core</artifactId>
  <version>[version]</version>
</dependency>

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>barcode</artifactId>
  <version>[version]</version>
</dependency>

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>parser</artifactId>
  <version>[version]</version>
</dependency>

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>text-base</artifactId>
  <version>[version]</version>
</dependency>

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>text</artifactId>
  <version>[version]</version>
</dependency>

<dependency>
  <groupId>com.scandit.datacapture</groupId>
  <artifactId>id</artifactId>
  <version>[version]</version>
</dependency>
```

## Manually Add Library to Project

You need to add a reference to `ScanditCaptureCore.aar`, which contains the shared functionality used by the other data capture modules. In addition, depending on the data capture task, you need a reference to:

- [ScanditBarcodeCapture API](https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api.html) if you want to use barcode-related functionality, such as barcode capture or MatrixScan
- [ScanditParser API](https://docs.scandit.com/data-capture-sdk/android/parser/api.html) if you want to parse data strings, for instance, as found in barcodes, into a set of key-value mappings
- [ScanditIdCapture API](https://docs.scandit.com/data-capture-sdk/android/id-capture/api.html) if you want to scan personal identification documents, such as identity cards, passports or visas

If your project already has a local `flatDir` repository, add the AAR files to that folder. If you do not have a `flatDir` repository yet, create a new one in your _build.gradle_ file as illustrated below:

```java
repositories {
  flatDir {
    dirs '/path/to/folder/containing/the/aar/file'
  }
}
```

Add the .aar libraries as dependencies to your `build.gradle` file:

```java
dependencies {
  api(name:'ScanditBarcodeCapture', ext:'aar')
}
```

## External Dependencies

The Scandit Data Capture SDK modules depend on the following few standard libraries. If you include the Scandit Data Capture SDK through Gradle or Maven, all of these dependencies are automatically pulled in and there is no further action items for you. On the other hand, if you directly ad the AAR files to the project, you need to add these dependencies yourself.

| Module | Dependencies  |
| ------------------------- | ----------------------------------------- |
| ScanditCaptureCore.aar    | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]; com.squareup.okhttp3:okhttp:4.9.2 |
| ScanditBarcodeCapture.aar | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]                                    |
| ScanditParser.aar   | No dependencies      |
| ScanditIdCapture.aar      | org.jetbrains.kotlin:kotlin-stdlib:[version]; androidx.annotation:annotation:[version]                                    |

# Additional Information

:::note
If you’re using _androidx.fragments_ dependency and have the situation where a scanning fragment navigates to another scanning fragment with an incompatible mode, make sure you’re using version 1.3.0+ of the dependency. If not, you may run into an incompatible modes error, as the new fragment gets resumed before the previous is paused and for some time incompatible modes may be enabled in the DataCaptureContext at the same time. This results in sessions being empty of any result.
:::

:::note
On Android, the Scandit SDK uses content providers to initialize the scanning capabilities properly. If your own content providers depend on the Scandit SDK, choose an **initOrder** lower than 10 to make sure the SDK is ready first.

If not specified, **initOrder** is zero by default and you have nothing to worry about.

Check [the official provider documentation](https://developer.android.com/guide/topics/manifest/provider-element).
:::
