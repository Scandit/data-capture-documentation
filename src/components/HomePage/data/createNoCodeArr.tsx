import { BarcodeScanning, IDScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { Bolt, Express } from "../../IconComponents";
import { FrameworkCardType } from "../../constants/types";

export function createNoCodeArr(framework: string) {
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

  return [
    {
      name: "ID Bolt",
      text: "A pre-built web component that adds compliant passport, visa, and ID scanning to any website",
      icon: <Bolt />,
      isActive: frameworkData?.IDScanning?.includes(IDScanning.IdBolt),
      link: `/hosted/id-bolt/overview`,
    },
    {
      name: "Scandit Express",
      text: "A turnkey app that brings barcode, label, and ID scanning to your workflows — no code required",
      icon: <Express />,
      isActive: frameworkData?.barcodeScanning.includes(
        BarcodeScanning.ScanditExpress
      ),
      link: `/hosted/express/overview`,
    },
  ];
}
