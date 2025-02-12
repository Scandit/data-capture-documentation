---
sidebar_label: 'API Reference'
title: 'API Reference'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
keywords:
  - bolt
---

## ID Bolt Session

The main class of ID Bolt is `IdBoltSession`. It represents a session in which the end-user is guided through a workflow to scan their ID. The `IdBoltSession.onCompletion()` callback is called when the user has scanned their ID, the ID has been accepted and the ID Bolt pop-up is closed. Similarly, `IdBoltSession.onCancellation()` is called when the user closes the ID Bolt pop-up without finishing the full process successfully.

Using validators, ID Bolt can verify the expiration date or other features of the ID. Optionally, this can be done without sharing any personally identifiable information (PII) with your website.

### Methods

#### `create`

| Signature | Description |
| --------- | ----------- |
| `static create(serviceUrl: string, options: IdBoltCreateSessionOptions): IdBoltSession` | Primary way to create an ID Bolt session. |

##### Parameters

- `serviceUrl: string`: URL that ID Bolt loads when started. Provided in your account on the [Scandit dashboard](https://ssl.scandit.com/dashboard).

:::note
The default value `app.id-scanning.com` is an alias that points to Scandit’s servers. In a production environment it can be changed to your own domain name pointing to Scandit’s servers. This will require you to configure a CNAME record in the DNS settings of your domain.
:::

- `options: IdBoltCreateSessionOptions`: Object specifying the session options:
  - `licenseKey: string`: Your license key, provided in you account on the [Scandit dashboard](https://ssl.scandit.com/dashboard).
  - `documentSelection: Document Selection`: Object specifying the acceptable documents. See *[`Document Selection`](#document-selection)*.
  - `returnDataMode: ReturnDataMode`: Defines the extent of the data returned by the `onCompletion()` callback. Use:    
	- `ReturnDataMode.FullWithImages` to get all extracted data and images.
	- `ReturnDataMode.Full` to get all extracted data without images.
  - `anonymizationMode?: AnonymizationMode`: Define the extend returned data is anonymized. See *[`Anonymization Mode`](#anonymization-mode)*.
  - `scanner?: Scanner`: Options to customize the scanner. See *[`Scanner`](#scanner-options)*.
  - `validation?: Validators[]`: Optional array of validators, default: `[]`. See *[`Validators`](#validators)*. 
  - `locale?: string`: The language in which the text is displayed. Default: `"en-US"`.
  - `workflow?: WorkflowOptions`: Options to customize the workflow. See *[`Workflow Options`](#workflow-options)*.
  - `theme?: Theme`: Options to customize the theme. See *[`Theme`](#theme)*.
  - `textOverrides?: TextOverrides`: Options to customize the text. See *[`Text Overrides`](#text-overrides)*.
  - `onCompletion: (result: CompletionResult) => void`: A callback that is called when the user has successfully scanned their ID.
  - `onCancellation?: (reason: CancellationReason) => void`: A callback that is called whenever the flow can not be completed.


Once created, a session object does nothing until you execute `start()` on it:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
	licenseKey: LICENSE_KEY,
	documentSelection,
	returnDataMode: ReturnDataMode.FullWithImages,
	validation: [Validators.notExpired()],
	onCompletion: (result) => {
		alert("Successfully completed workflow");
	},
	onCancellation: (reason) => {
		switch (reason) {
			case CancellationReason.UserClosed:
				console.log("User closed the scanning window");
				break;
			case CancellationReason.ServiceStartFailure:
				console.log("ID Bolt service failed to start");
				break;
		}
	}
});
await idBoltSession.start();
```

#### `start`

| Signature | Description |
| --------- | ----------- |
| `async IdBoltSession.start(): Promise<string>` | Open the ID Bolt pop-up to start the scanning workflow. This method returns a session ID identifying the session. |

## Document Selection

Documents are selected using the `DocumentSelection` class.

A class to define which types of documents the ID Bolt will accept. The list of documents is provided as specific document objects, instantiated with a `Region`. For example passports from the USA would be `new Passport(Region.USA)`.

Documents that are not acceptable may still get recognized by the scanner. In this case the user will be notified to use one of the accepted document types.

#### `create`

| Signature | Description |
| --------- | ----------- |
| `static DocumentSelection.create(selection: Selection): DocumentSelection` | Primary way to create a `DocumentSelection` instance with all the included and excluded documents. Only `Selection.include` is mandatory. |

```ts
const documentSelection = DocumentSelection.create({
	accepted: [
		new Passport(Region.Any),
		// You can either use country name or ISO code
		new IDCard(Region.FRA),
		new DriverLicense(Region.France)
	],
	rejected: [
		// You can explicitly reject certain documents, if they would be included otherwise.
		new Passport(Region.Switzerland)
	],
});
```

### Document Types

Document types are represented by classes. The general purpose document classes can all be instantiated with a specific region. 

These document type instances are used to define which documents are accepted or rejected in the `DocumentSelection` class.

#### Passport

Includes all Passports

```ts
new Passport(Region.USA) // US passports
new Passport(Region.Any) // Any passport
```

#### ID Card

Includes national identity cards

```ts
new IDCard(Region.Germany) // German identity cards
new IDCard(Region.Any) // National identity card from any country
```

#### Driver License

Includes driver licenses

```ts
new DriverLicense(Region.France) // French driver license
new DriverLicense(Region.Any) // Driver license card from any country
```

#### Visa (ICAO)

Includes visas that comply with the International Civil Aviation Organization (ICAO) standards

```ts
new VisaIcao(Region.USA) // US ICAO-compliant visas
new VisaIcao(Region.Any) // Any ICAO-compliant visa
```


#### Residence Permit

Includes residence permits

```ts
new ResidencePermit(Region.USA) // US residence permits
new ResidencePermit(Region.Any) // Residence permit from any country
```

#### Health Insurance Card

Includes health insurance cards

```ts
new HealthInsuranceCard(Region.Germany) // German health insurance cards
new HealthInsuranceCard(Region.Any) // Health insurance card from any country
```

#### Region Specific Documents

In addition to the general purpose document classes, there are also region specific document. These documents are instantiated with the `RegionSpecific` class and a `RegionSpecificSubtype` argument.

Example:
```ts
new RegionSpecific(RegionSpecificSubtype.BelgiumMinorsId) // Belgian minors ID
new RegionSpecific(RegionSpecificSubtype.MexicoTaxId) // Mexican tax ID
```

The list of supported region specific document types can be found [here](#supported-region-specific-documents).



### Regions

Regions are used to define the region of a document. They can be used to define which documents are accepted or rejected in the `DocumentSelection` class.

Regions can be chosen using the `Region` enum. The `Region` enum contains both the ISO code and the name of the region.
If your system uses three-letter ISO codes, you can also directly use those strings.

Example:

```ts
// France
Region.FRA;
Region.France;

Region.FRA === Region.France === "FRA"; // true

// Any
Region.Any;
```


#### Two-letter ISO code

If you have a two-letter ISO code, you can convert it to a region using the `Region.fromShortCode` method. To convert a region to a two-letter ISO code, use the `Region.toShortCode` method.

Example:

```ts
const region = Region.fromShortCode("FR"); // == Region.France == "FRA"
const shortCode = Region.toShortCode(Region.FRA); // == "FR"
```

In case the provided short code is not valid, the methods throw an exception.



## Validators

Validators enable you to run checks on the scanned ID. They are only run on documents that are from the list of accepted documents.

The avaliablde validators can be created by using the `Validators` class.

The following validators are available:

#### Not Expired

The `notExpired` validator checks that the scanned document has not expired. This validator will not pass if the expiration date could not be determined from the extracted data.

```ts
	...
	validation: [Validators.notExpired()],
	...
```



#### Not Expired In

The `notExpiredIn` validator checks that the scanned document has still not expired after the duration passed in argument. This test will not pass if the expiration date could not be determined from the extracted data.

This validator takes a `Duration` object as argument with the following properties: 

```ts
type Duration = {
	days?: number;
	months?: number;
}
```

In the following example, the ID must not expire in the next 12 months:

```ts
	...
	validation: [Validators.notExpiredIn({months: 12})],
	...
```

#### US Real ID

The `US.isRealID` validator checks that the scanned driver license is compliant with the rules of Real ID defined by the American Association of Motor Vehicle Administrators (AAMVA). This validator will not pass if the scanned document is not an AAMVA document.

```ts
	...
	validation: [Validators.US.isRealID()],
	...
```

## Callbacks

### Methods

#### `onCompletion`

A callback that is called when the user has successfully scanned their ID and passed all validations.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `result` | `CompletionResult` | Contains the scanning results including the captured ID data |

The `CompletionResult` object contains:
- `capturedId`: The scanned document data. See *[`CapturedId`](#capturedid)*. Will be `null` if no data was returned based on the `returnDataMode`.

Example:
```ts
	...
	onCompletion: (result) => {
		if (result.capturedId) {
			console.log('Document type:', result.capturedId.documentType);
			console.log('Full name:', result.capturedId.fullName);
			console.log('Document number:', result.capturedId.documentNumber);
		}
	}
	...
```

#### `onCancellation`

A callback that is called when the user closes the ID Bolt pop-up without completing the scanning process.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `reason` | `CancellationReason` | The reason why the scanning was cancelled |

The `CancellationReason` enum contains:
- `CancellationReason.UserClosed`: The user closed the ID Bolt pop-up before completing the scanning process
- `CancellationReason.ServiceStartFailure`: The ID Bolt service failed to start

Example:
```ts
...
	onCancellation: (reason) => {
		switch (reason) {
			case CancellationReason.UserClosed:
				console.log("User closed the scanning window");
				break;
			case CancellationReason.ServiceStartFailure:
				console.log("ID Bolt service failed to start");
				break;
		}
	}
...
```

### Result Data Types

#### `CapturedId`

The interface defining the object you receive in `CompletionResult.capturedId`.

##### Properties

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `firstName` | `string` | `null` | |
| `lastName` | `string` | `null` | |
| `fullName` | `string` | | |
| `sex` | `string` | `null` | |
| `nationality` | `string` | `null` | |
| `address` | `string` | `null` | |
| `issuingCountry` | `Region` | `null` | The ISO (Alpha-3 code) abbreviation of the issuing country of the document.|
| `documentNumber` | `string` | `null` | |
| `documentAdditionalNumber` | `string` | `null` ||
| `dateOfBirth` | `DateResult` | `null` | |
| `age` | `number` | `null` | |
| `dateOfExpiry` | `DateResult` | `null` | |
| `isExpired` | `boolean` | `null` ||
| `dateOfIssue` | `DateResult` | `null` | |
| `documentType` | `DocumentType` | | One of `"Passport" \| "IDCard" \| "DriverLicense"` |
| `capturedResultTypes` | `string[]` | | |
| `images` | `ImageData` | `null` | Object containing base64 encoded jpg images |


#### `ImageData`

##### Properties



| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `fullFrame` | `string[]` | `null` | Raw captured frame used for detection. Array of base64 encoded jpg images|
| `cropped` | `string[]` | `null` | Cropped face and ID images, if available. Array of base64 encoded jpg images |



#### `DateResult`

An object representing a date.

##### Properties

| Property | Type |
| -------- | ---- |
| `day` | `number` |
| `month` | `number` |
| `year` | `number` |

## Return Data Mode

Values used by `IdBoltCreateSessionOptions` to define what data is returned by `IdBoltSession.onCompletion()`. Possible values are:

| Value | Description |
| ----- | ----------- |
| `Full` | All extracted data is returned, but images are excluded. |
| `FullWithImages` | All extracted data is returned, including images of the scanned ID. |

Example:
```ts
	...
	returnDataMode: ReturnDataMode.Full,
	...
```

## Anonymization Mode

Some countries have specific requirements for the anonymization of documents. ID-Bolt can be configured to not extract those sensitive fields from documents.
Black boxes cover sensitive data in result images.

The `AnonymizationMode` enum has the following values:

| Value             | Description                           |
| ----------------- | ------------------------------------- |
| `None`            | No anonymization is applied (default) |
| `FieldsOnly`      | Only fields (data) are anonymized     |
| `ImagesOnly`      | Only images are anonymized            |
| `FieldsAndImages` | Both fields and images are anonymized |

Note that when image anonymization is enabled, the `FullWithImages` return data mode does not return full-frame images. Cropped images are still returned, if available.

Example:
```ts
	...
	anonymizationMode: AnonymizationMode.FieldsOnly,
	...
```

## Workflow Options

Options to customize the user interface of the ID Bolt workflow.

#### Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `showWelcomeScreen` | `boolean` | When enabled: Always shown on both desktop and mobile. When disabled: Only shown on desktop to allow users to select between scanning on local device or handing over. |
| `showResultScreen` | `boolean` | Determines whether to show the result screen at the end of the workflow. |

Example:
```ts
	...
	workflow: {
		showWelcomeScreen: false,
		showResultScreen: true,
	},
	...
```

## Scanner Options

The scanner used can be customized using the `scanner` option in `IdBoltCreateSessionOptions`.

By default, the scanner is set to `SingleSideScanner` with all modalities enabled.

The following scanners are available:

#### Single Side Scanner

The single side scanner extracts all data from a single side scan of the document. The scanning modalities can be chosen individually in the constructor.

```ts
	...
	scanner: new SingleSideScanner(
		true, // Enable reading of barcode ID-documents
		true, // Enable reading of machine readable zone (MRZ) documents
		true, // Enable reading of visual inspection zone (VIZ) documents
	),
	...
```

#### Full Document Scanner

The full document scanner forces the user to scan both the front and back side of the document. It uses all modalities enabled by default.

```ts
	...
	scanner: new FullDocumentScanner(),
	...
```

## Theme

Options to customize the visual appearance of the ID Bolt interface.

### Properties

#### `colors`

Object containing color definitions for various UI elements:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `primary` | `string` | The primary color used throughout the interface |
| `image` | `string` | Color used for image-related elements |
| `background` | `string` | Main popup background color |
| `backgroundSecondary` | `string` | Secondary background color, used for surfaces |
| `backgroundInverse` | `string` | Inverse background color |
| `textPrimary` | `string` | Primary text color |
| `textSecondary` | `string` | Secondary text color |
| `textTertiary` | `string` | Tertiary text color |
| `textInverse` | `string` | Inverse text color |
| `success` | `string` | Color for success states |
| `error` | `string` | Color for error states |
| `warning` | `string` | Color for warning states |
| `info` | `string` | Color for informational states |
| `buttonBackground` | `string` | Background color for buttons, defaults to `primary` |
| `buttonText` | `string` | Text color for buttons, defaults to `textInverse` |
| `buttonBorder` | `string` | Border color for buttons, defaults to `primary` |
| `buttonBackgroundDisabled` | `string` | Background color for disabled buttons |
| `buttonBorderDisabled` | `string` | Border color for disabled buttons |
| `buttonTextDisabled` | `string` | Text color for disabled buttons |


#### `dimensions`

Object containing dimension values for UI elements:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `radiusPopup` | `string` | Border radius for the popup |
| `radiusButton` | `string` | Border radius for buttons |
| `radiusCard` | `string` | Border radius for cards |

Example:
```ts
	...
	theme: {
		colors: {
			primary: "#007AFF"
		},
		dimensions: {
			radiusButton: "8px"
		}
	}
	...
```


## Text Overrides

Text overrides are used to customize the text displayed in the ID Bolt interface.
The text overrides are defined using the `textOverrides` option in `IdBoltCreateSessionOptions`.

The following texts can be overridden:

- `titles.SCANNER_HEADER`: The header of the scanner screen.
- `titles.LOCAL_SCAN_HEADER`: The header of the local scan screen.
- `texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST`: The list of documents that are accepted, as displayed in the help screen.
- `texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF`: A brief description of the documents that are accepted, as displayed in the main screen.
- `texts.HELP_SUPPORTED_DOCUMENTS_EXCLUDE_LIST`: The list of documents that are excluded, as displayed in the help screen. Only shown if there are excluded documents.

Example:
```ts
	...
	textOverrides: {
		"titles.SCANNER_HEADER": "Scan your Passport for John Doe",
		"titles.LOCAL_SCAN_HEADER": "Scan your Passport for John Doe",
		"texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST": "Scan your passport, ID card or driver license",
		"texts.HELP_SUPPORTED_DOCUMENTS_INCLUDE_LIST_BRIEF": "Scan your passport, ID card or driver license",
		"texts.HELP_SUPPORTED_DOCUMENTS_EXCLUDE_LIST": "Not accepted are documents issued before 2000",
	....
```


## Supported Region Specific Documents

Region specific document types are instantiated with the `RegionSpecific` class and a `RegionSpecificSubtype` argument like `new RegionSpecific(RegionSpecificSubtype.BelgiumMinorsId)`.

The following region specific document types are supported:


* `UsBorderCrossingCard`
* `ChinaExitEntryPermit`
* `UsGlobalEntryCard`
* `ChinaMainlandTravelPermitTaiwan`
* `UsNexusCard`
* `ChinaMainlandTravelPermitHongKongMacau`
* `ApecBusinessTravelCard`
* `PakistanAfghanCitizenCard`
* `SingaporeFinCard`
* `UsGreenCard`
* `MalaysiaIkad`
* `MalaysiaMykad`
* `MalaysiaMypr`
* `MexicoConsularVoterId`
* `GermanyEid`
* `UsCommonAccessCard`
* `PhilippinesMultipurposeId`
* `MalaysiaMykas`
* `MalaysiaMykid`
* `MalaysiaMytentera`
* `MexicoProfessionalId`
* `MalaysiaRefugeeId`
* `CanadaTribalId`
* `UsUniformedServicesId`
* `UsVeteranId`
* `PhilippinesWorkPermit`
* `SingaporeWorkPermit`
* `UsWorkPermit`
* `PhilippinesSocialSecurityCard`
* `SwedenSocialSecurityCard`
* `CanadaSocialSecurityCard`
* `UsSocialSecurityCard`
* `BelgiumMinorsId`
* `ColombiaMinorsId`
* `PeruMinorsId`
* `BoliviaMinorsId`
* `HungaryAddressCard`
* `UkAsylumRequest`
* `CanadaCitizenshipCertificate`
* `SingaporeEmploymentPass`
* `CanadaMinorsPublicServicesCard`
* `MalaysiaMypolis`
* `PhilippinesNbiClearance`
* `IndiaPanCard`
* `PhilippinesPostalId`
* `PakistanProofOfRegistration`
* `SingaporeSPass`
* `SwedenSisId`
* `ColombiaTemporaryProtectionPermit`
* `UsTwicCard`
* `UsWeaponPermit`
* `CanadaWeaponPermit`
* `IrelandPublicServicesCard`
* `CanadaPublicServicesCard`
* `PakistanConsularId`
* `GuatemalaConsularId`
* `MexicoConsularId`
* `PhilippinesTaxId`
* `MexicoTaxId`
* `ChinaOneWayPermit`
* `UsMedicalMarijuanaCard`
* `UsMunicipalId`
* `AustraliaAsicCard`
* `UaeVehicleRegistrationCard`

## Supported Locales

The following languages are supported:

- `en-US`
- `de-DE`
- `de-CH`
- `es-ES`
- `fr-FR`
- `it-IT`
- `nl-NL`
- `pl-PL`
- `pt-PT`
- `da-DK`