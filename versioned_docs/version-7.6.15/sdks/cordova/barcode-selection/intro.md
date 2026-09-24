---
description: "Barcode Selection enables you to increase scanning accuracy and prevent users from scanning the wrong code in scenarios where there are multiple barcodes present, such as a crowded shelf, an order catalog with barcodes printed closely together, or a label with multiple barcodes.                                                         "

sidebar_position: 1
pagination_prev: null
framework: cordova
keywords:
  - cordova
---

# About Barcode Selection

Barcode Selection enables you to increase scanning accuracy and prevent users from scanning the wrong code in scenarios where there are multiple barcodes present, such as a crowded shelf, an order catalog with barcodes printed closely together, or a label with multiple barcodes.

Barcode Selection provides two key capabilities:

- **Aim to Select** allows users to select one code at a time. This is especially useful for one-handed operation.
- **Tap to Select** is a quick way for users to select several codes from the same view. Selection is done by tapping on highlighted barcodes in the live camera preview or on a frozen screen.

:::warning
Barcode Selection does not support handling of duplicate codes. If a code appears twice in the visible preview both instances will be marked as selected even if only one of them was selected.
:::
