---
description: Get Started With SwiftUI and Scandit MatrixScan Find.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan Find to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the MatrixScan Find logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core MatrixScan Find implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan Find

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the MatrixScan Find functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `MatrixScanFindViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class MatrixScanFindViewController: UIViewController {
    private var context: DataCaptureContext!
    private var barcodeFind: BarcodeFind!
    private var barcodeFindView: BarcodeFindView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupRecognition()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        barcodeFindView.prepareSearching()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        barcodeFindView.startSearching()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        barcodeFindView.stopSearching()
    }

    func setupRecognition() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the Barcode Find Mode
        // 3. Setup the Barcode Find View
        // 4. Register the UI delegate to handle finish button
    }
}

extension MatrixScanFindViewController: BarcodeFindViewUIDelegate {
    func barcodeFindView(_ view: BarcodeFindView,
                        didTapFinishButton foundItems: Set<BarcodeFindItem>) {
        // Handle finish button tap
    }
}
```

## Create a SwiftUI View using UIViewControllerRepresentable

Now create a SwiftUI wrapper that integrates the UIViewController into your SwiftUI app:

```swift
import SwiftUI
import UIKit

struct MatrixScanFindRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = MatrixScanFindViewController

    func makeUIViewController(context: Context) -> MatrixScanFindViewController {
        return MatrixScanFindViewController()
    }

    func updateUIViewController(_ uiViewController: MatrixScanFindViewController, context: Context) {
        // Update the view controller if needed
    }
}
```

## Use the SwiftUI View in Your App

Finally, use the `MatrixScanFindRepresentable` in your SwiftUI app:

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            MatrixScanFindRepresentable()
        }
    }
}
```

Or within another SwiftUI view:

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            MatrixScanFindRepresentable()
                .navigationTitle("MatrixScan Find")
        }
    }
}
```