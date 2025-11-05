---
description: "Validators allow you to run checks on scanned ID documents to ensure they meet specific criteria. They are only run on documents that are on the list of accepted documents.                                                                      "

sidebar_label: 'Validators'
title: 'Validators'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
keywords:
  - bolt
  - validators
  - verification
---

# Validators

Validators allow you to run checks on scanned ID documents to ensure they meet specific criteria. They are only run on documents that are on the list of accepted documents.

## Using Validators

Validators are specified in the `validation` array when creating an ID Bolt session:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  validation: [
    Validators.notExpired(),
    Validators.notExpiredIn({ months: 6 })
  ]
});
```

You can use multiple validators together. All validators must pass for the scan to be considered successful.

## Available Validators

### Not Expired

The `notExpired` validator checks that the scanned document has not expired. This validator will not pass if the expiration date could not be determined from the extracted data.

```ts
validation: [Validators.notExpired()]
```


### Not Expired In

The `notExpiredIn` validator checks that the scanned document will not expire within a specified time period. This validator will not pass if the expiration date could not be determined from the extracted data.

```ts
validation: [Validators.notExpiredIn({ months: 12 })]
```

The `notExpiredIn` validator accepts a `Duration` object with the following properties:

```ts
type Duration = {
  days?: number;
  months?: number;
}
```

You can specify either days, months, or both:

```ts
// Document must not expire in the next 30 days
Validators.notExpiredIn({ days: 30 })

// Document must not expire in the next 6 months
Validators.notExpiredIn({ months: 6 })

// Document must not expire in the next 1 year and 30 days
Validators.notExpiredIn({ months: 12, days: 30 })
```

### US Real ID

The `US.isRealID` validator checks that the scanned driver license is compliant with the REAL ID Act defined by the American Association of Motor Vehicle Administrators (AAMVA). This validator will not pass if the scanned document is not an AAMVA document.

```ts
validation: [Validators.US.isRealID()]
```

A REAL ID compliant license has a star marking in the upper portion of the card.


## Combining Validators

You can combine multiple validators to create more complex validation rules

### Example

Check that a supplied drivers license is both RealID-compliant as well as not expired:

```ts
const documentSelection = DocumentSelection.create({
  accepted: [
    new DriverLicense(Region.USA)
  ]
});

const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  documentSelection,
  validation: [
    Validators.notExpired(),
    Validators.US.isRealID()
  ],
  // other options...
});
```


## Custom Validators

In addition to the built-in validators, you can provide your own custom validation functions. These external validators receive the captured ID data and can perform any custom validation logic you need.

### External Validator Function

An external validator is a function that takes a `ValidatorCapturedId` object and returns an `ExternalValidatorResult`. The function can be either synchronous or asynchronous.

```ts
type ExternalValidatorFunction = (
  capturedId: ValidatorCapturedId
) => ExternalValidatorResult | Promise<ExternalValidatorResult>;
```

### Return Type

The external validator must return an `ExternalValidatorResult` with the following structure:

```ts
export type ExternalValidatorResult = {
    type: "external";
    name: string;
    valid: true;
} | {
    type: "external";
    name: string;
    valid: false;
    details: {
        message?: string;
    };
};
```

- **`type`**: Always set to `"external"` to identify this as an external validator result
- **`name`**: A descriptive name for your validator (used for debugging and error reporting)
- **`valid`**: Boolean indicating whether the validation passed
- **`details.message`**: Optional error message displayed to the user when validation fails

### Synchronous Validator Example

Here's an example validator that ensures the document's issuing country matches the holder's nationality:

```ts
function countryMatchValidator(capturedId: ValidatorCapturedId): ExternalValidatorResult {
  const { issuingCountry, nationality } = capturedId;
  
  // Check if both fields are present
  if (!issuingCountry || !nationality) {
    return {
      type: "external",
      name: "country_verification",
      valid: false,
      details: {
        message: "Document issuing country and nationality information are required"
      }
    };
  }
  
  // Check if they match
  if (issuingCountry === nationality) {
    return {
      type: "external",
      name: "country_verification",
      valid: true
    };
  } else {
    return {
      type: "external",
      name: "country_verification",
      valid: false,
      details: {
        message: `Document issuing country (${issuingCountry}) does not match nationality (${nationality})`
      }
    };
  }
}

// Use the country matching validator
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  validation: [
    Validators.notExpired(),
    countryMatchValidator
  ],
  // other options...
});
```

### Asynchronous Validator Example

External validators can also be asynchronous, allowing you to perform API calls or other async operations:

```ts
async function blacklistValidator(capturedId: ValidatorCapturedId): Promise<ExternalValidatorResult> {
    const documentNumber = capturedId.documentNumber;
  try {
    const isBlacklisted = await asyncCheckBlacklistFunction(documentNumber);
    
    if (isBlacklisted) {
      return {
        type: "external",
        name: "blacklist_check",
        valid: false,
        details: {
          message: "Document is not accepted"
        }
      };
    }
    
    return {
      type: "external",
      name: "blacklist_check",
      valid: true
    };
    
  } catch (error) {
    // Handle API errors gracefully
    return {
      type: "external",
      name: "Blacklist Check",
      valid: false,
      details: {
        message: "Unable to verify document at this time"
      }
    };
  }
}

// Use the async validator
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  validation: [
    Validators.notExpired(),
    blacklistValidator
  ],
  // other options...
});
```


### ValidatorCapturedId Interface

The `ValidatorCapturedId` object passed to your external validator contains the same extracted data from the scanned document as the document returned at the end of the flow.

## Error Handling

When a validator fails, ID Bolt will display an appropriate error message to the user and allow them to try again with a different document. The `onCompletion` callback will not be called unless all validators pass.