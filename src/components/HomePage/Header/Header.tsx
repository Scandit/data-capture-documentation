import React from "react";
import style from "./Header.module.css";
import logo from "../../../../static/img/logo-dark.svg";
import { Logo } from "../../IconComponents";
import Sparkles from "../../IconComponents/Sparkles";
import Link from "@docusaurus/Link";
import ThemeBtn from "../../ThemeBtn/ThemeBtn";
import { resolveAgentSkillsUrl } from "../../utils/frameworks";

export default function Header() {
  // The homepage swaps frameworks via history.pushState (no router update), so a
  // statically-rendered href would go stale and always point at iOS. Resolve the
  // Agent Skills target from the live URL + localStorage at click time, matching
  // the shared Agent Skills banner's behavior. The rendered href stays the iOS
  // default so SSR and first client render agree (no hydration mismatch); the
  // handlers below correct it before the browser navigates.
  const refreshHref: React.ReactEventHandler<HTMLAnchorElement> = (e) => {
    e.currentTarget.href = resolveAgentSkillsUrl();
  };
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    window.location.assign(resolveAgentSkillsUrl());
  };
  return (
    <header className={style.header}>
      <h1 className={style.hiddenText}>Scandit</h1>
      <div className={style.logoWrapper}>
        <Logo iconClass={style.logo} />
        <p className={style.logoText}>Docs</p>
      </div>
      <div className={style.authBtns}>
        <Link
          className={style.btnLogin}
          to="https://ssl.scandit.com/dashboard/sign-in?p=test"
        >
          Log In
        </Link>
        <Link className={style.btnSignUp} to="https://www.scandit.com/trial/">
          Sign Up
        </Link>
        <span className={style.delimiter}></span>
        <Link
          className={style.btnSkills}
          to="/sdks/ios/agent-skills"
          onClick={handleClick}
          onMouseDown={refreshHref}
          onFocus={refreshHref}
        >
          <Sparkles iconClass={style.skillsIcon}/><span>Agent Skills</span>
        </Link>
        <ThemeBtn />
      </div>
    </header>
  );
}
