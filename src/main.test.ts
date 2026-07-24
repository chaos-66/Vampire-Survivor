import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M4 world demo status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M4：探索大世界')
  })
})