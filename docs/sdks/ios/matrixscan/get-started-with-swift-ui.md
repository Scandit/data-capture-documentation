---
sidebar_position: 3
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController** - Implement the MatrixScan logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper** - Use `UIViewControllerRepresentable` to integrate the UIViewController
3. **Use in your SwiftUI app** - Add the SwiftUI view to your app's view hierarchy

The core MatrixScan implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a UIViewController that handles the MatrixScan functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

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