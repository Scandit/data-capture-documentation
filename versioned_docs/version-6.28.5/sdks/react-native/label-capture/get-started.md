---
pagination_prev: null
pagination_next: null
framework: react
keywords:
  - react
---

# Get Started

_ScanditLabelCapture_ coordinates the process of simultaneously capturing data contained in multiple barcodes and text that occur together. The basis of label capture is a label definition that specifies the spatial arrangement as well as the content of the barcodes and text of the label (its fields). Typical use cases for label capture are labels consisting of:

* Two barcodes of different symbologies printed on boxes in a specific spatial arrangement. When multiple boxes are visible in the image, spatial information is required to group the codes present in the frame. Label capture will analyze the scanned barcodes and automatically assign them to different labels based on the available geometric information.
* A barcode plus a short number printed as text below the barcode. Short numbers occur in many different contexts, so even with a perfect recognition solution short numbers from other contexts are still read even if they are not part of the form. By making the presence of the short number conditional on the presence of the barcodes, such false reads are eliminated very effectively.

Label capture builds on top of other technologies: Barcode Tracking for reading and tracking barcodes over multiple frames and text recognition for reading text.

Label capture follows the same architecture as other data capture modes. The functionality is split into the following classes:

* [`SDCLabelCapture`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/label-capture.html#class-scandit.datacapture.label.LabelCapture) is the actual data capture mode that coordinates the label capture process. A [`SDCLabelCaptureListener`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/label-capture-listener.html#interface-scandit.datacapture.label.ILabelCaptureListener) instance can be registered to get informed whenever the state of label capture changes.
* [`SDCLabelCaptureSettings`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/label-capture-settings.html#class-scandit.datacapture.label.LabelCaptureSettings) holds the `SDCLabelCapture` configuration (the label definitions as well as recognition settings).
* [`SDCLabelCaptureSession`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/label-capture-session.html#class-scandit.datacapture.label.LabelCaptureSession) holds the currently captured labels ([`SDCCapturedLabel`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/captured-label.html#class-scandit.datacapture.label.CapturedLabel) each with one or more [`SDCLabelField`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/label-field.html#class-scandit.datacapture.label.LabelField) instances).
* A [`SDCLabelCaptureBasicOverlay`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/label-capture/api/ui/label-capture-basic-overlay.html#class-scandit.datacapture.label.ui.LabelCaptureBasicOverlay) can be added to the [`SDCDataCaptureView`](https://docs.scandit.com/6.28/data-capture-sdk/react-native/core/api/ui/data-capture-view.html#class-scandit.datacapture.core.ui.DataCaptureView) to visualize the label capture process.