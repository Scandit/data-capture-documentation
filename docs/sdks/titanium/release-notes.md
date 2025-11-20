---
description: "Release notes and updates for the Scandit Titanium SDK."
toc_max_heading_level: 3
displayed_sidebar: titaniumSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: titanium
keywords:
  - titanium
---

## 8.0.0

**Released**: November 4, 2025

### New Features

Scandit's SDK 8.0 marks the evolution of data capture from a high-performing scanning tool into an intelligent AI-powered workflow enabler. As frontline operations face mounting pressures with more data points to capture, increasingly complex workflows to navigate, and tighter resource constraints, SDK 8.0 delivers a set of innovations that: 
  * Adapt its scanning settings and UI to context by analyzing the scanning environment and user intent;
  * Automate the capture of any data format, barcode clustering, task handling or camera settings;
  * Accelerate critical use cases to maximize ROI through intuitive, streamlined scanning workflows, using interactive AR-guidance, adaptive UI and out-of-the-box custom-branded passenger experiences.

With SDK 8.0 businesses can transform data capture from a basic function to a strategic advantage. It enables intelligent scanning that:
  * Understands not just what is being scanned, but also what you want to scan and why you’re scanning it
  * Adapts accordingly by adjusting scanning settings and/or UI, understanding what comes next and how to guide users seamlessly through sophisticated tasks to ensure the highest level of productivity.

#### Core

* Upgraded minimum Titanium SDK to `12.7.0.GA` and build modules with Titanium `13.0.0.GA` to enable 16 KB page size support.

#### Barcode

* Updated the Gradle version for all sample applications to 8.14.3.

### Behavioral Changes

#### Barcode

* Symbology `RM4SCC` has been renamed to `ROYAL_MAIL_4STATE`.
* Changed the default highlight brush in Barcode Capture.

### Bug Fixes

### Deprecations

#### Core

* `VideoResolution::Auto` is now deprecated. Please use the capture mode's `recommendedCameraSettings` for the best results.


## 7.6.5

Find earlier versions in the [release notes section of version 7](/7.6.5/sdks/titanium/release-notes)