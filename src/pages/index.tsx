import { useEffect, useState } from "react";
import CardsPart from "../components/HomePage/CardsPart/CardsPart";
import DataCapture from "../components/HomePage/DataCapture/DataCapture";
import Footer from "../components/HomePage/Footer/Footer";
import FrameworkExplore from "../components/HomePage/FrameworkExplore/FrameworkExplore";
import Frameworks from "../components/HomePage/Frameworks/Frameworks";
import Header from "../components/HomePage/Header/Header";
import Slogan from "../components/HomePage/Slogan/Slogan";
import style from "./index.module.css";
import localStorageUtil from "../components/utils/localStorageUtil";
import FrameworksMobile from "../components/HomePage/Frameworks/FrameworksMobile";

export interface Framework {
  frameworkParent: string;
  framework: string;
}

export default function HomePage() {
  const framework = localStorageUtil.getItem("selectedFramework");
  const [selectedFramework, setSelectedFramework] = useState<Framework>({
    frameworkParent: framework?.frameworkParent || "ios",
    framework: framework?.framework || "ios",
  });
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const storedFramework = localStorageUtil.getItem("selectedFramework");
    if (storedFramework) {
      setSelectedFramework({
        frameworkParent: storedFramework.frameworkParent || "ios",
        framework:
          storedFramework.framework || storedFramework.frameworkParent || "ios",
      });
    }
  }, []);

  // Simulates a fake page reload by briefly flashing the content
  const handleFrameworkClick = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 100);
  };

  return (
    <div className={style.homeWrapper}>
      <Header></Header>
      <div className={`${style.body} ${isFlashing ? style.flash : ""}`}>
        <Slogan></Slogan>

        <div className={style.frameworksMobile}>
          <FrameworksMobile
            setSelectedFramework={setSelectedFramework}
            selectedFramework={selectedFramework}
          ></FrameworksMobile>
        </div>

        <div className={style.frameworksDesktop}>
          <Frameworks
            setSelectedFramework={setSelectedFramework}
            selectedFramework={selectedFramework}
            handleFrameworkClick={handleFrameworkClick}
          ></Frameworks>
        </div>

        <CardsPart selectedFramework={selectedFramework}></CardsPart>
        <DataCapture></DataCapture>
        <FrameworkExplore></FrameworkExplore>
      </div>
      <Footer></Footer>
    </div>
  );
}
