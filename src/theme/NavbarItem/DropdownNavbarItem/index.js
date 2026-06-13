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
import { useFrameworkItems } from "@site/src/utils/useFrameworkItems";

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
  const location = useLocation();
  const currentPath = location.pathname;
  const regex = /\/hosted\//;
  const isHostedPage = regex.test(currentPath);
  const { currentFramework, frameworkItems } = useFrameworkItems();

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

  const headerItem = (label) => ({
    type: "html",
    value: `<div class="navbar-dropdown-header">${label}</div>`,
    className: "navbar-dropdown-header-item",
  });

  const hasDocsVersionItems =
    items && items.some((item) => item.type === "docsVersion");
  const hasSDKsItems =
    items && items.some((item) => item.type !== "docsVersion");

  const combinedItems = hasDocsVersionItems
    ? [headerItem("Framework"), ...frameworkItems]
    : items;
  const shouldShowDropdownMenu =
    hasSDKsItems || (hasDocsVersionItems && currentFramework);

  return (
    <>
      <div
        ref={dropdownRef}
        className={clsx("navbar__item", "dropdown", "dropdown--hoverable", {
          "dropdown--right": position === "right",
          "dropdown--show": showDropdown,
        })}
        style={{ height: "36px" }}
      >
        {hasDocsVersionItems && currentFramework && (
          <a
            className={clsx("navbar__link", styles.frameworkName)}
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded={showDropdown}
            onClick={(e) => e.preventDefault()}
          >
            {currentFramework}
          </a>
        )}

        {items.some((item) => item.type !== "docsVersion") && !isHostedPage && (
          <NavbarNavLink
            aria-haspopup="true"
            aria-expanded={showDropdown}
            role="button"
            // # hash permits to make the <a> tag focusable in case no link target
            // See https://github.com/facebook/docusaurus/pull/6003
            // There's probably a better solution though...

            // href={"#"}: Prevents navigation when clicking on the link, ensuring that the dropdown functionality works correctly.
            // In previous Docusaurus setup, the condition was href={props.to ? undefined : "#"}
            href={"#"}
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
        )}

        {shouldShowDropdownMenu && !isHostedPage && (
          <ul className="dropdown__menu">
            {combinedItems.map((childItemProps, i) => {
              // Drop sidebarId so the framework item's explicit `to` is used:
              // a docsVersion item with sidebarId resolves to the sidebar's
              // main doc instead, which would lose the current page.
              const { sidebarId, ...rest } = childItemProps;
              return (
                <NavbarItem
                  isDropdownItem
                  activeClassName="dropdown__link--active"
                  {...rest}
                  key={i}
                />
              );
            })}
          </ul>
        )}
      </div>
    </>
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
  const { frameworkItems } = useFrameworkItems();
  // The SDKs dropdown (docsVersion items) gets the dynamically built framework
  // links so switching frameworks on mobile keeps the current page and version.
  const hasDocsVersionItems = items.some(
    (item) => item.type === "docsVersion"
  );
  const effectiveItems = hasDocsVersionItems ? frameworkItems : items;
  const containsActive = containsActiveItems(effectiveItems, localPathname);
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
        {effectiveItems.map((childItemProps, i) => {
          // Drop sidebarId: for a docsVersion item, Docusaurus resolves the
          // link from the sidebar's main doc when sidebarId is present, which
          // would override our page-preserving `to`. Stripping it lets the
          // explicit `to` win (matches the desktop path above).
          const { sidebarId, ...rest } = childItemProps;
          return (
            <NavbarItem
              mobile
              isDropdownItem
              onClick={onClick}
              activeClassName="menu__link--active"
              {...rest}
              key={i}
            />
          );
        })}
      </Collapsible>
    </li>
  );
}
export default function DropdownNavbarItem({ mobile = false, ...props }) {
  const Comp = mobile ? DropdownNavbarItemMobile : DropdownNavbarItemDesktop;
  return <Comp {...props} />;
}
