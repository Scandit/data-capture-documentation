---
sidebar_position: 1
toc_max_heading_level: 4
framework: ios
tags: [ios]
keywords:
  - ios
---

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your iOS project. The SDK can be added via:

- [CocoaPods](#cocoapods)
- [Carthage](#carthage)
- [Swift Package Manager](#swift-package-manager)
- [Import in Source Code](#import-in-source-code)

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

- Latest version of Xcode
- iOS project with a deployment target of iOS 13.0+
- Scandit license key, sign up for a [free trial](https://www.scandit.com/trial/) if you don't already have a license key

## CocoaPods

[CocoaPods](https://cocoapods.org/) is a dependency manager for Swift and Objective-C Cocoa projects. To integrate the Scandit Data Capture SDK into your Xcode project using CocoaPods, specify it in your `Podfile`:

```ruby
pod 'ScanditBarcodeCapture',
# Add the following pods if you want to use additional features
pod 'ScanditIdCapture',
pod 'ScanditParser',
```

:::note
This command also downloads `ScanditCaptureCore` as `ScanditBarcodeCapture` depends on it.
:::

## Carthage

[Carthage](https://github.com/Carthage/Carthage) is a decentralized dependency manager that builds your dependencies and provides you with binary frameworks.

To integrate the Scandit Data Capture SDK into your Xcode project using Carthage, specify it in your `Cartfile`:

```ruby
binary "https://ssl.scandit.com/sdk/download/carthage/ScanditBarcodeCapture.json"
```

You also need to add [`ScanditCaptureCore`](https://docs.scandit.com/data-capture-sdk/ios/core/api.html) since [`ScanditBarcodeCapture`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api.html) API depends on it.

```ruby
binary "https://ssl.scandit.com/sdk/download/carthage/ScanditCaptureCore.json"
```

If applicable for your use case, you can also add the following Carthage binaries:

```ruby
binary "https://ssl.scandit.com/sdk/download/carthage/ScanditIdCapture.json"
binary "https://ssl.scandit.com/sdk/download/carthage/ScanditParser.json"
```

## Swift Package Manager

To integrate the Scandit Data Capture SDK into your Xcode project using Swift Package Manager, add the frameworks you want to add in the _Swift Packages_ section of your project.

Add our SPM package repository:

```shell
https://github.com/Scandit/datacapture-spm
```

Or if you prefer checking out git repositories via SSH:

```shell
git@github.com:Scandit/datacapture-spm.git
```

You also need to add [`ScanditCaptureCore`](https://docs.scandit.com/data-capture-sdk/ios/core/api.html) since [`ScanditBarcodeCapture`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api.html) API depends on it, and if applicable for your use case, you can also add the following packages:

- `ScanditIdCapture`
- `ScanditParser`

## Add the Frameworks Manually

Adding the frameworks manually is a single step process when using the XCFramework archives.

All you need to do is drag the frameworks into the _Frameworks, Libraries, and Embedded Content_ section of your target. Make sure to select _Embed and Sign_ for the _Embed_ option.

Please note that you will always need at least `ScanditCaptureCore.xcframework` which contains the shared functionality used by the other data capture modules.

![Add Frameworks Manually](./img/embedded-binaries.png)

:::note
When building the project, by default Xcode will look for the frameworks in the root folder of the project.

If you choose to copy the frameworks in a different location, don’t forget to update the `FRAMEWORK_SEARCH_PATHS` build setting accordingly.
:::

## Import in Source Code

To import the Scandit Data Capture SDK into your source code, add the following import statement:

<Tabs>
<TabItem value="swift" label="Swift">

```swift
import ScanditCaptureCore
import ScanditBarcodeCapture
import ScanditIdCapture
import ScanditParser
```

</TabItem>
<TabItem value="objectivec" label="Objective-C">

```objectivec
@import ScanditCaptureCore;
@import ScanditBarcodeCapture;
@import ScanditIdCapture;
@import ScanditParser;
```

</TabItem>
</Tabs>
