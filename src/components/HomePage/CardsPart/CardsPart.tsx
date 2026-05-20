import CardsGroup from "../CardsGroup/CardsGroup";
import style from "./CardsPart.module.css";
import { createBarcodeScanningArr } from "../data/createBarcodeScanningArr";
import { createLabelScanningArr } from "../data/createLabelScanningArr";
import { createIdScanningArr } from "../data/createIdScanningArr";
import { createNoCodeArr } from "../data/createNoCodeArr";
import { FrameworksName } from "../../constants/frameworksName";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function CardsPart() {
  return (
    <BrowserOnly>
      {() => {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(window.location.search)
        );
        const selectedFramework = paramsURL.framework || "web";

        const barcodeScanning = createBarcodeScanningArr(selectedFramework);
        const labelScanning = createLabelScanningArr(selectedFramework);
        const idScanning = createIdScanningArr(selectedFramework);
        const noCode = createNoCodeArr(selectedFramework);

        return (
          <div className={style.cardsPartWrapper}>
            <div className={style.cardsGroupWrapper}>
              <CardsGroup
                title={`Barcode Scanning for ${FrameworksName[selectedFramework]}`}
                content={barcodeScanning}
                mainColor="var(--barcode-scanning-color)"
                cardColor="var(--barcode-scanning-gradient)"
              />
            </div>
            <div className={style.cardsRow}>
              <div className={style.cardsGroupHalf}>
                <CardsGroup
                  title={`ID Scanning for ${FrameworksName[selectedFramework]}`}
                  content={idScanning}
                  mainColor="var(--barcode-scanning-color)"
                  cardColor="var(--barcode-scanning-gradient)"
                />
              </div>
              <div className={style.cardsGroupHalf}>
                <CardsGroup
                  title={`Label Scanning for ${FrameworksName[selectedFramework]}`}
                  content={labelScanning}
                  mainColor="var(--barcode-scanning-color)"
                  cardColor="var(--barcode-scanning-gradient)"
                />
              </div>
            </div>
            <div className={style.cardsGroupWrapper}>
              <CardsGroup
                title="Plug & Play Solutions"
                content={noCode}
                mainColor="var(--IDScanningColor)"
                cardColor="var(--id-scanning-gradient)"
              />
            </div>
          </div>
        );
      }}
    </BrowserOnly>
  );
}
