export const getJumpingAnimation = (direction: string) => {
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
