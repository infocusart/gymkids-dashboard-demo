<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import BentoPreview from './bento-preview.vue'

const { width, height } = useWindowSize()
const showMotionAudit = import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionAudit') === '1'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <BentoPreview interaction-mode="focus-reflow" />
  <output
    v-if="showMotionAudit"
    class="motion-audit-viewport"
  >
    Область браузера: {{ width }} × {{ height }} CSS px
  </output>
</template>

<style src="../styles/bento-focus-preview.css"></style>

<style src="../styles/bento-validity-focus.css"></style>

<style src="../styles/bento-conversion-focus.css"></style>

<style src="../styles/bento-site-focus.css"></style>

<style src="../styles/bento-promo-focus.css"></style>

<style src="../styles/bento-sources-focus.css"></style>

<style src="../styles/bento-trial-focus.css"></style>

<style src="../styles/bento-path-focus.css"></style>

<style scoped>
.motion-audit-viewport {
  position: fixed;
  z-index: 1000;
  border-radius: 6px;
  background: #171a19;
  color: #fff;
  font-size: 11px;
  inset-block-end: 8px;
  inset-inline-start: 8px;
  padding-block: 4px;
  padding-inline: 8px;
  pointer-events: none;
}
</style>
