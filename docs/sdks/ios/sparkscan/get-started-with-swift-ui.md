---
description: Get Started With SwiftUI and Scandit SparkScan.
framework: ios
keywords:
  - ios
---

# Get Started With SwiftUI

In this guide you will learn step-by-step how to add SparkScan to your application using SwiftUI.

The general steps are:

1. **Create a UIViewController**: Implement the SparkScan logic following the main [Get Started guide](./get-started.md)
2. **Use the withSparkScan view modifier**: Apply the SparkScan view controller to your SwiftUI views
3. **Integrate into your SwiftUI app**: Use the view modifier in your SwiftUI view hierarchy

The core SparkScan implementation (data capture context, settings, SparkScanView setup, etc.) remains the same as described in the main guide.

## Create a UIViewController for SparkScan

To integrate the Scandit Data Capture SDK with SwiftUI, you'll need to create a `UIViewController` that handles the SparkScan functionality. This follows the same implementation as described in the main [Get Started guide](./get-started.md).

Create a `SparkScanViewController` class that implements all the steps from the UIKit guide:

```swift
import ScanditBarcodeCapture
import UIKit

class SparkScanViewController: UIViewController {
    private var context: DataCaptureContext!
    private var sparkScan: SparkScan!
    private var sparkScanView: SparkScanView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupSparkScan()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        sparkScanView.prepareScanning()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        sparkScanView.stopScanning()
    }

    func setupSparkScan() {
        // Follow the implementation from the Get Started guide:
        // 1. Create data capture context
        // 2. Configure the SparkScan Mode
        // 3. Create the SparkScan View
        // 4. Register the listener
    }
}

extension SparkScanViewController: SparkScanListener {
    func sparkScan(_ sparkScan: SparkScan,
                   didScanIn session: SparkScanSession,
                   frameData: FrameData?) {
        // Handle SparkScan results
        // See the main Get Started guide
    }
}
```

## Use the withSparkScan View Modifier

SparkScan provides a convenient SwiftUI view modifier called `withSparkScan` that allows you to easily integrate SparkScan into your SwiftUI view hierarchy.

Use the `withSparkScan` view modifier on any SwiftUI view, passing your SparkScan view controller instance:

```swift
import SwiftUI
import ScanditBarcodeCapture

struct ContentView: View {
    @State private var sparkScanViewController = SparkScanViewController()
    
    var body: some View {
        VStack {
            Image(systemName: "barcode.viewfinder")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Scan barcodes with SparkScan")
        }
        .withSparkScan(sparkScanViewController)
    }
}
```

## Use SparkScan in Your SwiftUI App

You can use SparkScan in your main app view:

```swift
import SwiftUI
import ScanditBarcodeCapture

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

Or integrate it into more complex view hierarchies:

```swift
struct MainView: View {
    @State private var sparkScanViewController = SparkScanViewController()
    
    var body: some View {
        NavigationView {
            TabView {
                ScanningView()
                    .withSparkScan(sparkScanViewController)
                    .tabItem {
                        Image(systemName: "barcode.viewfinder")
                        Text("Scan")
                    }
                
                HistoryView()
                    .tabItem {
                        Image(systemName: "list.bullet")
                        Text("History")
                    }
            }
            .navigationTitle("SparkScan Demo")
        }
    }
}

struct ScanningView: View {
    var body: some View {
        VStack {
            Text("Point camera at barcodes")
                .font(.headline)
                .padding()
            
            Spacer()
        }
    }
}
```

## Alternative: Integrate Using UIViewRepresentable

If you prefer to avoid view controllers entirely, you can wrap the [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html) directly with [`UIViewRepresentable`](https://developer.apple.com/documentation/swiftui/uiviewrepresentable) and a coordinator.

Using the `withSparkScan` view modifier described above is often the easier integration path, especially when handling more advanced configurations. The bonus of `UIViewRepresentable` is that it can feel more natural in a pure SwiftUI codebase:

- **State flows down**: SwiftUI state (such as the enabled symbologies, or whether scanning is active) is pushed into the running scanner whenever it changes.
- **Events flow up**: scan results and feedback decisions are forwarded to your SwiftUI code through closures.

### Create the UIViewRepresentable

Create a `SparkScanScanner` struct that creates the [`SparkScanView`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html) in `makeUIView` and pushes SwiftUI state changes to the scanner in `updateUIView`.

Since there is no view controller in this approach, [`SDCSparkScanView.prepareScanning`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.PrepareScanning) and [`SDCSparkScanView.stopScanning`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/ui/spark-scan-view.html#method-scandit.datacapture.barcode.spark.ui.SparkScanView.StopScanning) are driven by an `isActive` flag instead of the `viewWillAppear` and `viewWillDisappear` callbacks:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct SparkScanScanner: UIViewRepresentable {
    // State flows down from SwiftUI.
    let dataCaptureContext: DataCaptureContext
    let symbologies: Set<Symbology>
    let isActive: Bool
    // Events flow up to your SwiftUI code.
    let onScan: (Barcode) -> Void
    let feedbackFor: (Barcode) -> SparkScanBarcodeFeedback?

    func makeCoordinator() -> SparkScanScannerCoordinator {
        let settings = SparkScanSettings()
        symbologies.forEach { settings.set(symbology: $0, enabled: true) }

        return SparkScanScannerCoordinator(
            dataCaptureContext: dataCaptureContext,
            settings: settings,
            onScan: onScan,
            feedbackFor: feedbackFor
        )
    }

    func makeUIView(context: Context) -> UIView {
        // SparkScanView attaches itself to the parent view passed at creation.
        let parentView = ParentView()
        parentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        let sparkScanView = SparkScanView(
            parentView: parentView,
            context: context.coordinator.dataCaptureContext,
            sparkScan: context.coordinator.sparkScan,
            settings: SparkScanViewSettings()
        )
        sparkScanView.feedbackDelegate = context.coordinator
        context.coordinator.sparkScanView = sparkScanView

        return parentView
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        context.coordinator.update(onScan: onScan, feedbackFor: feedbackFor)
        // Push the current SwiftUI state into the running scanner.
        context.coordinator.applySymbologiesIfNeeded(symbologies)
        if isActive {
            DispatchQueue.main.async {
                context.coordinator.sparkScanView?.prepareScanning()
            }
        } else {
            context.coordinator.sparkScanView?.stopScanning()
        }
    }
}

// Forward touches to the SparkScan UI so that its floating controls stay
// interactive on top of your SwiftUI content.
private class ParentView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        subviews.first?.hitTest(point, with: event)
    }
}
```

### Create the Coordinator

SwiftUI recreates the `UIViewRepresentable` struct on every render, so everything long-lived must be owned by the coordinator: the SparkScan mode with its settings, and the delegate conformances.

```swift
class SparkScanScannerCoordinator: NSObject {
    let dataCaptureContext: DataCaptureContext
    private let settings: SparkScanSettings
    weak var sparkScanView: SparkScanView?
    lazy var sparkScan: SparkScan = {
        let sparkScan = SparkScan(settings: settings)
        sparkScan.addListener(self)
        return sparkScan
    }()

    private var onScan: (Barcode) -> Void
    private var feedbackFor: (Barcode) -> SparkScanBarcodeFeedback?

    init(
        dataCaptureContext: DataCaptureContext,
        settings: SparkScanSettings,
        onScan: @escaping (Barcode) -> Void,
        feedbackFor: @escaping (Barcode) -> SparkScanBarcodeFeedback?
    ) {
        self.dataCaptureContext = dataCaptureContext
        self.settings = settings
        self.onScan = onScan
        self.feedbackFor = feedbackFor
    }

    // Closures capture the state of the render they were created in,
    // so refresh them on every update.
    func update(
        onScan: @escaping (Barcode) -> Void,
        feedbackFor: @escaping (Barcode) -> SparkScanBarcodeFeedback?
    ) {
        self.onScan = onScan
        self.feedbackFor = feedbackFor
    }
}
```

The coordinator implements the [`SDCSparkScanListener`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-listener.html#interface-scandit.datacapture.barcode.spark.ISparkScanListener) and [`SDCSparkScanFeedbackDelegate`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-feedback-delegate.html) protocols and forwards both to the SwiftUI closures:

```swift
extension SparkScanScannerCoordinator: SparkScanListener {
    func sparkScan(_ sparkScan: SparkScan,
                   didScanIn session: SparkScanSession,
                   frameData: FrameData?) {
        guard let barcode = session.newlyRecognizedBarcode else { return }

        // This method is invoked from a recognition internal thread.
        // Dispatch to the main thread to update your SwiftUI state.
        DispatchQueue.main.async {
            self.onScan(barcode)
        }
    }
}

extension SparkScanScannerCoordinator: SparkScanFeedbackDelegate {
    // Invoked on a background queue: the closure must only access
    // thread-safe state.
    func feedback(for barcode: Barcode) -> SparkScanBarcodeFeedback? {
        feedbackFor(barcode)
    }
}
```

### Update Settings While Scanning

Because `updateUIView` runs whenever the SwiftUI state changes, changed settings can be applied to the running scanner. Add the following method to the coordinator. It compares the incoming symbologies with the ones currently enabled and calls [`SDCSparkScan.applySettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan.html#method-scandit.datacapture.barcode.spark.SparkScan.ApplySettings) only when they differ:

```swift
extension SparkScanScannerCoordinator {
    func applySymbologiesIfNeeded(_ symbologies: Set<Symbology>) {
        let current = settings.enabledSymbologies
        guard symbologies != current else { return }

        // Mutate the existing settings instance instead of creating a new one,
        // so that any other customization applied to it is preserved.
        current.subtracting(symbologies).forEach { settings.set(symbology: $0, enabled: false) }
        symbologies.subtracting(current).forEach { settings.set(symbology: $0, enabled: true) }
        sparkScan.apply(settings)
    }
}
```

This example forwards the enabled symbologies, but any [`SparkScanSettings`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-settings.html) property (for example [`codeDuplicateFilter`](https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api/spark-scan-settings.html#property-scandit.datacapture.barcode.spark.SparkScanSettings.CodeDuplicateFilter)) can be forwarded from SwiftUI state to the running scanner the same way.

### Use the Scanner in Your SwiftUI App

Place the scanner in your view hierarchy like any other SwiftUI view and drive it entirely through state. Changing `symbologies` — for example through a `Toggle` — reconfigures the running scanner:

```swift
import ScanditBarcodeCapture
import SwiftUI

struct ScanningView: View {
    private static let dataCaptureContext = DataCaptureContext(
        licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --"
    )

    @State private var scannedBarcodes: [String] = []
    @State private var scanQRCodes = false
    @Environment(\.scenePhase) private var scenePhase

    private var symbologies: Set<Symbology> {
        scanQRCodes ? [.ean13UPCA, .qr] : [.ean13UPCA]
    }

    var body: some View {
        VStack {
            Toggle("Also scan QR codes", isOn: $scanQRCodes)
                .padding()

            List(scannedBarcodes, id: \.self) { barcode in
                Text(barcode)
            }
        }
        .overlay(
            SparkScanScanner(
                dataCaptureContext: Self.dataCaptureContext,
                symbologies: symbologies,
                isActive: scenePhase == .active,
                onScan: { barcode in
                    scannedBarcodes.append(barcode.data ?? "")
                },
                feedbackFor: { barcode in
                    // Decide the feedback for each scan here, for example by
                    // checking the barcode against your own data.
                    SparkScanBarcodeSuccessFeedback()
                }
            )
            .ignoresSafeArea()
        )
    }
}
```