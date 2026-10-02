import style from "./Frameworks.module.css";
import { frameworkCards } from "../data/frameworkCardsArr";
import { FrameworkCard } from "./FrameworkCard";
import CardAdditional from "./CardAdditional";
import { FrameworkCardType } from "../../constants/types";
import { FRAMEWORK_STORAGE_KEY, emitFrameworkChange } from "../../utils/frameworks";
import { useEffect, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { pushHomepageFramework, resolveHomepageFramework } from "../data/resolveHomepageFramework";

interface FrameworksProps {
  handleFrameworkClick: () => void;
}

export default function Frameworks({ handleFrameworkClick }: FrameworksProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>("web");

  function clickedFramework(framework: FrameworkCardType) {
    if (ExecutionEnvironment.canUseDOM) {
      pushHomepageFramework(framework.framework);
      localStorage.setItem(FRAMEWORK_STORAGE_KEY, framework.framework);
      emitFrameworkChange(framework.framework);
    }
    setSelectedFramework(framework.framework);
    framework.framework !== "xamarin" &&
      framework.framework !== "net" &&
      handleFrameworkClick();
  }

  useEffect(() => {
    // The page this listener belongs to. popstate also fires when Back or
    // Forward LEAVES the home page, before it unmounts, and rewriting the URL
    // then would put ?framework= on the destination and drop its #hash.
    const homePath = ExecutionEnvironment.canUseDOM ? location.pathname : "";
    const updateSelectedFramework = () => {
      if (ExecutionEnvironment.canUseDOM && location.pathname === homePath) {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(location.search)
        );
        const frameworkFromURL = resolveHomepageFramework(
          paramsURL.framework || localStorage.getItem(FRAMEWORK_STORAGE_KEY),
        );
        // replaceState, not pushState: this runs on mount and on every
        // popstate, so pushing here added a history entry each time and Back
        // could never leave the page.
        window.history.replaceState(
          window.history.state,
          "",
          `${location.pathname}?framework=${frameworkFromURL}${location.hash}`,
        );
        setSelectedFramework(frameworkFromURL);
        emitFrameworkChange(frameworkFromURL);
      }
    };
    updateSelectedFramework();
    window.addEventListener("popstate", updateSelectedFramework);
    return () => {
      window.removeEventListener("popstate", updateSelectedFramework);
    };
  }, []);

  return (
    <div>
      <h4 className={style.text}>
        Select Your Framework to View Supported Products and Features
      </h4>
      <form className={style.iconList}>
        {frameworkCards.map((item) => {
          return (
            <div
              onClick={(e) => {
                // A click on a .NET / Xamarin child option bubbles up here
                // before the child's own onChange runs. Let the child handle
                // it: selecting the parent first would push ?framework=net
                // and then ?framework=netAndroid, two entries for one click.
                if ((e.target as HTMLElement).closest("[data-additional-frameworks]")) return;
                clickedFramework(item);
              }}
              key={item.framework}
              className={style.frameworkCardWrapper}
              data-value={item.framework}
            >
              <FrameworkCard
                handleFrameworkClick={handleFrameworkClick}
                framework={item}
                hasAdditional={item.additional ? true : false}
              />
              {item.additional &&
                (selectedFramework === item.framework ||
                  selectedFramework.startsWith(item.framework)) && (
                  <div className={style.additionalFrameworks} data-additional-frameworks>
                    {item.additional.map((unit) => {
                      return (
                        <CardAdditional
                          handleFrameworkClick={handleFrameworkClick}
                          key={unit.framework}
                          framework={unit}
                          selectedFramework={selectedFramework}
                          setSelectedFramework={() =>
                            setSelectedFramework(unit.framework)
                          }
                        />
                      );
                    })}
                  </div>
                )}
            </div>
          );
        })}
      </form>
    </div>
  );
}
