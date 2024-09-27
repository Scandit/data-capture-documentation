---
sidebar_position: 2
pagination_prev: null
pagination_next: null
framework: flutter
keywords:
  - flutter
---

# Get Started

The parser parses data strings, e.g. as found in barcodes, into a set of key-value mappings. In this guide, you will know briefly how to use a parser and what types of parser are currently supported by Scandit. These data formats are supported: [Health Industry Bar Code (HIBC)](https://docs.scandit.com/data-capture-sdk/flutter/parser/hibc.html), [GS1 Application Identifier (https://docs.scandit.com/data-capture-sdk/flutter/parser/AI) system](https://docs.scandit.com/data-capture-sdk/flutter/parser/gs1ai.html) and [Swiss QR Codes](https://docs.scandit.com/data-capture-sdk/flutter/parser/swissqr.html), [VIN Vehicle Identification
Number](https://docs.scandit.com/data-capture-sdk/flutter/parser/vin.html), [IATA Bar Coded Boarding Pass (BCBP)](https://docs.scandit.com/data-capture-sdk/flutter/parser/iata-bcbp.html).

More data formats will be added in future releases. Please contact us if the data format you are using is not yet supported, or you want to use the parser on a currently unsupported platform.

## Format-Specific Documentation

- [Supported Data Formats](https://docs.scandit.com/data-capture-sdk/flutter/parser/formats.html)
- [HIBC](https://docs.scandit.com/data-capture-sdk/flutter/parser/hibc.html)
- [GS1 AI](https://docs.scandit.com/data-capture-sdk/flutter/parser/gs1ai.html)
- [GS1 Digital Link](https://docs.scandit.com/data-capture-sdk/flutter/parser/gs1-digital-link.html)
- [Swiss QR](https://docs.scandit.com/data-capture-sdk/flutter/parser/swissqr.html)
- [VIN](https://docs.scandit.com/data-capture-sdk/flutter/parser/vin.html)
- [IATA BCBP](https://docs.scandit.com/data-capture-sdk/flutter/parser/iata-bcbp.html)

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out [this guide](../add-sdk.md).

:::note
You can retrieve your Scandit Data Capture SDK license key, by signing in to [your Scandit account](https://ssl.scandit.com/dashboard/sign-in).
:::

First of all, include the ScanditParser library and its dependencies to your project, if any.

## Internal dependencies

Some of the Scandit Data Capture SDK modules depend on others to work:

| Module                              | Dependencies                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| scandit-flutter-datacapture-core    | No dependencies                                                                  |
| scandit-flutter-datacapture-barcode | scandit-flutter-datacapture-core                                                 |
| scandit-flutter-datacapture-parser  | scandit-flutter-datacapture-core                                                 |
| scandit-flutter-datacapture-text    | scandit-flutter-datacapture-core                                                 |
| scandit-flutter-datacapture-id      | scandit-flutter-datacapture-core scandit-flutter-datacapture-text(VIZ documents) |
