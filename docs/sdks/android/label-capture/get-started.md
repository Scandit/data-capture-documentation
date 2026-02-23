---
description: "In this guide you will learn step-by-step how to add Smart Label Capture to your application.                                                                                    "

sidebar_position: 2
framework: android
keywords:
  - android
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Create a new Data Capture Context instance
- Configure the LabelCapture mode
- Define a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

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

:::tip
You can use Label Definitions provided in Smart Label Capture to set pre-built label types or define your label using pre-built fields. For more information, see the [Label Definitions](label-definitions.md) section.
:::

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">

```kotlin
import com.scandit.datacapture.label.capture.LabelCapture
import com.scandit.datacapture.label.capture.LabelCaptureSettings
import com.scandit.datacapture.label.data.LabelDateComponentFormat
import com.scandit.datacapture.label.data.LabelDateFormat
import com.scandit.datacapture.barcode.symbology.Symbology

// Build LabelCaptureSettings
val settings = LabelCaptureSettings.builder()
    .addLabel()
        // Add a barcode field with the expected symbologies and pattern
        .addCustomBarcode()
            .setSymbologies(Symbology.EAN13_UPCA, Symbology.CODE128)
            .setAnchorRegexes("\\d{12,14}")
        .buildFluent("<your-barcode-field-name>")
        // Add a text field for capturing expiry dates
        .addExpiryDateText()
            .isOptional(true)
            .setLabelDateFormat(LabelDateFormat(LabelDateComponentFormat.MDY, false))
        .buildFluent("<your-expiry-date-field-name>")
    .buildFluent("<your-label-name>")
.build()

// Create the label capture mode with the settings and data capture context
val labelCapture = LabelCapture.forDataCaptureContext(dataCaptureContext, settings)
```

</TabItem>

<TabItem value="java" label="Java">

```java
import com.scandit.datacapture.label.capture.LabelCapture;
import com.scandit.datacapture.label.capture.LabelCaptureSettings;
import com.scandit.datacapture.label.data.LabelDateComponentFormat;
import com.scandit.datacapture.label.data.LabelDateFormat;

LabelCaptureSettings settings = LabelCaptureSettings.builder()
    .addLabel()
        /*
         * Add a barcode field with the expected symbologies and pattern.
         * You can omit the pattern if the content of the barcode is unknown.
         */
        .addCustomBarcode()
            .setSymbologies(Symbology.EAN13_UPCA, Symbology.CODE128)
        .buildFluent("<your-barcode-field-name")
        /*
         * Add a text field for capturing expiry dates.
         * The field is set as optional so that the capture can complete
         * even if the expiry date is not present or not readable.
         */
        .addExpiryDateText()
            .isOptional(true)
            .setLabelDateFormat(new LabelDateFormat(LabelDateComponentFormat.MDY,false))
        .buildFluent("<your-expiry-date-field-name>")
    .buildFluent("<your-label-name>")
.build();

/*
* Create the label capture mode with the settings and data capture context created earlier.
*/
LabelCapture labelCapture = LabelCapture.forDataCaptureContext(dataCaptureContext, settings);
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
        data: FrameData,
    ) {
        /*
         * The session update callback is called for every processed frame.
         * Check if the session contains any captured labels;
         * if not, continue capturing.
         */
        val capturedLabel = session.capturedLabels.firstOrNull() ?: return

        /*
         * Given the label capture settings defined above,
         * barcode data will always be present.
         */
        val barcodeData = capturedLabel.fields
            .find { it.name == "<your-barcode-field-name>" }?.barcode?.data

        /*
         * The expiry date field is optional. Check for null in your result handling.
         */
        val expiryDate = capturedLabel.fields
            .find { it.name == "<your-expiry-date-field-name>" }?.asDate()

        /*
         * Disable the label capture mode after a label has been captured
         * to prevent it from capturing the same label multiple times.
         */
        mode.isEnabled = false

        /*
         * Consider handling the results in a coroutine to avoid blocking the main thread
         * when updating the UI.
         */
        coroutineScope.launch {
            handleResults(barcodeData, expiryDate)
            Feedback.defaultFeedback().emit()
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

            /*
             * Given the label capture settings defined above,
             * the barcode field would always be present.
             */
            String barcodeData = label.getFields().stream()
                    .filter(field -> field.getName().equals("<your-barcode-field-name>"))
                    .findFirst()
                    .map(field -> field.getBarcode().getData())
                    .orElse(null);

            /*
             * The expiry date field is optional.
             * Check for null in your result handling.
             */
            String expiryDate = label.getFields().stream()
                    .filter(field -> field.getName().equals("<your-expiry-date-field-name>"))
                    .findFirst()
                    .map(LabelField::getText)
                    .orElse(null);

            /*
             * Disable the label capture mode after a label has been captured
             * to prevent it from capturing the same label multiple times.
             */
            labelCapture.setEnabled(false);

            /*
             * Post the captured results for further processing.
             */
            capturedLabels.postValue(new CapturedLabelEvent(barcodeData, expiryDate));

            /*
             * Consider communicating a successful scan with audio and vibration feedback.
             * See the Feedback section for more information.
             */
            Feedback.defaultFeedback().emit();
        }
    }
}
```
</TabItem>
</Tabs>

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/android/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.

To visualize the results of Label Capture you can use two overlays:

- [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) 
- [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay)

:::tip
The overlays can be used independently of each other, but you can also use both at the same time as each can serve to extend the functionality of the other.
:::

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
    ViewGroup.LayoutParams.MATCH_PARENT,
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
ViewGroup container = findViewById(R.id.container); /* get your containing view here, e.g. with inflate or findViewById */
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

## Start the Camera

Next, you need to create a new instance of the [Camera](https://docs.scandit.com/data-capture-sdk/android/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera to stream previews and to capture images.

When initializing the camera, you can pass the recommended camera settings for Label Capture.

```kotlin
val camera = Camera.getDefaultCamera(LabelCapture.createRecommendedCameraSettings())
if (camera == null) {
    throw IllegalStateException("Failed to init camera!")
}
dataCaptureContext.setFrameSource(camera)
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.
Typically, this is done on resuming the view and when the user granted permission to use the camera, or once the user pressed continue scanning after handling a previous scan.

```kotlin
camera.switchToDesiredState(FrameSourceState.ON)
```

## Provide Feedback

Smart Label Capture provides customizable feedback, emitted automatically when a label is recognized and successfully processed, configurable via [`LabelCapture.feedback`](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/label-capture.html#property-scandit.datacapture.label.LabelCapture.Feedback).

You can use the default feedback, or configure your own sound or vibration.

:::tip
If you already have a [Feedback](https://docs.scandit.com/data-capture-sdk/android/core/api/feedback.html#class-scandit.datacapture.core.Feedback) instance implemented in your application, remove it to avoid double feedback.
:::

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">

```kotlin
labelCapture.feedback = LabelCaptureFeedback.defaultFeedback()
```

</TabItem>
<TabItem value="java" label="Java">

```java
labelCapture.setFeedback(LabelCaptureFeedback.defaultFeedback());
```

</TabItem>
</Tabs>

:::note
Audio feedback is only played if the device is not muted.
:::
