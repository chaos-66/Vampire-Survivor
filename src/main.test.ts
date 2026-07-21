import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M2 combat status message in Chinese', () => {
    expect(getStatusMessage()).toBe('M2：移动、躲避敌人并自动攻击')
  })
})
