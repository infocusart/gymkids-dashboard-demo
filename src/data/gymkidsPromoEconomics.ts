/** Opt-in visual fixture, NOT CRM data. Names, spend and attribution are fictional. */
export interface PromoPerson {
  key: string
  name: string
  leads: number
  valid: number
  invalid: number
  inWork: number
  scheduled: number
  reached: number
}

const people: PromoPerson[] = [
  { key: 'demo-1', name: 'Алексей', leads: 80, valid: 34, invalid: 36, inWork: 10, scheduled: 23, reached: 18 },
  { key: 'demo-2', name: 'Мария', leads: 62, valid: 25, invalid: 29, inWork: 8, scheduled: 15, reached: 11 },
  { key: 'demo-3', name: 'Даниил', leads: 51, valid: 18, invalid: 25, inWork: 8, scheduled: 10, reached: 7 },
]

const sum = (key: 'leads' | 'valid' | 'reached') => people.reduce((total, person) => total + person[key], 0)
const spend = 100000
const money = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`

export const gymkidsPromoEconomicsDemo = {
  mode: 'demo' as const,
  spend,
  spendLabel: money(spend),
  leads: sum('leads'),
  costs: [
    { key: 'lead', label: 'Стоимость лида', count: sum('leads'), countLabel: `${sum('leads')} обращения`, valueLabel: money(spend / sum('leads')) },
    { key: 'valid', label: 'Валидного лида', count: sum('valid'), countLabel: `${sum('valid')} валидных лидов`, valueLabel: money(spend / sum('valid')) },
    { key: 'trial', label: 'Дошедшего до пробного', count: sum('reached'), countLabel: `${sum('reached')} посещений`, valueLabel: money(spend / sum('reached')) },
  ],
  people,
}

export type GymkidsPromoEconomics = typeof gymkidsPromoEconomicsDemo
