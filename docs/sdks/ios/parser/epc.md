---
sidebar_position: 9
pagination_prev: null
pagination_next: null
framework: ios
keywords:
  - ios
---

# Electronic Product Code (EPC)

## Overview

The EPC parser supports Electronic Product Code payloads in hexadecimal form.

:::note
Currently only RFID Tag EPC Memory Bank Contents in GS1 SGTIN-96 format is supported.
:::

## Example Data

```text
303418705048259E449A941C
```

## Parse EPC Data

```swift
let parser = try Parser(context: context, format: .epc)
let parsedData = try parser.parseString("303418705048259E449A941C")
```

`parsedData.fieldsByName` contains structured values, including fields such as:
- `header`
- `filter`
- `partition`
- `companyPrefix`
- `itemReference`
- `serialNumber`
- `sgtin96`

## See Also

- [Parser Get Started](/sdks/ios/parser/get-started)
- [Parser Data Format API](https://docs.scandit.com/data-capture-sdk/ios/parser/api/parser-data-format.html)
