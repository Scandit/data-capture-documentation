import { FrameworksName } from "../../constants/frameworksName";
import { FrameworkCardType } from "../../constants/types";
import style from "./CardAdditional.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";

interface CardAdditionalProps {
  framework: FrameworkCardType;
  handleFrameworkClick: () => void;
  setSelectedFramework: () => void;
  selectedFramework: string;
}

export default function CardAdditional({
  framework,
  handleFrameworkClick,
  setSelectedFramework,
  selectedFramework,
}: CardAdditionalProps) {
  function clickedFramework(e, framework: FrameworkCardType) {
    e.stopPropagation();
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?framework=${framework.framework.toString()}`
    );
    setSelectedFramework();
    handleFrameworkClick();
    localStorage.setItem("framework", framework.framework);
  }

  return (
    <BrowserOnly>
      {() => (
        <>
          <input
            className={style.input}
            value={framework.framework}
            type="radio"
            name="frameworkAdditional"
            id={framework.framework}
            onChange={(e) => clickedFramework(e, framework)}
            checked={framework.framework === selectedFramework}
          />
          <label
            htmlFor={framework.framework}
            className={`${style.iconWrapper} ${
              framework.framework === selectedFramework
                ? style.checkedFramework
                : ""
            }`}
          >
            {framework.icon}
            <span>
              {
                FrameworksName[
                  framework.framework as keyof typeof FrameworksName
                ]
              }
            </span>
          </label>
        </>
      )}
    </BrowserOnly>
  );
}
