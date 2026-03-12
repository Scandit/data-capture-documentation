---
description: Get Started With SwiftUI and Scandit MatrixScan Pick.
pagination_prev: null
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add MatrixScan Pick to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the MatrixScan Pick logic following the main [Get Started guide](./get-started.md)
2. **Create a SwiftUI wrapper**: Use `UIViewControllerRepresentable` to integrate the `UIViewController`
3. **Use in your SwiftUI app**: Add the SwiftUI view to your app's view hierarchy

The core MatrixScan Pick implementation (data capture context, settings, camera setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for MatrixScan Pick

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the MatrixScan Pick functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

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

Now create a SwiftUI wrapper that integrates the `UIViewController` into your SwiftUI app:

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

## Alternative: Using UIViewRepresentable

As an alternative to wrapping a `UIViewController`, you can implement the MatrixScan Pick functionality directly using `UIViewRepresentable`. This approach creates the pick view directly without an intermediate view controller:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct MatrixScanPickView: UIViewRepresentable {
    private let dataCaptureContext: DataCaptureContext
    private let barcodePick: BarcodePick
    private let productProviderDelegate: ProductProviderDelegate
    private let uiDelegate: UIDelegate

    init(products: Set<BarcodePickProduct>,
         productMapper: @escaping ([String]) async -> [BarcodePickProductProviderCallbackItem],
         onFinishButtonTapped: @escaping () -> Void) {
        // Create the data capture context
        DataCaptureContext.initialize(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
        dataCaptureContext = DataCaptureContext.shared

        // Configure Barcode Pick settings
        let settings = BarcodePickSettings()
        // ...

        // Create product provider with delegate.
        // IMPORTANT: You must assign the delegate to a strong property
        // to prevent it from being deallocated
        productProviderDelegate = ProductProviderDelegate(productMapper: productMapper)
        let productProvider = BarcodePickAsyncMapperProductProvider(products: products,
                                                                    providerDelegate: productProviderDelegate)

        // Create Barcode Pick mode with product provider
        barcodePick = BarcodePick(context: dataCaptureContext,
                                  settings: settings,
                                  productProvider: productProvider)

        // Create the UI delegate
        uiDelegate = UIDelegate(onFinishButtonTapped: onFinishButtonTapped)
    }

    func makeUIView(context: Context) -> UIView {
        // Configure Barcode Pick view settings
        let viewSettings = BarcodePickViewSettings()
        // ...

        // Create the Barcode Pick view
        let barcodePickView = BarcodePickView(frame: .zero,
                                              context: dataCaptureContext,
                                              barcodePick: barcodePick,
                                              settings: viewSettings)
        barcodePickView.uiDelegate = uiDelegate

        // Start the pick view
        barcodePickView.start()

        return barcodePickView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // Update the view if needed
    }
}

private class ProductProviderDelegate: NSObject, BarcodePickAsyncMapperProductProviderDelegate {
    private let productMapper: ([String]) async -> [BarcodePickProductProviderCallbackItem]

    init(productMapper: @escaping ([String]) async -> [BarcodePickProductProviderCallbackItem]) {
        self.productMapper = productMapper
        super.init()
    }

    func mapItems(_ items: [String]) async -> [BarcodePickProductProviderCallbackItem] {
        return await productMapper(items)
    }
}

private class UIDelegate: NSObject, BarcodePickViewUIDelegate {
    private let onFinishButtonTapped: () -> Void

    init(onFinishButtonTapped: @escaping () -> Void) {
        self.onFinishButtonTapped = onFinishButtonTapped
    }

    func barcodePickViewDidTapFinishButton(_ view: BarcodePickView) {
        DispatchQueue.main.async {
            self.onFinishButtonTapped()
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
                MatrixScanPickView(
                    products: productsToPick,
                    productMapper: { items in
                        // Map scanned items to products
                        // ...
                    },
                    onFinishButtonTapped: {
                        // Handle finish button tap
                    },
                )
                .navigationTitle("MatrixScan Pick")
            }
        }
    }
}
```