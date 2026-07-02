export default function Kmp({ iconClass = "svg-wrap--blue" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 40 40"
      fill="none"
      className={iconClass}
    >
      <path d="M8.99854 35L4.99854 35L4.99853 31" stroke="currentColor" strokeWidth="2"/>
      <path d="M31 35L35 35L35 31" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 5L5 5L5 9" stroke="currentColor" strokeWidth="2"/>
      <path d="M31 5L35 5L35 9" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 10h20L20 20l10 10H10V10Z" fill="currentColor" />
    </svg>
  );
}
