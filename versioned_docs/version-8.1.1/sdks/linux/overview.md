---
toc_max_heading_level: 4
pagination_next: null
framework: linux
keywords:
  - linux
  - debian
  - ubuntu
---

# Overview

The Scandit SDK C API offers a low-level interface to the Data Capture SDK. The low-level API is the default interface on Linux but it is also available for Android and iOS.

This interface is very limited compared to the Data Capture API provided in the SDKs for all platforms. It allows you to pass image data directly to the data capture modules, such as barcode scanning. The API does not include a user interface, image or stream management, or advanced camera control. On Linux a basic camera interface for Video4Linux 2 (V4L2) cameras is provided.

If you are creating a mobile application for Android and/or iOS where the Scandit SDK is the only camera user, then you **should not** use the low-level API and use the Data Capture API instead. Possible scenarios requiring the low-level API include building:

* An embedded system with custom camera handling.
* A batch or single image processing system on an embedded system or server
* A mobile application where multiple consumers (other vision frameworks) access the camera stream and therefore the camera control can not be done by the Scandit Data Capture API.

## Features

The low-level API offers single and multi barcode scanning, barcode tracking (MatrixScan), barcode generation and barcode data parsing.

### Single Barcodes Scanning

Scanning one barcode or one group of barcodes is the default behavior of the low-level API. Valid groups are EAN/UPC with [add-on codes](barcode-capture/add-on-codes.md) or [composite codes](barcode-capture/composite-codes.md). If you implement a hand held use-case, we recommend using the `SC_PRESET_SINGLE_CODE_HAND_HELD` barcode scanner settings preset. The single scan preset provides some of the SparkScan features on the mobile API, such as smart scan intention and OCR fallback.

### Multi Barcode Scanning and Tracking

Scanning multiple barcodes in an image can be implemented in two ways; by enabling multi-scan in the barcode scanner settings (see `sc_barcode_scanner_settings_set_multi_scan_enabled`) or by using the tracking API (see `ScObjectTracker`). A license key with the `tracking` feature enabled is required for both approaches. Please [contact Scandit support](mailto:support@scandit.com) if you need such a license.

Barcode tracking identifies and follows multiple codes over time. It can be used to count objects or anchor augmented reality (AR) markers on objects, similar to the functionality of MatrixScan on the mobile API.

## Low-level API Concepts

### Memory Management Rules

Object represented by opaque pointers in Scandit SDK internally use reference counting. To claim ownership of an object, the reference count of the object is increased and decreased again when the object is no longer needed. When the reference count drops to zero, e.g. the object has no owners, the object is deallocated (freed).

To claim ownership of an object use one of the `sc_*_retain` functions, and use `sc_*_release` when you finish using it.

Some objects returned by functions are automatically owned by the caller and must be released after use, while others must be retained manually, if required. The following rules apply:

* Objects created by you (using any of the `*_new` functions) must be released after use by you.
* Objects returned by functions that explicitly state they transfer ownership to you, must be released after use. An examples of such a function is [`sc_barcode_scanner_session_get_newly_recognized_codes()`](https://docs.scandit.com/stable/c_api/struct_sc_barcode_scanner_session.html#a090af0487a5928ca5893baa66d94f946).
* You must release objects on which you called `sc_*_retain`

### Image Coordinate System

All (relative) coordinates used in the barcode scanner SDK are defined in image coordinates of the frame in memory. The origin, coordinate (0,0), is in the upper left corner. The x-direction (width) points to the right and the y-direction (height) points downwards.

Be aware that the camera sensors of most devices capture images in landscape mode and the display on screen depends on the device orientation and does not necessarily correspond to the layout of the camera image in memory. Different screen coordinate systems and use-cases require mirroring and/or rotation to obtain the correct location areas or code directions in image space. The inverse transform has to be applied if the location of a recognized code should be displayed in screen space.

## Low-Level API Performance

By default the Scandit SDK is optimized for real-time video streaming. In general barcodes in the image will not be decoded in every frame. Instead the engine tries to skip bad frames to meet real-time processing constraints.

Single image processing use-cases, for example scanning a scanned or photographed document, require a specific setup.

* Use a YUV or Grayscale image input format. RGB(A) will be converted internally.
* Use an image resolution between 800x600 to 1920x1080. 1280x720 is recommended.
* Make sure to have an area of at least 320x160 pixels when setting a restricted code location area for barcode localization.
* Having SIMD CPU support (NEON or SSE) improves execution times.
* Pre-cropping the image is not required. The SDK can find the barcodes in the image.
* Pre-processing (filter, blur, binarize) the image is not recommended. Provide natural images.
* Very long codes require that you setup the symbol counts that you want to scan.
* Blurry decoding using your custom camera and camera lens will not perform as well as high-end iOS or Android devices. Please [contact us](mailto:support@scandit.com) if specific optimizations for your camera are desired.

### Video Streaming Use-Case

The default barcode scanner settings (`SC_PRESET_NONE`) offer a balance speed to accuracy performance on frame sequences for single and multi-scan use-cases. To achieve comparable results as the high level Data Capture API, you have to create barcode specific camera control algorithms that adjust exposure and auto-focus. The `ScCamera` implementations currently provided do not implement this. The recommended input resolution is FullHD (1080p) or 4KUHD (2160p) for extra range.

For scenarios where a hand held device is used to scan a single barcode in a static scene, the barcode scanner preset `SC_PRESET_SINGLE_CODE_HAND_HELD` should be set.
Among other optimizations, this preset enables Smart Scan Intention, which prevents scans in the background or during fast movement.

A frame sequence should only be restarted (see `sc_recognition_context_start_new_frame_sequence`) if the frame stream is discontinuous, e.g. when the camera is switched off or temporarily stopped.

### Single Image Processing Use-Case

There are barcode scanner presets to improve the scan robustness. For SDK versions before 7.0, `SC_PRESET_ENABLE_SINGLE_FRAME_MODE` can be set. For SDK versions 7.1 or later `SC_PRESET_HIGH_EFFORT` should be set. These presets try to achieve the best accuracy by spending more time per frame than the default preset. The settings are optimized for high power devices or non real-time requirements. They supports single or multi-code scanning and is recommended for single image or cloud processing use-cases.

Recommendations:
* The recommended input resolution is FullHD (1080p) or 4KUHD (2160p).
* A new frame sequence should be started for every new input image by calling `sc_recognition_context_start_new_frame_sequence`.
* The input image should be uncompressed. JPEG encoded image data is often poor as it contains block artifacts.
* Try to acquire images that are as sharp as possible and don't contain motion blur.
* Disable the code duplicate filter in the session configuration.

Despite following above recommendations your single image processing will not perform the same as a mobile app based solution. The Data Capture API on mobile uses a video stream to scan. Scanning from a single image will never perform as well as scanning from a video stream, as the probability of getting a good picture of a code is much lower with just one image. In addition, the SDK can't control the camera based on previous frames if a single image is used. Real-time adjustment of auto-focus and exposure which is optimized for barcode scanning make a significant difference.

### Multi-Threading

Dynamic threading is used internally to accelerate the execution if available. The functions of the SDK library are not thread-safe. All context and scanner calls have to happen in the same thread.

