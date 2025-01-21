---
toc_max_heading_level: 4
pagination_next: null
framework: linux
keywords:
  - linux
---

# Overview

The Scandit C API offers a low-level interface to the Data Capture SDK. The low-level API is the default interface on Linux but it is also available for Android, iOS and Windows on request.

This interface is very limited compared to the Data Capture API provided in the SDKs for all platforms. It allows you to pass image data directly to the data capture modules, such as barcode scanning. The API does not include a user interface, image or stream management, or advanced camera control. On Linux a basic camera interface for Video4Linux 2 (V4L2) cameras is provided.

If you are creating a mobile application for Android, iOS or Windows where the Scandit SDK is the only camera user, then you **should not** use the low-level API and use the Data Capture API instead. Possible scenarios requiring the low-level API include building:

* An embedded system with custom camera handling.
* A batch or single image processing system on an embedded system or server
* A mobile application where multiple consumers (other vision frameworks) access the camera stream and therefore the camera control can not be done by the Scandit Data Capture API.

## SDK Concepts

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

* Use a YUV or Grayscale image input format. RGB will be converted internally.
* Use an image resolution between 800x600 to 1920x1080. 1280x720 is recommended.
* Make sure to have an area of at least 320x160 pixels when setting a restricted code location area for barcode localization.
* Having a working GPU (OpenGLES 2.0) support improves the performance of the barcode localization. The CPU fallback is less accurate and slower.
* Having SIMD CPU support (NEON or SSE) improves execution times.
* Pre-cropping the image is not required. The SDK can find the barcodes in the image.
* Pre-processing (filter, blur, binarize) the image is not recommended. Provide natural images.
* Very long codes require that you setup the symbol counts that you want to scan.
* Blurry decoding using your custom camera and camera lens will not perform as well as high-end iOS or Android devices. Please [contact us](mailto:support@scandit.com) if specific optimizations for your camera are desired.

### Single Image Processing

* Starting from SDK version 5.4 the settings preset `SC_PRESET_ENABLE_SINGLE_FRAME_MODE` can be used to improve performance.
* The input image should be uncompressed. JPEG file sources are very bad as they contain block artifacts.
* Try to acquire images that are as sharp as possible and don't contain motion blur.
* Disable the code duplicate filter in the session configuration.
* For SDK version 5.4 and earlier the recognition context implicitly switches between running full image localization and default scan area. To perform both strategies on an input image the process frame call has to be executed twice for each input image. This is no longer necessary for versions 5.5 or newer.

### Video Processing

To achieve comparable results as the high level Data Capture API, you have to create barcode specific camera control algorithms that adjust exposure and auto-focus. Please [contact us](mailto:support@scandit.com) if you need help with this.