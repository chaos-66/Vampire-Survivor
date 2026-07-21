export type Circle = {
  x: number
  y: number
  radius: number
}

/** True when circles overlap or touch (distance <= sum of radii). */
export const circlesOverlap = (a: Circle, b: Circle): boolean => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const r = a.radius + b.radius
  return dx * dx + dy * dy <= r * r
}

export const distanceSq = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number => {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}
