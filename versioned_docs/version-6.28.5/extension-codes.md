---
displayed_sidebar: sdcSidebar
---

# Add-on Codes

:::important
Add-on codes are only supported in `SDCBarcodeCapture`.
:::

The Scandit Data Capture SDK supports add-on codes (also known as Extension Codes) for EAN-8, EAN-13, UPC-A and UPC-E codes. These codes encode additional product data like an issue number, date or price. There is a two and a five digit version. This guide will show you how to enable and read out add-on codes.

## Enabling Add-on Codes

Add-ons are handled through symbology extensions. To scan add-on codes:

Enable the main symbologies that should be scanned (EAN-8, EAN-13, UPC-A and UPC-E).

For each main symbology enable the wanted add-on symbology extension(s). The two add-on extensions are:

* `two_digit_add_on`
* `five_digit_add_on`

The following lines of code show you how this is done to enable the two digit add-on for EAN-13, UPC-A and the five digit add-on for EAN-8 while UPC-E is not expecting any add-ons:

```swift
let settings = BarcodeCaptureSettings()

let ean13upcaSettings = settings.settings(for: .ean13UPCA)
ean13upcaSettings.isEnabled = true
ean13upcaSettings.set(extension: "two_digit_add_on", enabled: true)

let ean8Settings = settings.settings(for: .ean8)
ean8Settings.isEnabled = true
ean8Settings.set(extension: "five_digit_add_on", enabled: true)

settings.set(symbology: .upce, enabled: true)
```

:::note
Enabling add-on codes will slow down the recognition of non-add-on codes slightly because the Scandit Data Capture SDK needs to make absolutely sure that no add-on code was missed. If you are not expecting add-on codes for a certain symbology then don’t enable them.
:::

## Reading Add-on Codes

When add-on codes are enabled the Scandit Data Capture SDK automatically couples the add-ons to the main code and returns the add-on’s data through `SDCBarcode.addOnData`. There are two potential cases when a barcode of a symbology with enabled add-on extension is returned, when the barcode:

* Has an add-on and is returned with add-on data
* Does not have an add-on and is returned without add-on data

Inside `SDCBarcodeCaptureListener.barcodeCapture:didScanInSession:frameData:` the data can be retrieved from the recognized barcode as follows:

```swift
let barcode = session.newlyRecognizedBarcode[0]

let data = barcode.data
let addOnData = barcode.addOnData
if let addOnData = addOnData {
    // Do something with the data & addOnData.
} else {
    // Do something with just the data.
}
```
