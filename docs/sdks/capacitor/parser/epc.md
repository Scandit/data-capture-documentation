---
sidebar_position: 9
pagination_prev: null
pagination_next: null
framework: capacitor
keywords:
  - capacitor
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

```ts
const parser = await Parser.create(ParserDataFormat.Epc);
const parsedData = await parser.parseString("303418705048259E449A941C");
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

- [Parser Get Started](/sdks/capacitor/parser/get-started)
- [Parser Data Format API](https://docs.scandit.com/data-capture-sdk/capacitor/parser/api/parser-data-format.html)
