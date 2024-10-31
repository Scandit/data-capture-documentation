import React, { useState, useRef, useEffect, useMemo } from "react";
import clsx from "clsx";
import {
  isRegexpStringMatch,
  useCollapsible,
  Collapsible,
} from "@docusaurus/theme-common";
import {
  isSamePath,
  useLocalPathname,
} from "@docusaurus/theme-common/internal";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import NavbarItem from "@theme/NavbarItem";
import styles from "./styles.module.css";
import { useLocation } from "@docusaurus/router";
import { FrameworksName } from "@site/src/components/constants/frameworksName";

function isItemActive(item, localPathname) {
  if (isSamePath(item.to, localPathname)) {
    return true;
  }
  if (isRegexpStringMatch(item.activeBaseRegex, localPathname)) {
    return true;
  }
  if (item.activeBasePath && localPathname.startsWith(item.activeBasePath)) {
    return true;
  }
  return false;
}
function containsActiveItems(items, localPathname) {
  return items.some((item) => isItemActive(item, localPathname));
}
function DropdownNavbarItemDesktop({
  items,
  position,
  className,
  onClick,
  ...props
}) {
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [link, setLink] = useState("/add-sdk");
  const [linkVersion, setLinkVersion] = useState("sdks");
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) {
        return;
      }
      setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("focusin", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("focusin", handleClickOutside);
    };
  }, [dropdownRef]);

  const currentFramework = useMemo(() => {
    const regex = /(?<=\/sdks\/)(\w+)(?:\/(\w+))?/;
    const match = currentPath.match(regex);
    if (match) {
      const primaryKey = match[1];
      const secondaryKey = match[2];
      if (primaryKey === "xamarin" || primaryKey === "net") {
        const frameworkKey = secondaryKey
          ? `${primaryKey}/${secondaryKey}`
          : primaryKey;
        const frameworksMap = {
          "xamarin/ios": "Xamarin iOS",
          "xamarin/android": "Xamarin Android",
          "xamarin/forms": "Xamarin Forms",
          "net/android": ".NET Android",
          "net/ios": ".NET iOS",
        };
        return frameworksMap[frameworkKey] || null;
      }
      return FrameworksName[primaryKey] || null;
    }
  }, [currentPath]);

  useEffect(() => {
    if (!currentPath) return;
    const possibleVersions = ["/next", "/6.28.0"];
    const match = currentPath.match(/(.*)(?=\/sdks)/);
    setLinkVersion(match && match[0] ? `${match[0]}/sdks` : "/sdks");

    const activeBasePath = newItems.find((item) =>
      currentPath.includes(item.activeBasePath)
    )?.activeBasePath;

    let trimmedPath = activeBasePath
      ? currentPath.replace(activeBasePath, "")
      : currentPath;

    possibleVersions.forEach((version) => {
      trimmedPath = trimmedPath.replace(version, "");
    });

    trimmedPath = trimmedPath.endsWith("/")
      ? trimmedPath.slice(0, -1)
      : trimmedPath;

    setLink(trimmedPath || "/add-sdk");
  }, [currentPath]);

  const newItems = [
    {
      type: "docsVersion",
      label: "iOS",
      sidebarId: "iosSidebar",
      to: `${linkVersion}/ios${link}`,
      activeBasePath: "sdks/ios/",
    },
    {
      type: "docsVersion",
      label: "Android",
      sidebarId: "androidSidebar",
      to: `${linkVersion}/android${link}`,
      activeBasePath: "sdks/android/",
    },
    {
      type: "docsVersion",
      label: "Web",
      sidebarId: "webSidebar",
      to: `${linkVersion}/web${link}`,
      activeBasePath: "sdks/web/",
    },
    {
      type: "docsVersion",
      label: "Cordova",
      sidebarId: "cordovaSidebar",
      to: `${linkVersion}/cordova${link}`,
      activeBasePath: "sdks/cordova/",
    },
    {
      type: "docsVersion",
      label: "React Native",
      sidebarId: "reactnativeSidebar",
      to: `${linkVersion}/react-native${link}`,
      activeBasePath: "sdks/react-native/",
    },
    {
      type: "docsVersion",
      label: "Flutter",
      sidebarId: "flutterSidebar",
      to: `${linkVersion}/flutter${link}`,
      activeBasePath: "sdks/flutter/",
    },
    {
      type: "docsVersion",
      label: "Capacitor",
      sidebarId: "capacitorSidebar",
      to: `${linkVersion}/capacitor${link}`,
      activeBasePath: "sdks/capacitor/",
    },
    {
      type: "docsVersion",
      label: "Titanium",
      sidebarId: "titaniumSidebar",
      to: `${linkVersion}/titanium${link}`,
      activeBasePath: "sdks/titanium/",
    },
    {
      type: "docsVersion",
      label: "Xamarin iOS",
      sidebarId: "xamarinIosSidebar",
      to: `${linkVersion}/xamarin/ios${link}`,
      activeBasePath: "sdks/xamarin/ios/",
    },
    {
      type: "docsVersion",
      label: "Xamarin Android",
      sidebarId: "xamarinAndroidSidebar",
      to: `${linkVersion}/xamarin/android${link}`,
      activeBasePath: "sdks/xamarin/android/",
    },
    {
      type: "docsVersion",
      label: "Xamarin Forms",
      sidebarId: "xamarinFormsSidebar",
      to: `${linkVersion}/xamarin/forms${link}`,
      activeBasePath: "sdks/xamarin/forms/",
    },
    {
      type: "docsVersion",
      label: ".NET iOS",
      sidebarId: "netIosSidebar",
      to: `${linkVersion}/net/ios${link}`,
      activeBasePath: "sdks/net/ios/",
    },
    {
      type: "docsVersion",
      label: ".NET Android",
      sidebarId: "netAndroidSidebar",
      to: `${linkVersion}/net/android${link}`,
      activeBasePath: "sdks/net/android/",
    },
  ];

  const combinedItems =
    items && items.some((item) => item.type === "docsVersion")
      ? newItems
      : items;

  return (
    <div>
      <div className={styles.frameworkNameWrapper}>
        <p className={styles.frameworkName}>
          {items && items.some((item) => item.type === "docsVersion") && currentFramework &&  (
            <>
              Framework:
              <span style={{ fontWeight: "700", marginLeft: "4px" }}>
                {currentFramework}
              </span>
            </>
          )}
        </p>

        <div
          ref={dropdownRef}
          className={clsx("navbar__item", "dropdown", "dropdown--hoverable", {
            "dropdown--right": position === "right",
            "dropdown--show": showDropdown,
          })}
        >
          <NavbarNavLink
            aria-haspopup="true"
            aria-expanded={showDropdown}
            role="button"
            // # hash permits to make the <a> tag focusable in case no link target
            // See https://github.com/facebook/docusaurus/pull/6003
            // There's probably a better solution though...
            href={props.to ? undefined : "#"}
            className={clsx("navbar__link", className)}
            {...props}
            onClick={props.to ? undefined : (e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setShowDropdown(!showDropdown);
              }
            }}
          >
            {props.children ?? props.label}
          </NavbarNavLink>
          <ul className="dropdown__menu">
            {combinedItems.map((childItemProps, i) => (
              <NavbarItem
                isDropdownItem
                activeClassName="dropdown__link--active"
                {...childItemProps}
                key={i}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
function DropdownNavbarItemMobile({
  items,
  className,
  position, // Need to destructure position from props so that it doesn't get passed on.
  onClick,
  ...props
}) {
  const localPathname = useLocalPathname();
  const containsActive = containsActiveItems(items, localPathname);
  const { collapsed, toggleCollapsed, setCollapsed } = useCollapsible({
    initialState: () => !containsActive,
  });
  // Expand/collapse if any item active after a navigation
  useEffect(() => {
    if (containsActive) {
      setCollapsed(!containsActive);
    }
  }, [localPathname, containsActive, setCollapsed]);

  return (
    <li
      className={clsx("menu__list-item", {
        "menu__list-item--collapsed": collapsed,
      })}
    >
      <NavbarNavLink
        role="button"
        className={clsx(
          styles.dropdownNavbarItemMobile,
          "menu__link menu__link--sublist menu__link--sublist-caret",
          className
        )}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}
      >
        {props.children ?? props.label}
      </NavbarNavLink>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {items.map((childItemProps, i) => (
          <NavbarItem
            mobile
            isDropdownItem
            onClick={onClick}
            activeClassName="menu__link--active"
            {...childItemProps}
            key={i}
          />
        ))}
      </Collapsible>
    </li>
  );
}
export default function DropdownNavbarItem({ mobile = false, ...props }) {
  const Comp = mobile ? DropdownNavbarItemMobile : DropdownNavbarItemDesktop;
  return <Comp {...props} />;
}
