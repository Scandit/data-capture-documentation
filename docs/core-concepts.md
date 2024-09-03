---
sidebar_position: 2
---

# Core Concepts

This page gives an overview of the core concepts and terms used in the Scandit Data Capture SDK.

All of these concepts are implemented as classes or protocols in the `ScanditCaptureCore` framework and are used by the frameworks that build on it to implement the data capture capabilities such as barcode reading.

## Data Capture Context

The data capture context is the central object that orchestrates the data capture and recognition tasks.

It is the object that links all of the different components together. Its main responsibilities are managing and verifying the license key, scheduling when data capture modes process frames, and defining the frame source to be used for recognition. The context itself acts as a scheduler, but does not provide any interfaces for configuring data capture capabilities.

Configuration and result handling is handled by the data capture modes directly.

Relevant classes: `SDCDataCaptureContext`, `SDCDataCaptureMode`

## Data Capture View

Typically a `SDCDataCaptureView` is used to visualize the ongoing data capture process on screen together with one or more overlays. However it’s also possible to use the data capture context without a view to perform off-screen processing.

Relevant classes: `SDCDataCaptureView`, `SDCDataCaptureOverlay`

## Frame Source

The data capture context performs recognition on images (frames).

These images are provided to the context through classes that conform to the frame source protocol. Most applications will use images coming from one of the built-in cameras of the device as implemented by the camera class.

Relevant classes: `SDCFrameSource`, `SDCFrameData`, `SDCCamera`

## Data Capture Mode

Recognition capabilities are added to the data capture context through registering one or more data capture modes.

A capture mode is responsible for one particular type of data capture, e.g. capturing barcodes, or tracking barcodes. The mode manages the settings and allows to configure what exactly gets captured, for example in the case of barcode capture, it allows to configure the symbologies of the barcodes to be captured.

Each of the data capture modes follows the same basic structure and is made up of the same building blocks described below.

Relevant classes: `SDCDataCaptureMode`, `SDCBarcodeCapture`, `SDCBarcodeTracking`

## Capture Mode Settings

Capture modes are configured through settings.

Settings are specific to each data capture mode and allow to configure the data that is captured. For example, for barcode capture and barcode tracking, the settings allow to configure which symbologies are enabled. Settings are applied to the capture mode, which is when they take effect.

Relevant classes: `SDCBarcodeCaptureSettings`, `SDCBarcodeTrackingSettings`

## Capture Mode Listeners

Data capture events, such as when a new barcode has been recognized, are propagated to the user of the API through listeners added to the capture mode.

Capture modes allow an arbitrary number of listeners to be registered.

Relevant classes: `SDCBarcodeCaptureListener`, `SDCBarcodeTrackingListener`

## Capture Mode Sessions

The captured data, such as the list of captured barcodes is available to the event callbacks through a session object.

The session object is only safe to be accessed from the event callbacks themselves and should not be passed to other threads.

Relevant classes: `SDCBarcodeCaptureSession`, `SDCBarcodeTrackingSession`

## Overlays

Each of the capture modes has one or more overlays that visualize the ongoing data capturing process.

These overlays are added to the data capture view.

Relevant classes: `SDCDataCaptureOverlay`, `SDCBarcodeCaptureOverlay`, `SDCBarcodeTrackingBasicOverlay`