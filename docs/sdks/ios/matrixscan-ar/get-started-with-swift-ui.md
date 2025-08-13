---
description: Get Started With SwiftUI and Scandit MatrixScan AR.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan AR to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the MatrixScan AR logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core MatrixScan AR implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan AR

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the MatrixScan AR functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `MatrixScanArViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class MatrixScanArViewController: UIViewController {
    private var context: DataCaptureContext!
    private var barcodeAr: BarcodeAr!
    private var barcodeArView: BarcodeArView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodeArView.start()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        barcodeArView.stop()
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode AR Mode
        // 3. Setup the Barcode AR View
        // 4. Register the providers
    }
}

extension MatrixScanArViewController: BarcodeArAnnotationProvider {
    func annotation(for barcode: Barcode,
                    completionHandler: @escaping ((any UIView & BarcodeArAnnotation)?) -> Void) {
        // Provide annotations for barcodes
        // See the main Get Started guide
    }
}

extension MatrixScanArViewController: BarcodeArHighlightProvider {
    func highlight(for barcode: Barcode,
                   completionHandler: @escaping ((any UIView & BarcodeArHighlight)?) -> Void) {
        // Provide highlights for barcodes
        // See the main Get Started guide
    }
}

extension MatrixScanArViewController: BarcodeArViewUIDelegate {
    func barcodeAr(_ barcodeAr: BarcodeAr,
                   didTapHighlightFor barcode: Barcode,
                   highlight: any UIView & BarcodeArHighlight) {
        // Handle tap events
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct MatrixScanArRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = MatrixScanArViewController

    func makeUIViewController(context: Context) -> MatrixScanArViewController {
        return MatrixScanArViewController()
    }

    func updateUIViewController(_ uiViewController: MatrixScanArViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `MatrixScanArRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            MatrixScanArRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanArRepresentable()
                .navigationTitle("MatrixScan AR")
        }
    }
}
```