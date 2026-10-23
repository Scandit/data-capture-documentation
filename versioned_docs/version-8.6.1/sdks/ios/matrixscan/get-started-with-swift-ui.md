---
description: Get Started With SwiftUI and Scandit MatrixScan.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the MatrixScan logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core MatrixScan implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the MatrixScan functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `MatrixScanViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class MatrixScanViewController: UIViewController {
    private var context: DataCaptureContext!
    private var camera: Camera?
    private var barcodeBatch: BarcodeBatch!
    private var captureView: DataCaptureView!
    private var overlay: BarcodeBatchBasicOverlay!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodeBatch.isEnabled = true
        camera?.switch(toDesiredState: .on)
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        barcodeBatch.isEnabled = false
        camera?.switch(toDesiredState: .off)
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode Batch Mode
        // 3. Use the built-in camera
        // 4. Visualize the scan process
        // 5. Provide feedback
    }
}

extension MatrixScanViewController: BarcodeBatchBasicOverlayDelegate {
    func barcodeBatchBasicOverlay(_ overlay: BarcodeBatchBasicOverlay,
                                brushFor trackedBarcode: TrackedBarcode) -> Brush? {
        // Return a custom Brush based on the tracked barcode.
    }

    func barcodeBatchBasicOverlay(_ overlay: BarcodeBatchBasicOverlay,
                                  didTap trackedBarcode: TrackedBarcode) {
        // Handle barcode tap
        // See the main Get Started guide
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct MatrixScanRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = MatrixScanViewController

    func makeUIViewController(context: Context) -> MatrixScanViewController {
        return MatrixScanViewController()
    }

    func updateUIViewController(_ uiViewController: MatrixScanViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `MatrixScanRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            MatrixScanRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanRepresentable()
                .navigationTitle("MatrixScan")
        }
    }
}
```

## Alternative: Using UIViewRepresentable

As an alternative to wrapping a `UIViewController`, you can implement the MatrixScan functionality directly using `UIViewRepresentable`. This approach uses a `Coordinator` to hold the SDK objects, ensuring they are created once and persist across SwiftUI updates:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct MatrixScanView: UIViewRepresentable {
    let onBarcodeBatchUpdated: ([TrackedBarcode]) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> UIView {
        let coordinator = context.coordinator
        coordinator.onBarcodesUpdated = onBarcodeBatchUpdated

        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = BarcodeBatch.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Turn on the camera
            coordinator.dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
            coordinator.camera = camera
        }

        // Enable Barcode Batch
        coordinator.barcodeBatch.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: coordinator.dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay
        coordinator.overlay = BarcodeBatchBasicOverlay(barcodeBatch: coordinator.barcodeBatch, view: captureView, style: .frame)

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        context.coordinator.onBarcodesUpdated = onBarcodeBatchUpdated
    }

    static func dismantleUIView(_ uiView: UIView, coordinator: Coordinator) {
        coordinator.barcodeBatch.isEnabled = false
        coordinator.camera?.switch(toDesiredState: .off)
    }

    class Coordinator: NSObject, BarcodeBatchListener {
        let dataCaptureContext: DataCaptureContext
        let barcodeBatch: BarcodeBatch
        var overlay: BarcodeBatchBasicOverlay?
        var camera: Camera?
        var onBarcodesUpdated: (([TrackedBarcode]) -> Void)?

        override init() {
            // Create the data capture context
            DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
            dataCaptureContext = DataCaptureContext.shared

            // Configure barcode batch settings
            let settings = BarcodeBatchSettings()
            // ...

            // Create barcode batch mode
            barcodeBatch = BarcodeBatch(context: dataCaptureContext, settings: settings)

            super.init()
            barcodeBatch.addListener(self)
        }

        nonisolated func barcodeBatch(_ barcodeBatch: BarcodeBatch,
                                      didUpdate session: BarcodeBatchSession,
                                      frameData: FrameData) {
            let trackedBarcodes = session.trackedBarcodes.values.map { $0 }
            DispatchQueue.main.async {
                self.onBarcodesUpdated?(trackedBarcodes)
            }
        }
    }
}
```

You can then use this view directly in your SwiftUI app:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanView { trackedBarcodes in
                // Handle the tracked barcodes
            }
            .navigationTitle("MatrixScan")
        }
    }
}
```