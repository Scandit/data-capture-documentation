---
framework: express
tags: [express]
keywords:
  - express
---

# Bluetooth Device Pairing

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- The latest version of Xcode
- An iOS project with a deployment target of iOS 14.0 or higher
- A Scandit Express license key. Sign up for a [free trial](https://www.scandit.com/trial/) if you don't already have a license key.

## Installation

<Tabs groupId="installation">

<TabItem value="spm" label="Swift Package Manager" default>

To integrate the BLEScanner SDK into your Xcode project using Swift Package Manager, add the desired frameworks in the _Package Dependencies_ section of your project.

Add our SPM package repository:

```
https://github.com/Scandit/blescanner-spm
```

Alternatively, if you prefer checking out git repositories via SSH:

```
git@github.com:Scandit/blescanner-spm.git
```
</TabItem>

<TabItem value="cocoapods" label="CocoaPods">

[CocoaPods](https://cocoapods.org/) is a dependency manager for Swift and Objective-C Cocoa projects. To integrate the BLEScanner SDK into your Xcode project using CocoaPods, specify it in your `Podfile`:

```ruby
pod 'BLEScannerSDK'
```

</TabItem>

<TabItem value="manual" label="Add Manually">

You can download the framework from:
```
https://ssl.scandit.com/sdk/download/scandit-blescannersdk-ios-${VERSION}.zip
```
replacing `${VERSION}` with the version you want to download.

</TabItem>

<TabItem value="import" label="Import in Source Code">

To use the SDK in your source code, import it as follows:

```swift
import BLEScannerSDK
```

</TabItem>

</Tabs>

## Configuring the Host

You can use the `WedgeHost` initializer to set up a host:

```swift
WedgeHost(
    hostName: String,
    projectCode: String,
    baseUrl: String,
    eventCallback: (WedgeHostEvent) -> Void
)
```

- **hostName:** The name you specify for the host.
- **projectCode:** Your Scandit Express project code provided in the dashboard.
- **baseUrl:** The base URL for the QR code that will be generated. You can use this to directly open your app by specifying a universal link. For example, if you want your host to redirect users to Scandit Express, you can specify `https://express.scandit.com/bluetooth` or `scanditExpress://bluetooth`.
- **eventCallback:** The callback for events sent to the host (more details below).

The host can provide you with the **connection QR code** as a `UIImage` using:

```swift
host.makeQRCode().generateQRCode()
```

### Receiving Events

Hosts receive events in the `eventCallback`. Here's how an event is defined:

```swift
public struct WedgeHostEvent {
    public let eventType: BLEScannerSDK.WedgeHostEventType
    public let data: String?
}
```

```swift
public enum WedgeHostEventType: Int {
    case NONE
    case ADV_STARTED // ADV stands for advertising Bluetooth services
    case ADV_STOPPED
    case ADV_ABORTED
    case DEVICE_NAME_SET
    case DEVICE_BARCODE_RECEIVED
    case DEVICE_DISCONNECTED
}
```

For example, when the host successfully receives a barcode, the `WedgeHostEvent` will look like this:

```swift
WedgeHostEvent(eventType: .DEVICE_BARCODE_RECEIVED, data: "barcode data")
```

## Debugging the Host

You will need to run the host on a physical device since Bluetooth functionality does not work on the simulator.
