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

<ReactPlayer playing controls width='800' url="/img/batch-scanning/MatrixScanCheck.mp4" />

MatrixScan AR is implemented through two elements, both in the `com.kmp.datacapture.barcode.ar` package of the `barcode` module:

- `BarcodeAr`—the data capture mode driving scan-and-track recognition. Unlike most other modes, `BarcodeAr` is not a `DataCaptureMode`: it attaches itself to a `DataCaptureContext` when constructed via `BarcodeAr.forContext(...)`, so you never call `addMode()`/`removeMode()` for it.
- `BarcodeArView`—the prebuilt AR UI that renders highlights and annotations over tracked barcodes and hosts the camera preview.

## Highlights

Used to enable the user to identify the scanned barcode. They are shown on top of the respective barcode and displayed as soon as the barcode is scanned.

<ReactPlayer playing controls width='800' url="/img/matrixscan-ar/highlights.mp4" />

## Annotations

Displayed outside of the area of a barcode and attach to the scanned barcode. There are multiple types of annotations available:

### Info Annotation

Comprised of any desired combination of text and/or icons. Info annotations are displayed on the screen and can be configured to appear on scan.

<ReactPlayer playing controls width='800' url="/img/matrixscan-ar/annotations.mp4" />

### Status Icons

The collapsed icon is shown as soon as the barcode is scanned. It expands to display the icon and any desired text when the user taps on it, and collapses once tapped again.

<ReactPlayer playing controls width='800' url="/img/matrixscan-ar/status_icons.mp4" />

### Popovers

Comprised of any desired combination of text and icons. Popovers appear upon tapping the respective highlight and can be configured to appear on scan. They are removed on tapping the highlight or area inside the popover.

<ReactPlayer playing controls width='800' url="/img/matrixscan-ar/popovers.mp4" />

## Next Steps

Use MatrixScan AR as the go-to API for new projects that need custom, advanced AR capabilities. If you only need lightweight multi-barcode tracking without an AR overlay, use [MatrixScan Batch](../matrixscan/intro.md) instead.

Continue to [Get Started](./get-started.md) to add MatrixScan AR to your application.
