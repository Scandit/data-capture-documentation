export default function ScanditKmp({ iconClass = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={iconClass}
    >
      <path fill="transparent" d="M0 0h24v24H0z" opacity=".01" />
      <defs>
        <linearGradient id="scanditKmpGradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E44857" />
          <stop offset="0.5" stopColor="#C711E1" />
          <stop offset="1" stopColor="#7F52FF" />
        </linearGradient>
      </defs>
      <path d="M2 2h20L12 12l10 10H2V2Z" fill="url(#scanditKmpGradient)" />
    </svg>
  );
}
