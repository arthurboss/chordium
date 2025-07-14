import React from "react";

interface BlinkingArrowProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
  direction?: "down" | "right" | "left" | "up";
}

const arrowMap = {
  down: "\u2193",
  right: "\u2192",
  left: "\u2190",
  up: "\u2191",
};

const getAnimation = (direction: string) => {
  switch (direction) {
    case "right":
      return `pulse 1s infinite, moveRight 1s infinite`;
    case "left":
      return `pulse 1s infinite, moveLeft 1s infinite`;
    case "up":
      return `pulse 1s infinite, moveUp 1s infinite`;
    default:
      return `pulse 1s infinite, moveDown 1s infinite`;
  }
};

const BlinkingArrow: React.FC<BlinkingArrowProps> = ({
  size = 36,
  color = "#666",
  style = {},
  className = "",
  label = "Loading more results",
  direction = "down",
}) => (
  <>
    <span
      className={`animate-pulse font-bold select-none leading-none ${className}`}
      style={{
        fontSize: size,
        color,
        animation: getAnimation(direction),
        ...style,
      }}
      aria-label={label}
    >
      {arrowMap[direction]}
    </span>
    <style>{`
      @keyframes moveDown {
        0% { transform: translateY(0); }
        50% { transform: translateY(12px); }
        100% { transform: translateY(0); }
      }
      @keyframes moveRight {
        0% { transform: translateX(0); }
        50% { transform: translateX(12px); }
        100% { transform: translateX(0); }
      }
      @keyframes moveLeft {
        0% { transform: translateX(0); }
        50% { transform: translateX(-12px); }
        100% { transform: translateX(0); }
      }
      @keyframes moveUp {
        0% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
        100% { transform: translateY(0); }
      }
    `}</style>
  </>
);

export default BlinkingArrow;
