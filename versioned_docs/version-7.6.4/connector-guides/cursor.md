# Cursor Connectors Guide

This guide explains how to connect Scandit’s documentation feed (`llms-full.txt`) to your [Cursor](https://cursor.sh) environment. Once integrated, Cursor will have direct access to the latest Scandit SDK information, helping you build faster with accurate, up-to-date context.

## What is `llms-full.txt`?

We provide an always up-to-date text file of our complete developer documentation with every release. This file is designed for easy integration with AI coding assistants like Cursor.

This file is published with the public documentation and also available from the Context7 MCP server:

- **Direct URL:** [https://docs.scandit.com/llms-full.txt](https://docs.scandit.com/llms-full.txt)  
- **Context7 Mirror:** [https://context7.com/scandit/data-capture-documentation](https://context7.com/scandit/data-capture-documentation)  

## Getting Started

Follow these steps to integrate Scandit’s documentation into your Cursor environment.

### Add the Context

1. Open Cursor and navigate to **Settings → Features → Custom Contexts**.  
2. Add Scandit Documentation as a Context Source
   * Click **Add Context**.  
   * Choose **Custom URL**.  
   * Paste the following URL: `https://docs.scandit.com/llms-full.txt`
3. (Optional) For redundancy, you can also add the Context7 mirror:  
  ```
  https://context7.com/scandit/data-capture-documentation
  ```
4. Name the context, for example **Scandit Docs (llms-full)**.

### Configure Cursor to Use Scandit Docs

1. In the **Context Settings**, set:  
   - **Refresh Interval:** `Daily` (so Cursor always pulls the latest release updates).  
   - **Scope:** Global (recommended) or Project-only if you want Scandit docs available only in specific projects.  
2. Enable **Auto-context injection** so Scandit docs are suggested whenever you work with `scandit-datacapture` imports.  

### Verify Integration

1. Open a project using the Scandit SDK.
2. Start typing code like:
  ```dart
  import 'package:scandit_flutter_datacapture_barcode/scandit_flutter_datacapture_barcode.dart';
  ```
3. Ask Cursor:  
   > “How do I configure SparkScan with continuous scanning and manual activation?”  

Cursor should now answer using the Scandit documentation pulled from `llms-full.txt`.

## Best Practices

- **Keep contexts lean:** If you’re using multiple SDKs, assign them to different projects to avoid context bloat.
- **Check for updates:** Since `llms-full.txt` is updated on release, rely on the daily refresh. For urgent updates, manually reload the context in Cursor.
- **Use alongside Scandit samples:** Combine the docs feed with local [SDK sample app](https://github.com/Scandit) for best results.

## Using `contexts.json`

If you prefer to configure Cursor directly via `contexts.json`, paste the following block:  

```json
{
  "name": "Scandit Docs (llms-full)",
  "urls": [
    "https://docs.scandit.com/llms-full.txt",
    "https://context7.com/scandit/data-capture-documentation"
  ],
  "refreshInterval": "daily",
  "scope": "global",
  "autoInject": true
}
```

Place this inside your Cursor `contexts.json` file, typically located at:  

- **macOS/Linux:** `~/.cursor/contexts.json`  
- **Windows:** `%APPDATA%\Cursor\contexts.json`   
