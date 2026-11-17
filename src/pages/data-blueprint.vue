<script setup lang="ts">
import { dashboardBlueprint, dashboardSnapshot } from '@/data/dashboard'

const sourceTone = {
  connected: 'success',
  partial: 'warning',
  planned: 'secondary',
} as const

const sourceLabel = {
  connected: 'Подключен',
  partial: 'Частично',
  planned: 'Запланирован',
} as const
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <VCard title="Blueprint данных">
        <template #subtitle>
          Эта страница фиксирует data contract, через который one-screen dashboard должен переходить от demo/proxy к реальным источникам.
        </template>

        <VCardText>
          <div class="text-subtitle-1 font-weight-medium mb-3">
            Главные вопросы сборки
          </div>
          <VList density="comfortable">
            <VListItem
              v-for="question in dashboardBlueprint.coreQuestions"
              :key="question"
              class="px-0"
            >
              <template #prepend>
                <VIcon
                  icon="tabler-arrow-right"
                  color="primary"
                  size="18"
                />
              </template>
              <VListItemTitle>{{ question }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      lg="7"
    >
      <VCard title="Определения метрик">
        <template #subtitle>
          Это рабочий source-of-truth по метрикам до подключения реальных backend-источников.
        </template>

        <VCardText class="pa-0">
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th>Метрика</th>
                <th>Определение</th>
                <th>Источник</th>
                <th>Частота</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="metric in dashboardBlueprint.metricDefinitions"
                :key="metric.metric"
              >
                <td class="font-weight-medium">
                  {{ metric.metric }}
                </td>
                <td class="text-wrap">
                  {{ metric.definition }}
                </td>
                <td>{{ metric.source }}</td>
                <td>{{ metric.cadence }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      lg="5"
    >
      <VCard title="Контракты источников">
        <template #subtitle>
          Пока это честная карта готовности, а не фейковая интеграция.
        </template>

        <VList>
          <VListItem
            v-for="source in dashboardSnapshot.sources"
            :key="source.name"
          >
            <template #prepend>
              <VAvatar
                rounded
                size="36"
                variant="tonal"
                :color="sourceTone[source.status]"
              >
                <VIcon icon="tabler-plug-connected" />
              </VAvatar>
            </template>

            <VListItemTitle class="d-flex align-center gap-2">
              {{ source.name }}
              <VChip
                label
                size="x-small"
                :color="sourceTone[source.status]"
              >
                {{ sourceLabel[source.status] }}
              </VChip>
            </VListItemTitle>
            <VListItemSubtitle>
              {{ source.freshness }} · {{ source.nextStep }}
            </VListItemSubtitle>
          </VListItem>
        </VList>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Widget lanes">
        <template #subtitle>
          Какие визуальные семейства уже собраны в runtime и куда дальше раскладывать новые metric families.
        </template>

        <VCardText>
          <VRow>
            <VCol
              v-for="lane in dashboardBlueprint.widgetLanes"
              :key="lane.title"
              cols="12"
              md="6"
              xl="3"
            >
              <VCard
                border
                flat
              >
                <VCardText>
                  <div class="text-subtitle-1 font-weight-medium mb-2">
                    {{ lane.title }}
                  </div>
                  <p class="mb-3 text-body-2">
                    {{ lane.description }}
                  </p>
                  <VChip
                    label
                    size="small"
                    color="primary"
                  >
                    {{ lane.originalSource }}
                  </VChip>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
