---
description: Get Started With SwiftUI and Scandit Label Capture.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add Smart Label Capture to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the Smart Label Capture logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core Smart Label Capture implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for Smart Label Capture

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the Smart Label Capture functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `LabelCaptureViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditLabelCapture
import UIKit

class LabelCaptureViewController: UIViewController {
    private var context: DataCaptureContext!
    private var camera: Camera?
    private var labelCapture: LabelCapture!
    private var dataCaptureView: DataCaptureView!
    private var labelCaptureOverlay: LabelCaptureBasicOverlay!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        labelCapture.isEnabled = true
        camera?.switch(toDesiredState: .on)
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        labelCapture.isEnabled = false
        camera?.switch(toDesiredState: .off)
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Initialize the Data Capture context
        // 2. Initialize the Label Capture mode with label definitions
        // 3. Add listener to handle captured labels
        // 4. Visualize the scan process with DataCaptureView and overlays
        // 5. Configure and start the camera
    }
}

extension LabelCaptureViewController: LabelCaptureListener {
    func labelCapture(_ labelCapture: LabelCapture,
                      didUpdate session: LabelCaptureSession,
                      frameData: FrameData) {
        // Handle label capture results
        // See the main Get Started guide
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct LabelCaptureRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = LabelCaptureViewController

    func makeUIViewController(context: Context) -> LabelCaptureViewController {
        return LabelCaptureViewController()
    }

    func updateUIViewController(_ uiViewController: LabelCaptureViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `LabelCaptureRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            LabelCaptureRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            LabelCaptureRepresentable()
                .navigationTitle("Smart Label Capture")
        }
    }
}
```

## Alternative: Using UIViewRepresentable

As an alternative to wrapping a `UIViewController`, you can implement the Smart Label Capture functionality directly using `UIViewRepresentable`. This approach uses a `Coordinator` to hold the SDK objects, ensuring they are created once and persist across SwiftUI updates:

```swift
import ScanditLabelCapture
import SwiftUI

struct LabelCaptureView: UIViewRepresentable {
    let labelDefinitions: [LabelDefinition]
    let onLabelCaptured: ([CapturedLabel]) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(labelDefinitions: labelDefinitions,
                    onLabelCaptured: onLabelCaptured)
    }

    func makeUIView(context: Context) -> UIView {
        let coordinator = context.coordinator

        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = LabelCapture.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Set the camera as the frame source
            coordinator.dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
            coordinator.camera = camera
        }

        // Enable Label Capture
        coordinator.labelCapture.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: coordinator.dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay (automatically added to the capture view)
        coordinator.overlay = LabelCaptureBasicOverlay(labelCapture: coordinator.labelCapture,
                                                       view: captureView)

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        context.coordinator.onLabelCaptured = onLabelCaptured
    }

    static func dismantleUIView(_ uiView: UIView, coordinator: Coordinator) {
        coordinator.labelCapture.isEnabled = false
        coordinator.camera?.switch(toDesiredState: .off)
    }

    class Coordinator: NSObject, LabelCaptureListener {
        let dataCaptureContext: DataCaptureContext
        let labelCapture: LabelCapture
        var overlay: LabelCaptureBasicOverlay?
        var camera: Camera?
        var onLabelCaptured: ([CapturedLabel]) -> Void

        init(labelDefinitions: [LabelDefinition],
             onLabelCaptured: @escaping ([CapturedLabel]) -> Void) {
            // Create the data capture context
            DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
            dataCaptureContext = DataCaptureContext.shared
            self.onLabelCaptured = onLabelCaptured

            // Configure Label Capture settings
            guard let settings = try? LabelCaptureSettings(labelDefinitions: labelDefinitions) else {
                fatalError("Invalid label definitions")
            }

            // Create Label Capture mode
            labelCapture = LabelCapture(context: dataCaptureContext, settings: settings)

            super.init()
            labelCapture.addListener(self)
        }

        nonisolated func labelCapture(_ labelCapture: LabelCapture,
                                      didUpdate session: LabelCaptureSession,
                                      frameData: FrameData) {
            let capturedLabels = session.capturedLabels
            guard !capturedLabels.isEmpty else { return }
            DispatchQueue.main.async {
                self.onLabelCaptured(capturedLabels)
            }
        }
    }
}
```

You can then use this view directly in your SwiftUI app:

```swift
struct ContentView: View {
    private let labelDefinitions: [LabelDefinition] = [
        LabelDefinition("Retail Item") {
            CustomBarcode(name: "Barcode", symbology: .ean13UPCA)
            ExpiryDateText(name: "Expiry Date")
        }
    ]

    var body: some View {
        NavigationView {
            LabelCaptureView(
                labelDefinitions: labelDefinitions,
                onLabelCaptured: { labels in
                    // Handle captured labels
                }
            )
            .navigationTitle("Smart Label Capture")
        }
    }
}
```