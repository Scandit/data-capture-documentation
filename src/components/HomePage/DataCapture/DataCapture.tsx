import BrowserOnly from "@docusaurus/BrowserOnly";
import style from "./DataCapture.module.css";
import DataCaptureCard from "../DataCaptureCard/DataCaptureCard";
import { createDataCaptureArr } from "./dataCaptureArr";

export default function DataCapture() {
  return (
    <div className={style.dataCapture}>
      <h2 className={style.dataCaptureTitle}>Quick Reference</h2>
      <p className={style.dataCaptureText}>
        Release notes and sample apps for your selected framework, plus
        reference tables for system requirements, supported symbologies, ID
        documents, and labels.
      </p>
      <BrowserOnly>
        {() => {
          const paramsURL = Object.fromEntries(
            new URLSearchParams(window.location.search)
          );
          const selectedFramework = paramsURL.framework || "web";
          const items = createDataCaptureArr(selectedFramework);
          return (
            <ul className={style.dataCaptureList}>
              {items.map((item, index) => (
                <li key={index}>
                  <DataCaptureCard link={item.link}>{item.title}</DataCaptureCard>
                </li>
              ))}
            </ul>
          );
        }}
      </BrowserOnly>
    </div>
  );
}
