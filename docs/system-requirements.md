---
sidebar_position: 1
displayed_sidebar: sdcSidebar
---

# System Requirements

## Native SDK

### iOS

| Requirement | Version |
| ----------- | ------- |
| iOS         | 14.0+   |
| Architecture| arm64, x86_64 |
| Camera      | 720p+   |
| GPU         |    |

### Android

| Requirement | Version |
| ----------- | ------- |
| Android     | 6.0+ (API level 23) |
| Java        | 8+     |
| Architecture| arm64v7, arm64, x86, x86_64 |
| Camera      | 720p+   |
| GPU         |    |

:::note
On Android hardware acceleration has to be enabled for the camera preview to work. Hardware acceleration is enabled by default since API level 14 but can potentially be turned off in the Manifest, do not do this if you use the camera.
:::

## Web SDK

| Requirement | Notes |
| ----------- | ----- |
| Blob        | [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) is used to store the video stream. Check [supported browser versions](https://caniuse.com/#feat=blobbuilder). |
| WebAssembly | [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) is used to run the video processing algorithms. Check [supported browser versions](https://caniuse.com/#feat=wasm). |
| URL/createObjectURL | [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) is used to create a URL for the video stream. Check [supported browser versions](https://caniuse.com/#feat=bloburls). |
| Web Workers | [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) are used to run the video processing algorithms in a separate thread. Check [supported browser versions](https://caniuse.com/#feat=webworkers). |
| SharedArrayBuffer | [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) is **required** for simultaneous multiple barcode tracking. Check [supported browser versions](https://caniuse.com/#feat=sharedarraybuffer). |
| MediaDevices.getUserMedia | Optional. [MediaDevices.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) is required for camera video streaming. Check [supported browser versions](https://caniuse.com/#feat=stream). |
| OffscreenCanvas | Optional. [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) allows for GPU acceleration in Web Worker. Check [supported browser versions](https://caniuse.com/#feat=offscreencanvas). |
| WebGL | Optional. [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) is used for GPU acceleration. Check [supported browser versions](https://caniuse.com/#feat=webgl). |
| WebAssembly SIMD | Optional. [WebAssembly SIMD](https://chromestatus.com/feature/6533147810332672) is used for OCR computation acceleration. |

### Browser Compatibility

| Browser                | Threads | Single thread |
|------------------------|---------|---------------|
| Chrome                 | 68+     | 61+           |
| Edge                   | 79+     | 79+           |
| Firefox                | 105+    | 105+          |
| Opera                  | 55+     | 44+           |
| Safari                 | 15.2+   | 13+           |
| Chrome Android         | 89+     | 61+           |
| Firefox Android        | 105+    | 105+          |
| Opera Android          | 63+     | 46+           |
| Safari iOS / Chrome iOS (webkit) | 16.4+     | 14.6+         |
| Samsung Internet       | 15+     | 7+            |
| Webview Android        | No      | Yes           |

## Frameworks

These platforms are based on the native platforms and therefore the requirements of native platforms apply as well. If a framework has stricter requirements (e.g. it only supports newer versions of Android/iOS) it is explicitly stated.

| Platform        | Requirements                                        |
|-----------------|-----------------------------------------------------|
| Capacitor       | - Capacitor 2.0.0<br/>- Swift 4.0+                   |
| Cordova         | - cordova 8.0.0<br/>- cordova-android 7.0.0<br/>- cordova-ios 4.5.5<br/>- Swift 4.0+ |
| Flutter         | - Flutter 3.22.0 (Dart 3.4.0)<br/>- Swift 4.0+      |
| Xamarin.Android | - Xamarin.Android 13.2.2<br/>- Kotlin 1.8.22           |
| Xamarin.iOS     | - Xamarin.iOS 16.4.0.23                             |
| Xamarin.Forms   | - Xamarin.Forms 4.8<br/>- Kotlin 1.8.22              |
| React Native    | - react-native 0.60 (0.63 if using Fast Refresh)<br/>- Kotlin 1.8.22<br/>- Swift 4.0+ |
| Titanium        | - Titanium 12.2.1.GA                                |
| .NET for iOS    | - .NET SDK 6.0.403+                                 |
| .NET for Android| - .NET SDK 6.0.403+<br/>- Kotlin 1.8.22              |
