---
description: "In this guide you will learn step-by-step how to add Smart Label Capture to your application.                                                                                    "

sidebar_position: 2
framework: ios
keywords:
  - ios
---

# Get Started

In this guide you will learn step-by-step how to add Smart Label Capture to your application.

The general steps are:

- Create a view controller
- Initialize the Data Capture context
- Initialize the Label Capture mode
- Implement a listener to handle captured labels
- Visualize the scan process
- Start the camera
- Provide feedback

## Prerequisites

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you have added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/ios/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a view controller

```swift
import ScanditLabelCapture

class YourScanViewController: UIViewController {
    private var context: DataCaptureContext!
    private var labelCapture: LabelCapture!
    private var dataCaptureView: DataCaptureView!
    private var labelCaptureOverlay: LabelCaptureBasicOverlay!
    private var camera: Camera?

    override func viewDidLoad() {
        super.viewDidLoad()
        /* Initialize the components as lined out in the following sections */
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        /* Start the camera */
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        /* Stop the camera, disable capture mode */
    }

    // ...
}
```

## Initialize the Data Capture Context

import DataCaptureContextIos from '../../../partials/get-started/_create-data-capture-context-ios.mdx';

<DataCaptureContextIos/>

## Initialize the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```swift
let labelDefinition: LabelDefinition = {
    /*
        * Add a barcode field with the expected symbologies and pattern.
        * You can omit the pattern if the content of the barcode is unknown.
        */
    let barcodeField = CustomBarcode(
        name: "<your-barcode-field-name>",
        symbologies: [
            NSNumber(value: Symbology.ean13UPCA.rawValue),
            NSNumber(value: Symbology.code128.rawValue)
        ]
    )
    barcodeField.patterns = ["\\d{12,14}"]

    /*
        * Add a text field for capturing expiry dates.
        * The field is set as optional so that the capture can complete
        * even if the expiry date is not present or not readable.
        */
    let expiryDateField = ExpiryDateText(name: "<your-expiry-date-field-name>")
    expiryDateField.optional = false

    return LabelDefinition(
        name: "<your-label-name>",
        fields: [barcodeField, expiryDateField]
    )
}()

guard let labelCaptureSettings = try? LabelCaptureSettings(
    labelDefinitions: [labelDefinition]
) else {
    /*
    * Creating label capture settings can fail if the label definitions are invalid. 
    * You can handle the error here.
    */
}

/*
* Create the label capture mode with the settings 
* and data capture context created earlier
*/
labelCapture = LabelCapture(context: context, settings: labelCaptureSettings)

/*
* Add a listener to the label capture mode, see the following section 
* for more information on implementing the listener
*/
labelCapture.addListener(self)
```

## Implement a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above:

```swift
extension YourScanViewController: LabelCaptureListener {
    func labelCapture(
      _ labelCapture: LabelCapture, 
      didUpdate session: LabelCaptureSession, 
      frameData: FrameData
    ) {
        /* 
         * The did update callback is called for every processed frame.
         * Check if the session contains any captured labels; 
         * if not, continue capturing.
         */
        guard let label = session.capturedLabels.first else { return }
              
        /*
         * Given the label capture settings defined above, barcode data will always be present.
         */
        guard let barcodeField = label.fields.first(where: { $0.name == "<your-barcode-field-name>"}),
              let barcodeData = barcodeField.barcode?.data else { return }

        /*
         * The expiry date field is optional.
         * Check for nil in your result handling.
         */
        let expiryDate = label.fields.first(where: { $0.name == "<your-barcode-field-name>"})?.text

        /*
         * Emit feedback to notify the user that a label has been captured.
         */
        Feedback.default.emit()

        DispatchQueue.main.async {
            self.camera?.switch(toDesiredState: .off)
            labelCapture.isEnabled = false
            /*
             * Handle the captured barcode and expiry date here.
             */
        }
    }
}
```
## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls the UI elements, such as the viewfinder and overlays, that are shown to visualize captured labels.

To visualize the results of Label Capture, you can choose between two overlays, [LabelCaptureBasicOverlay](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/ui/label-capture-basic-overlay.html#label-capture-basic-overlay) and [LabelCaptureAdvancedOverlay](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/ui/label-capture-advanced-overlay.html#label-capture-advanced-overlay).

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

```swift
/* 
* Create the data capture view and attach it to the data capture context created earlier.
*/
dataCaptureView = DataCaptureView(context: context, frame: .zero)

/* 
* Add the data capture view to your view hierarchy, e.g. with insertSubview.
*/
@IBOutlet weak var containerView: UIView!
containerView.insertSubview(dataCaptureView, at: 0)

/* 
* Create the overlay with the label capture mode and data capture view created earlier.
*/
labelCaptureOverlay = LabelCaptureBasicOverlay(labelCapture: labelCapture, view: dataCaptureView)
labelCaptureOverlay.viewfinder = RectangularViewfinder(style: .square)
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays and how to use the advanced overlay to display arbitrary iOS views such as text views, icons or images.
:::

## Start the Camera

Next, you need to create a new instance of the [`SDCCamera`](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera that will be used to stream previews and capture images. 

You can initialize the camera with the recommended settings for Label Capture:

```swift
camera = Camera.default
context.setFrameSource(camera, completionHandler: nil)

let recommendedCameraSettings = LabelCapture.recommendedCameraSettings
camera?.apply(recommendedCameraSettings)
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.

This can be done in the `viewWillAppear` method of your view controller, or once a user presses continue scanning after handling a previous scan.
 
```swift
camera?.switch(toDesiredState: .on)
```

## Provide Feedback

Smart Label Capture provides customizable feedback, emitted automatically when a label is recognized and successfully processed, configurable via [`LabelCapture.feedback`](https://docs.scandit.com/7.6/data-capture-sdk/ios/label-capture/api/label-capture.html#property-scandit.datacapture.label.LabelCapture.Feedback).

You can use the default feedback, or configure your own sound or vibration.

:::tip
If you already have a [Feedback](https://docs.scandit.com/7.6/data-capture-sdk/ios/core/api/feedback.html#class-scandit.datacapture.core.Feedback) instance implemented in your application, remove it to avoid double feedback.
:::

```swift
labelCapture.feedback = LabelCaptureFeedback.default
```

:::note
Audio feedback is only played if the device is not muted.
:::
