import CardsGroup from "../CardsGroup/CardsGroup";
import style from "./CardsPart.module.css";
import { createBarcodeScanningArr } from "../data/createBarcodeScanningArr";
import { createLabelScanningArr } from "../data/createLabelScanningArr";
import { createIdScanningArr } from "../data/createIdScanningArr";
import { createNoCodeArr } from "../data/createNoCodeArr";
import { FrameworksName } from "../../constants/frameworksName";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useEffect, useReducer } from "react";
import { resolveHomepageFramework } from "../data/resolveHomepageFramework";
import { frameworkCards } from "../data/frameworkCardsArr";
import { FRAMEWORK_CHANGE_EVENT } from "../../utils/frameworks";

export default function CardsPart() {
  // The cards are read from ?framework= at render time, and the framework
  // pickers change it with history.pushState, which doesn't re-render this
  // component. Picking .NET or Xamarin (which skip the page flash) or pressing
  // Back left the cards showing another framework. The pickers announce every
  // change, Back and Forward included, with FRAMEWORK_CHANGE_EVENT.
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    window.addEventListener(FRAMEWORK_CHANGE_EVENT, rerender);
    // The pickers' own mount effects run first and may already have rewritten
    // ?framework= (from localStorage) before this listener existed.
    rerender();
    return () => window.removeEventListener(FRAMEWORK_CHANGE_EVENT, rerender);
  }, []);

  return (
    <BrowserOnly>
      {() => {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(window.location.search)
        );
        const selectedFramework = resolveHomepageFramework(paramsURL.framework);

        // .NET and Xamarin are groups, not frameworks: their docs live under
        // each platform (/sdks/net/ios/, /sdks/net/android/). Product cards
        // built for the group itself all linked to /sdks/net/<product>/, which
        // doesn't exist. Ask for the platform first.
        const parentCard = frameworkCards.find(
          (card) => card.framework === selectedFramework && card.hasChildren,
        );
        if (parentCard) {
          const platforms = (parentCard.additional || []).map(
            (child) => FrameworksName[child.framework],
          );
          // "A or B", "A, B or C"
          const choice =
            platforms.length > 1
              ? `${platforms.slice(0, -1).join(", ")} or ${platforms[platforms.length - 1]}`
              : platforms[0] ?? "a platform";
          return (
            <p className={style.choosePlatform}>
              Choose {choice} above to see its products.
            </p>
          );
        }

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
