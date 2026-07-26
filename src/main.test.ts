import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M4 outcome status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M4：坚持 60 秒')
  })
})