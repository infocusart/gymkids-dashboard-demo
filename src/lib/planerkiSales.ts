import source from '@/data/planerkiSales.generated.json'

export interface SalesMetric { label: string; plan: number | null; fact: number | null }
export interface SalesRecord {
  centerId: string
  centerName: string
  currency: string
  period: string
  endDate: string
  sheet: string
  sourceCenter: string
  planColumn: string
  factColumn: string
  metrics: Record<string, SalesMetric>
  errors: { cell: string; error: string }[]
}
export const salesRecords: SalesRecord[] = source.records
export const salesSource = { workbook: source.source, sha256: source.sha256 }
export const metric = (record: SalesRecord | undefined, row: number, kind: 'fact' | 'plan' = 'fact'): number | null => record?.metrics[String(row)]?.[kind] ?? null

// Excel SUM(blank cells) caches 0. A blank breakdown does not establish zero sales.
export const displayMetric = (record: SalesRecord | undefined, row: number): number | null => {
  const value = metric(record, row)
  const dependencies: Record<number, number[]> = { 32: [33, 34, 35, 36], 42: [39, 40, 41], 66: [62, 63, 64, 65] }

  return value === 0 && dependencies[row]?.every(input => metric(record, input) === null) ? null : value
}
export const ratio = (value: number | null, base: number | null): number | null => value === null || base === null || base <= 0 ? null : value / base
export const completeSum = (values: (number | null)[]): number | null => values.includes(null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
export const baseBalance = (record: SalesRecord | undefined): number | null => {
  const added = completeSum([displayMetric(record, 32), metric(record, 25)])
  const lost = metric(record, 68)

  return added === null || lost === null ? null : added - lost
}
export const termDifference = (record: SalesRecord | undefined): number | null => {
  const total = metric(record, 32)
  const terms = completeSum([33, 34, 35, 36].map(row => metric(record, row)))

  return total === null || terms === null ? null : total - terms
}
export const moneyRows = new Set([3, 4, 5, 11, 12, 18, 19, 22, 26, 27, 30, 31, 43, 44, 62, 63, 64, 65, 66, 71])
export const rateRows = new Set([6, 9, 13, 16, 20, 23, 28, 37, 38, 47, 50, 51, 59, 60])
