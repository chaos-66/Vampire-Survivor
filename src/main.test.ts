import { describe, expect, it } from 'vitest'

import { getBootstrapMessage } from './status'

describe('M0 bootstrap', () => {
  it('exposes the scaffold status message', () => {
    expect(getBootstrapMessage()).toBe('M0 toolchain ready')
  })
})
