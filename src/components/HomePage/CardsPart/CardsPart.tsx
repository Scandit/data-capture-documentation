import CardsGroup from "../CardsGroup/CardsGroup";
import style from "./CardsPart.module.css";
import { createBarcodeScanningArr } from "../data/createBarcodeScanningArr";
import { createIdScanningArr } from "../data/createIdScanningArr";
import { ArrowDropDown } from "../../IconComponents";
import { useState } from "react";
import { FrameworksName } from "../../constants/frameworksName";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function CardsPart() {
  const [allCards, setAllCards] = useState(false);

  const transformFrameworkName = (framework: string): string => {
    const frameworkUrls: { [key: string]: string } = {
      react: "sdks/react-native/add-sdk",
      linux: "https://docs.scandit.com/stable/c_api/index.html",
      netIos: "sdks/net/ios/add-sdk",
      netAndroid: "sdks/net/android/add-sdk",
      xamarinIos: "sdks/xamarin/ios/add-sdk",
      xamarinAndroid: "sdks/xamarin/android/add-sdk",
      xamarin: "sdks/xamarin/forms/add-sdk",
    };

    return frameworkUrls[framework] || `sdks/${framework}/add-sdk`;
  };

  return (
    <BrowserOnly>
      {() => {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(window.location.search)
        );
        const selectedFramework = paramsURL.framework || "ios";

        const barcodeScanning = createBarcodeScanningArr(
          selectedFramework,
          allCards
        );
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
              <button
                className={style.hiddenBtn}
                onClick={() => setAllCards(!allCards)}
              >
                {allCards ? "Show less" : "Show more functionality"}
                <ArrowDropDown
                  iconClass={allCards ? style.reversIcon : style.icon}
                />
              </button>
            </div>
            <div className={style.cardsGroupWrapper}>
              <CardsGroup
                title={`ID Scanning for ${FrameworksName[selectedFramework]}`}
                content={idScanning}
                mainColor="var(--IDScanningColor)"
                cardColor="var(--id-scanning-gradient)"
                linkStarted={`${transformFrameworkName(selectedFramework)}`}
              />
            </div>
          </div>
        );
      }}
    </BrowserOnly>
  );
}
