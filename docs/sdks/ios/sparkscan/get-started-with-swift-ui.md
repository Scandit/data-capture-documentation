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
    let sparkScanViewController = SparkScanViewController()
    
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
    let sparkScanViewController = SparkScanViewController()
    
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