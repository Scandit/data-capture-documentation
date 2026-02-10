---
description: "This page covers advanced features and options for ID Bolt that help optimize performance and handle specific use cases.                                                                                 "

sidebar_label: 'Advanced Options'
title: 'Advanced Options'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
keywords:
  - bolt
  - advanced
  - options
---

# Advanced Options

This page covers advanced features and options for ID Bolt that help optimize performance and handle specific use cases.

## Keep Alive

When running ID Bolt multiple times in sequence (such as scanning multiple passports in a batch), you can improve performance by keeping resources alive between sessions:

```ts
// first scan
let idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  keepAliveForNextSession: true
});

// second scan

idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  keepAliveForNextSession: true
});

// more scans...

// When finished with all scans
IdBoltSession.terminate();
```

### Benefits

- Faster loading times for subsequent scans
- No need to request camera permissions again
- Reduced resource initialization overhead

### Important Notes

- Always call `IdBoltSession.terminate()` when done with all scans to release resources
- This feature is most beneficial when scanning multiple IDs in quick succession

## Browser Navigation Control

By default, ID Bolt closes when users press the browser's back button. You can disable this behavior:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  disableCloseOnBrowserBack: true
});
```

### When to Use

- When you have custom navigation logic in your application, that interferes with this feature

### Default Behavior

When `disableCloseOnBrowserBack` is `false` (default), pressing the back button closes the ID Bolt pop-up and triggers the `onCancellation` callback with `CancellationReason.UserClosed`.

## Transaction Tracking

You can associate ID Bolt sessions with your internal tracking identifiers for analytics and debugging:

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  externalTransactionId: "booking-12345" // your booking, order, or transaction ID
});
```

### Benefits

- Correlate ID Bolt sessions with your business transactions
- Better analytics and reporting capabilities

### Example Use Cases

- E-commerce: Order IDs
- Booking systems: Reservation Numbers
