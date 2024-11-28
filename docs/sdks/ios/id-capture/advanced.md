---
sidebar_position: 4
pagination_next: null
framework: ios
keywords:
  - ios
---

# Advanced Configurations

There are several advanced configurations that can be used to customize the behavior of the ID Capture SDK and enable additional features.

## Decode EU Driver Licenses

By default, ID Capture doesn’t extract data from the table on the back of European Driver Licenses. If you are interested in this data, you may enable the extraction by calling:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
settings.decodeBackOfEuropeanDrivingLicense = true
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
settings.decodeBackOfEuropeanDrivingLicense = YES;
```

</TabItem>

</Tabs>

:::warning
To use this feature, you will need to include the `ScanditIdEuropeDrivingLicense` module in your project. See the [module overview](/sdks/ios/id-capture/get-started.md#module-overview) for details.
:::

## Configure Data Anonymization

By default, data extracted from documents is anonymized according to local regulations. See [Anonymized Documents](/sdks/ios/id-capture/intro.md#anonymized-documents) for more information.

That means certain data from certain fields won’t be returned, even if it’s present on a document. You control the anonymization level with the following setting:

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
// Default value:
settings.anonymizationMode = .fieldsOnly

// Sensitive data is additionally covered with black boxes on returned images:
settings.anonymizationMode = .fieldsAndImages

// Only images are anonymized:
settings.anonymizationMode = .imagesOnly

// No anonymization:
settings.anonymizationMode = .none
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
// Default value:
settings.anonymizationMode = SDCIdAnonymizationModeFieldsOnly;

// Sensitive data is additionally covered with black boxes on returned images:
settings.anonymizationMode = SDCIdAnonymizationModeFieldsAndImages;

// Only images are anonymized:
settings.anonymizationMode = SDCIdAnonymizationModeImagesOnly;

// No anonymization:
settings.anonymizationMode = SDCIdAnonymizationModeNone;
```

</TabItem>

</Tabs>

## ID Images

Your use can may require that you capture and extract images of the ID document. Use the [IdImageType](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-image-type.html#enum-scandit.datacapture.id.IdImageType) enum to specify the images you want to extract from the `CapturedId` object.

:::tip
Face and Cropped Document can be extracted only by either `SingleSideScanner` with `visualInspectionZone` enabled or by `FullDocumentScanner`.
In the case of `FullDocumentScanner`, if the front & the back side of a document are scanned, Cropped Document and Full Frame are returned for both sides.
:::

For the full frame of the document, you can use [`setShouldPassImageTypeToResult`](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/id-capture-settings.html#method-scandit.datacapture.id.IdCaptureSettings.SetShouldPassImageTypeToResult) when creating the `IdCaptureSettings` object. This will pass the image type to the result, which you can then access in the `CapturedId` object.

<Tabs groupId="language">

<TabItem value="swift" label="Swift">

```swift
// Holder's picture as printed on a document:
settings.resultShouldContainImage(true, for: .face)

// Cropped image of a document:
settings.resultShouldContainImage(true, for: .croppedDocument)

// Full camera frame that contains the document:
settings.resultShouldContainImage(true, for: .frame)
```

</TabItem>

<TabItem value="objc" label="Objective-C">

```objectivec
// Holder's picture as printed on a document:
[settings resultShouldContainImage:YES forImageType:SDCIdImageTypeFace];

// Cropped image of a document:
[settings resultShouldContainImage:YES forImageType:SDCIdImageTypeCroppedDocument];

// Full camera frame that contains the document:
[settings resultShouldContainImage:YES forImageType:SDCIdImageTypeFrame];
```

</TabItem>

</Tabs>

## Callbacks and Scanning Workflows

The ID Capture Listener provides two callbacks: `onIdCaptured` and `onIdRejected`. The `onIdCaptured` callback is called when an acceptable document is successfully captured, while the `onIdRejected` callback is called when a document is captured but rejected.

For a successful capture, the `onIdCaptured` callback provides a `SDCCapturedId` object that contains the extracted information from the document. This object is specific to the type of document scanned. For example, a `SDCCapturedId` object for a US Driver License will contain different fields than a `SDCCapturedId` object for a Passport.

For a rejected document, a [SDCRejectionReason](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/rejection-reason.html#enum-scandit.datacapture.id.RejectionReason) is provided in the `onIdRejected` callback to help you understand why the document was rejected and to take appropriate action. These are:

* NOT_ACCEPTED_DOCUMENT_TYPE: The document is not in the list of accepted documents. In this scenario, you could direct the user to scan a different document.
* INVALID_FORMAT: The document is in the list of accepted documents, but the format is invalid. In this scenario, you could direct the user to scan the document again.
* DOCUMENT_VOIDED: The document is in the list of accepted documents, but the document is voided. In this scenario, you could direct the user to scan a different document.
* TIMEOUT: The document was not scanned within the specified time. In this scenario, you could direct the user to scan the document again.

## Detect Fake IDs

*ID Validate* is a fake ID detection software. It currently supports documents that follow the Driver License/Identification Card specification by the American Association of Motor Vehicle Administrators (AAMVA).

The following verifier is available:

* [SDCAAMVABarcodeVerifier](https://docs.scandit.com/data-capture-sdk/ios/id-capture/api/aamva-barcode-verifier.html#class-scandit.datacapture.id.AamvaBarcodeVerifier): Validates the authenticity of the document by scanning the barcode on the back.

To enable ID validation for your subscription, please reach out to [Scandit Support](mailto:support@scandit.com).


