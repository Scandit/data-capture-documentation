---
sidebar_label: 'Advanced Options'
title: 'Advanced Options'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
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
