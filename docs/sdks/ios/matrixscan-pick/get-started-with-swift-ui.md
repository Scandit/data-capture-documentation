---
sidebar_position: 3
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan Pick to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController** - Implement the MatrixScan Pick logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper** - Use `UIViewControllerRepresentable` to integrate the UIViewController
3. **Use in your SwiftUI app** - Add the SwiftUI view to your app's view hierarchy

The core MatrixScan Pick implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan Pick

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a UIViewController that handles the MatrixScan Pick functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `MatrixScanPickViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class MatrixScanPickViewController: UIViewController {
    private var context: DataCaptureContext!
    private var barcodePick: BarcodePick!
    private var barcodePickView: BarcodePickView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodePickView.start()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        barcodePickView.pause()
        if isMovingFromParent {
            barcodePickView.stop()
        }
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode Pick Mode with product provider
        // 3. Setup the Barcode Pick View
        // 4. Register the UI delegate and view listener
    }
}

extension MatrixScanPickViewController: BarcodePickAsyncMapperProductProviderDelegate {
    func mapItems(_ items: [String], completionHandler: @escaping ([BarcodePickProductProviderCallbackItem]) -> Void) {
        // Map scanned items to products
        // See the main Get Started guide
    }
}

extension MatrixScanPickViewController: BarcodePickViewUIDelegate {
    func barcodePickViewDidTapFinishButton(_ view: BarcodePickView) {
        // Handle finish button tap
    }
}

extension MatrixScanPickViewController: BarcodePickViewListener {
    func barcodePickViewDidStartScanning(_ view: BarcodePickView) {
        // Handle scanning started
    }

    func barcodePickViewDidFreezeScanning(_ view: BarcodePickView) {
        // Handle scanning frozen
    }

    func barcodePickViewDidPauseScanning(_ view: BarcodePickView) {
        // Handle scanning paused
    }

    func barcodePickViewDidStopScanning(_ view: BarcodePickView) {
        // Handle scanning stopped
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct MatrixScanPickRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = MatrixScanPickViewController

    func makeUIViewController(context: Context) -> MatrixScanPickViewController {
        return MatrixScanPickViewController()
    }

    func updateUIViewController(_ uiViewController: MatrixScanPickViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `MatrixScanPickRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            MatrixScanPickRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanPickRepresentable()
                .navigationTitle("MatrixScan Pick")
        }
    }
}
```