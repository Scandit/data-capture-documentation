import React, { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    if (currentPath) {
      let trimmedPath = "";

      for (const item of newItems) {
        if (currentPath.includes(item.activeBasePath)) {
          trimmedPath = currentPath.replace(item.activeBasePath, "");
          break;
        }
        continue;
      }

      setLink(trimmedPath || '/add-sdk');
    }
  }, [currentPath]);

  const newItems = [
    {
      type: "doc",
      label: "iOS",
      sidebarId: "iosSidebar",
      docId: `sdks/ios${link}`,
      activeBasePath: "sdks/ios/",
    },
    {
      type: "doc",
      label: "Android",
      sidebarId: "androidSidebar",
      docId: `sdks/android${link}`,
      activeBasePath: "sdks/android/",
    },
    {
      type: "doc",
      label: "Web",
      sidebarId: "webSidebar",
      docId: `sdks/web${link}`,
      activeBasePath: "sdks/web/",
    },
    {
      type: "doc",
      label: "Cordova",
      sidebarId: "cordovaSidebar",
      docId: `sdks/cordova${link}`,
      activeBasePath: "sdks/cordova/",
    },
    {
      type: "doc",
      label: "React Native",
      sidebarId: "reactnativeSidebar",
      docId: `sdks/react-native${link}`,
      activeBasePath: "sdks/react-native/",
    },
    {
      type: "doc",
      label: "Flutter",
      sidebarId: "flutterSidebar",
      docId: `sdks/flutter${link}`,
      activeBasePath: "sdks/flutter/",
    },
    {
      type: "doc",
      label: "Capacitor",
      sidebarId: "capacitorSidebar",
      docId: `sdks/capacitor${link}`,
      activeBasePath: "sdks/capacitor/",
    },
    {
      type: "doc",
      label: "Titanium",
      sidebarId: "titaniumSidebar",
      docId: `sdks/titanium${link}`,
      activeBasePath: "sdks/titanium/",
    },
    {
      type: "doc",
      label: "Xamarin iOS",
      sidebarId: "xamarinIosSidebar",
      docId: `sdks/xamarin/ios${link}`,
      activeBasePath: "sdks/xamarin/ios/",
    },
    {
      type: "doc",
      label: "Xamarin Android",
      sidebarId: "xamarinAndroidSidebar",
      docId: `sdks/xamarin/android${link}`,
      activeBasePath: "sdks/xamarin/android/",
    },
    {
      type: "doc",
      label: "Xamarin Forms",
      sidebarId: "xamarinFormsSidebar",
      docId: `sdks/xamarin/forms${link}`,
      activeBasePath: "sdks/xamarin/forms/",
    },
    {
      type: "doc",
      label: ".NET iOS",
      sidebarId: "netIosSidebar",
      docId: `sdks/net/ios${link}`,
      activeBasePath: "sdks/net/ios/",
    },
    {
      type: "doc",
      label: ".NET Android",
      sidebarId: "netAndroidSidebar",
      docId: `sdks/net/android${link}`,
      activeBasePath: "sdks/net/android/",
    },
  ];

  return (
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
        {newItems.map((childItemProps, i) => (
          <NavbarItem
            isDropdownItem
            activeClassName="dropdown__link--active"
            {...childItemProps}
            key={i}
          />
        ))}
      </ul>
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
