---
displayed_sidebar: sdcSidebar
sidebar_position: 3
toc_max_heading_level: 4
---

# Barcode Symbologies

This page details the different barcode symbologies and their use cases.

## 1D Barcodes

### Retail

#### European Article Number (EAN)

![EAN-13](/img/symbologies/ean13.png)

* Also known as Japanese Article Number (JAN).
* Encodes a Global Trade Identification Number (GTIN).
* Contains 8 (EAN-8) or 13 (EAN-13) numerical digits.
* Last digit serves as a mod10 checksum.
* Additional data can be stored in an EAN-2 or EAN-5 add-on code.
* It has been standardized under ISO/IEC 15420.
* Relevant enum values: `SDCSymbologyEAN8`, `SDCSymbologyEAN13UPCA`.

#### EAN-2 / EAN-5 Add-On

![EAN-2](/img/symbologies/ean13_with_addon2.png)

* Encode additional product data like issue number, date or price.
* Can only be used in combination with an EAN-8, EAN-13, UPC-A or UPC-E code.
* EAN-2 encodes two digits, EAN-5 encodes five digits.
* Additional information can be found on the [Scan Add-On/Extension Codes](./extension-codes).

#### Universal Product Code (UPC)

![UPC-A](/img/symbologies/upca.png)

* Encodes a Global Trade Identification Number (GTIN).
* Contains 6 (UPC-E) or 12 (UPC-A) numerical digits.
* Last digit serves as a mod10 checksum.
* Additional data can be stored in an EAN-2 or EAN-5 add-on code.
* It has been standardized under ISO/IEC 15420.
* Encodes a Global Trade Identification Number (GTIN).
* Relevant enum values: `SDCSymbologyUPCE`, `SDCSymbologyEAN13UPCA`.

#### GS1 DataBar

![GS1 DataBar](/img/symbologies/gs1databar_expanded_stacked.png)

* Used to encode a Global Trade Identification Numbers (GTIN) along with variable additional information defined by application identifiers (AI). Examples are price, weight or expiry date.
* Valid application identifiers (AI) are defined in the GS1 specification.
* Supports variable length data content.
* Barcode data is verified by an implicit checksum.
* Does not require quiet zones around the barcode.
* It has been standardized under ISO/IEC 24724.
* Always contains GS1 data.
* Relevant enum value: `SDCSymbologyGS1Databar`, `SDCSymbologyGS1DatabarExpanded`, `SDCSymbologyGS1DatabarLimited`.

### Industrial

#### Code 128

![Code 128](/img/symbologies/code128.png)

Used in a wide range of applications.

* The barcode data can be encode numerical data only, two different subsets of the ASCII table or Latin-1 (ISO-8859-1) data. Combinations of the four different modes can be used in a single code.
* Supports variable length data content.
* A mandatory checksum is verified.
* It has been standardized under ISO/IEC 15417.
* Includes support for EAN-128 and GS1-128.
* Uses a leading FNC1 character (ASCII 21) to signal GS1 data. The FNC1 character is encoded but will not be returned in the barcode result.
* Relevant enum value: `SDCSymbologyCode128`.

#### Code 32

![Code 32](/img/symbologies/code32.png)

* It is used for labelling pharmaceutical products in Italy.
* Also known as Italian Pharmacode, IMH, Codice 32 Pharmacode, Codice Farmaceutico Italiano and Radix 32.
* Contains nine numerical digits.
* Last digit serves as a mandatory checksum.
* Narrow to wide bar ratios of 1:2.5 is recommended.
* Specification can be found in Allegato A Caratteristiche tecniche del bollino farmaceutico from 18-7-2014 GAZZETTA UFFICIALE DELLA REPUBBLICA ITALIANA Serie generale - n. 165
* Please note that Code 32 codes can be scanned as valid Code 39 codes and vice versa. Code 32 is a subset of the Code 39 symbology (and therefore indistinguishable).
* Relevant enum value: `SDCSymbologyCode32`.

#### Code 39

![Code 39](/img/symbologies/code39.png)

* Mostly used in logistics to encode application specific identifiers.
* The standard version can encode numbers 0-9, capital letters A-Z, symbols -.$/+% and space.
* Supports variable length data content.
* Narrow to wide bar ratios from 1:2 up to 1:3 are supported. 1:2.5 is recommended.
* By default no checksum is verified, but an optional mod43 checksum can be enforced.
* All ASCII characters including control characters encoding support can be enabled on demand.
* It has been standardized under ISO/IEC 16388.
* Please note that Code 39 codes can be scanned as valid Code 32 codes and vice versa. Code 32 is a subset of the Code 39 symbology (and therefore indistinguishable).
* Relevant enum value: `SDCSymbologyCode39`.

#### Code 93

![Code 93](/img/symbologies/code93.png)

* Mostly used in logistics to encode application specific identifiers.
* Data in standard encoding (numbers 0-9, capital letters A-Z, symbols -.$/+% and space) and Full ASCII mode (including control characters) are supported.
* Supports variable length data content.
* Two mod47 checksums are verified.
* Relevant enum value: `SDCSymbologyCode93`.

#### ITF (Interleaved Two of Five)

![ITF](/img/symbologies/itf.png)

* It is used primarily in the distribution and warehouse industry.
* Encodes an even number of numerical characters.
* Supports variable length data content.
* Narrow to wide bar ratios from 1:2 up to 1:3 are supported. 1:2.5 is recommended.
* By default no checksum is verified.
* It has been standardised under ISO/IEC 16390.
* An optional mod10 checksum can be enforced.
* Alternative names for this symbology include Leitcode, or Identcode. Both of these have a mandatory mod10 checksum.
* Relevant enum value: `SDCSymbologyInterleavedTwoOfFive`.

#### Codabar

![Codabar](/img/symbologies/codabar.png)

* This symbology is used by U.S. blood banks, photo labs, libraries, on FedEx airbills and in Japanese Logistics (where it is known as NW-7).
* Encodes numbers and the characters –$:/.+
* First and last symbols (the guard patterns) are one of A, B, C, or D. They are returned as part of the data string.
* Supports variable length data content.
* Some standards that use Codabar will define a check digit, but there is no agreed-upon standard checksum algorithm.
* The width ratio between narrow and wide can be chosen between 1:2.25 and 1:3.
* Different checksum algorithms are in use, though they are not standardized. Supported optional checksums are a mod11 and mod16 checksum.
* Relevant enum value: `SDCSymbologyCodabar`.

### Legacy

#### Code 11

![Code 11](/img/symbologies/code11.png)

* Primarily used for labelling telecommunication equipment. Also known as USD-8.
* The barcode data can be encode numerical data, the dash and dot character.
* Supports variable length data content.
* For up to 10 data digits a single check digit is used, otherwise two check digits are used.
* Relevant enum value: `SDCSymbologyCode11`.

#### Code 25

![Code 25](/img/symbologies/code25.png)

* Also known as Standard 2 of 5, Industrial 2 of 5 or Discrete 2 of 5.
* Legacy numerical barcode format with a low data density.
* Supports variable length data content.
* By default no checksum is verified.
* An optional mod10 checksum can be enforced.
* Relevant enum value: `SDCSymbologyCode25`.

#### IATA 2 of 5

![IATA 2 of 5](/img/symbologies/iata2of5.png)

* Also known as Computer Identics 2 of 5.
* Used by International Air Transport Association (IATA) for managing air cargo.
* Supports variable length data content.
* By default no checksum is verified.
* An optional mod1010 checksum can be enforced.
* Relevant enum value: `SDCSymbologyIATATwoOfFive`.

#### Matrix 2 of 5

![Matrix 2 of 5](/img/symbologies/matrix2of5.png)

From the same family as Code 25 and IATA 2 of 5
~30% more dense than Code 25 or IATA 2 of 5
Supports variable length data content.
Encoding uses variable width spaces as well as bars
Stores numerical [0-9] data only
An optional mod10 checksum can be enforced.
Relevant enum value: `SDCSymbologyMatrixTwoOfFive`.

#### MSI Plessey

![MSI Plessey](/img/symbologies/msi.png)

* MSI is used primarily for inventory control, marking storage containers and shelves in warehouse environments.
* Encodes any number of numerical characters.
* By default a mod10 checksum is verified. Alternative supported checksum options are mod11, mod1010 and mod1110.
* MSI is used primarily for inventory control, marking storage containers and shelves in warehouse environments.
* Encodes any number of numerical characters.
* Relevant enum value: `SDCSymbologyMSIPlessey`.

## 2D Barcodes

### QR Code

![QR Code](/img/symbologies/qr.png)

* Supports variable length data content.
* Data encoding modes support numeric, alphanumeric, binary data and kanji characters.
* Different sizes (called versions) and error correction levels can be defined.
* The Scandit Data Capture SDK supports Model 2 codes including color inversion, mirroring and GS1 data content.
* It has been standardized under ISO/IEC 18004.
* Uses an internal symbology specific FNC1 symbol to signal GS1 data carrier mode. The internal symbol is not returned as part of the result. The common mistake of adding a leading group separator character in raw byte mode does not turn the code into a GS1 data carrier.
* Relevant enum value: `SDCSymbologyQR`.

#### Micro QR Code

![Micro QR Code](/img/symbologies/microqr.png)

* Miniature version of the standard QR code that supports variable length data content up to 35 characters.
* Different error correction levels can be defined with a data recovery rate of up to 25%.
* Optimized to transfer small amounts of data such as a phone number or a website URL.
* The Scandit Data Capture SDK supports color inversion and mirroring.
* Relevant enum value: `SDCSymbologyMicroQR`.

#### Rectangular Micro QR Code

![Rectangular Micro QR Code](/img/symbologies/rmqr.png)

* Rectangular version of Micro QR code (described in ISO/IEC 23941), supports variable length data content up to 361 numbers, 219 alphanumeric characters, 150 byte, 92 Kanji.
* Two different error correction levels can be defined with a data recovery rate of up to 30%.
* 32 Different sizes, from 7x43 to 17x139.
* Relevant enum value: `SDCSymbologyMicroQR`.

### Data Matrix

![Data Matrix](/img/symbologies/datamatrix.png)

* Supports variable length data content.
* Encodings and sizes defined in the Data Matrix ECC 200 standard are supported.
* Different error correction levels can be defined.
* It has been standardized under ISO/IEC 16022.
* Uses an internal symbology specific FNC1 symbol to signal GS1 data carrier mode. The internal symbol is not returned as part of the result. The common mistake of adding a leading group separator character in raw byte mode does not turn the code into a GS1 data carrier.
* Relevant enum value: `SDCSymbologyDataMatrix`.

#### Data Matrix Rectangular Extension

![Data Matrix Rectangular Extension](/img/symbologies/dmre.png)

* The decoder supports the Data Matrix Rectangular Extension (DMRE) as defined in the AIM-D Symbology Specification Revision 1.01.
* Includes support for GS1 encoded data (GS1 Data Matrix).
* Relevant enum values: `SDCSymbologyDataMatrix`.

#### Data Matrix Direct Part Marking (DPM)

![Data Matrix Direct Part Marking](/img/symbologies/dpm.png)

* Data Matrix codes are frequently used for direct part marking (DPM) where the codes are edged directly into the material instead of being printed.
* Includes support for GS1 encoded data (GS1 Data Matrix).
* For scanning these types of codes, it is recommended to enable the `direct_part_marking` extension_mode.
* Relevant enum values: `SDCSymbologyDataMatrix`.

### PDF417

![PDF417](/img/symbologies/pdf417.png)

* Used in a wide range of applications such as transport tickets and document processing.
* Supports variable length data content.
* The number of rows and columns are configurable.
* Different error correction levels can be defined.
* It has been standardized under ISO/IEC 15438.
* Truncated PDF417 (Compact PDF417) codes can be used to save space.
* Relevant enum value: `SDCSymbologyPDF417`.

#### Micro PDF417

![Micro PDF417](/img/symbologies/micropdf417.png)

* More space efficient version of PDF417 without start and end patterns.
* Used in GS1 Composite Codes type A (CC-A) and B (CC-B).
* Supports variable length data content using one to four columns and up to 44 rows.
* All size versions have a fixed error correction level.
* It has been standardized under ISO/IEC 24728.
* Relevant enum value: `SDCSymbologyMicroPDF417`.

### Aztec Code

![Aztec Code](/img/symbologies/aztec.png)

* Used for tickets in the transport industries, e.g. railway companies.
* Data can be encoded in ASCII or extended ASCII.
* Supports variable length data content.
* Different error correction levels can be defined.
* It has been standardized under ISO/IEC 24778.
* Relevant enum value: `SDCSymbologyAztec`.

### MaxiCode

![MaxiCode](/img/symbologies/maxicode.png)

* Fixed size 2d symbology originally created by UPS in 1992.
* Used for tracking and managing shipments of packages.
* It has been standardized under ISO/IEC 16023.
* Supports encoding of a Structured Carrier Message or data in extended ASCII.
* Uses Reed-Solomon error correction.
* Fixed size 2d symbology originally created by UPS in 1992.
* Relevant enum value: `SDCSymbologyMaxiCode`.

### DotCode

![DotCode](/img/symbologies/dotcode.png)

* Public Domain optical data carrier designed to be printed reliably at very high speed.
* Flexible code shape: rectangular codes of virtually any size and width/height proportion can be used.
* Strong error correction by using message encoding inspired by Code 128 and strengthened by Reed-Solomon.
* Allows to apply real time data with GS1 application identifiers, such as expiration date, lot number and serial number to products at production line speeds.
* It has been standardized in the AIM specification AIMD013 Revision 3.0.
Relevant enum value: `SDCSymbologyDotCode`.

### ArUco

![ArUco](/img/symbologies/aruco.png)

* Used mainly for camera pose estimation in augmented reality and robotics, developed at the University of Cordoba.
* Consists of an n x n bit matrix (n can be any integer value, most commonly used are values ranging from 4 to 7) and a one element wide black border.
* Does not store any data directly, the bit matrix uniquely identifies the marker in a dictionary (collection of markers of the same bit matrix size).
* Requires a dictionary, it can be computed or an available preset can be used.
* Relevant enum value: `SDCSymbologyArUco`.

## GS1 Composite Codes

GS1 Composite Codes as defined in ISO/IEC 24723:2010 are made up of a 1D and 2D code. See [Scanning Composite Codes](./scanning-composite-codes) for more information.

### GS1 Composite Code A (CC-A)

![GS1 Composite Code A](/img/symbologies/composite_type_a.png)

* Extends a linear GS1 barcode using an additional MicroPDF417 code.
* Optimized to use as little space as possible.
* Only a special set of MicroPDF417 column, row and error correction level combinations can be used.
* Data is encoded in a special base 928 compaction mode.
* Three column version has no left row address patterns.

### GS1 Composite Code B (CC-B)

![GS1 Composite Code B](/img/symbologies/composite_type_b.png)

* Extends a linear GS1 barcode using an additional MicroPDF417 code.
* A subset of the MicroPDF417 column and row combinations can be used.
* Marked by the (Micro)PDF417 symbol 920 at the first position.
* (Micro)PDF417 data is encoded in byte compaction mode.

### GS1 Composite Code C (CC-C)

![GS1 Composite Code C](/img/symbologies/composite_type_c.png)

* Extends a GS1-128 (Code 128) barcode using an additional PDF417 code.
* Same encoding as CC-B.

## Postal Codes

### Royal Mail 4 State Customer Code (RM4SCC)

![RM4SCC](/img/symbologies/rm4scc.png)

* Postal code symbology used by Royal Mail and Singapore Post for encoding the destination address.
* It enables UK postcodes as well as Delivery Point Suffixes (DPSs) to be easily read by a machine at high speed.
* Uses a checksum digit for verifying data.
* Relevant enum value: `SDCSymbologyRM4SCC`.

### KIX (Klant index)

![KIX](/img/symbologies/kix.png)

* Uses the same symbol alphabet as RM4SCC.
* Does not use a checksum for data verification, nor does it have a start/end pattern.
* KIX codes can be read from left-to-right or right-to-left. Depending on the reading direction, the data is completely different. To determine which of the two orientations is correct, the Scandit Data Capture SDK matches the data against a set of encoding rules and returns the data that matches the rule.
* Relevant enum value: `SDCSymbologyKIX`.

### Posi LAPA 4 State Code

![Posi LAPA 4 State Code](/img/symbologies/posi_lapa_4state.png)

* Uses the same symbol alphabet as RM4SCC
* Uses Reed-Solomon error correction. It can correct up to 8 erasures or 4 errors.
* LAPA can be read from left-to-right or right-to-left. The direction can be determined by reading the leftmost or the rightmost bar.
* Thanks to its fixed length and error correction, it offers better robustness than RM4SCC.
* Relevant enum value: `SDCSymbologyLapa4SC`.

### USPS Intelligent Mail

![USPS Intelligent Mail](/img/symbologies/usps_intelligent_mail.png)

* Postal code symbology used by the United States Postal Service (USPS) to sort and track letters and flats.
* Height-modulated barcode with 4-state symbology.
* Combines and improves functionalities of the POSTNET and PLANET Code symbologies.
* Uses an eleven-bit cyclic redundancy check to detect, but not correct, errors.
* Relevant enum value: `SDCSymbologyUSPSIntelligentMail`.

### UPU (Universal Postal Union) S18 4 State Code

![UPU S18 4 State Code](/img/symbologies/upu_s18.png)

* UPU 4-state is a variable-length and alphanumeric barcode.
* It is used to add identifier tags to UPU postal items.
* It has two possible encoding formats, 18C and 18D.
* It can encode 19 or 25 codeword with up to 6 or 12 error correction codewords respectively.
* It uses a Reed-Solomon error detection and correction scheme.
* The Universal Postage Union manages the UPU S18 4-State specification.
* Relevant enum value: `SDCSymbologyUPU4State`.

### Australia Post

![Australia Post](/img/symbologies/australian_postal_code.png)

* This symbology is used by Australia Post for Postal code and automatic mail sorting.
* The Australian Post 4-State barcode specifies three formats. Each format corresponds to a fixed length barcode of a unique number of bars.
* The Standard Customer Barcode has 37 bars, Customer Barcode 2 has 51 bars and Customer Barcode 3 has 67 bars.
* All barcodes contain a two-digit Format Control Code Field and an eight-digit Sorting Code Field, also know as Delivery Point ID (DPID).
* The Standard Customer Barcode has no Customer Information Field. Customer Barcode 2 and Customer Barcode 3 have respectively 16 and 31 bars for encoding customer information.
* Australian post specifies two encoding tables. Table N encode numeric data and table C encodes alphanumeric characters and special symbols.
* The Standard Barcode format only carries numeric values, while the Customer Information section of Barcode Formats 2 and 3 can carry alphanumeric information coded using Table N and Table C. Customers can also use their own scheme to encode data in the Customer Information field.
* The symbology uses a Reed-Solomon error detection and correction scheme, and can correct up to 2 errors or 4 erasures.
* Australian Post manages the Guide to Printing the 4-State Barcode specification (latest revision 16 Mar 2012).
* Relevant enum value: `SDCSymbologyAustralianPost`.

### French Postal Code (La Poste)

![French Postal Code](/img/symbologies/french_postal_code.png)

* This symbology is used by La Poste (France).
* The French Post symbology consists of a two codes: a Chronomark and a Routing code. The two codes are printed side by side.
* The Chronomark has 38 positions and the Routing code has 46 positions.
* La Poste manages the specifications.

### Swiss Post
 
* This symbology is used by [Swiss Post](https://www.post.ch) for mail item identification. 
* The Swiss Post 4-State barcodes have a fixed length of 93 bars. 
* Swiss Post manages the specifications.

## Additional Symbologies

### GS1 Data Carrier

The GS1 organization defined a [standard](https://www.google.com/url?q=https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications&sa=D&source=editors&ust=1724244897545334&usg=AOvVaw10tvH29tXazbZZd0PTU1uR) to encode application specific data in a barcode. The symbologies Code128, GS1 DataBar, DataMatrix and QR codes can contain GS1 encoded data.

The barcode property `SDCBarcode.isGS1DataCarrier` tells you if a barcode contains GS1 encoded data. GS1 data has to be accessed using `SDCBarcode.rawData` and not `SDCBarcode.data` because it is stored in machine readable form and might contain non-printable characters such as group separators (ASCII 29).

GS1 encoded data cannot be displayed directly to the user. The application identifiers cannot be distinguished from the data and non-printable characters might be part of the data. There are three different options to process the data. Use the Scandit parser API to convert the machine readable data into a human readable string, use the Scandit parser to extract all data elements (Application Identifiers) from the machine readable data or lastly use your own parser to transform the machine readable data.

Example of a correctly encoded GS1 Code128 (also known as GS1-128) barcode:

![GS1 Code128](/img/symbologies/gs1_code128.png)

The machine readable data that gets scanned from the code above, where \<GS\> represents the non-printable group separator character:

```text
1088748816455721123456789012<GS>11111228
```

The same data in the human readable representation:

```text
(10)887488164557(21)123456789012(11)111228
```

The same data parsed into its application identifiers by the Scandit parser:

```json
[
    {
        "name" : "01",
        "parsed" : {
            "indicator" : 1,
            "company_prefix" : "0887488",
            "item_reference" : "16455"
        },
        "rawString" : "10887488164557"
    },
    {
        "name" : "21",
        "parsed" : "123456789012",
        "rawString" : "123456789012"
    },
    {
        "name" : "11",
        "parsed" : {
            "year" : 2011,
            "month" : 12,
            "day" : 28
        },
        "rawString" : "111228"
    }
]
```

## Symbology Specific Notes

* **Code128** uses a leading FNC1 character (ASCII 21) to signal GS1 data. The FNC1 character is encoded but will not be returned in the barcode result.
* **GS1 DataBar** always contains GS1 data.
* **DataMatrix** and **QR Code** use an internal symbology specific FNC1 symbol to signal GS1 data carrier mode. The internal symbol is not returned as part of the result. The common mistake of adding a leading group separator character in raw byte mode does not turn the code into a GS1 data carrier.

There are many incorrectly encoded GS1 codes in the wild. The following image depicts two common error cases: The first incorrect code uses a leading group separator instead of the DataMatrix specific encoding scheme. The second error case encodes the human readable GS1 data representation in a normal DataMatrix code.

![GS1 Codes](/img/symbologies/gs1_data_matrix_examples.png)