import style from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={style.footer}>
      <p className={style.footerText}>
        Copyright © Scandit AG<br />
        Scandit's products are patent protected. Details at{' '}
        <a href="https://www.scandit.com/patents/" target="_blank" rel="noopener noreferrer">
          scandit.com/patents
        </a>
      </p>
    </footer>
  );
}
