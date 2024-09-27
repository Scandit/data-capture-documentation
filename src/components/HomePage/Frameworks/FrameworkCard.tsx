import { ArrowDropDown } from "../../IconComponents";
import { FrameworksName } from "../../constants/frameworksName";
import style from "./FrameworkCard.module.css";

export function FrameworkCard({
  framework,
  hasAdditional = false,
  handleFrameworkClick,
}) {
  function selectFramework(e: React.ChangeEvent<HTMLInputElement>) {
    const formData = new FormData(e.target.form);
    const frameworkValue = formData.get("framework");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?framework=${frameworkValue.toString()}`
    );
    !hasAdditional && handleFrameworkClick();
  }

  const paramsURL = Object.fromEntries(new URLSearchParams(location.search));
  const selectedFramework = paramsURL.framework || "ios";
  const isSelected = framework.framework === selectedFramework;

  return (
    <>
      <input
        className={style.input}
        value={framework.framework}
        type="radio"
        name="framework"
        id={framework.framework}
        onChange={selectFramework}
        checked={
          selectedFramework.startsWith(framework.framework) ||
          framework.framework === selectedFramework
        }
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
        {(!isSelected || !hasAdditional) && (
          <span className={style.titleLabelHover}>
            {FrameworksName[framework.framework as keyof typeof FrameworksName]}
          </span>
        )}

        {hasAdditional && (
          <span className={style.iconDropDown}>
            <ArrowDropDown iconClass={style.icon} />
          </span>
        )}
      </label>
    </>
  );
}
