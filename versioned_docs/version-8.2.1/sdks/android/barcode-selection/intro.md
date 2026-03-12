---
description: "Barcode Selection enables you to increase scanning accuracy and prevent users from scanning the wrong code in scenario where there are multiple barcodes present. This includes the following:                                                                        "

sidebar_position: 1
pagination_prev: null
framework: android
keywords:
  - android
---

# About Barcode Selection

:::warning
We recommend using **SparkScan** or **Barcode Capture API** instead of Barcode Selection. With the new [AI-powered features](/sdks/android/ai-powered-barcode-scanning), barcode selection in crowded environments is done without the need of a dedicated API. This API will be deprecated.
:::

Barcode Selection enables you to increase scanning accuracy and prevent users from scanning the wrong code in scenario where there are multiple barcodes present. This includes the following:

- A crowded shelf where users want to scan the correct barcode to report stockouts or perform a cycle count.
- An order catalog with barcodes printed closely together.
- A label that has several types of barcodes; however users are only interested in scanning barcodes that have the same type, but cannot select them programmatically.

Barcode Selection provides two key capabilities:

- **Aim to Select** allows users to select one code at a time. This is especially useful for one-handed operation.
- **Tap to Select** is a quick way for users to select several codes from the same view. Selection is done by tapping on highlighted barcodes in the live camera preview or on a frozen screen. Tapping on codes while keeping the smartphone steady can be tricky, and freezing the screen allows for ergonomic use.

:::warning
Barcode Selection does not support handling of duplicate codes. If a code appears twice in the visible preview both instances will be marked as selected even if only one of them was selected.
:::
