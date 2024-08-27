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
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
      BarcodeScanning.BarcodeSelection,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
    ],
    IDScanning: [
      IDScanning.IdCapture,
      IDScanning.IdValidate,
      IDScanning.IdBolt,
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
      BarcodeScanning.BarcodeSelection,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
  },
  {
    framework: "cordova",
    icon: <ScanditCordova iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.BarcodeSelection,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
  },
  {
    framework: "xamarinParent",
    hasChildren: true,
    icon: <Xamarin iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.MatrixScan,
      BarcodeScanning.Parser,
      BarcodeScanning.SparkScan,
      BarcodeScanning.MatrixScanCount,
      BarcodeScanning.BarcodeSelection,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
        ],
        IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
        ],
        IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
      },
      {
        framework: "xamarin",
        icon: <Xamarin iconClass={style.iconStyle} />,
        link: "xamarin/forms",
        barcodeScanning: [
          BarcodeScanning.BarcodeCapture,
          BarcodeScanning.MatrixScan,
          BarcodeScanning.Parser,
          BarcodeScanning.SparkScan,
          BarcodeScanning.MatrixScanCount,
          BarcodeScanning.BarcodeSelection,
        ],
        IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
      BarcodeScanning.BarcodeSelection,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
  },
  {
    framework: "netParent",
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
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
          BarcodeScanning.BarcodeSelection,
        ],
        IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
          BarcodeScanning.BarcodeSelection,
        ],
        IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
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
      BarcodeScanning.BarcodeSelection,
    ],
    IDScanning: [IDScanning.IdCapture, IDScanning.IdValidate],
  },
  {
    framework: "titanium",
    icon: <TitaniumFramework iconClass={style.iconStyle} />,
    barcodeScanning: [BarcodeScanning.BarcodeCapture],
    IDScanning: [],
  },
  {
    framework: "linux",
    icon: <AntDesign iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.BarcodeCapture,
      BarcodeScanning.BarcodeGenerator,
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
