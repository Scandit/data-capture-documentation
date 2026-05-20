import { LabelScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { LabelCapture } from "../../IconComponents";
import { FrameworkCardType } from "../../constants/types";

export function createLabelScanningArr(framework: string) {
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

  function buildLink(basePath: string): string {
    const path = getFrameworkPath(frameworkData);
    if (path && path.startsWith('/')) {
      return `${path}${basePath}`;
    }
    return `/sdks/${path}${basePath}`;
  }

  return [
    {
      name: LabelScanning.LabelScanning,
      text: "Capture expiry dates, prices, weights, VIN, IMEI, or serial numbers",
      apis: "Smart Label Capture",
      icon: <LabelCapture />,
      isActive: frameworkData?.labelScanning?.includes(
        LabelScanning.LabelScanning
      ),
      link: buildLink('/label-capture/intro'),
    },
  ];
}
