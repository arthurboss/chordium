const DEFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <clipPath id="de-circle">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
    <g clipPath="url(#de-circle)">
      <rect width="100" height="33.33" fill="#000" />
      <rect y="33.33" width="100" height="33.33" fill="#DD0000" />
      <rect y="66.66" width="100" height="33.34" fill="#FFCC00" />
    </g>
  </svg>
);

export default DEFlag;
