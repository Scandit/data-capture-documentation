---
sidebar_position: 3
pagination_next: null
framework: android
keywords:
  - android
---

# Advanced Configurations

## Customize the Overlay Appearance

To customize the appearance of the overlay, you can implement a [LabelCaptureBasicOverlayListener](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#interface-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener).

The method [brushForLabel()](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForLabel) is called every time a label is captured, and [brushForField()](https://docs.scandit.com/data-capture-sdk/android/label-capture/api/ui/label-capture-basic-overlay-listener.html#method-scandit.datacapture.label.ui.ILabelCaptureBasicOverlayListener.BrushForField) is called for each of its fields to determine the brush for the label or field.

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin">

```kotlin
overlay.listener = object : LabelCaptureBasicOverlayListener {
    /*
     * Customize the appearance of the overlay for the individual fields.
     */
    override fun brushForField(
        overlay: LabelCaptureBasicOverlay,
        field: LabelField,
        label: CapturedLabel
    ): Brush? = when (field.name) {
        "<your-barcode-field-name>" -> Brush(Color.CYAN.withAlpha(128), Color.CYAN, 1f)
        "<your-expiry-date-field-name>" -> Brush(Color.GREEN.withAlpha(128), Color.GREEN, 1f)
        else -> Brush(Color.TRANSPARENT, Color.TRANSPARENT, 0f)
    }

    /*
     * Customize the appearance of the overlay for the full label.
     * In this example, we disable label overlays by returning null always.
     */
    override fun brushForLabel(
        overlay: LabelCaptureBasicOverlay,
        label: CapturedLabel
    ): Brush? = null

    override fun onLabelTapped(
        overlay: LabelCaptureBasicOverlay,
        label: CapturedLabel
    ) { 
        /*
         * Handle the user tap gesture on the label.
         */
    }
}

```
</TabItem>
<TabItem value="java" label="Java">

```java
overlay.setListener(new LabelCaptureBasicOverlayListener() {
    @Nullable
    @Override
    public Brush brushForLabel(
        @NonNull LabelCaptureBasicOverlay overlay, @NonNull CapturedLabel label) {
        return null;
    }

    @Override
    public Brush brushForField(@NonNull LabelCaptureBasicOverlay overlay,
                               @NonNull CapturedField field, @NonNull CapturedLabel label) {
        if (field.getName().equals("<your-barcode-field-name>")) {
            return new Brush(
              getResources().getColor(R.color.barcode_overlay_fill),
              getResources().getColor(R.color.barcode_overlay_stroke), 
              0f
            );
        } 
        
        if (field.getName().equals("<your-expiry-date-field-name>")) {
            return new Brush(
              getResources().getColor(R.color.expiry_date_overlay_fill),
              getResources().getColor(R.color.expiry_date_overlay_stroke), 
              0f
            );
        } 
        
        return null;
    }
});
```
</TabItem>
</Tabs>

:::tip
You can also use `LabelCaptureBasicOverlay.setLabelBrush()` and `LabelCaptureBasicOverlay.setCapturedFieldBrush()` to configure the overlay if you don't need to customize the appearance based on the name or content of the fields.
:::
