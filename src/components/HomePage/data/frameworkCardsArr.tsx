import {
  AntDesign,
  JavascriptFramework,
  Net,
  NetAndroid,
  NetIos,
  ScanditAndroid,
  ScanditCapacitor,
  ScanditCordova,
  ScanditFlutter,
  ScanditIOS,
  ScanditReact,
  TitaniumFramework,
  Xamarin,
  XamarinAndroidFramework,
  XamarinIosFramework,
} from "../../IconComponents";
import style from "../Frameworks/FrameworkCard.module.css";
import { BarcodeScanning, IDScanning } from "../../constants/scanningEnums";

//the framework name in this array is used exactly as it appears in the FrameworksName enum
//The framework key of the object in the frameworkCards array is also used to form the link.

export const frameworkCards = [
  {
    framework: "ios",
    icon: <ScanditIOS iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.LabelCapture,
      BarcodeScanning.BarcodeGenerator,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.ScanditExpress,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "android",
    icon: <ScanditAndroid iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.LabelCapture,
      BarcodeScanning.BarcodeGenerator,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.ScanditExpress,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "web",
    icon: <JavascriptFramework iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IdBolt,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "react",
    icon: <ScanditReact iconClass={style.iconStyle} />,
    link: "react-native",
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.LabelCapture,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "cordova",
    icon: <ScanditCordova iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.BarcodeGenerator,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "xamarin",
    hasChildren: true,
    icon: <Xamarin iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
    additional: [
      {
        framework: "xamarinIos",
        icon: <XamarinIosFramework iconClass={style.iconStyle} />,
        link: "xamarin/ios",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.BarcodeSelection,
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [
          IDScanning.IdCapture,
          IDScanning.IdValidate,
          IDScanning.IDCaptureValidation,
        ],
      },
      {
        framework: "xamarinAndroid",
        icon: <XamarinAndroidFramework iconClass={style.iconStyle} />,
        link: "xamarin/android",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.BarcodeSelection,
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [
          IDScanning.IdCapture,
          IDScanning.IdValidate,
          IDScanning.IDCaptureValidation,
        ],
      },
      {
        framework: "xamarinForms",
        icon: <Xamarin iconClass={style.iconStyle} />,
        link: "xamarin/forms",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.BarcodeSelection,
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [
          IDScanning.IdCapture,
          IDScanning.IdValidate,
          IDScanning.IDCaptureValidation,
        ],
      },
    ],
  },
  {
    framework: "flutter",
    icon: <ScanditFlutter iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "net",
    hasChildren: true,
    icon: <Net iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
    additional: [
      {
        framework: "netIos",
        icon: <NetIos iconClass={style.iconStyle} />,
        link: "net/ios",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanFind,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.MatrixScanPick,
          BarcodeScanning.BarcodeSelection,
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [
          IDScanning.IdCapture,
          IDScanning.IdValidate,
          IDScanning.IDCaptureValidation,
        ],
      },
      {
        framework: "netAndroid",
        icon: <NetAndroid iconClass={style.iconStyle} />,
        link: "net/android",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanFind,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.MatrixScanPick,
          BarcodeScanning.BarcodeSelection,
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [
          IDScanning.IdCapture,
          IDScanning.IdValidate,
          IDScanning.IDCaptureValidation,
        ],
      },
    ],
  },
  {
    framework: "capacitor",
    icon: <ScanditCapacitor iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanFind,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.MatrixScanPick,
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.BarcodeGenerator,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IDCaptureValidation,
    ],
  },
  {
    framework: "titanium",
    icon: <TitaniumFramework iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [],
  },
  {
    framework: "linux",
    icon: <AntDesign iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.BarcodeGenerator,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [],
  },
];

function frameworksEmbedded() {
  const embeddedFrameworks = frameworkCards
    .filter((framework) => framework?.additional)
    .map((framework) => framework.framework);

  return embeddedFrameworks.length > 0 ? embeddedFrameworks : [];
}
export const embeddedFrameworks = frameworksEmbedded();
