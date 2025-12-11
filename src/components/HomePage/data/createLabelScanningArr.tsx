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
    // If path starts with a version (e.g., "/7.6.5/"), use it as-is
    if (path && path.startsWith('/')) {
      return `${path}${basePath}`;
    }
    // Otherwise prepend /sdks/
    return `/sdks/${path}${basePath}`;
  }

  const allCardsArray = [
    {
      name: LabelScanning.LabelScanning,
      text: "Capture Multiple Barcodes and Text from Labels",
      icon: <LabelCapture />,
      isActive: frameworkData?.labelScanning?.includes(
        LabelScanning.LabelScanning
      ),
      link: buildLink('/label-capture/intro'),
    },
  ];

  return allCardsArray;
}

