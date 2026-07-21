import { describe, expect, it } from 'vitest'

import { getStatusMessage } from './status'

describe('status copy', () => {
  it('exposes the M2 combat status message', () => {
    expect(getStatusMessage()).toBe('M2: move, dodge enemies, auto-attack')
  })
})
