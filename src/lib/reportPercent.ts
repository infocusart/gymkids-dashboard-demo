/** Parse one displayed percentage, rejecting malformed values instead of deleting characters. */
export const parseReportPercent = (value: string): number | null => {
  const match = /^(\d{1,3}(?:[.,]\d+)?)%?$/.exec(value.trim())
  if (!match)
    return null

  const numericValue = Number(match[1].replace(',', '.'))

  return numericValue <= 100 ? numericValue : null
}
