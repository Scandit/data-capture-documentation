import { BarcodeScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import {
  BarcodeCapture,
  BarcodeGenerator,
  BarcodeSelection,
  Express,
  LabelCapture,
  MatrixScanPick,
  Ms,
  MsCount,
  MsFind,
  Parser,
  Sparkscan,
} from "../../IconComponents";
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
      cards: [
        {
          name: BarcodeScanning.SingleScanning,
          text: "Single Scanning",
          icon: <BarcodeCapture />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.SingleScanning
          ),
          link: `/sdks/${getFrameworkPath(frameworkData)}/single-scanning`,
        },
        {
          name: BarcodeScanning.BatchScanning,
          text: "Single Scanning",
          icon: <BarcodeCapture />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BatchScanning
          ),
          link:
            framework === "linux"
              ? "https://docs.scandit.com/stable/c_api/index.html "
              : `/sdks/${getFrameworkPath(frameworkData)}/batch-scanning`,
        },
        {
          name: BarcodeScanning.MatrixScan,
          text: "Multi-Scanning and Tracking",
          icon: <Ms />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScan
          ),
          link:
            framework === "linux"
              ? "https://docs.scandit.com/stable/c_api/index.html "
              : `/sdks/${getFrameworkPath(frameworkData)}/matrixscan/intro`,
        },
        {
          name: BarcodeScanning.Parser,
          text: "Parse Barcode Data",
          icon: <Parser />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.Parser
          ),
          link: `/sdks/${getFrameworkPath(frameworkData)}/parser/get-started`,
        },
        {
          name: BarcodeScanning.LabelCapture,
          text: "Scan Barcodes and Text",
          icon: <LabelCapture />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.LabelCapture
          ),
          link: `/sdks/${getFrameworkPath(
            frameworkData
          )}/label-capture/get-started`,
        },
        {
          name: BarcodeScanning.BarcodeGenerator,
          text: "Generate Supported Symbologies",
          icon: <BarcodeGenerator />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BarcodeGenerator
          ),
          link:
            framework === "linux"
              ? "https://docs.scandit.com/stable/c_api/generator-settings-json.html"
              : `/sdks/${getFrameworkPath(frameworkData)}/barcode-generator`,
        },
      ],
    },
    {
      cards: [
        {
          name: BarcodeScanning.SparkScan,
          text: "High-speed Single Scanning",
          icon: <Sparkscan />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.SparkScan
          ),
          link: `/sdks/${getFrameworkPath(frameworkData)}/sparkscan/intro`,
        },
        {
          name: BarcodeScanning.MatrixScanFind,
          text: "AR-Enabled Search and Find",
          icon: <MsFind />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScanFind
          ),
          link: `/sdks/${getFrameworkPath(
            frameworkData
          )}/matrixscan-find/intro`,
        },
        {
          name: BarcodeScanning.MatrixScanCount,
          text: "Batch Scan and Count",
          icon: <MsCount />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScanCount
          ),
          link: `/sdks/${getFrameworkPath(
            frameworkData
          )}/matrixscan-count/intro`,
        },
        {
          name: BarcodeScanning.MatrixScanPick,
          text: "AR-Enabled Scan and Pick",
          icon: <MatrixScanPick />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScanPick
          ),
          link: `/sdks/${getFrameworkPath(
            frameworkData
          )}/matrixscan-pick/intro`,
        },
        {
          name: BarcodeScanning.BarcodeSelection,
          text: "Scan One-of-Many",
          icon: <BarcodeSelection />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BarcodeSelection
          ),
          link: `/sdks/${getFrameworkPath(
            frameworkData
          )}/barcode-selection/intro`,
        },
      ],
    },
    {
      groupName: "Data Capture App",
      cards: [
        {
          name: BarcodeScanning.ScanditExpress,
          text: "No-Code Scanning in Any App",
          icon: <Express />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.ScanditExpress
          ),
          link: `/hosted/express/overview`,
        },
      ],
    },
  ];

  return allCardsArray;
}
