import { BarcodeScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { BarcodeCapture, Express, Ms } from "../../IconComponents";
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

  const allCardsArray = [
    {
      name: BarcodeScanning.SingleScanning,
      text: "Ready-to-Use Workflows and APIs",
      icon: <BarcodeCapture />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.SingleScanning
      ),
      link:
        framework === "linux"
          ? `/sdks/linux/add-sdk/`
          : `/sdks/${getFrameworkPath(frameworkData)}/single-scanning`,
    },
    {
      name: BarcodeScanning.BatchScanning,
      text: "MatrixScan Workflows and APIs",
      icon: <Ms />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.BatchScanning
      ),
      link:
        framework === "linux"
          ? `/sdks/linux/add-sdk/`
          : `/sdks/${getFrameworkPath(frameworkData)}/batch-scanning`,
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
