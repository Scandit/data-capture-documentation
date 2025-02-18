---
sidebar_label: 'Getting Started'
title: 'Getting Started'
hide_title: true
displayed_sidebar: boltSidebar
framework: bolt
tags: [bolt]
keywords:
  - bolt
---

## Getting Started

ID Bolt can be integrated into your existing application or website with minimal time and effort, often ready to test in your staging environment in just one hour.

ID Bolt is available as an [npm package](https://www.npmjs.com/package/@scandit/web-id-bolt) and can be installed using `npm` or `yarn`.

<Tabs>
<TabItem value="npm" label="npm">
```bash
npm install @scandit/web-id-bolt
```
</TabItem>
<TabItem value="yarn" label="yarn">
```bash
yarn add @scandit/web-id-bolt
```
</TabItem>
</Tabs>

Once you have installed the package as a dependency, you can import the ID Bolt module and start scanning IDs.

:::note
A valid license key is required for ID Bolt. You can sign up for a free [test account](https://ssl.scandit.com/dashboard/sign-up?p=id-bolt).
:::

Your specific application needs and design define when the ID Bolt pop-up should opened. In this example, we open it after a click on a button present on the page:

```javascript
import {
	DocumentSelection,
	IdBoltSession,
	Region,
	Passport,
	ReturnDataMode,
	Validators,
} from "@scandit/web-id-bolt";

const ID_BOLT_URL = "https://app.id-scanning.com";

const LICENSE_KEY = "-- YOUR LICENSE KEY HERE --";

async function startIdBolt() {
	// define which documents are allowed to be scanned. More complex rules can be added.
	const documentSelection = DocumentSelection.create({
		accepted: [new Passport(Region.Any)],
	});
	// initialization of the ID Bolt session
	const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
		licenseKey: LICENSE_KEY,
		documentSelection,
		// define what data you expect in the onCompletion listener (set below)
		returnDataMode: ReturnDataMode.Full,
		// add validation rules on the scanned document
		validation: [Validators.notExpired()],
		locale: "en-US",
	});
	// open the pop-up
	await idBoltSession.start();

	// register some listeners:
	idBoltSession.onCancellation = (reason) => {
		// the ID Bolt pop-up has been closed by the user without finishing the scan process.
	};
	idBoltSession.onCompletion = (result) => {
		// the ID has been captured and validation was successful. In this example the result
		// will contain the document data because `returnDataMode` was set to RETURN_DATA_MODE.FULL.
	};
}

// open ID Bolt when some button is clicked
const someButton = document.getElementById("someButton") as HTMLButtonElement;
someButton.addEventListener("click", startIdBolt);
```

The above code snippet is a simple example of how to integrate ID Bolt into your application. It opens the ID Bolt pop-up when a button is clicked and listens for the completion of the scanning process.
