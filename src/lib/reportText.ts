/** Remove complete parenthesized notes in linear time, preserving the report label. */
export const stripParenthesizedNotes = (label: string): string => {
  const parts: string[] = []
  let cursor = 0
  while (cursor < label.length) {
    const open = label.indexOf('(', cursor)
    if (open < 0)
      break
    const close = label.indexOf(')', open + 1)
    if (close < 0)
      break
    parts.push(label.slice(cursor, open).trimEnd())
    cursor = close + 1
  }

  return (parts.join('') + label.slice(cursor)).trim()
}
