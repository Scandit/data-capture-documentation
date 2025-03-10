---
sidebar_position: 2
toc_max_heading_level: 5
sidebar_label: 'Samples'
pagination_next: null
framework: linux
keywords:
  - linux
---

# Sample Programs

This page provides a list of sample programs that demonstrate how to use the Scandit Data Capture SDK for C / Linux.

All sample applications are contained the samples directory of the SDK package.

## Prerequisites

Before you begin, make sure you have the following prerequisites in place for the relevant samples:

### Scanner Samples

Requires Video4Linux2 for camera access, install it with:
 
```bash
$ sudo apt-get install libv4l-dev`
```
    
### Image Processing Samples

If using C, requires SDL2 for loading images, install it with:

```bash
$ sudo apt-get install libsdl2-dev libsdl2-image-dev
```

If using Python3, requires SDL2 for python3 also for image loading, install it with:

```bash
$ sudo apt-get install python3-sdl2
```

### Barcode Generator Sample

Requires libpng for generating the output image, install it with:

```bash
$ sudo apt-get install libpng-dev
```

### License Key

You must insert your license key to all sample source files before compiling and running them. Sign up for a [free trial](https://www.scandit.com/trial/) if you don't already have a license key.

## Running the Samples

To run the samples, follow these steps:

1. Open a terminal and navigate to the SDK package directory.
2. Compile the samples.
    ```bash
    $ cd samples
    $ make
    ```
3. Execute the desired sample program, for example:
    ```bash
    $ ./CommandLineBarcodeScannerImageProcessingSample ean13-code.png
    ```

