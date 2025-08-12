---
sidebar_position: 3
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan Count to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController** - Implement the MatrixScan Count logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper** - Use `UIViewControllerRepresentable` to integrate the UIViewController
3. **Use in your SwiftUI app** - Add the SwiftUI view to your app's view hierarchy

The core MatrixScan Count implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan Count

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a UIViewController that handles the MatrixScan Count functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `MatrixScanCountViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class MatrixScanCountViewController: UIViewController {
    private var context: DataCaptureContext!
    private var camera: Camera?
    private var barcodeCount: BarcodeCount!
    private var barcodeCountView: BarcodeCountView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        camera?.switch(toDesiredState: .on)
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        camera?.switch(toDesiredState: .off)
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode Count Mode
        // 3. Obtain the camera instance and set frame source
        // 4. Register the listener to be informed when scan phase is complete
        // 5. Set the capture view and AR overlays
        // 6. Configure UI delegate for list and exit callbacks
    }
}

extension MatrixScanCountViewController: BarcodeCountListener {
    func barcodeCount(_ barcodeCount: BarcodeCount,
                      didScanIn session: BarcodeCountSession,
                      frameData: FrameData) {
        // Handle barcode count results
        // See the main Get Started guide
    }
}

extension MatrixScanCountViewController: BarcodeCountViewUIDelegate {
    func listButtonTapped(for view: BarcodeCountView) {
        // Handle list button tap
    }

    func exitButtonTapped(for view: BarcodeCountView) {
        // Handle exit button tap
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct MatrixScanCountRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = MatrixScanCountViewController

    func makeUIViewController(context: Context) -> MatrixScanCountViewController {
        return MatrixScanCountViewController()
    }

    func updateUIViewController(_ uiViewController: MatrixScanCountViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `MatrixScanCountRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            MatrixScanCountRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanCountRepresentable()
                .navigationTitle("MatrixScan Count")
        }
    }
}
```