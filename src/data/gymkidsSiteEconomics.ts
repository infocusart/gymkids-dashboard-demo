/** Isolated visual sample. Never used by snapshot adapters or dashboard totals. */
const money = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`
const spend = 200000

export const gymkidsSiteEconomicsDemo = {
  spendLabel: money(spend),
  basis: 'Демонстрационные данные. Стоимости считаются от всего интернет-потока, а не только от Директа.',
  trialBasis: 'Демонстрационный пример, не календарная статистика выбранного центра.',
  costs: [
    { key: 'lead', label: 'Стоимость лида', valueLabel: money(spend / 160), countLabel: '160', unit: 'уникальных обращения' },
    { key: 'valid', label: 'Валидного лида', valueLabel: money(spend / 96), countLabel: '96', unit: 'валидный лид' },
    { key: 'trial', label: 'Дошедшего до пробного', valueLabel: money(spend / 64), countLabel: '64', unit: 'посещений' },
  ],
  traffic: [
    { key: 'impressions', label: 'Показы', valueLabel: '200 000' },
    { key: 'clicks', label: 'Клики', valueLabel: '2 000' },
    { key: 'ctr', label: 'CTR', valueLabel: '1%' },
    { key: 'cpc', label: 'Цена клика', valueLabel: '100 ₽' },
  ],
  channels: [
    { key: 'direct', label: 'Яндекс Директ', count: 100, countLabel: '100', shareLabel: '62,5%' },
    { key: 'other', label: 'Органика и мессенджеры', count: 60, countLabel: '60', shareLabel: '37,5%' },
  ],

  // Illustrative traffic values.
  visitsLabel: '4 600',
  siteConversionLabel: '3,78%',
}

export type GymkidsSiteEconomics = typeof gymkidsSiteEconomicsDemo
