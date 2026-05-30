import type jsQR from 'jsqr';

type QRLocation = ReturnType<typeof jsQR>['location'] & {};

export function isChordiumJamUrl(data: string): URL | null {
  try {
    const url = new URL(data);
    if (url.searchParams.has('d')) return url;
  } catch {
    // not a URL
  }
  return null;
}

export function drawCorners(
  ctx: CanvasRenderingContext2D,
  corners: QRLocation,
  color = '#22c55e',
  lineWidth = 4,
  size = 24
) {
  const { topLeftCorner: tl, topRightCorner: tr, bottomRightCorner: br, bottomLeftCorner: bl } = corners;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  for (const [corner, dx, dy] of [
    [tl, 1, 1],
    [tr, -1, 1],
    [br, -1, -1],
    [bl, 1, -1],
  ] as unknown as [[{x:number;y:number}, number, number]]) {
    ctx.beginPath();
    ctx.moveTo(corner.x + dx * size, corner.y);
    ctx.lineTo(corner.x, corner.y);
    ctx.lineTo(corner.x, corner.y + dy * size);
    ctx.stroke();
  }
}
