---
description: "The Scandit Data Capture SDK supports scanning of all . The specification defines three different types: A, B and C.                                                                                "

sidebar_position: 2
displayed_sidebar: sdcSidebar
---

# Composite Codes

The Scandit Data Capture SDK supports scanning of all [GS1 Composite Codes](/barcode-symbologies.md#gs1-composite-codes). The specification defines three different types: A, B and C.

:::note
Composite codes are only supported in `SDCBarcodeCapture`.
:::

For composite codes Type A and B the 2d component is always a `SDCSymbologyMicroPDF417` and the 1d component can be any of the following symbologies:

* `SDCSymbologyEAN13UPCA`
* `SDCSymbologyEAN8`
* `SDCSymbologyUPCE`
* `SDCSymbologyGS1Databar`
* `SDCSymbologyGS1DatabarExpanded`
* `SDCSymbologyGS1DatabarLimited`

For composite codes of Type C the 2d component is always `SDCSymbologyPDF417` while the 1d component is `SDCSymbologyCode128`.

## Enabling Composite Codes

Composite code scanning is enabled in the `SDCBarcodeCaptureSettings` as follows:

* One or more composite types need to be enabled via `enabledCompositeTypes`
* The symbologies associated with those composite types need to be enabled through `enableSymbologiesForCompositeTypes:`.

For example, to enable scanning of composite code A:

* First `SDCCompositeTypeA` is enabled with a call to `enabledCompositeTypes`
* A call to `enableSymbologiesForCompositeTypes:` passing `SDCCompositeTypeA` the following symbologies will be enabled:
    * `SDCSymbologyEAN13UPCA`
    * `SDCSymbologyEAN8`
    * `SDCSymbologyUPCE`
    * `SDCSymbologyGS1Databar`
    * `SDCSymbologyGS1DatabarExpanded`
    * `SDCSymbologyGS1DatabarLimited`
    * `SDCSymbologyMicroPDF417`

The same can be accomplished by individually enabling all of these symbologies with `setSymbology:enabled:`.

`enableSymbologiesForCompositeTypes:` is a convenience function to enable all at once for a certain composite type. If you only want to scan a subset of the possible symbologies of a composite type then you should only enable those. It is not possible to disable a specific symbology, like `SDCSymbologyGS1DatabarExpanded` for `SDCCompositeTypeA` but keep it enabled for `SDCCompositeTypeB`, it is either enabled for both or neither.

The following lines of code show you how this is done to enable scanning of composite codes A and C. Composite code B will not be recognized in these examples as `SDCCompositeTypeB` is not enabled:

```swift
let settings = BarcodeCaptureSettings()

let compositeTypes: CompositeType = [.a, .c]
settings.enableSymbologies(forCompositeTypes: compositeTypes)
settings.enabledCompositeTypes = compositeTypes
```

:::note
Enabling composite codes will slow down the recognition of non-composite codes slightly. You should only enable composite codes if you expect them to be present.
:::

## Improving Composite Code Recognition

The `SDCSymbologyMicroPDF417` is contained in all composite codes A and B but is generally not very easy to recognize in a large scan area because of its compressed size.

To improve the recognition rate it is advised to restrict the scan area when scanning Composite Code A and B, which is best done through a rectangular location selection.

## Reading Composite Code Data

When composite codes are enabled the Scandit Data Capture SDK automatically couples the composites to the main code and returns the composite’s data through `SDCBarcode.compositeData` and `SDCBarcode.compositeRawData`.

There are two potential cases when a barcode of a symbology with enabled composite extension is returned:

* The barcode has a composite and is returned with composite data
* The barcode does not have an composite and is returned without composite data

Inside `SDCBarcodeCaptureListener.barcodeCapture:didScanInSession:frameData:` the data can be retrieved from the recognized barcode as follows:

```swift
let barcode = session.newlyRecognizedBarcode[0]

let data = barcode.data
let compositeData = barcode.compositeData
if let compositeData = compositeData {
    // Do something with the data & compositeData.
} else {
    // Do something with just the data.
}
```
