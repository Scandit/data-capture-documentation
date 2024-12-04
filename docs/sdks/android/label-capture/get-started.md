---
sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Creating a new Data Capture Context instance
- Configuring the LabelCapture mode
- Defining the a listener to handle captured labels
- Using the built-in camera
- Visualizing the scan process
- Providing feedback
- Disabling LabelCapture

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/android/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a Data Capture Context

import DataCaptureContextAndroid from '../../../partials/get-started/_create-data-capture-context-android.mdx';

<DataCaptureContextAndroid/>

## Configure the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">
```kotlin
import com.scandit.datacapture.label.capture.labelCaptureSettings

val settings = labelCaptureSettings {
    label("<your-label-name>") {
        customBarcode("<your-barcode-field-name>") {
            // configure the expected barcodes symbologies
            setSymbologies(Symbology.EAN13_UPCA, Symbology.CODE128)
            // you can set an expected regex pattern to filter out irrelevant barcodes
            setPattern("\\d{12,14}")
        }
        expiryDateText("<your-expiry-date-field-name>") {
            // required fields must be present to complete the capture
            // note: setting isOptional to false can be omitted as it is the default value
            isOptional = false
        }
        weightText("<your-weight-field-name>") {
            // optional fields are only captured if present and readable
            isOptional = true 
        }
        unitPriceText("<your-unit-price-field-name>") {
            isOptional = true
        }
    }
}

// Create the label capture mode with the settings and data capture context created earlier
val labelCapture = LabelCapture.forDataCaptureContext(dataCaptureContext, settings)
```
</TabItem>
<TabItem value="java" label="Java">
```java
import com.scandit.datacapture.label.capture.LabelCapture;
import com.scandit.datacapture.label.capture.LabelCaptureSettings;

LabelCaptureSettings settings = LabelCaptureSettings.builder()
    .addLabel()
        .addCustomBarcode()
            // configure the expected barcodes symbologies
            .setSymbologies(Symbology.EAN13_UPCA, Symbology.CODE128)
            .setPattern("\\d{12,14}")
        .buildFluent("<your-barcode-field-name")
        .addExpiryDateText()
            // required fields must be present to complete the capture
            // note: setting isOptional to false can be omitted as it is the default value
            .isOptional(false)
        .buildFluent("<your-expiry-date-field-name>")
        .addWeightText()
            // optional fields are only captured if present and readable
            .isOptional(true)
        .buildFluent("<your-weight-field-name>")
        .addUnitPriceText()
            .isOptional(true)
        .buildFluent("<your-unit-price-field-name>")
    .buildFluent("<your-label-name>")
.build();

// Create the label capture mode with the settings and data capture context created earlier
LabelCapture labelCapture = LabelCapture.forDataCaptureContext(dataCaptureContext, settings)
```
</TabItem>
</Tabs>

## Define a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above:

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">

```kotlin
labelCapture.addListener(object : LabelCaptureListener {
    override fun onSessionUpdated(
        mode: LabelCapture,
        session: LabelCaptureSession,
        data: FrameData
    ) {
        // onSessionUpdated is called for every processed frame.
        // Check if the session contains any captured labels; if not, continue capturing.
        val capturedLabel = session.capturedLabels.firstOrNull() ?: return

        // Given the label capture settings defined above, barcode data will always be present.
        val barcodeData = capturedLabel.fields
            .find { it.name == "<your-barcode-field-name>" }?.barcode?.data

        // Expiry date, weight, and unit price are optional fields.
        // Check for null in your result handling.
        val expiryDate = capturedLabel.fields
            .find { it.name == "<your-expiry-date-field-name>" }?.text
        val netWeight = capturedLabel.fields
            .find { it.name == "<your-weight-field-name>" }?.text
        val unitPrice = capturedLabel.fields
            .find { it.name == "<your-unit-price-field-name>" }?.text

        // Disable the label capture mode after a label has been captured
        // to prevent it from capturing the same label multiple times.
        mode.isEnabled = false
        
        // Consider handling the results in a coroutine to avoid blocking the main thread
        // when updating the UI.
        coroutineScope.launch {
            handleResults(barcodeData, expiryDate, netWeight, unitPrice)
        }
    }
})
```

</TabItem>
<TabItem value="java" label="Java">

In this example, we create a `LabelCaptureRepository` class that implements the `LabelCaptureListener` interface. This class is responsible for handling the captured labels and processing them accordingly.

Depending on your app architecture and whether you use dependency injection or not, you may use a fragment or a repository to implement the listener.

```java
public class LabelCaptureRepository implements LabelCaptureListener {

    /* 
     * We use MutableLiveData to post captured labels to the UI thread.
     * You don't need to use MutableLiveData in your implementation, but it's important good practice to keep the UI thread free from heavy processing.
     */
    private final MutableLiveData<CapturedLabelEvent> capturedLabels = new MutableLiveData<>();
    
    // ... other methods
    
    @Override
    public void onSessionUpdated(
            @NonNull LabelCapture labelCapture,
            @NonNull LabelCaptureSession session,
            @NonNull FrameData frameData) {
        /* 
         * The session update callback is called for every processed frame.
         * Check if the session contains any captured labels; if not, continue capturing.
         */
        List<CapturedLabel> labels = session.getCapturedLabels();

        if (!labels.isEmpty()) {
            final CapturedLabel label = labels.get(0);
            
            String barcodeData = label.getFields().find { it.getName().equals("<your-barcode-field-name>") }?.getBarcode()?.getData();

            /* 
             * Expiry date, weight, and unit price are optional fields.
             * Check for null in your result handling.
             */
            String expiryDate = label.getFields().find { it.getName().equals("<your-expiry-date-field-name>") }?.getText();
            String netWeight = label.getFields().find { it.getName().equals("<your-weight-field-name>") }?.getText();
            String unitPrice = label.getFields().find { it.getName().equals("<your-unit-price-field-name>") }?.getText();

            /* 
             * Disable the label capture mode after a label has been captured
             * to prevent it from capturing the same label multiple times.
             */
            labelCapture.setEnabled(false);

            /* 
             * Post the captured results for further processing.
             */
            capturedLabels.postValue(new CapturedLabelEvent(barcodeData, expiryDate, netWeight, unitPrice));
        }
    }
}
```
</TabItem>
</Tabs>

## Use the Built-in Camera

import CameraAndroid from '../../../partials/get-started/_camera-android.mdx';

<CameraAndroid/>

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.
To do that, add a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy.

To visualize the results of Label Capture, you can choose between two overlays, [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) and [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay).

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">

```kotlin
/* 
 * Create the data capture view and attach it to the data capture context created earlier.
 */
val dataCaptureView = DataCaptureView.newInstance(requireContext(), dataCaptureContext)

/* 
 * Add the data capture view to your view hierarchy, e.g. with setContentView or findViewById.
 */
val container = /* get your containing view here, e.g. with inflate or findViewById */
container.addView(
  dataCaptureView,
  ViewGroup.LayoutParams.MATCH_PARENT,
  ViewGroup.LayoutParams.MATCH_PARENT
)

/* 
 * Create the overlay with the label capture mode and data capture view created earlier.
 */
val overlay = LabelCaptureBasicOverlay.newInstance(labelCapture, dataCaptureView)
overlay.viewfinder = RectangularViewfinder(RectangularViewfinderStyle.SQUARE)
```
</TabItem>
<TabItem value="java" label="Java">

```java
/* 
 * Create the data capture view and attach it to the data capture context created earlier.
 */
DataCaptureView dataCaptureView = DataCaptureView.newInstance(this, dataCaptureContext);

/* 
 * Add the data capture view to your view hierarchy, e.g. with setContentView or findViewById.
 */
ViewGroup container = /* get your containing view here, e.g. with inflate or findViewById */
container.addView(
  dataCaptureView,
  new ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)
);

/* 
 * Create the overlay with the label capture mode and data capture view created earlier.
 */
LabelCaptureBasicOverlay overlay = LabelCaptureBasicOverlay.newInstance(labelCapture, dataCaptureView);
overlay.setViewfinder(new RectangularViewfinder(RectangularViewfinderStyle.SQUARE));
```
</TabItem>
</Tabs>

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary Android views such as text views, icons or images.
:::

## Provide Feedback
**WIP**