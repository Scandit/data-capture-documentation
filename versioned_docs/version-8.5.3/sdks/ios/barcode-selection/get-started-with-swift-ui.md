---
description: Get Started With SwiftUI and Scandit Barcode Selection.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add Barcode Selection to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the barcode selection logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core barcode selection implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for Barcode Selection

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the barcode selection functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `BarcodeSelectionViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class BarcodeSelectionViewController: UIViewController {
    private var context: DataCaptureContext!
    private var camera: Camera?
    private var barcodeSelection: BarcodeSelection!
    private var captureView: DataCaptureView!
    private var overlay: BarcodeSelectionBasicOverlay!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodeSelection.isEnabled = true
        camera?.switch(toDesiredState: .on)
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        barcodeSelection.isEnabled = false
        camera?.switch(toDesiredState: .off)
    }

    func setupRecognition() {
        // Follow the implementation from the main Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode Selection Mode 
        // 3. Register the listener to receive scan events
        // 4. Obtain the camera instance and set as frame source
        // 5. Create capture view and overlay
    }
}

extension BarcodeSelectionViewController: BarcodeSelectionListener {
    func barcodeSelection(_ barcodeSelection: BarcodeSelection,
                          didUpdateSelection session: BarcodeSelectionSession,
                          frameData: FrameData?) {
        // Handle barcode selection results
        // See the main Get Started guide
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct BarcodeSelectionRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = BarcodeSelectionViewController

    func makeUIViewController(context: Context) -> BarcodeSelectionViewController {
        return BarcodeSelectionViewController()
    }

    func updateUIViewController(_ uiViewController: BarcodeSelectionViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `BarcodeSelectionRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            BarcodeSelectionRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            BarcodeSelectionRepresentable()
                .navigationTitle("Barcode Selection")
        }
    }
}
```

## Alternative: Using UIViewRepresentable

As an alternative to wrapping a `UIViewController`, you can implement the barcode selection functionality directly using `UIViewRepresentable`. This approach uses a `Coordinator` to hold the SDK objects, ensuring they are created once and persist across SwiftUI updates:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct BarcodeSelectionView: UIViewRepresentable {
    let onBarcodeSelectionUpdated: ([Barcode]) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> UIView {
        let coordinator = context.coordinator
        coordinator.onSelectionUpdated = onBarcodeSelectionUpdated

        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = BarcodeSelection.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Turn on the camera
            coordinator.dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
            coordinator.camera = camera
        }

        // Enable barcode selection
        coordinator.barcodeSelection.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: coordinator.dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay
        coordinator.overlay = BarcodeSelectionBasicOverlay(barcodeSelection: coordinator.barcodeSelection,
                                                           view: captureView,
                                                           style: .frame)

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        context.coordinator.onSelectionUpdated = onBarcodeSelectionUpdated
    }

    static func dismantleUIView(_ uiView: UIView, coordinator: Coordinator) {
        coordinator.barcodeSelection.isEnabled = false
        coordinator.camera?.switch(toDesiredState: .off)
    }

    class Coordinator: NSObject, BarcodeSelectionListener {
        let dataCaptureContext: DataCaptureContext
        let barcodeSelection: BarcodeSelection
        var overlay: BarcodeSelectionBasicOverlay?
        var camera: Camera?
        var onSelectionUpdated: (([Barcode]) -> Void)?

        override init() {
            // Create the data capture context
            DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
            dataCaptureContext = DataCaptureContext.shared

            // Configure barcode selection settings
            let settings = BarcodeSelectionSettings()
            // ...

            // Create barcode selection mode
            barcodeSelection = BarcodeSelection(context: dataCaptureContext, settings: settings)

            super.init()
            barcodeSelection.addListener(self)
        }

        nonisolated func barcodeSelection(_ barcodeSelection: BarcodeSelection,
                                          didUpdateSelection session: BarcodeSelectionSession,
                                          frameData: FrameData?) {
            let selectedBarcodes = session.selectedBarcodes
            DispatchQueue.main.async {
                self.onSelectionUpdated?(selectedBarcodes)
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
            BarcodeSelectionView { barcodes in
                // Handle the selected barcodes
            }
            .navigationTitle("Barcode Selection")
        }
    }
}
```

