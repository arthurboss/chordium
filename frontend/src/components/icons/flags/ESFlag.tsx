const ESFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <clipPath id="es-circle">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
    <g clipPath="url(#es-circle)">
      <rect width="100" height="100" fill="#C60B1E" />
      <rect y="25" width="100" height="50" fill="#FFC400" />
    </g>
  </svg>
);

export default ESFlag;
