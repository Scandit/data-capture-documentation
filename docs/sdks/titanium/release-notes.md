---
toc_max_heading_level: 3
displayed_sidebar: titaniumSidebar
hide_title: true
title: Release Notes
pagination_prev: null
framework: titanium
keywords:
  - titanium
---

## 7.1.0-beta.1

**Released**: January 28, 2025

### New Features

#### Core

* `DataCaptureContext` has been adapted to work as a singleton.
  * You can use the `DataCaptureContext.SharedInstance` property to retrieve the singleton instance.
  * The license key must be set using `DataCaptureContext.Initialize`. This step is only required once. Once initialized, the context can be used as before.
  * It is important to call `DataCaptureContext.RemoveCurrentMode()` when the active mode is no longer needed, such as when navigating away from a screen used for scanning.
  * The following methods have been added (also see Deprecations, below, for removed methods):
    * `setMode`: Sets a mode to be the active mode in the context.
    * `removeCurrentMode`: Removes the currently active mode in the context.
    * `static sharedInstance`: Returns a singleton instance of DataCaptureContext. This instance is unusable until properly configured by calling initialize() on it.
    * `initialize(string licenseKey)`: Reinitializes the context by configuring it with a license key.
    * `initialize(string licenseKey, string? frameworkName, string? frameworkVersion, string? deviceName, string? externalId, DataCaptureContextSettings settings)`: Reinitializes the context by configuring it with new settings.
* Calling `DataCaptureContext.addMode()` or `DataCaptureContext.setMode()` now replaces the current mode with the new one, so it’s no longer needed to remove a mode when adding a new one.
* Added the following API to fetch Open Source Software license text and attributions for all third-party software used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo`

### Performance Improvements

#### Barcode

* We’ve increased the scan rate of 10% on our datasets of QR codes with high perspective distortion (so scanned at high angles). This is particularly important for cases such as receiving boxes or scanning shelf labels.

### Behavioral Changes

* After further improving the scanning speed on color-inverted QR and MicroQR codes, these variations can now be scanned without having to set any specific setting (as opposed to before), offering a better experience to developers.

### Deprecations

#### Core

* The following methods of `DataCaptureContext` have been removed:
  * `addMode`: Replaced by `setMode` as only one mode can be active at a time.
  * `removeAllModes`: Replaced by `removeCurrentMode` as only one mode can be active at a time.

## 7.0.2

**Released**: January 20, 2025

No updates for this framework in this release.

## 7.0.1

**Released**: December 19, 2024

No updates for this framework in this release.

## 7.0.0

**Released**: November 29, 2024

### New Features

Scandit's Smart Data Capture SDK v7.0 addresses the industry's toughest scanning challenges with innovative solutions at every layer. Our enhanced scanning engine is context-aware, understanding both the environment and user needs. This results in smoother integrations, a richer user experience, and improved scanning performance without compromising flexibility.

Version 7.0 also offers increased versatility by supporting multiple input formats including text and barcodes.

#### Barcode

* Added the `remove_delimiter_data` extension to the CODABAR symbology.

#### Core

* Added the following API for fetching all Open Source Software (OSS) license text and attributions for all OSS used by the Scandit SDK.
  * `DataCaptureContext.openSourceSoftwareLicenseInfo()`

### Performance Improvements

* Improved tracking of 1D barcodes that are horizontally aligned.

### Deprecations

In 7.0, we removed several APIs that were deprecated during the lifetime of 6.0. Before [migrating to 7.0](/migrate-6-to-7.md), we suggest upgrading to 6.28, fixing all deprecation warnings and then upgrading to 7.0.