---
description: "MatrixScan Pick for Kotlin Multiplatform: a pre-built AR overlay UI for pick-and-pack workflows."

sidebar_position: 1
pagination_prev: null
framework: kmp
keywords:
  - kmp
---

# About MatrixScan Pick

MatrixScan Pick is a pre-built UI that uses augmented reality overlays to highlight specific items that need to be picked. Whereas MatrixScan AR is fully customizable, MatrixScan Pick is a pre-built solution that allows you to add a scan and pick experience with augmented reality to an existing app, with just a few lines of code.

MatrixScan Pick is implemented through functionality provided by `BarcodePick`.

## UI Overview

- MatrixScan Pick is inspired by the familiar paradigm of a camera, including a shutter button that the user operates to start and pause the scanning view. The Finish button is used at any time to exit the workflow.
- It highlights items with obvious and colorful visual dots on screen.
- When paused, MatrixScan Pick freezes the display at the last view, even if the device is moved. The Play button transitions back to the live view.
- Textual guidance is displayed from the beginning of the session and as the workflow progresses, informing the user of changes in item status (i.e. Detected, Ignored, To-Pick, or Picked).
- Status icons can be defined to provide further information to users for a given barcode. In the live view, the icons are displayed but not tappable. In the frozen view, the status icons can be tapped and expanded to provide additional textual information.
- The Get Started guide takes you through the process to install the full UI. You can then customize it, choosing to remove any elements on the screen except for the AR overlays, so you can create custom UIs suitable for your own workflows.

<ReactPlayer playing controls width='800' url="/img/batch-scanning/MatrixScanPick.mp4" />

## Supported Symbologies

MatrixScan Pick supports all [symbologies](../barcode-symbologies.mdx) **except** DotCode, MaxiCode and postal codes (KIX, RM4SCC).

If you are not familiar with the symbologies that are relevant for your use case, you can use capture presets that are tailored for different verticals (e.g. retail, logistics, etc.).
