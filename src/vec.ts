export type Vec2 = {
  x: number
  y: number
}

export const zeroVec = (): Vec2 => ({ x: 0, y: 0 })

export const vecLength = (v: Vec2): number => Math.hypot(v.x, v.y)

/** Returns a unit vector, or zero when the input is zero. */
export const normalize = (v: Vec2): Vec2 => {
  const length = vecLength(v)
  if (length === 0) {
    return zeroVec()
  }
  return { x: v.x / length, y: v.y / length }
}
