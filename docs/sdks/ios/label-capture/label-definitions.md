---
description: "Smart Label Capture provides a API, enabling you to configure and extract structured data from predefined and custom labels. This feature provides a flexible way to recognize and decode fields within a specific label layout such as price tags, VIN labels, or packaging stickers without needing to write custom code for each label type.                                              "

framework: ios
toc_max_heading_level: 4
keywords:
  - ios
---

# Label Definitions

Smart Label Capture provides a [Label Definition](https://docs.scandit.com/data-capture-sdk/ios/label-capture/api/label-definition.html#label-definition) API, enabling you to configure and extract structured data from predefined and custom labels. This feature provides a flexible way to recognize and decode fields within a specific label layout such as price tags, VIN labels, or packaging stickers without needing to write custom code for each label type.

A **Label Definition** is a configuration that defines the label, and its relevant fields, that Smart Label Capture should recognize and extract during scans.

There are two approaches to using label definitions:

- [**Pre-built Labels**](#pre-built-labels)
- [**Custom Labels**](#custom-labels)

## Pre-built Labels

Smart Label Capture provides pre-built label definitions out of the box for the following common label types:

<FeatureList 
  product="smart-label-capture" 
  category="Pre-built Labels" 
  tag="Label Definitions" 
  displayMode="compact"
/>

### Example: Price label

Configure a pre-built label definition for price labels, such as those found in retail environments:

![Price Label Example](/img/slc/price-label.png)

```swift
let settings = try LabelCaptureSettings {
    LabelDefinition.priceCapture(withName: "price-label")
}
```

## Custom Labels

If your use case is unique and not covered by Smart Label Capture's pre-built labels, you can define your own custom labels. These custom labels can use any combination of fully custom fields and pre-built fields, detailed below.

:::tip
The following characters are recognized: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ()-./:,$¶"`.
:::

### Custom Fields

There are two types of custom fields you can define:

<FeatureList 
  product="smart-label-capture" 
  category="Custom Fields" 
  tag="Field Types" 
  displayMode="compact"
/>

The following fluent methods are available to configure custom fields:

| Method | Optional | Description |
|--------|----------|-------------|
| `valueRegex()` / `valueRegexes()` | No | The regex patterns that identify the target string in the scanned content. |
| `anchorRegex()` / `anchorRegexes()` | Yes | Used to specify keywords or phrases that help identify the context of the field. This is particularly useful when the label contains multiple fields that could match the same pattern (e.g., when both packaging and expiry dates are present). |
| `symbologies` (init param) | No | The barcode symbologies to match for barcode fields. This is important for ensuring that the field only captures data from specific barcode types, enhancing accuracy and relevance. |
| `optional()` | Yes | Whether the field is optional or mandatory. This is helpful when certain fields may not be present on every scan. |

#### Example: Fish Shipping Box

This example shows how to create a custom label definition for a fish shipping box, which includes fields for barcode and batch number.

![Fish Shipping Box Example](/img/slc/fish-shipping-box.png)

```swift
let settings = try LabelCaptureSettings {
    LabelDefinition("shipping-label") {
        CustomBarcode(
            name: "barcode-field",
            symbologies: [NSNumber(value: Symbology.code128.rawValue)]
        )

        CustomText(name: "batch-number-field")
            .anchorRegexes(["Batch"])
            .valueRegexes(["FZ\\d{5,10}"])
            .optional(true)
    }
}
```

### Pre-built Fields

You can also configure your label by using pre-built fields. These are some common fields provided for faster integration, with all value regex patterns and anchor regex patterns already predefined.

Customization of pre-built fields is done via the `valueRegex()`, `valueRegexes()`, `anchorRegex()`, `anchorRegexes()`, and `optional()` fluent methods, which allow you to specify the expected format of the field data.

:::tip
All pre-built fields come with default value and anchor regex patterns that are suitable for most use cases. **Using these methods is optional and will override the defaults**.

The `resetAnchorRegexes()` method can be used to remove the default anchor regexes, allowing you to rely solely on the value patterns for detection.
:::

import FeatureList from '@site/src/components/FeatureList';

#### Barcode Fields

<FeatureList 
  product="smart-label-capture" 
  category="Pre-built Fields" 
  tag="Barcode Fields" 
  displayMode="compact"
/>

#### Price and Weight Fields

<FeatureList 
  product="smart-label-capture" 
  category="Pre-built Fields" 
  tag="Price and Weight Fields" 
  displayMode="compact"
/>

#### Date and Custom Text Fields

<FeatureList 
  product="smart-label-capture" 
  category="Pre-built Fields" 
  tag="Date and Custom Text Fields" 
  displayMode="compact"
/>

#### Example: Hard disk drive label

This example demonstrates how to configure a label definition for a hard disk drive (HDD) label, which typically includes common fields like serial number and part number.

![Hard Disk Drive Label Example](/img/slc/hdd-label.png)

```swift
let settings = try LabelCaptureSettings {
    LabelDefinition("hdd-label") {
        SerialNumberBarcode(name: "serial-number")
        PartNumberBarcode(name: "part-number")
    }
}
```

