---
sidebar_position: 1
pagination_prev: null
framework: netAndroid
keywords:
  - netAndroid
---

# About MatrixScan Find

MatrixScan Find is our pre-built UI that uses augmented reality overlays to highlight items that match predefined criteria. This is distinct from MatrixScan AR that is fully customizable, MatrixScan Find enables you to add a search and find experience with augmented reality to an existing native app with just a few lines of code.

MatrixScan Find bundles multiple scanning features together and addresses many common challenges associated with scanning on smart devices. It is designed to be easily integrated into any application, and can be customized to fit your specific needs.

## UI Overview

MatrixScan Find includes pre-built and pre-tested user interface (UI) elements and interactions in workflows. These UI elements are intentionally minimalistic, meant to be overlayed on any application without the need to adapt the existing app while offering the best user experience.

The UI workflow is designed to be as simple and ergonomic as possible, and includes the following elements:

![MatrixScan Find UI](/static/img/matrixscan-find/ui-overview.png)

- A **shutter button** the user operates in order to initiate scanning and searching for items.
- **Feedback** is overlaid as to highlight items with obvious and colorful visual dots on screen.
- When paused, MatrixScan Find showcases a **carousel** showing all the items that are currently being searched for, with a check mark showing those that have been found.
  - In active search mode the carousel is hidden to free up more screen space for tracking items.

Upon completing the scanning process, if all items have been successfully scanned, you can advance the user to the next scan automatically. Next steps may be finalizing order receipt if all items are present, reviewing the scan list to identify items that shouldn’t be present, or moving on to the next order.

## Supported Symbologies

MatrixScan Find supports all [symbologies](/docs/barcode-symbologies.md) **except** DotCode, MaxiCode and postal codes (KIX, RM4SCC).

If you are not familiar with the symbologies that are relevant for your use case, you can use capture presets that are tailored for different verticals (e.g. retail, logistics, etc.).
