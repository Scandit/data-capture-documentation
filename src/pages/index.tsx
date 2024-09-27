import { useState } from "react";
import CardsPart from "../components/HomePage/CardsPart/CardsPart";
import DataCapture from "../components/HomePage/DataCapture/DataCapture";
import Footer from "../components/HomePage/Footer/Footer";
import FrameworkExplore from "../components/HomePage/FrameworkExplore/FrameworkExplore";
import Frameworks from "../components/HomePage/Frameworks/Frameworks";
import Header from "../components/HomePage/Header/Header";
import Slogan from "../components/HomePage/Slogan/Slogan";
import style from "./index.module.css";
import FrameworksMobile from "../components/HomePage/Frameworks/FrameworksMobile";


export default function HomePage() {
  const [isFlashing, setIsFlashing] = useState(false);
 
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
          <FrameworksMobile handleFrameworkClick={handleFrameworkClick}></FrameworksMobile>
        </div>

        <div className={style.frameworksDesktop}>
          <Frameworks handleFrameworkClick={handleFrameworkClick}></Frameworks>
        </div>

        <CardsPart></CardsPart>
        <DataCapture></DataCapture>
        <FrameworkExplore></FrameworkExplore>
      </div>
      <Footer></Footer>
    </div>
  );
}
