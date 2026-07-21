import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M1 movement status message', () => {
    expect(getStatusMessage()).toBe('M1: move with WASD or arrow keys')
  })
})
