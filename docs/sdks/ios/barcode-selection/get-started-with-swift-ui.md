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

