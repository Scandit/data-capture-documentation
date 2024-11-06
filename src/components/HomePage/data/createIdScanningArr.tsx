import { Bolt, IDValidate, IdCapture } from "../../IconComponents";
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
  return [
    {
      name: IDScanning.IDCaptureValidation,
      text: "Capture and Validate ID Data in One Step",
      icon: <IDValidate />,
      isActive: frameworkData.IDScanning.includes(
        IDScanning.IDCaptureValidation
      ),
      link: `/sdks/${getFrameworkPath(frameworkData)}/id-capture/intro`,
    },
    {
      name: IDScanning.IdBolt,
      text: "Add ID Scanning to Any Site",
      icon: <Bolt />,
      isActive: frameworkData.IDScanning.includes(IDScanning.IdBolt),
      link: `/hosted/id-bolt/overview`,
    },
  ];
}
