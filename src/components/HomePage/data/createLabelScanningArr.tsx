import { LabelScanning } from "../../constants/scanningEnums";
import { frameworkCards } from "./frameworkCardsArr";
import { LabelCapture } from "../../IconComponents";
import { FrameworkCardType } from "../../constants/types";

export function createLabelScanningArr(framework: string) {
  function findFrameworkData(): FrameworkCardType | undefined {
    return (
      frameworkCards.find((item) => item.framework === framework) ??
      frameworkCards
        .flatMap((item) => item.additional ?? [])
        .find((item) => item.framework === framework)
    );
  }

  const frameworkData = findFrameworkData();

  function getFrameworkPath(frameworkData: FrameworkCardType | undefined): string {
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
      ) ?? false,
      link: buildLink('/label-capture/intro'),
    },
  ];
}
