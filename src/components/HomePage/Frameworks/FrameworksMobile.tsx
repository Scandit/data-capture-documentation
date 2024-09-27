import BrowserOnly from "@docusaurus/BrowserOnly";
import { useEffect, useRef, useState } from "react";
import style from "./FrameworksMobile.module.css";
import { frameworkCards } from "../data/frameworkCardsArr";
import { FrameworksName } from "../../constants/frameworksName";
import localStorageUtil from "../../utils/localStorageUtil";
import { ArrowDown } from "../../IconComponents";

interface FrameworksMobileProps {
  handleFrameworkClick: () => void;
}

export default function FrameworksMobile({
  handleFrameworkClick,
}: FrameworksMobileProps) {
  const [openSelector, setOpenSelector] = useState(false);
  const menuRef = useRef<HTMLFormElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const paramsURL = Object.fromEntries(new URLSearchParams(location.search));
  const selectedFramework = paramsURL.framework || "ios";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        setOpenSelector(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function selectFramework(framework: string) {
    window.history.pushState({}, "", `?framework=${framework}`);
    framework !== "net" && framework !== "xamarin" && handleFrameworkClick();
  }

  function clickedFramework(e) {
    if (
      e.target.value &&
      e.target.value !== "net" &&
      e.target.value !== "xamarin"
    ) {
      setOpenSelector(false);
    }
  }

  return (
    <>
      <h4 className={style.text}>
        Select your framework to view supported products and features
      </h4>
      <BrowserOnly>
        {() => (
          <div className={style.frameworksMobile}>
            <div
              className={style.field}
              onClick={() => setOpenSelector(!openSelector)}
              ref={fieldRef}
            >
              {FrameworksName[
                selectedFramework as keyof typeof FrameworksName
              ] || "Select framework"}

              <span
                className={`${openSelector ? style.open : style.fieldIcon}`}
              >
                <ArrowDown />
              </span>
            </div>
            {openSelector && (
              <form className={style.optionsMain} ref={menuRef}>
                {frameworkCards.map((item) => (
                  <div
                    key={item.framework}
                    onClick={(e) => clickedFramework(e)}
                  >
                    <input
                      className={style.input}
                      value={item.framework}
                      type="radio"
                      name="framework"
                      id={item.framework}
                      onChange={(e) => selectFramework(item.framework)}
                      checked={
                        item.framework === selectedFramework ||
                        item.framework === selectedFramework
                      }
                    />
                    <label
                      htmlFor={item.framework}
                      className={`${style.iconWrapper} ${
                        item.framework === selectedFramework
                          ? style.checkedFramework
                          : ""
                      }`}
                    >
                      <span className={style.optionsIcon}>{item.icon}</span>
                      <span>
                        {
                          FrameworksName[
                            item.framework as keyof typeof FrameworksName
                          ]
                        }
                      </span>
                    </label>
                    {item.additional && (
                      <ul>
                        {item.additional.map((additionalItem) => (
                          <li
                            key={additionalItem.framework}
                            className={style.additionalFrameworks}
                          >
                            <input
                              className={style.input}
                              value={additionalItem.framework}
                              type="radio"
                              name="framework"
                              id={additionalItem.framework}
                              onChange={(e) =>
                                selectFramework(additionalItem.framework)
                              }
                              checked={
                                additionalItem.framework === selectedFramework
                              }
                            />
                            <label
                              htmlFor={additionalItem.framework}
                              className={`${style.iconWrapper} ${
                                additionalItem.framework === selectedFramework
                                  ? style.checkedFramework
                                  : ""
                              }`}
                            >
                              <span className={style.optionsIcon}>
                                {additionalItem.icon}
                              </span>
                              <span className={style.titleLabelHover}>
                                {
                                  FrameworksName[
                                    additionalItem.framework as keyof typeof FrameworksName
                                  ]
                                }
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </form>
            )}
          </div>
        )}
      </BrowserOnly>
    </>
  );
}
