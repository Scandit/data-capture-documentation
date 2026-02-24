---
description: "This quick start guide will help you get up and running with SparkScan, the easiest way to get started with Scandit barcode scanning.                                                                             "

toc_max_heading_level: 2
pagination_next: null
displayed_sidebar: capacitorSidebar
framework: capacitor
keywords:
  - capacitor
---

# Quick Start Guide

This quick start guide will help you get up and running with SparkScan, the easiest way to get started with Scandit barcode scanning.

SparkScan provides top performance and optimized scanning UX with just a few lines of code, incorporating the best practices developed by Scandit across years of experience and billions of scans. The intentionally minimalistic UI floats on top of any smartphone application, without the need to adapt the existing app.

The fastest way to get started is by running our sample application, so we'll cover that first. After that, we'll show you how to integrate SparkScan into your own application.

## Prerequisites

Before you start, make sure you have the following:

- Capacitor Version 5-8 [and other related tools and dependencies](https://capacitorjs.com/docs/getting-started).
- A project with minimum iOS deployment target of 15.0 or higher. Or an Android project with target SDK version 24 (Android 7, Nougat) or higher.
- A valid Scandit Data Capture SDK license key. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=test&utm%5Fsource=documentation).

## Sample Application

In this section, we'll show you how to try SparkScan in minutes by running our sample application.

### Running the Sample Application

1. First we need a copy of the sample application. It is available on GitHub and also bundled with the SDK archive you can download from your Scandit account dashboard. Here we'll use the GitHub repository.

```bash
git clone https://github.com/Scandit/datacapture-capacitor-samples.git
```

2. The repository contains many sample applications you can try. For this example, we'll use the **ListBuildingSample**. Navigate to the sample directory from the terminal or your preferred IDE:

```bash
cd datacapture-capacitor-samples/ListBuildingSample
```

3. From the `/www/js` directory, open the `app.js` file and enter your Scandit License Key:

```js
...
const context = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
...
```

4. Install the dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:8888`. You should see the sample application running.

## Integrating SparkScan into Your Application

This section will guide you through the general steps for integrating SparkScan into your own application. There may be additional steps depending on your specific use case, and you can always reach out to [Scandit Support](mailto:support@scandit.com) with any issues.

### 1. Installation

First you need to install the required packages. You can this via npm:

```bash
# Core library
npm install scandit-capacitor-datacapture-core

# Barcode scanning functionality
npm install scandit-capacitor-datacapture-barcode
```

### 2. Create the Context

The first step is to create a context for the Data Capture tasks. This is done by creating an instance of the `DataCaptureContext` class:

```js
const context = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

### 3. Configure SparkScan Settings

Next, you need to configure your desired settings for SparkScan, such as the symbologies you want to scan. This is done by creating an instance of the `SparkScanSettings` class:

```js
const settings = new SparkScanSettings();
settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128]);
settings.codeDuplicateFilter = 0;
settings.scanIntention = ScanIntention.Smart;
```

In this example, we're:

- Enabling both EAN-13 and Code 128 symbologies
- Setting the code duplicate filter to 0, meaning the same code can be reported multiple times
- Using the Smart [scan intention](https://docs.scandit.com/data-capture-sdk/capacitor/core/api/scan-intention.html#enum-scandit.datacapture.core.ScanIntention) algorithm, to reduce the likelihood of unintended scans

### 4. Setup the SparkScanView

Now we'll create and configure the scanner view and it's settings. This is done via the `SparkScanView` and `SparkScanViewSettings` classes:

```js
const viewSettings = new SparkScanViewSettings();
viewSettings.defaultScanningMode = new SparkScanScanningModeTarget(SparkScanScanningBehavior.Single);
viewSettings.soundEnabled = true;
viewSettings.hapticEnabled = false;
```

In this example, we're:

- Setting the default scanning mode to `SparkScanScanningModeTarget` for precision scanning
- Enabling sound feedback
- Disabling haptic feedback

Next, we create the `SparkScanView` instance, adding the scanning interface to the application:

```js
const sparkScanView = SparkScanView.forContext(context, sparkScan, viewSettings);
```

In your application's state handling logic, you must also call the `stopScanning` method when the scanner is no longer needed:

```js
componentWillUnmount() {
sparkScanView.stopScanning();
}

handleAppStateChange = async (nextAppState) => {
if (nextAppState.match(/inactive|background/)) {
sparkScanView.stopScanning();
}
};
```

### 5. Implement the Listener

Lastly, you need to implement the listener to handle the scanned data. This is done by creating an instance of the [`SparkScanListener`](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) class:

```js
const listener = {
	didScan: (sparkScan, session, getFrameData) => {
		// Gather the recognized barcode
		const barcode = session.newlyRecognizedBarcode[0];

		// Handle the barcode
	},
};

sparkScan.addListener(listener);
```

Here, `didScan()` is called when a barcode is recognized. You can access the recognized barcode data from the `SparkScanSession` object.

### 6. Next Steps

This guide provides a basic overview of how to integrate SparkScan into your application. For more detailed information, check out the [SparkScan documentation](/sdks/capacitor/sparkscan/intro.md) and [SparkScan API Reference](https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api/spark-scan.html).

If you have any questions or need help, feel free to reach out to [Scandit Support](mailto:support@scandit.com).
