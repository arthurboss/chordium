const BRFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <clipPath id="br-circle">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
    <g clipPath="url(#br-circle)">
      <rect width="100" height="100" fill="#009B3A" />
      <polygon points="50,10 92,50 50,90 8,50" fill="#FEDF00" />
      <circle cx="50" cy="50" r="18" fill="#002776" />
      <path
        d="M32,53 Q50,44 68,53"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
      />
    </g>
  </svg>
);

export default BRFlag;
