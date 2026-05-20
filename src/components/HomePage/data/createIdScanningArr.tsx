import { IDValidate } from "../../IconComponents";
import { frameworkCards } from "./frameworkCardsArr";
import { IDScanning } from "../../constants/scanningEnums";
import { FrameworkCardType } from "../../constants/types";

export function createIdScanningArr(framework: string) {
  function findFrameworkData() {
    const frameworkData = frameworkCards.find(
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
      name: IDScanning.IDCaptureValidation,
      text: "Extract data from 2,500+ IDs and run authenticity checks",
      apis: "ID Capture",
      icon: <IDValidate />,
      isActive: frameworkData.IDScanning.includes(
        IDScanning.IDCaptureValidation
      ),
      link: buildLink('/id-capture/intro'),
    },
  ];
}
