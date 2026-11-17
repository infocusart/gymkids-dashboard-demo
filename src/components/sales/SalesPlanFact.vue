<script setup lang="ts">
defineProps<{ rows: { label: string; plan: string; fact: string }[]; caption: string }>()
</script>

<template>
  <table class="monthly-parameters">
    <caption class="sales-sr-only">
      {{ caption }}
    </caption>
    <thead>
      <tr>
        <th scope="col">
          Параметр
        </th><th scope="col">
          План
        </th><th scope="col">
          Факт
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.label"
      >
        <th scope="row">
          {{ row.label }}
        </th><td>{{ row.plan }}</td><td>{{ row.fact }}</td>
      </tr>
    </tbody>
  </table>
</template>
