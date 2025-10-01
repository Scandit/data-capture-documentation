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

As an alternative to wrapping a `UIViewController`, you can implement the barcode selection functionality directly using `UIViewRepresentable`. This approach creates the capture view directly without an intermediate view controller:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct BarcodeSelectionView: UIViewRepresentable {
    private let dataCaptureContext: DataCaptureContext
    private let barcodeSelection: BarcodeSelection
    private let listener: Listener

    init(onBarcodeSelectionUpdated: @escaping ([Barcode]) -> Void) {
        // Create the data capture context
        DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
        dataCaptureContext = DataCaptureContext.sharedInstance

        // Configure barcode selection settings
        let settings = BarcodeSelectionSettings()
        // ...

        // Create barcode selection mode
        barcodeSelection = BarcodeSelection(context: dataCaptureContext, settings: settings)

        // Create the listener instance.
        // IMPORTANT: You must assign the listener to a strong property
        // to prevent it from being deallocated
        listener = Listener(onBarcodeSelectionUpdated: onBarcodeSelectionUpdated)
        barcodeSelection.addListener(listener)
    }

    func makeUIView(context: Context) -> UIView {
        if let camera = Camera.default {
            // Apply recommended camera settings
            let cameraSettings = BarcodeSelection.recommendedCameraSettings
            camera.apply(cameraSettings)

            // Turn on the camera
            dataCaptureContext.setFrameSource(camera)
            camera.switch(toDesiredState: .on)
        } else {
            print("Camera not available")
        }

        // Enable barcode selection
        barcodeSelection.isEnabled = true

        // Create the capture view
        let captureView = DataCaptureView(context: dataCaptureContext, frame: .zero)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // Create the overlay
        let overlay = BarcodeSelectionBasicOverlay(barcodeSelection: barcodeSelection,
                                                   view: captureView,
                                                   style: .frame)
        captureView.addOverlay(overlay)

        return captureView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // Update the view if needed
    }
}

private class Listener: NSObject, BarcodeSelectionListener {
    private let onBarcodeSelectionUpdated: ([Barcode]) -> Void

    init(onBarcodeSelectionUpdated: @escaping ([Barcode]) -> Void) {
        self.onBarcodeSelectionUpdated = onBarcodeSelectionUpdated
    }

    func barcodeSelection(_ barcodeSelection: BarcodeSelection,
                          didUpdateSelection session: BarcodeSelectionSession,
                          frameData: FrameData?) {
        let selectedBarcodes = session.selectedBarcodes
        DispatchQueue.main.async {
            self.onBarcodeSelectionUpdated(selectedBarcodes)
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
                BarcodeSelectionView { barcodes in
                    // Handle the selected barcodes
                }
                .navigationTitle("Barcode Selection")
            }
        }
    }
}
```

