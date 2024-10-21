import style from "./Frameworks.module.css";
import { frameworkCards } from "../data/frameworkCardsArr";
import { FrameworkCard } from "./FrameworkCard";
import CardAdditional from "./CardAdditional";
import { FrameworkCardType } from "../../constants/types";
import { useEffect, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

interface FrameworksProps {
  handleFrameworkClick: () => void;
}

export default function Frameworks({ handleFrameworkClick }: FrameworksProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>("web");

  function clickedFramework(framework: FrameworkCardType) {
    if (ExecutionEnvironment.canUseDOM) {
      window.history.pushState({}, "", `?framework=${framework.framework}`);
      localStorage.setItem("framework", framework.framework);
    }
    setSelectedFramework(framework.framework);
    framework.framework !== "xamarin" &&
      framework.framework !== "net" &&
      handleFrameworkClick();
  }

  useEffect(() => {
    const updateSelectedFramework = () => {
      if (ExecutionEnvironment.canUseDOM) {
        const paramsURL = Object.fromEntries(
          new URLSearchParams(location.search)
        );
        const frameworkFromURL =
          paramsURL.framework || localStorage.getItem("framework") || "web";
        window.history.pushState(
          {},
          "",
          `?framework=${
            new URLSearchParams(location.search).get("framework") ||
            localStorage.getItem("framework") ||
            "web"
          }`
        );
        setSelectedFramework(frameworkFromURL);
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
              onClick={(e) => clickedFramework(item)}
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
                  <div className={style.additionalFrameworks}>
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
