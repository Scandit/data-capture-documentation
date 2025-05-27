---
sidebar_label: 'Document Selection'
title: 'Document Selection'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
keywords:
  - bolt
  - document selection
---

# Document Selection

ID Bolt allows you to specify which types of documents are acceptable for scanning. Documents are selected using the `DocumentSelection` class.

## Creating a Document Selection

Use `DocumentSelection.create()` to define which types of documents the ID Bolt will accept:

```ts
const documentSelection = DocumentSelection.create({
  accepted: [
    new Passport(Region.Any),
    new IDCard(Region.FRA),
    new DriverLicense(Region.France)
  ],
  rejected: [
    // You can explicitly reject certain documents that would otherwise be included
    new Passport(Region.Switzerland)
  ],
});
```

Documents not on the list may trigger the scanner, but will not be accepted.

## Standard Document Types

### Passport

Includes all passports.

```ts
new Passport(Region.USA) // US passports only
new Passport(Region.Any) // Any passport
```

### ID Card

Includes national identity cards.

```ts
new IDCard(Region.Germany) // German identity cards only
new IDCard(Region.Any) // Identity cards from any country
```

### Driver License

Includes driver licenses.

```ts
new DriverLicense(Region.France) // French driver licenses only
new DriverLicense(Region.Any) // Driver licenses from any country
```

### Visa (ICAO)

Includes visas that comply with International Civil Aviation Organization (ICAO) standards.

```ts
new VisaIcao(Region.USA) // US ICAO-compliant visas
new VisaIcao(Region.Any) // Any ICAO-compliant visa
```

### Residence Permit

Includes residence permits.

```ts
new ResidencePermit(Region.USA) // US residence permits
new ResidencePermit(Region.Any) // Residence permits from any country
```

### Health Insurance Card

Includes health insurance cards.

```ts
new HealthInsuranceCard(Region.Germany) // German health insurance cards
new HealthInsuranceCard(Region.Any) // Health insurance cards from any country
```

## Region Specific Documents

For specialized document types that are specific to certain regions, use the `RegionSpecific` class with a `RegionSpecificSubtype` argument:

```ts
new RegionSpecific(RegionSpecificSubtype.BelgiumMinorsId) // Belgian minors ID
new RegionSpecific(RegionSpecificSubtype.MexicoTaxId) // Mexican tax ID
```

### Supported Region Specific Documents

The following region-specific document types are supported:

#### United States

* `UsBorderCrossingCard`
* `UsGlobalEntryCard`
* `UsNexusCard`
* `UsGreenCard`
* `UsCommonAccessCard`
* `UsUniformedServicesId`
* `UsVeteranId`
* `UsWorkPermit`
* `UsSocialSecurityCard`
* `UsTwicCard`
* `UsWeaponPermit`
* `UsMedicalMarijuanaCard`
* `UsMunicipalId`

#### Asia

* `ChinaExitEntryPermit`
* `ChinaMainlandTravelPermitTaiwan`
* `ChinaMainlandTravelPermitHongKongMacau`
* `ChinaOneWayPermit`
* `PakistanAfghanCitizenCard`
* `PakistanProofOfRegistration`
* `PakistanConsularId`
* `SingaporeFinCard`
* `SingaporeWorkPermit`
* `SingaporeEmploymentPass`
* `SingaporeSPass`
* `IndiaPanCard`
* `MalaysiaIkad`
* `MalaysiaMykad`
* `MalaysiaMypr`
* `MalaysiaMykas`
* `MalaysiaMykid`
* `MalaysiaMytentera`
* `MalaysiaRefugeeId`
* `MalaysiaMypolis`
* `PhilippinesMultipurposeId`
* `PhilippinesWorkPermit`
* `PhilippinesSocialSecurityCard`
* `PhilippinesNbiClearance`
* `PhilippinesPostalId`
* `PhilippinesTaxId`

#### Europe

* `GermanyEid`
* `BelgiumMinorsId`
* `HungaryAddressCard`
* `UkAsylumRequest`
* `SwedenSocialSecurityCard`
* `SwedenSisId`
* `IrelandPublicServicesCard`

#### Americas

* `MexicoConsularVoterId`
* `MexicoProfessionalId`
* `MexicoConsularId`
* `MexicoTaxId`
* `CanadaTribalId`
* `CanadaSocialSecurityCard`
* `CanadaCitizenshipCertificate`
* `CanadaMinorsPublicServicesCard`
* `CanadaWeaponPermit`
* `CanadaPublicServicesCard`
* `ColombiaMinorsId`
* `ColombiaTemporaryProtectionPermit`
* `PeruMinorsId`
* `BoliviaMinorsId`
* `GuatemalaConsularId`

#### Other

* `ApecBusinessTravelCard`
* `AustraliaAsicCard`
* `UaeVehicleRegistrationCard`

## Working with Regions

Regions are used to define the geographic scope of a document. They can be specified using the `Region` enum, which contains both ISO codes and region names.

```ts
// These are equivalent
Region.FRA;
Region.France;
"FRA";

// For any region
Region.Any;
```

### Two-letter ISO Codes

If you have a two-letter ISO code, you can convert it to a region:

```ts
const region = Region.fromShortCode("FR"); // == Region.France == "FRA"
const shortCode = Region.toShortCode(Region.FRA); // == "FR"
```

If the provided short code is invalid, the methods will throw an exception. 