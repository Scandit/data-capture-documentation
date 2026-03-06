---
description: Get Started With SwiftUI and Scandit Barcode Capture.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add Barcode Capture to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the barcode scanning logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core barcode scanning implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for Barcode Scanning

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the barcode scanning functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

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

Now create a SwiftUI wrapper that integrates the `UIViewController` into your SwiftUI app:

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

## Alternative: Using UIViewRepresentable

As an alternative to wrapping a `UIViewController`, you can implement the barcode scanning functionality directly using `UIViewRepresentable`. This approach creates the capture view directly without an intermediate view controller:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct BarcodeCaptureView: UIViewRepresentable {
    private let dataCaptureContext: DataCaptureContext
    private let barcodeCapture: BarcodeCapture
    private let listener: Listener

    init(onBarcodeScanned: @escaping (Barcode) -> Void) {
        // Create the data capture context
        DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
        dataCaptureContext = DataCaptureContext.sharedInstance

        // Configure barcode capture settings
        let settings = BarcodeCaptureSettings()
        // ...

        // Create barcode capture mode
        barcodeCapture = BarcodeCapture(context: dataCaptureContext, settings: settings)

        // Create the listener instance.
        // IMPORTANT: You must assign the listener to a strong property
        // to prevent it from being deallocated
        listener = Listener(onBarcodeScanned: onBarcodeScanned)
        barcodeCapture.addListener(listener)
    }

    func makeUIView(context: Context) -> UIView {
        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = BarcodeCapture.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Turn on the camera
            dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
        } else {
            print("Camera not available")
        }

        // Enable barcode capture
        barcodeCapture.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay if desired
        // ...

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // Update the view if needed
    }
}

private class Listener: NSObject, BarcodeCaptureListener {
    private let onBarcodeScanned: (Barcode) -> Void

    init(onBarcodeScanned: @escaping (Barcode) -> Void) {
        self.onBarcodeScanned = onBarcodeScanned
    }

    func barcodeCapture(_ barcodeCapture: BarcodeCapture,
                        didScanIn session: BarcodeCaptureSession,
                        frameData: FrameData) {
        guard let barcode = session.newlyRecognizedBarcode else { return }
        DispatchQueue.main.async {
            self.onBarcodeScanned(barcode)
        }
    }
}
```

You can then use this view directly in your SwiftUI app:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                BarcodeCaptureView { barcode in
                    // Handle the scanned barcode
                }
                .navigationTitle("Barcode Scanner")
            }
        }
    }
}
```

