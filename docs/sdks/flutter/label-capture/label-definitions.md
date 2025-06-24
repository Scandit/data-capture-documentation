---
framework: flutter
keywords:
  - flutter
---

# Label Definitions

A **Label Definition** is a configuration that defines the label, and its relevant fields, that Smart Label Capture should recognize and extract during scans.

Smart Label Capture provides a [Label Definition](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-definition.html#label-definition) API, enabling you to configure and extract structured data from predefined and custom labels. This feature provides a flexible way to recognize and decode fields within a specific label layout such as price tags, VIN labels, or packaging stickers without needing to write custom code for each label type.

There are three approaches to using label definitions:

- [**Pre-built Labels**](#pre-built-labels)
- [**Pre-built Fields**](#pre-built-fields)
- [**Custom Labels and Fields**](#custom-labels-and-fields)

## Pre-built Labels

Smart Label Capture provides pre-built label definitions out of the box for the following common label types:

- [**Price Label**](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-definition.html#method-scandit.datacapture.label.LabelDefinition.PriceCaptureDefinitionWithName): This factory method is designed for price checking scenarios where both barcode and price text need to be captured from product labels. Returns `SKU` and `priceText` fields.
- [**VIN Label**](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-definition.html#method-scandit.datacapture.label.LabelDefinition.VinLabelDefinitionWithName): A predefined label definition for scanning Vehicle Identification Numbers (VIN). Returns `text` and/or `barcode` fields.

### Example: Price label

Use the `LabelCaptureSettings` builder to configure a pre-built label definition for price labels, such as those found in retail environments:

![Price Label Example](/img/slc/price-label.png)

```dart
final settings = LabelCaptureSettingsBuilder()()
    .addLabel(LabelDefinition.priceCaptureDefinitionWithName("price-label"))
    .build();
```

## Pre-built Fields

You can also configure your label by using pre-built fields. This allows more granular customization of the label definition without needing to define a complete label structure.

Customization of pre-built fields is done via the `patterns` and `dataTypePatterns` methods, which allow you to specify the expected format of the field data.

:::tip
All pre-built fields come with default `patterns` and `dataTypePatterns` that are suitable for most use cases. Using either method is optional and will override the defaults.
:::

### `patterns`

The `patterns` method is used to define the expected format of the field data. It accepts one or more regular expressions that the captured data must match.

### `dataTypePatterns`

The `dataTypePatterns` method is used to specify identifying keywords that help the system recognize the context of the field. This is particularly useful for fields like expiry dates or packing dates, where the surrounding text can vary.

:::tip
The `resetDataTypePatterns` method can be used to remove the default `dataTypePattern`, allowing you to rely solely on the `patterns` for detection.
:::

### Example: Hard disk drive label

This example demonstrates how to configure a label definition for a hard disk drive (HDD) label, which typically includes common fields like serial number and part number.

![Hard Disk Drive Label Example](/img/slc/hdd-label.png)

```dart
final settings = LabelCaptureSettingsBuilder()()
    .addLabel(LabelDefinitionBuilder()
        .addSerialNumberBarcode()
        .buildFluent("serial-number")
        .addPartNumberBarcode()
        .buildFluent("part-number")
        .buildFluent("hdd-label"))
    .build();
```

## Custom Labels and Fields

If your use case is unique and not covered by Smart Label Capture's predefined options for label and fields, you can define your own custom label and its fields.

### `patterns`

This is a **mandatory** field when creating a custom field.

The `patterns` method allows you to define one or more regex-based patterns that identify the target string in the scanned content.

### `dataTypePatterns`

The `dataTypePatterns` method is used to specify keywords or phrases that help identify the context of the field. This is particularly useful when the label contains multiple fields that could match the same pattern (e.g., when both packaging and expiry dates are present).

### `symbologies`

This is a **mandatory** field when creating a custom barcode field.

The `symbologies` method allows you to specify which barcode symbologies are valid for the custom field. This is important for ensuring that the field only captures data from specific barcode types, enhancing accuracy and relevance.

### Example: Fish Shipping Box

This example shows how to create a custom label definition for a fish shipping box, which includes fields for barcode and batch number.

![Fish Shipping Box Example](/img/slc/fish-shipping-box.png)

```dart
final settings = LabelCaptureSettingsBuilder()()
    .addLabel(LabelDefinitionBuilder()  
        .addCustomBarcode()
            .setSymbologies([Symbology.code128])
            .buildFluent("barcode-field")
        .addCustomText()
            .setDataTypePatterns(["Batch"])
            .setPatterns(["FZ\\d{5,10}"])
            .setOptional(true)
            .buildFluent("batch-number-field")
        .buildFluent("shipping-label"))
    .build();
```

## Field Types

The [LabelDefinitionBuilder](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-definition-builder.html) API provides various field types you can use to define the structure of your label.

### Barcode Fields

* [`SerialNumberBarcode`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/serial-number-barcode.html#serial-number-barcode)
* [`PartNumberBarcode`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/part-number-barcode.html#part-number-barcode)
* [`ImeiOneBarcode`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/imei-one-barcode.html#imei-one-barcode)
* [`ImeiTwoBarcode`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/imei-two-barcode.html#imei-two-barcode)
* [`CustomBarcode`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/custom-barcode.html#custom-barcode)

### Price and Weight Fields

* [`UnitPriceText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/unit-price-text.html#unit-price-text)
* [`TotalPriceText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/total-price-text.html#total-price-text)
* [`WeightText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/weight-text.html#weight-text)

### Date and Custom Text Fields

* [`PackingDateText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/packing-date-text.html#packing-date-text)
* [`ExpiryDateText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/expiry-date-text.html#expiry-date-text)
* [`CustomText`](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/custom-text.html#custom-text)

### Optional Fields

Fields can be marked as optional, this is helpful when certain fields may not be present on every scan.

```dart
final field = LabelField('expiryDate')
  .setOptional(true);
```