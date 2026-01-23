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
    if (framework === "linux") {
      return `/sdks/linux/add-sdk`;
    }

    // If link starts with "/" (e.g., versioned path like "/7.6.6/sdks/xamarin/ios"), use it directly
    if (link && link.startsWith('/')) {
      return `${link}/add-sdk`;
    }

    // Otherwise construct the path normally
    const basePath = link
      ? `/sdks/${link}/add-sdk`
      : `/sdks/${framework}/add-sdk`;
    return basePath;
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
