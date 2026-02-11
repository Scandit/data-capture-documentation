---
sidebar_position: 9
pagination_prev: null
pagination_next: null
framework: web
keywords:
  - web
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
const parser = await Parser.forFormat(context, ParserDataFormat.EPC);
const parsedData = await parser.parseStringToJson("303418705048259E449A941C");
```

The parsed result includes fields such as:
- `header`
- `filter`
- `partition`
- `companyPrefix`
- `itemReference`
- `serialNumber`
- `sgtin96`

## See Also

- [Parser Get Started](/sdks/web/parser/get-started)
- [Parser Data Format API](https://docs.scandit.com/data-capture-sdk/web/parser/api/parser-data-format.html)
