---
description: "Parse data strings such as GS1 or driver's license barcodes into key-value mappings with the Kotlin Multiplatform Parser API."

sidebar_position: 2
pagination_prev: null
pagination_next: null
framework: kmp
keywords:
  - kmp
---

# Get Started

The parser parses data strings, e.g. as found in barcodes, into a set of key-value mappings. In this guide, you will know briefly how to use a parser and what types of parser are currently supported by Scandit. These data formats are supported: Health Industry Bar Code (HIBC), GS1 Application Identifier (AI) system, GS1 Digital Link, Swiss QR Codes, VIN Vehicle Identification Number, IATA Bar Coded Boarding Pass (BCBP), and Electronic Product Code (EPC).

More data formats will be added in future releases. Please contact us if the data format you are using is not yet supported, or you want to use the parser on a currently unsupported platform.

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.mdx).

:::note
You can retrieve your Scandit Data Capture SDK license key by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

First of all, include the `parser` module and its dependencies to your project, if any. `parser` has no dependency on other Scandit KMP modules, so it can be added on its own. See [Modules](/sdks/kmp/add-sdk.mdx#modules) for the exact Gradle coordinates and Swift Package products.

## Create a Parser

A `Parser` is created for a specific `ParserDataFormat`, bound to your `DataCaptureContext`:

```kotlin
import com.kmp.datacapture.core.capture.DataCaptureContext
import com.kmp.datacapture.parser.Parser
import com.kmp.datacapture.parser.ParserDataFormat

val dataCaptureContext = DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
val parser = Parser.forFormat(dataCaptureContext, ParserDataFormat.GS1_AI)
```

If your app already initialized a context (for example for a scanning mode), reuse it via `DataCaptureContext.sharedInstance` instead of initializing it again.

`ParserDataFormat` has the following values:

- `GS1_AI`
- `HIBC`
- `SWISS_QR`
- `VIN`
- `IATA_BCBP`
- `GS1_DIGITAL_LINK`
- `EPC`

## Parse a String

Call `parseString` (or `parseRawData` for binary payloads) with the data you want to parse, for example the data decoded from a scanned barcode:

```kotlin
import com.kmp.datacapture.barcode.data.Barcode
import com.kmp.datacapture.parser.ParsedData

fun parseBarcode(barcode: Barcode): ParsedData? {
    val data = barcode.data ?: return null
    return parser.parseString(data)
}
```

`parseString` and `parseRawData` throw on malformed input, so wrap the call accordingly:

```kotlin
fun parseBarcodeSafely(barcode: Barcode): ParsedData? {
    val data = barcode.data ?: return null
    return try {
        parser.parseString(data)
    } catch (e: Exception) {
        null
    }
}
```

## Read the Parsed Fields

`ParsedData` exposes the parsed key-value fields, along with any parsing issues:

```kotlin
val fields = result.fields
val fieldsByName = result.fieldsByName
val jsonString = result.jsonString

val expiryDate = fieldsByName["EXPIRY_DATE"]?.parsed
```

Each `ParsedField` carries its `name`, its decoded `parsed` value, the `rawString` it was decoded from, and any `warnings` (`ParserIssue`) raised while parsing that field. Fields that raised a warning are also available separately via `result.fieldsWithIssues`.
