---
description: "How to unit test application code that uses the Scandit Data Capture SDK, without a camera or a live capture session."
sidebar_label: Testing
framework: ios
keywords:
  - ios
  - testing
  - unit testing
  - mocking
---

# Testing

Scanning happens on a live camera frame, which is not available in unit tests or on the iOS Simulator. The capture modes, sessions, and result objects that the SDK hands to your listeners are also produced internally by the SDK, so they cannot be constructed directly in a test.

There are two recommended approaches to working around this, which you can use on their own or combine:

- **[Isolate the SDK behind your own abstraction](#isolate-the-sdk-behind-your-own-abstraction).** Keep your application logic independent of the SDK and test that logic directly, without any SDK objects.
- **[Mock the SDK's types in your tests](#mock-the-sdks-types-in-your-tests).** Use a mocking framework to stand in for the capture mode, session, and result objects, then drive your listener with controlled values.

Choose based on what you want to verify: your own logic in isolation, or your code's behavior against the SDK's own types.

Both approaches test your callback logic in isolation. To verify the full pipeline end to end (an app-hosted integration test that feeds a known image through an `ImageFrameSource`), see [Integration testing your pipeline](#integration-testing-your-pipeline).

:::note
The examples on this page use BarcodeCapture. The same techniques apply to every capture mode; work with the corresponding listener and result types, for example `SparkScanListener`, `BarcodeBatchListener`, or `IdCaptureListener`.
:::

## Isolate the SDK behind your own abstraction

With this approach the SDK is confined to a thin adapter, and your application logic depends only on an abstraction that you own. The example below sets up a full BarcodeCapture integration and routes every scan into a plain, testable type, so your tests never reference an SDK object.

### Define the abstraction and your application logic

Declare a protocol that exposes only the data your application needs from a scan, and put your logic in a type that depends on that protocol. It never references `BarcodeCapture`, `BarcodeCaptureSession`, or `Barcode`.

```swift
import ScanditBarcodeCapture

// The app-facing abstraction. Only what your logic needs.
protocol BarcodeScanReceiver: AnyObject {
    func didScan(data: String, symbology: Symbology)
}

// Your testable application logic.
final class CartModel: BarcodeScanReceiver {
    private(set) var scannedItems: [String] = []

    func didScan(data: String, symbology: Symbology) {
        scannedItems.append(data)
    }
}
```

`Symbology` is a plain enum, so it is safe to use in your abstraction and to construct in tests. Only the capture mode, session, and result objects need to be kept out of your logic.

### Confine the SDK to a thin adapter

Create a single adapter that conforms to `BarcodeCaptureListener`. This is the only type that touches the capture session. It extracts plain values from the result and forwards them to your protocol on the main queue.

```swift
import ScanditBarcodeCapture

// The only type that depends on the live capture session.
final class BarcodeCaptureAdapter: NSObject, BarcodeCaptureListener {
    weak var receiver: BarcodeScanReceiver?

    func barcodeCapture(_ barcodeCapture: BarcodeCapture,
                        didScanIn session: BarcodeCaptureSession,
                        frameData: FrameData) {
        guard let barcode = session.newlyRecognizedBarcode, let data = barcode.data else {
            return
        }
        // Listener callbacks arrive on a background queue.
        let symbology = barcode.symbology
        DispatchQueue.main.async {
            self.receiver?.didScan(data: data, symbology: symbology)
        }
    }
}
```

### Set up the scanner

Wire up the context, settings, capture mode, camera, and view as usual. This mirrors the standard integration in the [Get Started](/sdks/ios/barcode-capture/get-started.md) guide; the only difference is that the listener is the adapter, and the adapter forwards results to your logic.

```swift
import UIKit
import ScanditCaptureCore
import ScanditBarcodeCapture

final class ScanViewController: UIViewController {
    // Your logic and the SDK adapter that feeds it.
    private let cartModel = CartModel()
    private let scanAdapter = BarcodeCaptureAdapter()

    private var context: DataCaptureContext!
    private var camera: Camera?
    private var barcodeCapture: BarcodeCapture!
    private var captureView: DataCaptureView!
    private var overlay: BarcodeCaptureOverlay!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupScanner()
    }

    private func setupScanner() {
        context = DataCaptureContext(licenseKey: "-- ENTER YOUR SCANDIT LICENSE KEY HERE --")

        // 1. Configure which symbologies to scan.
        let settings = BarcodeCaptureSettings()
        settings.set(symbology: .ean13UPCA, enabled: true)
        settings.set(symbology: .code128, enabled: true)

        // 2. Create the capture mode.
        barcodeCapture = BarcodeCapture(context: context, settings: settings)

        // 3. Route results into your own logic through the adapter.
        scanAdapter.receiver = cartModel
        barcodeCapture.addListener(scanAdapter)

        // 4. Use the camera as the frame source.
        let camera = Camera.default
        camera?.apply(BarcodeCapture.recommendedCameraSettings)
        context.setFrameSource(camera)
        self.camera = camera

        // 5. Add a capture view and overlay to visualize scanning.
        captureView = DataCaptureView(context: context, frame: view.bounds)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(captureView)
        overlay = BarcodeCaptureOverlay(barcodeCapture: barcodeCapture, view: captureView)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        camera?.switch(toDesiredState: .on)
        barcodeCapture.isEnabled = true
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        camera?.switch(toDesiredState: .off)
        barcodeCapture.isEnabled = false
    }
}
```

### Test your application logic

Because the logic only depends on your protocol, the test calls it directly. No camera, no capture session, and no capture mode are involved, so it runs on the Simulator.

```swift
import XCTest
import ScanditBarcodeCapture
@testable import MyApp

final class CartModelTests: XCTestCase {
    func testScannedItemIsAddedToCart() {
        let cart = CartModel()

        cart.didScan(data: "0123456789012", symbology: .ean13UPCA)

        XCTAssertEqual(cart.scannedItems, ["0123456789012"])
    }
}
```

:::note
The adapter and the scanner setup are intentionally minimal and are not covered by unit tests, since they depend on a live capture session. Exercise them through integration or UI tests on a real device.
:::

## Mock the SDK's types in your tests

Approach 1 made the scan handling testable by moving it out of the view controller. If you would rather test your existing code without restructuring it, you can instead mock the SDK's types and call your listener directly.

This suits code where the scan handling already lives in your view controller or another existing type, like this:

```swift
final class ScanViewController: UIViewController, BarcodeCaptureListener {
    private(set) var scannedItems: [String] = []

    // ... scanner setup, as shown in the Get Started guide ...

    func barcodeCapture(_ barcodeCapture: BarcodeCapture,
                        didScanIn session: BarcodeCaptureSession,
                        frameData: FrameData) {
        guard let barcode = session.newlyRecognizedBarcode, let data = barcode.data else {
            return
        }
        scannedItems.append(data)
    }
}
```

`BarcodeCaptureSession` is produced by the SDK during a live scan and has no public initializer, so a test cannot construct it directly. A runtime mocking framework can stand in for it.

:::note
The examples here use [OCMockito](https://github.com/jonreid/OCMockito), but [OCMock](https://github.com/erikdoe/ocmock) works equally well. Both mock Objective-C classes at runtime, including types that have no accessible initializer. Swift-native mocking frameworks (such as Cuckoo or Mockingbird) do not help here: they generate mocks from your own Swift protocols and classes rather than from a precompiled Objective-C framework, and they instantiate the mock through an initializer, which types such as `BarcodeCaptureSession` do not expose.
:::

### What to mock

The types a listener works with fall into a few groups:

| Type group | Examples | In a unit test |
|---|---|---|
| Listeners | `BarcodeCaptureListener`, `IdCaptureListener`, `SparkScanListener`, … | Conform directly, or mock |
| `FrameData` | `FrameData` | Mock (it is a protocol) |
| Modes | `BarcodeCapture`, `BarcodeBatch`, `IdCapture`, `SparkScan`, `BarcodePick` | Mock |
| Sessions | `BarcodeCaptureSession`, `BarcodeBatchSession`, … | Mock; stub the accessors you read |
| Results | `Barcode`, `TrackedBarcode`, `CapturedId` | Mock and stub the properties you read, or construct via a public initializer where one exists |
| Settings | `BarcodeCaptureSettings`, `IdCaptureSettings`, … | Construct the real object |
| Views and overlays | `SparkScanView`, `BarcodeCaptureOverlay`, … | Not needed for listener tests |

### Add the mocking framework

Add OCMockito to your test target. With Swift Package Manager, add the package and depend on the `OCMockito` product:

```swift
.package(url: "https://github.com/jonreid/OCMockito.git", from: "7.0.0"),
```

### Build a mock factory in Objective-C

OCMockito's stubbing API (`mock()`, `given().willReturn()`) is provided through Objective-C macros that are not available in Swift. Put the mock construction in a small Objective-C helper that returns the SDK types, so your tests stay in Swift.

```objectivec
// SDCScanMockFactory.h
#import <Foundation/Foundation.h>

@class SDCBarcodeCapture;
@class SDCBarcodeCaptureSession;
@protocol SDCFrameData;

NS_ASSUME_NONNULL_BEGIN

@interface SDCScanMockFactory : NSObject
/// A session whose `newlyRecognizedBarcode` returns a barcode with the given data,
/// or no barcode when `data` is nil.
+ (SDCBarcodeCaptureSession *)sessionReturningBarcodeData:(nullable NSString *)data;
+ (SDCBarcodeCapture *)anyBarcodeCapture;
+ (id<SDCFrameData>)anyFrameData;
@end

NS_ASSUME_NONNULL_END
```

```objectivec
// SDCScanMockFactory.m
#import "SDCScanMockFactory.h"

@import OCMockito;
@import ScanditBarcodeCapture;

@implementation SDCScanMockFactory

+ (SDCBarcodeCaptureSession *)sessionReturningBarcodeData:(NSString *)data {
    SDCBarcodeCaptureSession *session = mock([SDCBarcodeCaptureSession class]);
    if (data != nil) {
        SDCBarcode *barcode = mock([SDCBarcode class]);
        [given([barcode data]) willReturn:data];
        [given([session newlyRecognizedBarcode]) willReturn:barcode];
    } else {
        [given([session newlyRecognizedBarcode]) willReturn:nil];
    }
    return session;
}

+ (SDCBarcodeCapture *)anyBarcodeCapture {
    return mock([SDCBarcodeCapture class]);
}

+ (id<SDCFrameData>)anyFrameData {
    return mockProtocol(@protocol(SDCFrameData));
}

@end
```

Add both files to your test target, and import the header from Swift through the test target's Objective-C bridging header.

### Write the test

Create the view controller and call its listener method with a mocked session. The view is never loaded, so no camera or capture pipeline is created, and the test runs on the Simulator.

```swift
import XCTest
import ScanditBarcodeCapture
@testable import MyApp

final class ScanViewControllerTests: XCTestCase {
    func testHandlesScannedBarcode() {
        let viewController = ScanViewController()

        let session = SDCScanMockFactory.sessionReturningBarcodeData("0123456789012")
        viewController.barcodeCapture(SDCScanMockFactory.anyBarcodeCapture(),
                                      didScanIn: session,
                                      frameData: SDCScanMockFactory.anyFrameData())

        XCTAssertEqual(viewController.scannedItems, ["0123456789012"])
    }
}
```

:::tip
Where a type has a public initializer, you can construct a real instance instead of mocking it. For example, you can build a real `Barcode` with `Barcode(barcodeInfo: BarcodeInfo(symbology: .ean13UPCA, data: "0123456789012"))`. Settings, overlays, views, and feedback objects have public initializers or are not needed when testing listener logic, so they do not need mocking. Only the types the SDK produces internally, such as the capture session, must be mocked.
:::

:::note
Keep the mock factory and OCMockito in your test target so they are not linked into your release build. If your listener forwards work to the main queue, wait for it before asserting, for example with an `XCTestExpectation`.
:::

### Other capture modes

The same approach applies to the other modes. Only the callback signature and what the mock returns change.

#### SparkScan

The same as BarcodeCapture: conform to `SparkScanListener`, mock a `SparkScanSession`, and stub `newlyRecognizedBarcode`. The callback's `frameData` parameter is optional (`FrameData?`).

#### MatrixScan (Barcode Batch)

This mode delivers a collection. The callback is `barcodeBatch(_:didUpdate:frameData:)`, and the session exposes `addedTrackedBarcodes`, so the factory stubs a list. A `TrackedBarcode` can be built with its public initializer.

```objectivec
+ (SDCBarcodeBatchSession *)sessionWithTrackedBarcodes:(NSArray<SDCTrackedBarcode *> *)trackedBarcodes {
    SDCBarcodeBatchSession *session = mock([SDCBarcodeBatchSession class]);
    [given([session addedTrackedBarcodes]) willReturn:trackedBarcodes];
    return session;
}
```

#### ID Capture

The result arrives as a direct parameter, not through a session. The callback is `idCapture(_:didCapture:)` and receives a `CapturedId`, which has no public initializer, so mock it and stub the fields you read.

```objectivec
+ (SDCCapturedId *)capturedIdWithFirstName:(NSString *)firstName {
    SDCCapturedId *capturedId = mock([SDCCapturedId class]);
    [given([capturedId firstName]) willReturn:firstName];
    return capturedId;
}
```

Nested results such as `VizResult` and `MrzResult` are also produced only by the SDK; mock them the same way.

:::note
For ID Capture, also link the `ScanditIDC` framework into your test target alongside `ScanditIdCapture`. The ID engine is weak-linked, and the test bundle fails to launch without it.
:::

#### BarcodePick

Actions are reported through a completion handler rather than a session, so no SDK type needs mocking. Conform to `BarcodePickActionListener`, call the action method with a closure, and assert on the result your listener reports.

```swift
final class ProductPickHandler: NSObject, BarcodePickActionListener {
    func didPickItem(withData data: String, completionHandler: @escaping (Bool) -> Void) {
        completionHandler(!data.isEmpty)
    }

    func didUnpickItem(withData data: String, completionHandler: @escaping (Bool) -> Void) {
        completionHandler(true)
    }
}

// In the test:
let listener = ProductPickHandler()
var result: Bool?
listener.didPickItem(withData: "item-42") { result = $0 }
XCTAssertEqual(result, true)
```

## Integration testing your pipeline

The two approaches above are unit tests of your callback logic. To also confirm the whole pipeline works (your symbologies are enabled, your listener is registered, and frames reach your code) you can drive your real view controller with a known image instead of the camera.

This is an integration test that runs the real, licensed SDK, so it has two requirements a unit test does not:

- **It must run in an app-hosted test target** (a unit-test target with a host application), not a Swift package test target or a host-less logic-test bundle. The license is validated against the running process's bundle identifier, so the test has to run inside your app.
- **Set the app target's bundle identifier to the one your license is issued for.** Otherwise the SDK reports an "app ID doesn't match" error and never scans.

No camera and no on-screen view are needed: an `ImageFrameSource` feeds the image to the pipeline directly. Make the frame source (and the license key, for the test) injectable, and keep the pipeline setup separate from the view setup so the test can configure scanning without loading the view:

```swift
final class ScanViewController: UIViewController, BarcodeCaptureListener {
    var licenseKey = "-- ENTER YOUR SCANDIT LICENSE KEY HERE --"
    var frameSource: FrameSource?   // defaults to the camera

    // Configures the pipeline without touching the view, so a test can call it directly.
    func configureScanning() {
        context = DataCaptureContext(licenseKey: licenseKey)
        let settings = BarcodeCaptureSettings()
        settings.set(symbology: .code128, enabled: true)
        barcodeCapture = BarcodeCapture(context: context, settings: settings)
        barcodeCapture.addListener(self)

        let source = frameSource ?? Camera.default
        (source as? Camera)?.apply(BarcodeCapture.recommendedCameraSettings)
        context.setFrameSource(source)
        frameSource = source
        barcodeCapture.isEnabled = true
    }

    // viewDidLoad() calls configureScanning() and then adds the capture view.
    // The listener appends to scannedItems, as in the examples above.
}
```

The test injects an `ImageFrameSource`, configures scanning, switches the source on, and waits for the listener to fire:

```swift
func testViewControllerProcessesScannedImage() throws {
    guard let key = ProcessInfo.processInfo.environment["SCANDIT_LICENSE_KEY"],
          !key.isEmpty else {
        throw XCTSkip("Set SCANDIT_LICENSE_KEY to run this integration test")
    }

    let frameSource = ImageFrameSource(image: knownBarcodeImage) // from your test bundle

    let viewController = ScanViewController()
    viewController.licenseKey = key
    viewController.frameSource = frameSource
    viewController.configureScanning()
    frameSource.switch(toDesiredState: .on)

    let scanned = XCTNSPredicateExpectation(
        predicate: NSPredicate { _, _ in !viewController.scannedItems.isEmpty },
        object: nil)
    wait(for: [scanned], timeout: 10)

    XCTAssertEqual(viewController.scannedItems, ["0123456789012"])
}
```

:::note
This is an end-to-end check: it runs the licensed pipeline in an app-hosted target, so it is slower and needs a license key. Keep it separate from your fast, host-less unit tests.
:::
