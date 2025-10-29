---
sidebar_position: 5
pagination_next: null
framework: linux
keywords:
  - linux
---

# Scan composite codes

Composite codes are combinations of a linear (1d) barcode and a 2d code.
The linear component encodes the item’s primary identification. The 2d component describes
additional data like a batch number or expiration date.

The Scandit SDK version 4.14 or newer supports all GS1 Composite Codes as defined in
ISO/IEC 24723:2010. The specification defines three different types; A, B and C.

The 1d component of a composite A or B code can be any of the following symbologies:
* EAN/UPC symbology (EAN-13, EAN-8, UPC-A, or UPC-E)
* GS1-128 (Code 128)
* Any member of the GS1 DataBar family
Version C supports GS1-128 as the linear component only.

The 2d component of a composite code is either a PDF417 or a MicroPDF417.

## Enable composite codes in the SDK

* Enable all 1d symbologies required by the desired composite code type (see above).
* Enable the required 2d symbology supported by the composite type (PDF417 or MicroPDF417).
* Set the number of codes to scan in a frame to 2.

Accumulate scan results until a 1d and a 2d code were scanned that fulfill the following conditions:
1. EAN/UPC or GS1-128 code with the composite flag set to unknown or linked or a
   GS1 DataBar code with the composite flag set to linked.
2. A PDF417 or MicroPDF417 code with the composite flag set to GS1_A, GS1_B or GS1_C.

Concatenate the results from the linear and the 2d code into one valid GS1 encoded result.

## GS1 Composite Code A (CC-A)

![DataBar Limited Composite Code](/img/symbologies/composite_type_a.png)

* Extends a linear GS1 barcode using an additional MicroPDF417 code.
* Optimized to use as little space as possible.
* Only a special set of MicroPDF417 column, row and error correction level combinations can be used.
* Data is encoded in a special base 928 compaction mode.
* Three column version has no left row address patterns.

## GS1 Composite Code B (CC-B)

![DataBar-14 Composite Code](/img/symbologies/composite_type_b.png)

* Extends a linear GS1 barcode using an additional MicroPDF417 code.
* A subset of the MicroPDF417 column and row combinations can be used.
* Marked by the (Micro)PDF417 symbol 920 at the first position.
* (Micro)PDF417 data is encoded in byte compaction mode.

## GS1 Composite Code C (CC-C)

![GS1 128 Composite Code](/img/symbologies/composite_type_c.png)

* Extends a GS1-128 (Code 128) barcode using an additional PDF417 code.
* Same encoding as CC-B.

