import { BarcodeScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { BarcodeCapture, Ms } from "../../IconComponents";
import { FrameworkCardType } from "../../constants/types";

export function createBarcodeScanningArr(framework: string) {
  function findFrameworkData() {
    const frameworkData: FrameworkCardType = frameworkCards.find(
      (item) => item.framework === framework
    );

    if (frameworkData) {
      return frameworkData;
    }

    const additionalFrameworkData = frameworkCards
      .filter((item) => item.additional && Array.isArray(item.additional))
      .flatMap((item) => item.additional)
      .find((additionalItem) => additionalItem.framework === framework);
    return additionalFrameworkData || null;
  }

  const frameworkData = findFrameworkData();

  function getFrameworkPath(frameworkData: FrameworkCardType): string {
    return frameworkData?.link ? frameworkData.link : framework;
  }

  function buildLink(basePath: string): string {
    const path = getFrameworkPath(frameworkData);
    // If path starts with a version (e.g., "/7.6.14/"), use it as-is
    if (path && path.startsWith('/')) {
      return `${path}${basePath}`;
    }
    // Otherwise prepend /sdks/
    return `/sdks/${path}${basePath}`;
  }

  const allCardsArray = [
    {
      name: BarcodeScanning.SingleScanning,
      text: "Ready-to-use workflows and APIs for single barcode scanning",
      apis: "SparkScan, Barcode Capture",
      icon: <BarcodeCapture />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.SingleScanning
      ),
      link:
        framework === "linux"
          ? `/sdks/linux/add-sdk/`
          : buildLink('/single-scanning'),
    },
    {
      name: BarcodeScanning.BatchScanning,
      text: "MatrixScan workflows and APIs for capturing multiple barcodes",
      apis: "MatrixScan Batch, MatrixScan Count, MatrixScan Find, MatrixScan AR, MatrixScan Pick",
      icon: <Ms />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.BatchScanning
      ),
      link:
        framework === "linux"
          ? `/sdks/linux/add-sdk/`
          : buildLink('/batch-scanning'),
    },
  ];

  return allCardsArray;
}
