---
description: "MatrixScan Batch enables you to capture and interact with multiple barcodes simultaneously."

sidebar_position: 1
pagination_prev: null
framework: kmp
keywords:
  - kmp
---

# About MatrixScan Batch

MatrixScan Batch is Scandit's low-level API for scanning and tracking multiple barcodes at once, without augmented-reality overlays. It is implemented through the `BarcodeBatch` data capture mode, in the `com.kmp.datacapture.barcode.batch` package of the `barcode` module.

Typical use cases include:

- Inventory counts and stocktaking
- Receiving and put-away workflows
- Any scenario where you need to recognize and track several barcodes in the camera's field of view at the same time, without guiding the user through a check-off flow

## How It Works

`BarcodeBatch` tracks barcodes across frames, assigning each one a stable tracking identifier via [`TrackedBarcode`](./get-started.md#track-the-results). You can either:

- Use [`BarcodeBatchBasicOverlay`](./get-started.md#host-a-data-capture-view-and-visualize-the-tracked-barcodes) to highlight tracked barcodes on top of the camera preview with minimal setup, or
- Use [`BarcodeBatchAdvancedOverlay`](./advanced.md) to render your own native view (e.g. a badge or button) anchored to each tracked barcode.

If your use case needs a prebuilt augmented-reality UI with highlights, annotations, and a guided scan-and-check flow, see [MatrixScan AR](../matrixscan-ar/intro.md) instead — it is a superset of MatrixScan Batch's tracking capabilities.

Continue to [Get Started](./get-started.md) to add MatrixScan Batch to your application.
