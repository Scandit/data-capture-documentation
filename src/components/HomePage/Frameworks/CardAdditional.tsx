import { FrameworksName } from "../../constants/frameworksName";
import { FrameworkCardType } from "../../constants/types";
import style from "./CardAdditional.module.css";

export default function CardAdditional({ framework, handleFrameworkClick }) {
  const paramsURL = Object.fromEntries(new URLSearchParams(location.search));
  const frameworkFromURL = paramsURL.framework || "ios";

  function clickedFramework(e, framework: FrameworkCardType) {
    e.stopPropagation();
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?framework=${framework.framework.toString()}`
    );
    handleFrameworkClick();
  }

  return (
    <>
      <input
        className={style.input}
        value={framework.framework}
        type="radio"
        name="frameworkAdditional"
        id={framework.framework}
        onChange={(e) => clickedFramework(e, framework)}
        checked={framework.framework === frameworkFromURL}
      />
      <label
        htmlFor={framework.framework}
        className={`${style.iconWrapper} ${
          framework.framework === frameworkFromURL ? style.checkedFramework : ""
        }`}
      >
        {framework.icon}
        <span>
          {FrameworksName[framework.framework as keyof typeof FrameworksName]}
        </span>
      </label>
    </>
  );
}
