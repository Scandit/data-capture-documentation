---
sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

This page will guide you through the process of adding ID Capture to your iOS application. ID Capture is a mode of the Scandit Data Capture SDK that allows you to capture and extract information from personal identification documents, such as driver's licenses, passports, and ID cards.

The general steps are:

- Creating a new Data Capture Context instance
- Accessing a Camera
- Configuring the Capture Settings
- Implementing a Listener to Receive Scan Results
- Setting up the Capture View and Overlay
- Starting the Capture Process

:::warning
Using ID Capture at the same time as other modes (e.g. Barcode Capture) is not supported.
:::

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. See the [installation guide](/sdks/ios/add-sdk.md) for details.

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import IdModuleOverview from '../../../partials/get-started/_id-module-overview.mdx';

<IdModuleOverview/>

### Mobile ID Scanning

ID Capture supports Bluetooth to scan mobile identity documents. The App Store requires the `NSBluetoothAlwaysUsageDescription` key to be present in your app's `Info.plist` when this module is included, even if you are not actively using this feature.

To resolve this issue, add the following entry to your `Info.plist` file:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Required to scan mobile identity documents via Bluetooth.</string>
```

## Create a Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Access a Camera

Next, you need to create a new instance of the [`SDCCamera`](https://docs.scandit.com/data-capture-sdk/ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera that will be used to stream previews and to capture images. The camera settings are also configured, in this case, we use the `recommendedCameraSettings` that come withe ID Capture SDK.

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
camera = Camera.default
context.setFrameSource(camera, completionHandler: nil)

// Use the recommended camera settings for the IdCapture mode.
let recommendedCameraSettings = IdCapture.recommendedCameraSettings
camera?.apply(recommendedCameraSettings)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
SDCCamera *camera = [SDCCamera defaultCamera];
[dataCaptureContext setFrameSource:camera completionHandler:nil];

auto recommendedCameraSettings = [SDCIdCapture recommendedCameraSettings];
[camera applySettings:recommendedCameraSettings completionHandler:nil];
```

</TabItem>

</Tabs>

## Configure the Capture Settings

Use [IdCaptureSettings](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-settings.html#class-scandit.datacapture.id.IdCaptureSettings) to configure the scanner type to use and the documents that should be accepted and/or rejected.

Check [IdCaptureDocumentType](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-document.html#enum-scandit.datacapture.id.IdCaptureDocumentType) for all the available options.

:::tip
By default, [anonymized data](./advanced.md#configure-data-anonymization) is not returned in accordance with local regulations for specific documents. This setting can be disabled for testing purposes, but be sure to comply with local laws and requirements in production.
:::

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
var acceptedDocuments = [IdCaptureDocument]()
var rejectedDocuments = [IdCaptureDocument]()

// Passports from any region:
acceptedDocuments.append(Passport(region: .any))

// Only documents issued by a specific country:
acceptedDocuments.append(IdCard(region: .germany))

// Standardized documents issued in Europe:
acceptedDocuments.append(IdCard(region: .euAndSchengen))
acceptedDocuments.append(DriverLicense(region: .euAndSchengen))

// Regional documents:
acceptedDocuments.append(RegionSpecific(subtype: .apecBusinessTravelCard))
acceptedDocuments.append(RegionSpecific(subtype: .chinaExitEntryPermit))

// Reject passports from certain regions:
rejectedDocuments.append(Passport(region: .cuba))

// Configure:
let settings = IdCaptureSettings()
settings.acceptedDocuments = acceptedDocuments
settings.rejectedDocuments = rejectedDocuments

// Capture only one-side documents and a given zone
// Capture only barcodes
settings.scannerType = SingleSideScanner(enablingBarcode: true,
                                         machineReadableZone: false,
                                         visualInspectionZone: false)

// Capture only Machine Readable Zone (MRZ)
settings.scannerType = SingleSideScanner(enablingBarcode: false,
                                         machineReadableZone: true,
                                         visualInspectionZone: false)

// Capture only Visual Inspection Zone (VIZ)
settings.scannerType = SingleSideScanner(enablingBarcode: false,
                                         machineReadableZone: false,
                                         visualInspectionZone: true)

// Full document scanner
settings.scannerType = FullDocumentScanner()
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
NSMutableArray<SDCIdCaptureDocument *> *acceptedDocuments = [NSMutableArray new];
NSMutableArray<SDCIdCaptureDocument *> *rejectedDocuments = [NSMutableArray new];

// Passports from any region:
[acceptedDocuments addObject:[SDCPassport documentWithRegion:SDCIdCaptureRegionAny]];

// Only documents issued by a specific country:
[acceptedDocuments addObject:[SDCIdCard documentWithRegion:SDCIdCaptureRegionGermany]];

// Standardized documents issued in Europe:
[acceptedDocuments addObject:[SDCIdCard documentWithRegion:SDCIdCaptureRegionEUAndSchengen]];
[acceptedDocuments addObject:[SDCDriverLicense documentWithRegion:SDCIdCaptureRegionEUAndSchengen]];

// Regional documents:
[acceptedDocuments addObject:[SDCRegionSpecific documentWithSubtype:SDCIdCaptureRegionSpecificSubtypeApecBusinessTravelCard]];
[acceptedDocuments addObject:[SDCRegionSpecific documentWithSubtype:SDCIdCaptureRegionSpecificSubtypeChinaExitEntryPermit]];

// Reject passports from certain regions:
[rejectedDocuments addObject:[SDCPassport documentWithRegion:SDCIdCaptureRegionCuba]];

// Configure:
SDCIdCaptureSettings *settings = [SDCIdCaptureSettings new];
settings.acceptedDocuments = acceptedDocuments;
settings.rejectedDocuments = rejectedDocuments;

// Capture only one-side documents and a given zone
// Capture only barcodes
settings.scannerType = [SDCSingleSideScanner scannerEnablingBarcode:YES
                                                machineReadableZone:NO
                                               visualInspectionZone:NO];

// Capture only Machine Readable Zone (MRZ)
settings.scannerType = [SDCSingleSideScanner scannerEnablingBarcode:NO
                                                machineReadableZone:YES
                                               visualInspectionZone:NO];

// Capture only Visual Inspection Zone (VIZ)
settings.scannerType = [SDCSingleSideScanner scannerEnablingBarcode:NO
                                                machineReadableZone:NO
                                               visualInspectionZone:YES];

// Full document scanner
settings.scannerType = [SDCFullDocumentScanner scanner];
```

</TabItem>

</Tabs>

Create a new ID Capture mode with the chosen settings:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
idCapture = IdCapture(context: context, settings: idCaptureSettings)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
SDCIdCapture *idCapture = [SDCIdCapture idCaptureWithContext:dataCaptureContext settings:idCaptureSettings];
```

</TabItem>

</Tabs>

## Implement a Listener

To receive scan results, implement and [IdCaptureListener](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-listener.html#interface-scandit.datacapture.id.IIdCaptureListener). The listener provides two callbacks: `didCapture` and `didReject`

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
extension IdCaptureViewController: IdCaptureListener {

    func idCapture(_ idCapture: IdCapture, didCapture capturedId: CapturedId) {
        // Success! Handle extracted data here.
    }

    func idCapture(_ idCapture: IdCapture,
                   didReject capturedId: CapturedId?,
                   reason: RejectionReason) {
        // Something went wrong. Inspect the reason to determine the follow-up action.
    }
}

idCapture.addListener(self)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
- (void)idCapture:(SDCIdCapture *)idCapture didCapture:(SDCCapturedId *)capturedId {
    // Success! Handle extracted data here.
}

- (void)idCapture:(SDCIdCapture *)idCapture
        didReject:(nullable SDCCapturedId *)capturedId
           reason:(SDCRejectionReason)rejectionReason {
    // Something went wrong. Inspect the reason to determine the follow-up action.
}

[idCapture addListener:self];
```

</TabItem>

</Tabs>

### Handling Success

Capture results are delivered as a [CapturedId](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/captured-id.html#class-scandit.datacapture.id.CapturedId). This class contains data common for all kinds of personal identification documents.

For more specific information, use its non-null result properties (e.g. [CapturedId.barcode](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/captured-id.html#property-scandit.datacapture.id.CapturedId.Barcode)).

On a successful scan you may read the extracted data from `CapturedId`:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
func idCapture(_ idCapture: IdCapture, didCapture capturedId: CapturedId) {
    let fullName = capturedId.fullName
    let dateOfBirth = capturedId.dateOfBirth
    let dateOfExpiry = capturedId.dateOfExpiry
    let documentNumber = capturedId.documentNumber

    // Process data:
    processData(fullName, dateOfBirth, dateOfExpiry, documentNumber)
}
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
- (void)idCapture:(SDCIdCapture *)idCapture didCapture:(SDCCapturedId *)capturedId {
    NSString *fullName = capturedId.fullName;
    NSDate *dateOfBirth = capturedId.dateOfBirth;
    NSDate *dateOfExpiry = capturedId.dateOfExpiry;
    NSString *documentNumber = capturedId.documentNumber;

    // Process data:
    [self processData:fullName dateOfBirth:dateOfBirth dateOfExpiry:dateOfExpiry documentNumber:documentNumber];
}
```

</TabItem>

</Tabs>

:::tip
All data fields are optional, so it's important to verify whether the required information is present if some of the accepted documents may not contain certain data.
:::

### Handling Rejection

The ID scanning process may fail for various reasons. Start by inspecting [`RejectionReason`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) to understand the cause.

You may wish to implement the follow-up action based on the reason of failure:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
func idCapture(_ idCapture: IdCapture,
               didReject capturedId: CapturedId?,
               reason: RejectionReason) {
    if reason == .timeout {
        // Ask the user to retry, or offer alternative input method.
    } else if reason == .notAcceptedDocumentType {
        // Ask the user to provide alternative document.
    } else {
     // Handle other rejection reasons, if necessary.
    }
}
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
- (void)idCapture:(SDCIdCapture *)idCapture
        didReject:(nullable SDCCapturedId *)capturedId
           reason:(SDCRejectionReason)rejectionReason {
    if (rejectionReason == SDCRejectionReasonTimeout) {
        // Ask the user to retry, or offer alternative input method.
    } else if (rejectionReason == SDCRejectionReasonNotAcceptedDocumentType) {
        // Ask the user to provide alternative document.
    } else {
     // Handle other rejection reasons, if necessary.
    }
}
```

</TabItem>

</Tabs>

## Set up Capture View and Overlay

When using the built-in camera as frame source, you will typically want to display the camera preview on the screen together with UI elements that guide the user through the capturing process. 

To do that, add a [`SDCDataCaptureView`](https://docs.scandit.com/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
let dataCaptureView = DataCaptureView(context: dataCaptureContext, frame: .zero)
view.addSubview(dataCaptureView)

dataCaptureView.translatesAutoresizingMaskIntoConstraints = false
view.addConstraints([
    dataCaptureView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    dataCaptureView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
    dataCaptureView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    dataCaptureView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
])
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
SDCDataCaptureView *dataCaptureView =
  [SDCDataCaptureView dataCaptureViewForContext:dataCaptureContext frame:CGRectZero];

dataCaptureView.translatesAutoresizingMaskIntoConstraints = NO;
[self.view addSubview:dataCaptureView];
[self.view addConstraint:[dataCaptureView.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor]];
[self.view addConstraint:[dataCaptureView.bottomAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.bottomAnchor]];
[self.view addConstraint:[dataCaptureView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor]];
[self.view addConstraint:[dataCaptureView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor]];
```

</TabItem>

</Tabs>

Then, add a [`SDCIdCaptureOverlay`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/ui/id-capture-overlay.html#class-scandit.datacapture.id.ui.IdCaptureOverlay) to the view:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
let overlay = IdCaptureOverlay(idCapture: idCapture, view: captureView)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
SDCIdCaptureOverlay *overlay = [SDCIdCaptureOverlay overlayWithIdCapture:idCapture view:dataCaptureView];
```

</TabItem>

</Tabs>

The overlay chooses the displayed UI automatically, based on the selected `SDCIdCaptureSettings`.

## Start the Capture Process

Finally, turn on the camera to start scanning:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
camera?.switch(toDesiredState: .on)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
[camera switchToDesiredState:SDCFrameSourceStateOn];
```

</TabItem>

</Tabs>