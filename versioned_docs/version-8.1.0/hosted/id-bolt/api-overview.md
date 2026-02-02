---
description: "ID Bolt is built around the concept of a **session** - a complete user journey from starting the ID scanning process to either successful completion or cancellation. The main class `IdBoltSession` represents this session and manages the entire workflow.                                                             "

sidebar_label: 'API Overview'
title: 'API Overview'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
keywords:
  - bolt
---

# ID Bolt API Overview

ID Bolt is built around the concept of a **session** - a complete user journey from starting the ID scanning process to either successful completion or cancellation. The main class `IdBoltSession` represents this session and manages the entire workflow.


## Quick Start Example

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  licenseKey: LICENSE_KEY,
  documentSelection: DocumentSelection.create({
    accepted: [new Passport(Region.Any)]
  }),
  returnDataMode: ReturnDataMode.Full,
  validation: [Validators.notExpired()],
  onCompletion: (result) => {
    console.log("Successfully completed workflow", result);
  },
  onCancellation: (reason) => {
    console.log("Scanning cancelled", reason);
  }
});
await idBoltSession.start();
```

## Session Methods

### Creating a Session

```ts
IdBoltSession.create(serviceUrl: string, options: IdBoltCreateSessionOptions): IdBoltSession
```

Creates a new ID Bolt session with your configuration. The session is not started until you call `start()`.

**Parameters:**
- `serviceUrl`: Your ID Bolt service URL from the Scandit dashboard
- `options`: [Configuration object defining the session behavior](#configuration-options)

:::note
The default value `app.id-scanning.com` is an alias that points to Scandit's servers. In a production environment it can be changed to your own domain name pointing to Scandit's servers. This will require you to configure a CNAME record in the DNS settings of your domain. Contact your Scandit account manager for more information.
:::

### Starting a Session

```ts
async session.start(): Promise<string>
```

Launches the ID Bolt user interface and begins the scanning workflow. Returns a unique session ID for tracking.

### Resource Management

```ts
IdBoltSession.terminate(): void
```
When the `keepAliveForNextSession` (default: false) option is selected, this method can be used to clean up resources after the last session ended. If this option is not selected, there is no need to call this method. 

## Configuration Options

The following options can be configured when creating an ID Bolt session:

| Option | Type | Required | Description | Details |
|--------|------|----------|-------------|---------|
| `licenseKey` | `string` | Yes | Your Scandit license key | |
| `documentSelection` | `DocumentSelection` | Yes | Defines acceptable documents | [Document Selection](../document-selection) |
| `returnDataMode` | `ReturnDataMode` | Yes | Controls what data is returned | [Data Handling](../data-handling) |
| `anonymizationMode` | `AnonymizationMode` | No | Controls data anonymization | [Data Handling](../data-handling) |
| `scanner` | `Scanner` | No | Customizes scanner behavior | [Workflow Options](../workflow) |
| `validation` | `Validators[]` | No | Validators to verify ID | [Validators](../validators) |
| `locale` | `string` | No | Interface language | [Supported Locales](#supported-locales) |
| `workflow` | `WorkflowOptions` | No | Customizes workflow UI | [Workflow Options](../workflow) |
| `theme` | `Theme` | No | Customizes visual appearance | [Theming](../theming) |
| `textOverrides` | `TextOverrides` | No | Customizes displayed text | [Text Overrides](../text-overrides) |
| `keepAliveForNextSession` | `boolean` | No | Keeps resources for multiple sessions | [Advanced Options](../advanced) |
| `disableCloseOnBrowserBack` | `boolean` | No | Prevents closing on browser back | [Advanced Options](../advanced) |
| `externalTransactionId` | `string` | No | Your tracking ID for analytics | [Advanced Options](../advanced) |
| `learnMore` | `LearnMore` | No | Customize the "learn more" section | |
| `onCompletion` | `Function` | Yes | Completion callback | [Callbacks](../callbacks) |
| `onCancellation` | `Function` | No | Cancellation callback | [Callbacks](../callbacks) |


## Supported Locales

The following languages are supported:

- `en-US` (English, United States - default)
- `de-DE` (German, Germany)
- `de-CH` (German, Switzerland)
- `es-ES` (Spanish, Spain)
- `fr-FR` (French, France)
- `it-IT` (Italian, Italy)
- `nl-NL` (Dutch, Netherlands)
- `pl-PL` (Polish, Poland)
- `pt-PT` (Portuguese, Portugal)
- `da-DK` (Danish, Denmark) 