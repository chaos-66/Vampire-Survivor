/**
 * 卡片文字换行（纯函数，近似字符宽度，不依赖 Canvas）。
 * 全角字符（CJK）按 1 个字符单位、半角按 0.55 个单位；maxWidth / fontSize 为可用单位数。
 * 超过 maxLines 行时截断并在最后一行末尾追加省略号。
 */

const isFullWidth = (ch: string): boolean => ch.charCodeAt(0) > 0x2e80

export const wrapTextByWidth = (
  text: string,
  maxWidth: number,
  fontSize: number,
  maxLines: number,
): string[] => {
  const maxUnits = Math.max(1, maxWidth / fontSize)
  const lines: string[] = []
  let line = ''
  let units = 0
  for (const ch of text) {
    const w = isFullWidth(ch) ? 1 : 0.55
    if (line !== '' && units + w > maxUnits) {
      lines.push(line)
      line = ''
      units = 0
    }
    line += ch
    units += w
  }
  if (line !== '') {
    lines.push(line)
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    const last = kept[maxLines - 1] ?? ''
    kept[maxLines - 1] = `${last}…`
    return kept
  }
  return lines
}
