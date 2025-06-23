---
toc_max_heading_level: 4
pagination_next: null
framework: linux
keywords:
  - linux
---

# Installation

This page describes how to integrate the Scandit Data Capture SDK into your Linux project.

The Scandit Data Capture SDK for Linux is provided as a Debian package.

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

* Meet the [system requirements](/system-requirements.md#linux)
* Download the Scandit SDK for Linux from the [Scandit dashboard](https://ssl.scandit.com/dashboard/sign-in)
* Have a valid Scandit license key

## Installation

To install the Scandit SDK, use the following command while specifying the correct version number and architecture:

```bash
$ sudo dpkg -i libscandit-barcodescanner-X.Y.Z-architecture.deb
```

The architecture you need to use depends on your system:

- amd64 for 64bit x86 systems
- arm64 for 64bit ARM systems such as the Nvidia Jetson TX2 or the Raspberry Pi 4 or 5

For example, if using a 64bit x86 Ubuntu desktop the correct command would be:

```bash 
$ sudo dpkg -i libscandit-barcodescanner-5.27.1-amd64.deb
```

# Python API

The Python bindings for the Scandit SDK are located in the zip file. To use
them, you need to ensure that they are located in a path that Python
searches for modules. One way to achieve this is to extend the `PYTHONPATH`
to also list the directory that contains `scanditsdk.py`

Note that the Python bindings are provided on a best-effort basis. They
aren't an officially supported product from Scandit.

# Raspberry Pi's

The SDK supports the Raspberry Pi 3, 4 and 5. The camera has to support 
Video4Linux2 (V4L2). The following steps are required to setup V4L2:

```bash
$ sudo apt-get install v4l-utils
```

Put bcm2835-v4l2 into `/etc/modules-load.d/modules.conf`.
Reboot the device.

# Sample Applications

All sample applications are contained the samples directory and have the following dependencies:

 * Camera samples: Video4Linux2 for camera access:
 
    `$ sudo apt-get install libv4l-dev`
    
 * CommandLineBarcodeScannerImageProcessingSample: SDL2 for loading images.
 
    `$ sudo apt-get install libsdl2-dev libsdl2-image-dev`
    
 * CommandLineBarcodeScannerImageProcessingSample.py: SDL2 for python3 also for image loading.
 
    `$ sudo apt-get install python3-sdl2`
    
 * CommandLineBarcodeGeneratorSample: libpng for generating the output image.
 
    `$ sudo apt-get install libpng-dev`

Insert your license key to all sample source files.

Compile:
```bash
$ cd samples
$ make
```

Execute the image processing sample:
```bash
$ ./CommandLineBarcodeScannerImageProcessingSample ean13-code.png
```

Execute the camera sample:
```bash
$ ./CommandLineBarcodeScannerCameraSample /dev/video0 640 480
```

Execute the MatrixScan sample:
```bash
$ ./CommandLineMatrixScanCameraSample /dev/video0 1920 1080
```

Execute the barcode generator sample:
```bash
$ ./CommandLineBarcodeGeneratorSample
```

Execute the Python image processing sample:
```bash
$ python CommandLineBarcodeScannerImageProcessingSample.py ean13-code.png
```

## Gstreamer

Refer to the documentation in `samples/gstreamer/README.md`.

## OpenCV

OpenCV barcode scanner samples are in `samples/opencv_py_demo` folder.

These examples configure the SDK for a single image use case without any
resource restrictions.

* OpenCvCppSample.cpp: OpenCV C++ API sample:

```
    mkdir build
    cd build
    cmake ..
    make
```

* OpenCvPySample.py: OpenCV Python API sample:

  1. Copy ../public_api/python/scanditsdk.py locally
  2. Update LD_LIBRARY_PATH variable with a path to libscanditsdk.so library, e.g.

```
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/$USER/scanditsdk/lib
```
