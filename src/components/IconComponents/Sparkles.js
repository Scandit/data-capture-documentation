export default function Sparkles({ iconClass = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClass}
    >
      <path
        d="M11.5 1.5L12.7 5.3L16.5 6.5L12.7 7.7L11.5 11.5L10.3 7.7L6.5 6.5L10.3 5.3L11.5 1.5Z"
        fill="currentColor"
      />
      <path
        d="M5 11L5.75 13.25L8 14L5.75 14.75L5 17L4.25 14.75L2 14L4.25 13.25L5 11Z"
        fill="currentColor"
      />
      <path
        d="M15 12L15.5 13.5L17 14L15.5 14.5L15 16L14.5 14.5L13 14L14.5 13.5L15 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
