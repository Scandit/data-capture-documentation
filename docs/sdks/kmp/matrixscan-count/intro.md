---
description: "MatrixScan Count is our pre-built scan and count solution for counting and receiving multiple items at once, built on the Kotlin Multiplatform BarcodeCount mode and view."

sidebar_position: 1
pagination_prev: null
framework: kmp
keywords:
  - kmp
---

# About MatrixScan Count

MatrixScan Count is our pre-built scan and count solution for counting and receiving multiple items at once. It fits on top of any Kotlin Multiplatform application, providing an intuitive user interface for simple, fast and ergonomic scanning. MatrixScan Count enables the accurate scanning and counting of multiple items at once via smart devices, speeding up counting workflows considerably. The solution is designed to boost worker productivity, reduce human error and maintain accurate stock levels.

MatrixScan Count bundles multiple scanning features together and addresses many common challenges associated with scanning on smart devices. It is designed to be easily integrated into any application, and can be customized to fit your specific needs.

On Kotlin Multiplatform, MatrixScan Count is exposed through the `BarcodeCount` data capture mode and the `BarcodeCountView` built-in UI, both of which are shared between Android and iOS.

## UI Overview

MatrixScan Count includes pre-built and pre-tested user interface (UI) elements and interactions. These UI elements are intentionally minimalistic, meant to be overlaid on any application without the need to adapt the existing app while offering the best user experience.

The UI workflow is designed to be as simple and ergonomic as possible, and includes the following elements:

- A **shutter button** the user operates in order to initiate scanning. The user is guided to tap the shutter to scan items.
- A **loading indicator** is momentarily present, indicating to hold still while scanning is in progress.
- **Feedback** is overlaid as augmented reality (AR) icons on top of scanned barcodes, indicating successful scans and barcodes that should not be present. A counter badge and progress bar provide further confirmation of scans.
    - The counter badge counts the number of codes scanned.
    - The progress bar replaces the counter badge when scanning against a list of expected codes.

Upon completing the scanning process, if all items have been successfully scanned, you can advance the user to the next step automatically — for example finalizing an order receipt, or reviewing the scan list to identify unexpected items.

## Supported Symbologies

MatrixScan Count supports all [symbologies](../barcode-symbologies.mdx) except DotCode, MaxiCode and postal codes (KIX, RM4SCC).

## Next Steps

Continue with [Get Started](./get-started.md) to add MatrixScan Count to your application, or jump straight to [Advanced Configurations](./advanced.md) if you already have a basic integration running.
