---
sidebar_position: 2
framework: flutter
keywords:
  - flutter
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

Before starting with adding a capture mode, make sure that you have a valid Scandit Data Capture SDK license key and that you added the necessary dependencies. If you have not done that yet, check out this [guide](/sdks/flutter/add-sdk.md).

:::tip
You can retrieve your Scandit Data Capture SDK license key by signing in to your account [Dashboard](https://ssl.scandit.com/dashboard/sign-in).
:::

### Module Overview

import LabelCaptureModuleOverview from '../../../partials/get-started/_smart-label-capture-module-overview.mdx';

<LabelCaptureModuleOverview/>

## Create a Data Capture Context

The first step to add capture capabilities to your application is to create a new Data Capture Context. The context expects a valid Scandit Data Capture SDK license key during construction.

```dart
var dataCaptureContext = DataCaptureContext.forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
```

## Configure the Label Capture Mode

The main entry point for the Label Capture Mode is the [LabelCapture](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) object.

It is configured through [LabelCaptureSettings](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) and allows you to register one or more [listeners](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) that get informed whenever a new frame has been processed.

```dart
import 'package:scandit_flutter_datacapture_core/scandit_flutter_datacapture_core.dart';
import 'package:scandit_flutter_datacapture_barcode/scandit_flutter_datacapture_barcode.dart';
import 'package:scandit_flutter_datacapture_label/scandit_flutter_datacapture_label.dart';

final settings = LabelCaptureSettings();

// Create a label and add barcode field
final label = LabelBuilder('<your-label-name>')
  ..addCustomBarcodeField(
    fieldName: '<your-barcode-field-name>',
    symbologies: {Symbology.ean13Upca, Symbology.code128},
    pattern: r'\d{12,14}', // Dart raw string for regex
  )
  ..addExpiryDateTextField(
    fieldName: '<your-expiry-date-field-name>',
    isOptional: false,
  );

settings.addLabel(label.build());

// Assuming you have a DataCaptureContext instance
final labelCapture = LabelCapture.forContext(dataCaptureContext, settings);
```

## Define a Listener to Handle Captured Labels

To get informed whenever a new label has been recognized, add a [LabelCaptureListener](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) through [LabelCapture.addListener()](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/label-capture.html#method-scandit.datacapture.label.LabelCapture.AddListener) and implement the listener methods to suit your application’s needs.

First conform to the `LabelCaptureListener` interface. Here is an example of how to implement a listener that processes the captured labels based on the label capture settings defined above.

In this example, we create a `LabelCaptureRepository` class that implements the `LabelCaptureListener` interface. This class is responsible for handling the captured labels and processing them accordingly.

Depending on your app architecture and whether you use dependency injection or not, you may use a fragment or a repository to implement the listener.

```dart
import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:scandit_flutter_datacapture_core/scandit_flutter_datacapture_core.dart';
import 'package:scandit_flutter_datacapture_label/scandit_flutter_datacapture_label.dart';

class CapturedLabelEvent {
  final String? barcodeData;
  final String? expiryDate;

  CapturedLabelEvent(this.barcodeData, this.expiryDate);
}

class LabelCaptureRepository {
  final ValueNotifier<CapturedLabelEvent?> capturedLabels = ValueNotifier(null);

  late final LabelCapture labelCapture;
  late final LabelCaptureListener _listener;

  LabelCaptureRepository(DataCaptureContext context, LabelCaptureSettings settings) {
    labelCapture = LabelCapture.forContext(context, settings);
    _listener = _LabelCaptureListener(this);
    labelCapture.addListener(_listener);
  }

  void dispose() {
    labelCapture.removeListener(_listener);
    capturedLabels.dispose();
  }
}

class _LabelCaptureListener extends LabelCaptureListener {
  final LabelCaptureRepository repository;

  _LabelCaptureListener(this.repository);

  @override
  void onSessionUpdated(LabelCapture capture, LabelCaptureSession session, FrameData? frameData) {
    final labels = session.capturedLabels;

    if (labels.isNotEmpty) {
      final label = labels.first;

      // Extract the barcode field
      final barcodeField = label.fields.firstWhere(
        (field) => field.name == '<your-barcode-field-name>',
        orElse: () => null,
      );
      final barcodeData = barcodeField?.barcode?.data;

      // Extract the expiry date field (optional)
      final expiryDateField = label.fields.firstWhere(
        (field) => field.name == '<your-expiry-date-field-name>',
        orElse: () => null,
      );
      final expiryDate = expiryDateField?.text;

      // Disable label capture to avoid duplicate scans
      capture.isEnabled = false;

      // Notify UI via ValueNotifier
      repository.capturedLabels.value = CapturedLabelEvent(barcodeData, expiryDate);

      // Emit default feedback (sound + vibration)
      Feedback.defaultFeedback.emit();
    }
  }
}
```

## Visualize the Scan Process

The capture process can be visualized by adding a [DataCaptureView](https://docs.scandit.com/data-capture-sdk/flutter/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to your view hierarchy. The view controls what UI elements such as the viewfinder, as well as the overlays that are shown to visualize captured labels.

To visualize the results of Label Capture you can use two overlays:

- [LabelCaptureBasicOverlay](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) 
- [LabelCaptureAdvancedOverlay](https://docs.scandit.com/data-capture-sdk/flutter/label-capture/api/ui/label-capture-advanced-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureAdvancedOverlay)

:::tip
The overlays can be used independently of each other, but you can also use both at the same time as each can serve to extend the functionality of the other.
:::

Here is an example of how to add a `LabelCaptureBasicOverlay` to the `DataCaptureView`:

```dart
import 'package:flutter/material.dart';
import 'package:scandit_flutter_datacapture_core/scandit_flutter_datacapture_core.dart';
import 'package:scandit_flutter_datacapture_label/scandit_flutter_datacapture_label.dart';

class LabelCaptureScreen extends StatefulWidget {
  final DataCaptureContext context;
  final LabelCapture labelCapture;

  const LabelCaptureScreen({
    Key? key,
    required this.context,
    required this.labelCapture,
  }) : super(key: key);

  @override
  State<LabelCaptureScreen> createState() => _LabelCaptureScreenState();
}

class _LabelCaptureScreenState extends State<LabelCaptureScreen> {
  late final DataCaptureView _dataCaptureView;

  @override
  void initState() {
    super.initState();

    // Create the DataCaptureView and attach it to the context
    _dataCaptureView = DataCaptureView.forContext(widget.context);

    // Create the overlay and add it to the DataCaptureView
    final overlay = LabelCaptureBasicOverlay.newInstance(
      widget.labelCapture,
      _dataCaptureView,
    );

    // Optionally set a rectangular viewfinder
    overlay.viewfinder = RectangularViewfinder.withStyle(
      RectangularViewfinderStyle.square,
    );
  }

  @override
  Widget build(BuildContext context) {
    // Attach the view to your widget tree
    return Scaffold(
      appBar: AppBar(title: Text('Label Capture')),
      body: _dataCaptureView,
    );
  }
}
```

:::tip
See the [Advanced Configurations](advanced.md) section for more information about how to customize the appearance of the overlays.
:::

## Start the Camera

Next, you need to create a new instance of the [Camera](https://docs.scandit.com/data-capture-sdk/flutter/core/api/camera.html#class-scandit.datacapture.core.Camera) class to indicate the camera to stream previews and to capture images.

When initializing the camera, you can pass the recommended camera settings for Label Capture.

```dart
Future<void> setupCamera(DataCaptureContext context) async {
  // Get the default camera
  final camera = Camera.defaultCamera;

  if (camera == null) {
    throw StateError('Failed to initialize camera!');
  }

  // Apply recommended settings for LabelCapture
  final settings = LabelCapture.recommendedCameraSettings;
  await camera.applySettings(settings);

  // Set camera as the frame source for the context
  await context.setFrameSource(camera);
}
```

Once the Camera, DataCaptureContext, DataCaptureView and LabelCapture are initialized, you can switch on the camera to start capturing labels.
Typically, this is done on resuming the view and when the user granted permission to use the camera, or once the user pressed continue scanning after handling a previous scan.

```dart
await camera.switchToDesiredState(FrameSourceState.on);
```

## Provide Feedback

Label Capture doesn't emit any sound or vibration automatically when a new label is recognized. This is because it may be that the label is not complete and you choose to ignore it and wait for the next recognition.

However, we provide a [Feedback](https://docs.scandit.com/data-capture-sdk/flutter/core/api/feedback.html#class-scandit.datacapture.core.Feedback) class that can be uses to emit feedback when a label is recognized and successfully processed.

You can use the default feedback, or configure your own sound or vibration.

```dart
final Feedback feedback = Feedback.defaultFeedback;
```


:::note
Audio feedback is only played if the device is not muted.
:::