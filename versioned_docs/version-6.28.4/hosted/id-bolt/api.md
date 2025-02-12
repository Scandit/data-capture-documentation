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

## IdBoltSession

The main class of ID Bolt. It represents a session in which the end-user is guided through a workflow to scan their ID. The `IdBoltSession.onCompletion()` callback is called when the user has scanned their ID, the ID has been accepted and the ID Bolt pop-up is closed. Similarly, `IdBoltSession.onCancellation()` is called when the user closes the ID Bolt pop-up without finishing the full process successfully.

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
  - `documentSelection: DocumentSelection`: Object specifying the acceptable documents. See *[`DocumentSelection`](#documentselection)*.
  - `returnDataMode: ReturnDataMode`: Defines the extent of the data returned by the `onCompletion()` callback. Use:    
    - `ReturnDataMode.FullWithImages` to get all extracted data and images.
    - `ReturnDataMode.Full` to get all extracted data without images.
  - `validation?: Validators[]`: Optional array of validators, default: `[]`. See *[`Validators`](#validators)*. 
  - `locale?: string`: the language in which the text is displayed. Currently only english (`"en"`) is supported. Default: `"en"`.

Once created, a session object does nothing until you execute `start()` on it:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
	licenseKey: LICENSE_KEY,
	documentSelection,
	returnDataMode: ReturnDataMode.FullWithImages,
	validation: [Validators.notExpired()],
});
await idBoltSession.start();
```

#### `onCompletion`

| Signature | Description |
| --------- | ----------- |
| `IdBoltSession.onCompletion: (result: CompletionResult) => void` | A callback that is called when the user has successfully scanned their ID. `result.capturedId` will contain the document data. |

#### `onCancellation`

| Signature | Description |
| --------- | ----------- |
| `IdBoltSession.onCancellation: (reason: CancellationReason) => void` | A callback that is called when the user has closed the ID Bolt pop-up without having finished the scanning workflow. The reasona argument contains the reason for the cancellation. |

#### `start`

| Signature | Description |
| --------- | ----------- |
| `async IdBoltSession.start(): Promise<string>` | Open the ID Bolt pop-up to start the scanning workflow. This method returns a session ID identifying the session. |

## DocumentSelection

A class to define which types of documents the ID Bolt will accept. The list of documents is provided as specific document objects, instantiated with a `Region`. For example passports from the USA would be `new Passport(Region.USA)`.

Documents that are not acceptable may still get recognized by the scanner. In this case the user will be notified to use one of the accepted document types.

### Methods

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

If you have very specific rules, you can use the `Selection.customCallback` option where you can decide if the scanned document should be accepted or not:

```ts
const documentSelection = DocumentSelection.create({
	include: [new Passport(Region.USA)],
	customCallback: (capturedId: CapturedId, preCheckResults: PreCheckResults) => {
		if (capturedId.documentNumber === "123") {
			return {
				valid: false,
				// this message will be displayed to the user
				message: `Documents starting with "123" are not accepted.`,
			};
		}
		// when not returning anything, the default behavior will take place
	},
});
```

## Document Types

Each document type is represented with a specific class. These classes are instantiated in with a specific region to select accepted and rejected documents. 

### Passport

Includes all Passports

```ts
new Passport(Region.USA) // US passports
new Passport(Region.Any) // Any passport
```

### IDCard

Includes national identity cards

```ts
new IDCard(Region.Germany) // German identity cards
new IDCard(Region.Any) // National identity card from any country
```

### DriverLicense

Includes driver licenses

```ts
new DriverLicense(Region.France) // French driver license
new DriverLicense(Region.Any) // Driver license card from any country
```


## Validators

Validators enable you to run checks on the scanned ID. They are only run on accepted documents.

### Methods

#### `notExpired`

| Signature | Description |
| --------- | ----------- |
| `Validators.notExpired()` | Checks that the document has not expired. Note that this test will not pass if the expiration date could not be determined from the extracted data.|


#### `notExpiredIn`

| Signature | Description |
| --------- | ----------- |
| `Validators.notExpiredIn(duration: Duration)` | Checks that the document has still not expired after the duration passed in argument. This test will not pass if the expiration date could not be determined from the extracted data.|
| | `Duration` is an object with following properties: `days?: number`, `months?: number`. |


In the following example, the ID must not expire in the next 12 months:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
	licenseKey: LICENSE_KEY,
	documentSelection: ...,
	returnDataMode: RETURN_DATA_MODE.FULL_WITH_IMAGES,
	validation: [Validators.notExpiredIn({months: 12})],
});
```

#### `US.isRealID`

| Signature | Description |
| --------- | ----------- |
| `Validators.US.isRealID()` | Checks that the scanned driver license is compliant with the rules of Real ID defined by the American Association of Motor Vehicle Administrators (AAMVA). Note that this test will not pass if the scanned document is not an AAMVA document.|

## Interfaces

### `CapturedId`

The interface defining the object you receive in `CompletionResult.capturedId`.

#### Properties

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


### `ImageData`

#### Properties



| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `fullFrame` | `string[]` | `null` | Raw captured frame used for detection. Array of base64 encoded jpg images|
| `cropped` | `string[]` | `null` | Cropped face and ID images, if available. Array of base64 encoded jpg images |



### `DateResult`

An object representing a date.

#### Properties

| Property | Type |
| -------- | ---- |
| `day` | `number` |
| `month` | `number` |
| `year` | `number` |

### `PreCheckResults` 

An object containing the current acceptance status for the scanned document according to the configured rules in `IdBoltSession.documentSelection`.

#### Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `isIncluded` | `boolean` | The scanned document is acceptable. |
| `isExcluded` | `boolean` | The scanned document is excluded. |
| `valid` | `boolean` | Final outcome, the document is considered acceptable. |

## Const 

### `Region`

An enumeration of regions (countries), both as ISO codes as well as names.

Example:

```ts
// France
Region.FRA;
Region.France;

Region.FRA === Region.France === "FRA"; // true

// Any
Region.Any;
```

### `ReturnDataMode`

Values used by `IdBoltCreateSessionOptions` to define what data is returned by `IdBoltSession.onCompletion()`. Possible values are:

| Value | Description |
| ----- | ----------- |
| `Full` | All extracted data is returned, but images are excluded. |
| `FullWithImages` | All extracted data is returned, including images of the scanned ID. |
