interface TunerNeedleProps {
  cents: number | null; // -50 to +50
  isInTune: boolean;
}

const TunerNeedle = ({ cents, isInTune }: TunerNeedleProps) => {
  const rotation = cents !== null ? (cents / 50) * 75 : 0; // max ±75deg
  const active = cents !== null;

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Arc background */}
      <svg viewBox="0 0 240 130" className="w-64 h-36" aria-hidden>
        {/* Track arc */}
        <path
          d="M 20 120 A 100 100 0 0 1 220 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/30"
        />
        {/* Center in-tune zone */}
        <path
          d="M 113 23 A 97 97 0 0 1 127 23"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={isInTune && active ? "text-green-500" : "text-muted-foreground/20"}
        />
        {/* Tick marks */}
        {[-50, -25, 0, 25, 50].map((val) => {
          const angleDeg = (val / 50) * 75 - 90;
          const rad = (angleDeg * Math.PI) / 180;
          const r1 = 94, r2 = 104, cx = 120, cy = 120;
          return (
            <line
              key={val}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke="currentColor"
              strokeWidth={val === 0 ? 2 : 1}
              className="text-muted-foreground/50"
            />
          );
        })}
        {/* Needle */}
        <g
          transform={`rotate(${rotation}, 120, 120)`}
          style={{ transition: active ? "transform 0.08s ease-out" : "none" }}
        >
          <line
            x1="120" y1="120"
            x2="120" y2="28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={
              !active
                ? "text-muted-foreground/40"
                : isInTune
                ? "text-green-500"
                : "text-primary"
            }
          />
        </g>
        {/* Pivot dot */}
        <circle
          cx="120" cy="120" r="5"
          className={
            !active
              ? "fill-muted-foreground/40"
              : isInTune
              ? "fill-green-500"
              : "fill-primary"
          }
        />
        {/* Cent labels */}
        {[
          { val: -50, x: 14, y: 118 },
          { val: 50, x: 222, y: 118 },
        ].map(({ val, x, y }) => (
          <text
            key={val}
            x={x} y={y}
            textAnchor="middle"
            fontSize="10"
            className="fill-muted-foreground"
          >
            {val > 0 ? `+${val}` : val}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default TunerNeedle;
