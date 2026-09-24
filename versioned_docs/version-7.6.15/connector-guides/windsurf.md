# Windsurf Connectors Guide

This guide explains how to connect Scandit’s documentation feed (`llms-full.txt`) to your [Windsurf](https://codeium.com/windsurf) environment. Once integrated, Windsurf will have direct access to the latest Scandit SDK information, helping you build faster with accurate, up-to-date context.

## What is `llms-full.txt`?

We provide an always up-to-date text file of our complete developer documentation with every release. This file is designed for easy integration with AI coding assistants like Windsurf.

This file is published with the public documentation and also available from the Context7 MCP server:

- **Direct URL:** [https://docs.scandit.com/llms-full.txt](https://docs.scandit.com/llms-full.txt)  
- **Context7 Mirror:** [https://context7.com/scandit/data-capture-documentation](https://context7.com/scandit/data-capture-documentation)  

## Getting Started

Follow these steps to integrate Scandit’s documentation into your Windsurf environment.

### Add the Context Source

1. Open Windsurf.  
2. Go to **Settings → AI → Context Sources**.  
3. Click **Add Source** and choose **Custom URL**.  
4. Paste the following URL:  
   ```
   https://docs.scandit.com/llms-full.txt
   ```
5. (Optional) For redundancy, also add the Context7 mirror:  
   ```
   https://context7.com/scandit/data-capture-documentation
   ```
6. Give the source a name, for example **Scandit Docs (llms-full)**.  

### Configure Windsurf to Use Scandit Docs

1. In the **Source Settings** panel, configure the following:  
   - **Refresh Interval:** Set to `Daily` (so Windsurf always pulls the latest release updates).  
   - **Scope:** Choose `Global` if you want Scandit docs to be available in all projects, or `Workspace-only` for more targeted use.  
2. Toggle **Auto-injection** so that Windsurf automatically references Scandit docs when you work with `scandit-datacapture` imports.  

### Verify Integration

1. Open a project that uses the Scandit SDK.  
2. Add a package import such as:  
   ```dart
   import 'package:scandit_flutter_datacapture_barcode/scandit_flutter_datacapture_barcode.dart';
   ```
3. In the Windsurf chat panel, ask:  
   > “How do I configure SparkScan with continuous scanning and manual activation?”  

If configured correctly, Windsurf should respond using content pulled directly from Scandit’s documentation feed (`llms-full.txt`).  

## Best Practices

- **Keep context sources focused:** Assign Scandit docs only to relevant workspaces if you’re working with multiple SDKs.  
- **Stay up-to-date:** Windsurf automatically refreshes the feed daily, but you can manually reload if you need immediate access to the latest release.  
- **Combine with samples:** For best results, pair the Scandit docs feed with local [SDK sample apps](https://github.com/Scandit).  

## Using `windsurf.json`

You can also configure Windsurf directly via the `windsurf.json` file. Add the following block:  

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

### File Location

The configuration file is located at:  

- **macOS/Linux:** `~/.windsurf/windsurf.json`  
- **Windows:** `%APPDATA%\Windsurf\windsurf.json`  

Once added, restart Windsurf for the changes to take effect.
