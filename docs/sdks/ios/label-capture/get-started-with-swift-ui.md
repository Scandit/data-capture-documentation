---
sidebar_position: 3
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add Smart Label Capture to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController** - Implement the Smart Label Capture logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper** - Use `UIViewControllerRepresentable` to integrate the UIViewController
3. **Use in your SwiftUI app** - Add the SwiftUI view to your app's view hierarchy

The core Smart Label Capture implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for Smart Label Capture

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a UIViewController that handles the Smart Label Capture functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

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
                      didUpdateSession session: LabelCaptureSession,
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