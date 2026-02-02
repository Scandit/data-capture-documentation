---
description: "A **Label Definition** is a configuration that defines the label, and its relevant fields, that Smart Label Capture should recognize and extract during scans.                                                                            "

framework: net-android
keywords:
  - net-android
toc_max_heading_level: 4
---

# Label Definitions

A **Label Definition** is a configuration that defines the label, and its relevant fields, that Smart Label Capture should recognize and extract during scans.

Smart Label Capture provides a [Label Definition](https://docs.scandit.com/data-capture-sdk/dotnet.android/label-capture/api/label-definition.html#label-definition) API, enabling you to configure and extract structured data from predefined and custom labels. This feature provides a flexible way to recognize and decode fields within a specific label layout such as price tags, VIN labels, or packaging stickers without needing to write custom code for each label type.

There are two approaches to using label definitions:

- [**Pre-built Labels**](#pre-built-labels)
- [**Custom Labels**](#custom-labels)

## Pre-built Labels

Smart Label Capture includes ready-made label definitions for common use cases. These pre-built options let you recognize and extract information from standard label types without creating custom configurations:

<FeatureList
  product="smart-label-capture"
  category="Pre-built Labels"
  tag="Label Definitions"
  displayMode="compact"
/>

### Example: Price label

Use the `LabelCaptureSettings` builder to configure a pre-built label definition for price labels, such as those found in retail environments:

![Price Label Example](/img/slc/price-label.png)

```csharp
var settings = LabelCaptureSettings.Create()
    .AddLabel(LabelDefinition.CreatePriceCaptureDefinition("price-label"))
    .Build();
```

## Custom Labels

If Smart Label Capture's pre-built options don't fit your needs, define a custom label instead. Custom labels can combine your own fields with any of the available pre-built ones.

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

The following methods are available to configure custom fields:

| Method | Optional | Description |
|--------|----------|-------------|
| `ValueRegexes` | No | The regex patterns that identify the target string in the scanned content. |
| `AnchorRegexes` | Yes | Used to specify keywords or phrases that help identify the context of the field. This is particularly useful when the label contains multiple fields that could match the same pattern (e.g., when both packaging and expiry dates are present). |
| `Symbologies` | No | The barcode symbologies to match for barcode fields. This is important for ensuring that the field only captures data from specific barcode types, enhancing accuracy and relevance. |
| `IsOptional` | Yes | Whether the field is optional or mandatory. This is helpful when certain fields may not be present on every scan. |

#### Example: Fish Shipping Box

This example shows how to create a custom label definition for a fish shipping box, which includes fields for barcode and batch number.

![Fish Shipping Box Example](/img/slc/fish-shipping-box.png)

```csharp
var settings = LabelCaptureSettings.Create()
    .AddLabel()
        .AddCustomBarcode()
            .SetSymbologies(Symbology.Code128)
        .BuildFluent("barcode-field")
        .AddCustomText()
            .SetAnchorRegexes("Batch")
            .SetValueRegexes("FZ\\d{5,10}")
            .IsOptional(true)
        .BuildFluent("batch-number-field")
    .BuildFluent("shipping-label")
    .Build();
```

### Pre-built Fields

You can also build your label using pre-built fields. These common fields speed up integration because their `ValueRegexes`, `AnchorRegexes`, and `Symbologies` are already predefined.

Customization of pre-built fields is done via the `ValueRegexes`, `AnchorRegexes`, and `IsOptional` methods, which allow you to specify the expected format of the field data.

:::tip
All pre-built fields come with default `ValueRegexes` and `AnchorRegexes` that are suitable for most use cases. **Using either method is optional and will override the defaults**.

The `ResetAnchorRegexes` method can be used to remove the default `AnchorRegexes`, allowing you to rely solely on the `ValueRegexes` for detection.
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

```csharp
var settings = LabelCaptureSettings.Create()
    .AddLabel()
        .AddSerialNumberBarcode()
        .BuildFluent("serial-number")
        .AddPartNumberBarcode()
        .BuildFluent("part-number")
    .BuildFluent("hdd-label")
    .Build();
```
