---
description: "MatrixScan AR is the most advanced and flexible option for building custom augmented-reality workflows on top of multi-barcode scanning."

sidebar_position: 1
pagination_prev: null
framework: kmp
keywords:
  - kmp
---

# About MatrixScan AR

MatrixScan AR is Scandit's most advanced and flexible API for building custom augmented-reality workflows that scan and track multiple barcodes at once. It is a superset of [MatrixScan Batch](../matrixscan/intro.md): it tracks the same set of barcodes across frames, but adds a prebuilt AR view with configurable highlights, tap-driven annotations, torch/zoom/camera-switch controls, and audio/haptic feedback.

MatrixScan AR is implemented through two elements, both in the `com.kmp.datacapture.barcode.ar` package of the `barcode` module:

- `BarcodeAr` — the data capture mode driving scan-and-track recognition. Unlike most other modes, `BarcodeAr` is not a `DataCaptureMode`: it attaches itself to a `DataCaptureContext` when constructed via `BarcodeAr.forContext(...)`, so you never call `addMode()`/`removeMode()` for it.
- `BarcodeArView` — the prebuilt AR UI that renders highlights and annotations over tracked barcodes and hosts the camera preview.

Use MatrixScan AR as the go-to API for new projects that need custom, advanced AR capabilities. If you only need lightweight multi-barcode tracking without an AR overlay, use [MatrixScan Batch](../matrixscan/intro.md) instead.

Continue to [Get Started](./get-started.md) to add MatrixScan AR to your application.
