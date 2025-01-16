import { ReactElement } from "react";
import style from "./FrameworkExploreCard.module.css";
import Link from "@docusaurus/Link";

interface FrameworkExploreCardProps {
  icon: ReactElement;
  children: string;
  framework: string;
  link?: string;
}

export default function FrameworkExploreCard({
  icon,
  children,
  framework,
  link,
}: FrameworkExploreCardProps) {
  function getFrameworkPath(): string {
    const basePath = link
      ? `/sdks/${link}/add-sdk`
      : `/sdks/${framework}/add-sdk`;
    return framework === "linux"
      ? `/sdks/linux/add-sdk`
      : basePath;
  }

  return (
    <li>
      <Link to={getFrameworkPath()} className={style.frameworkExploreCard}>
        <div className={style.iconWrapper}>{icon}</div>
        <p className={style.frameworkExploreCardText}>{children}</p>
      </Link>
    </li>
  );
}
