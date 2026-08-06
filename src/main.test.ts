import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M5 outcome status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M5：坚持 5 分钟')
  })
})