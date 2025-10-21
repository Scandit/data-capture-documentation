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
                                  didTapTrackedBarcode trackedBarcode: TrackedBarcode) {
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

As an alternative to wrapping a `UIViewController`, you can implement the MatrixScan functionality directly using `UIViewRepresentable`. This approach creates the capture view directly without an intermediate view controller:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct MatrixScanView: UIViewRepresentable {
    private let dataCaptureContext: DataCaptureContext
    private let barcodeBatch: BarcodeBatch
    private let listener: Listener

    init(onBarcodeBatchUpdated: @escaping ([TrackedBarcode]) -> Void) {
        // Create the data capture context
        DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
        dataCaptureContext = DataCaptureContext.sharedInstance

        // Configure barcode batch settings
        let settings = BarcodeBatchSettings()
        // ...

        // Create barcode batch mode
        barcodeBatch = BarcodeBatch(context: dataCaptureContext, settings: settings)

        // Create the listener instance.
        // IMPORTANT: You must assign the listener to a strong property
        // to prevent it from being deallocated
        listener = Listener(onBarcodeBatchUpdated: onBarcodeBatchUpdated)
        barcodeBatch.addListener(listener)
    }

    func makeUIView(context: Context) -> UIView {
        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = BarcodeBatch.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Turn on the camera
            dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
        } else {
            print("Camera not available")
        }

        // Enable Barcode Batch
        barcodeBatch.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay
        let overlay = BarcodeBatchBasicOverlay(barcodeBatch: barcodeBatch, view: captureView, style: .frame)
        captureView.addOverlay(overlay)

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // Update the view if needed
    }
}

private class Listener: NSObject, BarcodeBatchListener {
    private let onBarcodeBatchUpdated: ([TrackedBarcode]) -> Void

    init(onBarcodeBatchUpdated: @escaping ([TrackedBarcode]) -> Void) {
        self.onBarcodeBatchUpdated = onBarcodeBatchUpdated
    }

    func barcodeBatch(_ barcodeBatch: BarcodeBatch,
                      didUpdate session: BarcodeBatchSession,
                      frameData: FrameData) {
        let trackedBarcodes = session.trackedBarcodes.values.map { $0 }
        DispatchQueue.main.async {
            self.onBarcodeBatchUpdated(trackedBarcodes)
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
                MatrixScanView { trackedBarcodes in
                    // Handle the tracked barcodes
                }
                .navigationTitle("MatrixScan")
            }
        }
    }
}
```