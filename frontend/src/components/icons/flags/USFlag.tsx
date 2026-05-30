const USFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <clipPath id="us-circle">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
    <g clipPath="url(#us-circle)">
      <rect width="100" height="100" fill="#B22234" />
      <g fill="#fff">
        {[...Array(13)].map((_, i) =>
          i % 2 === 1 ? <rect key={i} y={i * 7.69} width="100" height="7.69" /> : null
        )}
      </g>
      <rect width="40" height="53.85" fill="#3C3B6E" />
      <g fill="#fff">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row) =>
          [...Array(row % 2 === 0 ? 6 : 5)].map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={3.3 + col * 6.7 + (row % 2 === 0 ? 0 : 3.35)}
              cy={3 + row * 6}
              r="1.8"
            />
          ))
        )}
      </g>
    </g>
  </svg>
);

export default USFlag;
