---
description: "Guide to customizing overlays in the Scandit Web Label Capture SDK."
sidebar_position: 3
pagination_next: null
framework: web
keywords:
  - web
---

# Advanced Configurations

## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/7.6/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/7.6/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label captured and [brushForField()](https://docs.scandit.com/7.6/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```js
import { Brush, Color } from "@scandit/web-datacapture-core";

overlay.listener = {
  brushForField: (overlay, field, label) => {
    switch (field.name) {
      case "<your-barcode-field-name>":
        return new Brush(
          Color.fromRGBA(0, 255, 255, 0.5),
          Color.fromRGBA(0, 255, 255, 0.5),
          0
        );
      case "<your-expiry-date-field-name>":
        return new Brush(
          Color.fromRGBA(255, 165, 0, 0.5),
          Color.fromRGBA(255, 165, 0, 0.5),
          0
        );
      default:
        return Brush.transparent;
    }
  },
  brushForLabel: (overlay, label) => Brush.transparent,
  onLabelTapped: (overlay, label) => {
    // Handle user tap gestures on the label.
  },
};
```

:::tip
Use brush colors with transparency (alpha < 100%) to not occlude the captured barcodes or texts.
:::