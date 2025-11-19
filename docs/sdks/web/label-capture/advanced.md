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

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label captured and [brushForField()](https://docs.scandit.com/data-capture-sdk/web/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

```ts
import { Color, DataCaptureView } from "@scandit/web-datacapture-core";
import type { 
  LabelCaptureBasicOverlayListener, 
  LabelCaptureBasicOverlay, 
  LabelField,
  CapturedLabel 
} from "@scandit/web-datacapture-label";

const dataCaptureView = await DataCaptureView.forContext(DataCaptureContext.sharedInstance);

const transparentColor = Color.fromRGBA(0,0,0,0);
const overlayListener: LabelCaptureBasicOverlayListener = {
    brushForField(overlay: LabelCaptureBasicOverlay,
        field: LabelField,
        label: CapturedLabel): Brush | null => {
      switch (field.name) {
      case "<your-barcode-field-name>":
        return new Brush(
          Color.fromRGBA(0, 255, 255, 0.5),
          Color.fromRGBA(0, 255, 255, 0.5),
          0
        )
        break;
      case "<your-expiry-date-field-name>":
        return new Brush(
          Color.fromRGBA(255, 165, 0, 0.5),
          Color.fromRGBA(255, 165, 0, 0.5),
          0);
        break;
      default:
        return new Brush(
          transparentColor,
          transparentColor,
          0);
    },
    brushForLabel(overlay: LabelCaptureBasicOverlay,
        label: CapturedLabel): Brush | null {
      return new Brush(transparentColor, transparentColor, 0)
    },
    onLabelTapped(overlay: LabelCaptureBasicOverlay, label: CapturedLabel) {
      /*
       * Handle user tap gestures on the label.
       */
    }
  }
};

/*
  * Assign the overlay listener to the overlay
  * before adding it to the data capture view.
  */
overlay.listener = overlayListener;
await dataCaptureView.addOverlay(overlay);

/*
  * Unassign the overlay listener from the overlay
  * before removing it from the data capture view.
  */
overlay.listener = null;
await dataCaptureView.removeOverlay(overlay);
```

:::tip
Use brush colors with transparency (alpha < 100%) to not occlude the captured barcodes or texts.
:::
