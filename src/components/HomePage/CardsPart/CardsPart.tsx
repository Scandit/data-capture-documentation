import CardsGroup from "../CardsGroup/CardsGroup";
import style from "./CardsPart.module.css";
import { createBarcodeScanningArr } from "../data/createBarcodeScanningArr";
import { createIdScanningArr } from "../data/createIdScanningArr";
import { FrameworksName } from "../../constants/frameworksName";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function CardsPart() {
  const transformFrameworkName = (framework: string): string => {
    const frameworkUrls: { [key: string]: string } = {
      react: "sdks/react-native/add-sdk",
      netIos: "sdks/net/ios/add-sdk",
      netAndroid: "sdks/net/android/add-sdk",
      xamarinIos: "/7.6.6/sdks/xamarin/ios/add-sdk",
      xamarinAndroid: "/7.6.6/sdks/xamarin/android/add-sdk",
      xamarinForms: "/7.6.6/sdks/xamarin/forms/add-sdk",
      web: "sdks/web/getting-started",
      capacitor: "sdks/capacitor/getting-started",
    };

    return frameworkUrls[framework] || `sdks/${framework}/add-sdk`;
  };

  const transformFrameworkNameId = (framework: string): string => {
    const frameworkUrls: { [key: string]: string } = {
      react: "sdks/react-native/id-capture/get-started/",
      netIos: "sdks/net/ios/id-capture/get-started/",
      netAndroid: "sdks/net/id-capture/get-started/",
      xamarinIos: "/7.6.6/sdks/xamarin/id-capture/get-started/",
      xamarinAndroid: "/7.6.6/sdks/xamarin/android/id-capture/get-started/",
      xamarinForms: "/7.6.6/sdks/xamarin/forms/id-capture/get-started/",
    };

    return frameworkUrls[framework] || `sdks/${framework}/id-capture/get-started/`;
  };

  return (
    <BrowserOnly>
      {() => {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(window.location.search)
        );
        const selectedFramework = paramsURL.framework || "web";

        const barcodeScanning = createBarcodeScanningArr(selectedFramework);
        const idScanning = createIdScanningArr(selectedFramework);

        return (
          <div className={style.cardsPartWrapper}>
            <div className={style.cardsGroupWrapper}>
              <CardsGroup
                title={`Barcode Scanning for ${FrameworksName[selectedFramework]}`}
                content={barcodeScanning}
                mainColor="var(--barcode-scanning-color)"
                cardColor="var(--barcode-scanning-gradient)"
                linkStarted={`${transformFrameworkName(selectedFramework)}`}
              />
            </div>
            <div className={style.cardsGroupWrapper}>
              <CardsGroup
                title={`ID Scanning for ${FrameworksName[selectedFramework]}`}
                content={idScanning}
                mainColor="var(--IDScanningColor)"
                cardColor="var(--id-scanning-gradient)"
                linkStarted={`${transformFrameworkNameId(selectedFramework)}`}
              />
            </div>
          </div>
        );
      }}
    </BrowserOnly>
  );
}
