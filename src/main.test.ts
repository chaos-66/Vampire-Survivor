import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M3 progression status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M3：收集经验并选择强化')
  })
})
