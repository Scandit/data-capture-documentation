import IdCapture from "../../IconComponents/IdCapture";
import { BarcodeScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import {
  BarcodeCapture,
  BarcodeSelection,
  Express,
  LabelCapture,
  Ms,
  MsCount,
  MsFind,
  Parser,
  Sparkscan,
} from "../../IconComponents";

export function createBarcodeScanningArr(framework: string, allCards: boolean) {
  function findFrameworkData() {
    const frameworkData = frameworkCards.find(
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

  const hiddenList = [
    BarcodeScanning.ScanditExpress,
    BarcodeScanning.Parser,
    BarcodeScanning.LabelCapture,
    BarcodeScanning.BarcodeGenerator,
    BarcodeScanning.BarcodeSelection,
  ];

  const allCardsArray = [
    {
      groupName: "Low-level APIs",
      cards: [
        {
          name: BarcodeScanning.BarcodeCapture,
          text: "Single Scanning",
          icon: <BarcodeCapture />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BarcodeCapture
          ),
          link: `/sdks/${framework}/barcode-capture/get-started`,
        },
        {
          name: BarcodeScanning.MatrixScan,
          text: "Multi-Scanning and Tracking",
          icon: <Ms />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScan
          ),
          link: `/sdks/${framework}/matrixscan/intro`,
        },
        {
          name: BarcodeScanning.Parser,
          text: "Parse Barcode Data",
          icon: <Parser />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.Parser
          ),
          link: `/`,
        },
        {
          name: BarcodeScanning.LabelCapture,
          text: "Scan Barcodes and Text",
          icon: <LabelCapture />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.LabelCapture
          ),
          link: `/`,
        },
        {
          name: BarcodeScanning.BarcodeGenerator,
          text: "Generate Supported Symbologies",
          icon: <Parser />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BarcodeGenerator
          ),
          link: `/`,
        },
      ],
    },
    {
      groupName: "Pre-built UI components",
      cards: [
        {
          name: BarcodeScanning.SparkScan,
          text: "High-speed Single Scanning",
          icon: <Sparkscan />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.SparkScan
          ),
          link: `/sdks/${framework}/sparkscan/intro`,
        },
        {
          name: BarcodeScanning.MatrixScanFind,
          text: "AR-Enabled Search and Find",
          icon: <MsFind />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScanFind
          ),
          link: `/sdks/${framework}/matrixscan-find/intro`,
        },
        {
          name: BarcodeScanning.MatrixScanCount,
          text: "Batch Scan and Count",
          icon: <MsCount />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.MatrixScanCount
          ),
          link: `/sdks/${framework}/matrixscan-count/intro`,
        },
        {
          name: BarcodeScanning.BarcodeSelection,
          text: "Scan One-of-Many",
          icon: <BarcodeSelection />,
          isActive: frameworkData?.barcodeScanning.includes(
            BarcodeScanning.BarcodeSelection
          ),
          link: `/sdks/${framework}/barcode-selection/intro`,
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

  if (allCards) {
    return allCardsArray;
  }

  return allCardsArray.map(group => ({
    ...group,
    cards: group.cards.filter(card => !hiddenList.includes(card.name)),
  }));
}
