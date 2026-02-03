import { BarcodeScanning, LabelScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { BarcodeCapture, Express, Ms, LabelCapture } from "../../IconComponents";
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
    // If path starts with a version (e.g., "/7.6.7/"), use it as-is
    if (path && path.startsWith('/')) {
      return `${path}${basePath}`;
    }
    // For Cordova and .NET iOS label capture, link to /next/ docs (8.2)
    if ((framework === 'cordova' || framework === 'netIos') && basePath === '/label-capture/intro') {
      return `/next/sdks/${path}${basePath}`;
    }
    // Otherwise prepend /sdks/
    return `/sdks/${path}${basePath}`;
  }

  const allCardsArray = [
    {
      name: BarcodeScanning.SingleScanning,
      text: "Ready-to-use workflows and APIs for single barcode scanning",
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
      text: "MatrixScan workflows and APIs for multiple barcode scanning",
      icon: <Ms />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.BatchScanning
      ),
      link:
        framework === "linux"
          ? `/sdks/linux/add-sdk/`
          : buildLink('/batch-scanning'),
    },
    {
      name: LabelScanning.LabelScanning,
      text: "Workflows and APIs to capture barcodes and text simultaneously from labels",
      icon: <LabelCapture />,
      isActive: frameworkData?.labelScanning?.includes(
        LabelScanning.LabelScanning
      ),
      link: buildLink('/label-capture/intro'),
    },
    {
      name: BarcodeScanning.ScanditExpress,
      text: "No-Code Scanning in Any App",
      icon: <Express />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.ScanditExpress
      ),
      link: `/hosted/express/overview`,
    },
  ];

  return allCardsArray;
}
