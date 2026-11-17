<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from '../../src/@core/components/TiptapEditor.vue'
import ProductDescriptionEditor from '../../src/@core/components/ProductDescriptionEditor.vue'

definePage({ meta: { layout: 'blank' } })

const first = ref('<p>Первый исходный текст</p>')
const second = ref('<p>Второй исходный текст</p>')
const firstUpdates = ref(0)
const secondUpdates = ref(0)

const load = () => {
  first.value = '<p>Первый загруженный текст</p>'
  second.value = '<p>Второй загруженный текст</p>'
}
</script>

<template>
  <main>
    <h1>Проверка синхронизации редакторов</h1>
    <button
      type="button"
      @click="load"
    >
      Загрузить значения извне
    </button>
    <p id="first-updates">
      События первого: {{ firstUpdates }}
    </p>
    <p id="second-updates">
      События второго: {{ secondUpdates }}
    </p>
    <TiptapEditor
      :model-value="first"
      @update:model-value="firstUpdates++"
    />
    <ProductDescriptionEditor
      :model-value="second"
      @update:model-value="secondUpdates++"
    />
  </main>
</template>
