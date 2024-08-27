import { ArrowDropDown } from "../../IconComponents";
import { FrameworksName } from "../../constants/frameworksName";
import style from "./FrameworkCard.module.css";

export function FrameworkCard({
  framework,
  selectedFramework,
  setSelectedFramework,
  hasAdditional = false,
  handleFrameworkClick,
}) {
  function selectFramework(e: React.ChangeEvent<HTMLInputElement>) {
    const formData = new FormData(e.target.form);
    const frameworkValue = formData.get("framework");
    setSelectedFramework((prevState) => ({
      ...prevState,
      framework: hasAdditional ? prevState.framework : frameworkValue,
      frameworkParent: frameworkValue,
    }));
    !hasAdditional && handleFrameworkClick();
  }

  const isSelected = framework.framework === selectedFramework.frameworkParent;  

  return (
    <>
      <input
        className={style.input}
        value={framework.framework}
        type="radio"
        name="framework"
        id={framework.framework}
        onChange={selectFramework}
        checked={framework.framework === selectedFramework.frameworkParent}
      />
      <label
        htmlFor={framework.framework}
        className={`${style.iconWrapper} ${
          framework.framework === selectedFramework.frameworkParent
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
