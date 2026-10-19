---
description: "Get up and running with SparkScan, the easiest way to start with Scandit barcode scanning."

toc_max_heading_level: 2
pagination_next: null
displayed_sidebar: webSidebar
framework: web
keywords:
  - web
---

# Get Started

Get up and running with SparkScan, the easiest way to start with Scandit barcode scanning.

SparkScan provides top performance and optimized scanning UX with just a few lines of code, incorporating the best practices developed by Scandit across years of experience and billions of scans. The intentionally minimalistic UI floats on top of any smartphone application, without the need to adapt the existing app.

The fastest way to get started is by running our sample application, so we'll cover that first. After that, we'll show you how to integrate SparkScan into your own application.

## Prerequisites

Before you start, make sure you have the following:

- Most recent LTS versions of Node.js and npm installed on your machine. You can download them from the [Node.js website](https://nodejs.org/).
- A Scandit License Key. You can get a free trial key by signing up for an account on the [Scandit website](https://ssl.scandit.com/dashboard/sign-up).

## Sample Application

In this section, we'll show you how to try SparkScan in minutes by running our sample application.

### Running the Sample Application

1. First we need a copy of the sample application. It is available on GitHub and also bundled with the SDK archive you can download from your Scandit account dashboard. Here we'll use the GitHub repository.

```bash
git clone https://github.com/Scandit/datacapture-web-samples.git
```

2. The repository contains many sample applications you can try. For this example, we'll use the **ListBuildingSample**. Navigate to the sample directory from the terminal or your preferred IDE:

```bash
cd datacapture-web-samples/ListBuildingSample
```

3. From the `/src/app` directory, open the `presented.ts` file and replace the `licenseKey` variable with your Scandit License Key:

```typescript
...
licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --",
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
npm install --save @scandit/web-datacapture-core

# Barcode scanning functionality
npm install --save @scandit/web-datacapture-barcode
```

### 2. Create the Context

The first step is to create a context for the Data Capture tasks. This is done by creating an instance of the `DataCaptureContext` class:

```typescript
const context = await DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --", {
  libraryLocation: new URL("library/engine/", document.baseURI).toString(),
  moduleLoaders: [barcodeCaptureLoader()],
});
```

### 3. Configure SparkScan Settings

Next, you need to configure your desired settings for SparkScan, such as the symbologies you want to scan. This is done by creating an instance of the `SparkScanSettings` class:

```typescript
const settings = new SparkScanSettings();
settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128]);
settings.codeDuplicateFilter = 0;
settings.scanIntention = ScanIntention.Smart;
settings.selectionMode = SelectionMode.Auto;
```

In this example, we're:

- Enabling both EAN-13 and Code 128 symbologies
- Setting the code duplicate filter to 0, meaning the same code can be reported multiple times
- Using the Smart [scan intention](https://docs.scandit.com/data-capture-sdk/web/core/api/scan-intention.html#enum-scandit.datacapture.core.ScanIntention) algorithm, to reduce the likelihood of unintended scans
- Setting the [selection mode](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-settings.html#property-scandit.datacapture.barcode.spark.SparkScanSettings.SelectionMode) to *Auto*, so the SDK decides when users need to confirm the barcode they aim at. *Auto* works only with the Smart scan intention

Then create the SparkScan mode with these settings:

```typescript
const sparkScan = SparkScan.forSettings(settings);
```

### 4. Setup the SparkScanView

Now we'll create and configure the scanner view and it's settings. This is done via the `SparkScanView` and `SparkScanViewSettings` classes:

```typescript
const viewSettings = new SparkScanViewSettings();
viewSettings.soundEnabled = true;
viewSettings.hapticEnabled = false;
```

In this example, we're:

- Enabling sound feedback
- Disabling haptic feedback

Next, we create the `SparkScanView` instance, adding the scanning interface to the application.

There are two valid ways to instantiate the `SparkScanView`:

**Option 1 — Web Component (recommended for React and other frameworks):**

Register the web component once, then use the `<spark-scan-view>` custom element:

```typescript
SparkScanView.register();

// In your render/component:
(context && sparkScan) && <spark-scan-view
  dataCaptureContext={context}
  sparkScan={sparkScan}
  sparkScanViewSettings={viewSettings}
  ref={sparkScanViewRef}
/>
```

Here `sparkScanViewRef` is a React ref (`useRef<SparkScanView | null>(null)`) that gives you the view for `stopScanning`.
In TypeScript, declare the element's JSX type first, as in the React sample's [`spark-scan-view.d.ts`](https://github.com/Scandit/datacapture-web-samples/blob/master/05_Framework_Integration_Samples/SparkScanReactSample/src/spark-scan-view.d.ts). Without it, the compiler reports that `spark-scan-view` doesn't exist on `JSX.IntrinsicElements`.

**Option 2 — `SparkScanView.forElement()` (without a framework):**

```typescript
const sparkScanView = SparkScanView.forElement(
  document.getElementById("spark-scan-ui")!,
  context,
  sparkScan,
  viewSettings
);
```

You must also call the `stopScanning` method when the scanner is no longer needed, for example when the user leaves the page. With Option 2:

```typescript
await sparkScanView.stopScanning();
```

With Option 1 in React, call it in the cleanup function of `useEffect`. The cleanup function can't be `async`, so handle the returned promise instead of awaiting it:

```typescript
useEffect(() => {
  return () => {
    sparkScanViewRef.current?.stopScanning().catch(console.error);
  };
}, []);
```

For a complete React integration example, see the [SparkScan React Sample](https://github.com/Scandit/datacapture-web-samples/tree/master/05_Framework_Integration_Samples/SparkScanReactSample).

### 5. Implement the Listener

Lastly, you need to implement the listener to handle the scanned data. This is done by creating an instance of the [`SparkScanListener`](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) class:

```typescript
import type { SparkScanListener } from "@scandit/web-datacapture-barcode";

const listener: SparkScanListener = {
	didScan: (sparkScan, session, frameData) => {
		// Gather the recognized barcode
		const barcode = session.newlyRecognizedBarcode;

		if (barcode) {
			// Handle the barcode
		}
	},
};

sparkScan.addListener(listener);
```

Here, `didScan()` is called when a barcode is recognized. You can access the recognized barcode data from the `SparkScanSession` object.

### 6. Next Steps

This guide provides a basic overview of how to integrate SparkScan into your application. For more detailed information, check out the [SparkScan documentation](/sdks/web/sparkscan/intro.md) and [SparkScan API Reference](https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api/spark-scan.html).

If you have any questions or need help, feel free to reach out to [Scandit Support](mailto:support@scandit.com).