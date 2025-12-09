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
import { BarcodeScanning, IDScanning, LabelScanning } from "../../constants/scanningEnums";

//the framework name in this array is used exactly as it appears in the FrameworksName enum
//The framework key of the object in the frameworkCards array is also used to form the link.

export const frameworkCards = [
  {
    framework: "ios",
    icon: <ScanditIOS iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.ScanditExpress,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "android",
    icon: <ScanditAndroid iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.ScanditExpress,
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "web",
    icon: <JavascriptFramework iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "react",
    icon: <ScanditReact iconClass={style.iconStyle} />,
    link: "react-native",
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "cordova",
    icon: <ScanditCordova iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
  },
  {
    framework: "xamarin",
    hasChildren: true,
    icon: <Xamarin iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    additional: [
      {
        framework: "xamarinIos",
        icon: <XamarinIosFramework iconClass={style.iconStyle} />,
        link: "/7.6.5/sdks/xamarin/ios",
        barcodeScanning: [
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
      },
      {
        framework: "xamarinAndroid",
        icon: <XamarinAndroidFramework iconClass={style.iconStyle} />,
        link: "/7.6.5/sdks/xamarin/android",
        barcodeScanning: [
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
      },
      {
        framework: "xamarinForms",
        icon: <Xamarin iconClass={style.iconStyle} />,
        link: "/7.6.5/sdks/xamarin/forms",
        barcodeScanning: [
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
      },
    ],
  },
  {
    framework: "flutter",
    icon: <ScanditFlutter iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "net",
    hasChildren: true,
    icon: <Net iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    additional: [
      {
        framework: "netIos",
        icon: <NetIos iconClass={style.iconStyle} />,
        link: "net/ios",
        barcodeScanning: [
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
      },
      {
        framework: "netAndroid",
        icon: <NetAndroid iconClass={style.iconStyle} />,
        link: "net/android",
        barcodeScanning: [
          BarcodeScanning.SingleScanning,
          BarcodeScanning.BatchScanning,
          BarcodeScanning.ScanditExpress,
        ],
        IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
      },
    ],
  },
  {
    framework: "capacitor",
    icon: <ScanditCapacitor iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt, IDScanning.IDCaptureValidation],
    labelScanning: [LabelScanning.LabelScanning],
  },
  {
    framework: "titanium",
    icon: <TitaniumFramework iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.ScanditExpress,
    ],
    IDScanning: [IDScanning.IdBolt],
  },
  {
    framework: "linux",
    icon: <AntDesign iconClass={style.iconStyle} />,
    barcodeScanning: [
      BarcodeScanning.SingleScanning,
      BarcodeScanning.BatchScanning,
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
