---
sidebar_position: 1
pagination_prev: null
framework: capacitor
tags: [capacitor]
keywords:
  - capacitor
---

# About MatrixScan Count

MatrixScan Count is our pre-built scan and count solution for counting and receiving multiple items at once. It fits on top of any smartphone application, providing an intuitive user interface for simple, fast and ergonomic scanning. MatrixScan Count enables the accurate scanning and counting of multiple items at once via smart devices, speeding counting workflows by up to 10 times. The solution is designed to boost worker productivity, reduce human error and maintain accurate stock levels.

MatrixScan Count bundles multiple scanning features together and addresses many common challenges associated with scanning on smart devices. It is designed to be easily integrated into any application, and can be customized to fit your specific needs.

## UI Overview

MatrixScan Count includes pre-built and pre-tested user interface (UI) elements and interactions in workflows. These UI elements are intentionally minimalistic, meant to be overlayed on any application without the need to adapt the existing app while offering the best user experience.

The UI workflow is designed to be as simple and ergonomic as possible, and includes the following elements:

- A **shutter button** the user operates in order to initiate scanning. The user is guided to “Tap shutter to scan items”.
- A **loading indicator** is momentarily present, indicating to hold still while scanning is in progress.
  - An initial calibration may be triggered after the scanning phase if the user stands too far away from or too close to the items.
- **Feedback** is overlaid as augmented reality (AR) icons on top of scanned barcodes - indicating either successful scans, unscannable or items that should be not be present. A button counter badge and progress bar provide further confirmation of scans.
  - The counter badge counts the number of codes scanned.
  - The progress bar replaces the counter badge if the user is are scanning against a list of expected codes. It shows how many of the expected codes have been detected.

Upon completing the scanning process, if all items have been successfully scanned, you can advance the user to the next scan automatically. Next steps may be finalizing order receipt if all items are present, reviewing the scan list to identify items that shouldn’t be present, or moving on to the next order.

:::note
MatrixScan Count does not include a UI for reviewing the scan list, but a recommended UI for this process can be seen in our Receiving Sample.
:::

## Supported Symbologies

MatrixScan Count supports all [symbologies](../../../barcode-symbologies.md) **except** DotCode, MaxiCode and postal codes (KIX, RM4SCC).

If you are not familiar with the symbologies that are relevant for your use case, you can use capture presets that are tailored for different verticals (e.g. retail, logistics, etc.).
