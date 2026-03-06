---
sidebar_position: 3
pagination_next: null
framework: netIos
keywords:
  - netIos
---

# Advanced Configurations

MatrixScan Pick is optimized by default for efficiency, accuracy, and a seamless user experience. However, there are multiple advanced settings available to further customize MatrixScan Pick to best fit your needs.

## BarcodePick Listener

You may want more fine-grained knowledge over the different events happening during the life of the `BarcodePick` mode, such as when the search starts, pauses, and stops.

To do this, you can directly register a [`BarcodePickListener`](https://docs.scandit.com/7.6/data-capture-sdk/android/barcode-capture/api/barcode-pick-listener.html#interface-scandit.datacapture.barcode.pick.IBarcodePickListener) on the mode itself, keeping in mind that these listeners are called from a background thread.

```csharp
public class BarcodePickListener : IBarcodePickListener
{
	public void onObservationStopped(ICollection<BarcodePickProduct> foundItems)
	{
		// The mode was paused
	}

	public void onObservationStarted()
	{
		// The mode was started
	}
}

private void Initialize()
{
	BarcodePick.AddListener(new BarcodePickListener())
}
```
