/**
 * 卡片文字换行纯函数测试。
 */

import { describe, expect, it } from 'vitest'
import { wrapTextByWidth } from './text-wrap'

describe('wrapTextByWidth', () => {
  it('keeps short text on one line', () => {
    expect(wrapTextByWidth('移动速度 +10%', 200, 14, 2)).toEqual([
      '移动速度 +10%',
    ])
  })

  it('splits long text across lines by approximated width', () => {
    const text = '获得散射弹武器（替换当前武器）：一次发射多颗弹，可升级'
    const lines = wrapTextByWidth(text, 196, 14, 2)
    expect(lines.length).toBe(2)
    expect(lines.join('')).toContain('散射弹')
  })

  it('truncates beyond maxLines with an ellipsis', () => {
    const text = '一二三四五六七八九十甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申'
    const lines = wrapTextByWidth(text, 196, 14, 2)
    expect(lines).toHaveLength(2)
    expect(lines[1]?.endsWith('…')).toBe(true)
  })

  it('treats full-width characters wider than half-width', () => {
    const text = 'AAA一二三'
    const lines = wrapTextByWidth(text, 196, 14, 2)
    expect(lines.length).toBeGreaterThanOrEqual(1)
    expect(lines.join('')).toBe(text)
  })

  it('handles empty text', () => {
    expect(wrapTextByWidth('', 100, 14, 2)).toEqual([])
  })
})
