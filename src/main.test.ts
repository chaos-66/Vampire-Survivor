import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M4 difficulty status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M4：动态难度')
  })
})
