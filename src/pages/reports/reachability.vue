<script setup lang="ts">
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()

onMounted(() => {
  router.replace('/reports/lead-flow')
})
</script>

<template>
  <div class="reachability-redirect-page d-flex flex-column align-center justify-center text-center">
    <VProgressCircular
      indeterminate
      color="primary"
      size="42"
      width="4"
      class="mb-4"
    />

    <div class="text-h6 mb-2">
      Перенаправляем в отчет по потоку лидов
    </div>

    <div class="text-body-2 text-medium-emphasis">
      Старый маршрут сохранен как alias, чтобы не терять навигацию.
    </div>
  </div>
</template>

<style scoped lang="scss">
.reachability-redirect-page {
  min-block-size: 100vh;
  padding: 1.5rem;
  background:
    radial-gradient(circle at 20% 10%, rgba(var(--v-theme-primary), 0.18), transparent 24%),
    linear-gradient(180deg, #2f3f5f 0%, #24344f 34%, #182236 100%);
}
</style>
