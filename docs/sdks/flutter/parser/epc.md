---
sidebar_position: 9
pagination_prev: null
pagination_next: null
framework: flutter
keywords:
  - flutter
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

```dart
final parser = await Parser.create(ParserDataFormat.epc);
final parsedData = await parser.parseString("303418705048259E449A941C");
```

`parsedData.fields` includes structured values, including fields such as:
- `header`
- `filter`
- `partition`
- `companyPrefix`
- `itemReference`
- `serialNumber`
- `sgtin96`

## See Also

- [Parser Get Started](/sdks/flutter/parser/get-started)
- [Parser Data Format API](https://docs.scandit.com/data-capture-sdk/flutter/parser/api/parser-data-format.html)
