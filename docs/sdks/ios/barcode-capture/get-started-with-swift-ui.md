---
sidebar_position: 3
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add Barcode Capture to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController** - Implement the barcode scanning logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper** - Use `UIViewControllerRepresentable` to integrate the UIViewController
3. **Use in your SwiftUI app** - Add the SwiftUI view to your app's view hierarchy

The core barcode scanning implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for Barcode Scanning

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a UIViewController that handles the barcode scanning functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `BarcodeCaptureViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class BarcodeCaptureViewController: UIViewController {
    private var context: DataCaptureContext!
    private var camera: Camera?
    private var barcodeCapture: BarcodeCapture!
    private var captureView: DataCaptureView!
    private var overlay: BarcodeCaptureOverlay!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodeCapture.isEnabled = true
        camera?.switch(toDesiredState: .on)
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        barcodeCapture.isEnabled = false
        camera?.switch(toDesiredState: .off)
    }

    func setupRecognition() {
        // Follow the implementation from the main Get Started guide:
        // 1. Create data capture context
        // 2. Configure barcode scanning settings 
        // 3. Register the barcode capture listener
        // 4. Use the built-in camera
        // 5. Create capture view and overlay
    }
}

extension BarcodeCaptureViewController: BarcodeCaptureListener {
    func barcodeCapture(_ barcodeCapture: BarcodeCapture,
                        didScanIn session: BarcodeCaptureSession,
                        frameData: FrameData) {
        // Handle barcode scanning results
        // See the main Get Started guide
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct BarcodeCaptureRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = BarcodeCaptureViewController

    func makeUIViewController(context: Context) -> BarcodeCaptureViewController {
        return BarcodeCaptureViewController()
    }

    func updateUIViewController(_ uiViewController: BarcodeCaptureViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `BarcodeCaptureRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            BarcodeCaptureRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            BarcodeCaptureRepresentable()
                .navigationTitle("Barcode Scanner")
        }
    }
}
```
