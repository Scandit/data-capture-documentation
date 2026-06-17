---
description: "Learn how to use the Scandit Web SDK inside a native WebView on Android and iOS, including how to correctly handle camera permissions."
sidebar_position: 2
framework: web
keywords:
  - web
  - webview
  - android
  - ios
  - camera
  - permissions
displayed_sidebar: webSidebar
toc_max_heading_level: 3
---

# WebView Integration

The Scandit Web SDK can run inside a native WebView on Android and iOS. Because WebViews do not have direct access to device APIs, the native host application is responsible for requesting and delegating camera permissions to the web content.

## Secure Context Requirement

Browsers — including WebView runtimes — only allow camera access in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts). This means the web content must be served over HTTPS or from `localhost`. A plain `file://` URL is not a secure context and `getUserMedia` will fail.

The recommended approach is to embed a lightweight local HTTP server in the native app and load the web content from `http://localhost:<port>/`. This satisfies the secure context requirement without requiring a remote server.

## Android

:::warning
Android WebView does not support `SharedArrayBuffer` because its process model cannot provide the OS-level process isolation required to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated). This is an Android-specific limitation — iOS WKWebView supports cross-origin isolation since iOS 15.2. As a result, multithreading is unavailable on Android WebView and performance-intensive capture modes such as MatrixScan Batch and MatrixScan AR will run significantly slower than in a standard browser. See [Improve Runtime Performance by Enabling Browser Multithreading](./matrixscan/get-started.md#improve-runtime-performance-by-enabling-browser-multithreading) for context on what multithreading provides.

If scanning performance is critical for your use case, consider these alternatives:
- **Progressive Web App (PWA)**: a PWA runs in the device browser, which does support cross-origin isolation and multithreading, while still offering an app-like experience.
- **Native Android SDK**: the [Scandit Android SDK](/sdks/android/add-sdk.md) runs entirely in native code and is not subject to any WebView or browser limitations.
:::

### 1. Declare the Camera Permission

Add the `CAMERA` permission to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

### 2. Request Camera Permission at Runtime

Request the OS-level camera permission before loading the WebView. Using the Activity Result Contracts API:

```kotlin
# import android.Manifest
# import android.content.pm.PackageManager
# import android.os.Bundle
# import androidx.activity.result.contract.ActivityResultContracts
# import androidx.core.content.ContextCompat

private val cameraPermission = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
) { granted ->
    if (granted) {
        loadWebView()
    } else {
        // Handle denial — the web content cannot access the camera
    }
}

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED) {
        loadWebView()
    } else {
        cameraPermission.launch(Manifest.permission.CAMERA)
    }
}
```

### 3. Grant Camera Access to Web Content

When the web SDK calls `getUserMedia`, the WebView triggers `WebChromeClient.onPermissionRequest`. Override this method to forward the permission to the web content. It is safe to grant automatically here because the native app has already received the OS camera permission in the previous step:

```kotlin
# import android.webkit.PermissionRequest
# import android.webkit.WebChromeClient

webView.webChromeClient = object : WebChromeClient() {
    override fun onPermissionRequest(request: PermissionRequest) {
        val cameraResources = request.resources.filter {
            it == PermissionRequest.RESOURCE_VIDEO_CAPTURE
        }.toTypedArray()
        request.grant(cameraResources)
    }
}
```

### 4. Configure the WebView

Enable JavaScript and allow media autoplay so the SDK can start the camera without requiring a user gesture:

```kotlin
# import android.webkit.WebSettings
# import android.webkit.WebView

webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    mediaPlaybackRequiresUserGesture = false
}
```

### 5. Serve Content from Localhost

Load the web app from a local server to satisfy the secure context requirement:

```kotlin
# import android.webkit.WebView

webView.loadUrl("http://localhost:$port/")
```

A minimal implementation using [NanoHTTPD](https://github.com/NanoHttpd/nanohttpd) can serve static files from the APK's `assets/` folder. Make sure to include the correct MIME type for `.wasm` files (`application/wasm`) — without it, the browser will reject the Scandit engine files. For general guidance on serving the SDK's engine files, see [Hosting the `sdc-lib` files](./add-sdk.md#hosting-the-sdc-lib-files).

## iOS

### 1. Add the Camera Usage Description

Add a camera usage description to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for barcode scanning.</string>
```

### 2. Configure the WKWebView

Enable inline media playback and allow media to start without a user gesture:

```swift
import WebKit

let configuration = WKWebViewConfiguration()
configuration.allowsInlineMediaPlayback = true
configuration.mediaTypesRequiringUserActionForPlayback = []

let webView = WKWebView(frame: .zero, configuration: configuration)
webView.uiDelegate = self
```

### 3. Handle the Media Capture Permission Request

Implement `WKUIDelegate` to respond when the web SDK requests camera access. Tie the decision to the current `AVCaptureDevice` authorization status:

```swift
import AVFoundation
import WebKit

func webView(
    _ webView: WKWebView,
    requestMediaCapturePermissionFor origin: WKSecurityOrigin,
    initiatedByFrame frame: WKFrameInfo,
    type: WKMediaCaptureType,
    decisionHandler: @escaping (WKPermissionDecision) -> Void
) {
    AVCaptureDevice.requestAccess(for: .video) { granted in
        DispatchQueue.main.async {
            decisionHandler(granted ? .grant : .deny)
        }
    }
}
```

This delegate method is called every time the web content requests camera access. Calling `AVCaptureDevice.requestAccess` here triggers the system permission prompt on first launch, and returns immediately on subsequent calls based on the stored authorization status.

### 4. Pre-request the Camera Permission (Recommended)

Requesting the native camera permission before loading the page results in a smoother user experience, because the system prompt appears immediately at app launch rather than mid-scan:

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    setupWebView()
    requestCameraPermission()
    loadContent()
}

private func requestCameraPermission() {
    AVCaptureDevice.requestAccess(for: .video) { _ in }
}
```

### 5. Load the Web Content

Load a bundled HTML file or a local server URL. For bundled files, use `loadFileURL(_:allowingReadAccessTo:)` — note that `file://` URLs are not a secure context, so you must either serve from a local HTTP server or load the file with the SDK already initialized for a non-camera use-case.

The simplest approach is to bundle the web app and load it directly:

```swift
if let path = Bundle.main.path(forResource: "index", ofType: "html") {
    let url = URL(fileURLWithPath: path)
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
}
```

:::note
`loadFileURL` grants the web content a secure context on iOS, so `getUserMedia` works even for `file://` URLs when loaded this way.
:::
