<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { VIcon } from 'vuetify/components/VIcon'
import sliderBar1 from '@images/illustrations/sidebar-pic-1.png'
import sliderBar2 from '@images/illustrations/sidebar-pic-2.png'
import sliderBar3 from '@images/illustrations/sidebar-pic-3.png'

interface ThemeNativeHeroMetric {
  number: string
  text: string
}

interface ThemeNativeHeroSlide {
  name: string
  summary: string
  data: ThemeNativeHeroMetric[]
}

const props = defineProps<{
  overline: string
  title: string
  subtitle: string
  chip: string
  slides: ThemeNativeHeroSlide[]
}>()

const { smAndDown } = useDisplay()
const slideImages = [sliderBar1, sliderBar2, sliderBar3]
const desktopHeroHeight = 300
const mobileHeroHeight = 392
const heroHeight = computed(() => smAndDown.value ? mobileHeroHeight : desktopHeroHeight)

const websiteAnalytics = computed(() => props.slides.map((item, index) => ({
  ...item,
  data: smAndDown.value ? item.data.slice(0, 2) : item.data.slice(0, 3),
  slideImg: slideImages[index % slideImages.length],
})))
</script>

<template>
  <VCard
    color="primary"
    :height="heroHeight"
  >
    <VCarousel
      cycle
      :continuous="false"
      :show-arrows="false"
      :interval="6500"
      hide-delimiter-background
      :delimiter-icon="() => h(VIcon, { icon: 'fa-circle', size: '8' })"
      :height="heroHeight"
      class="carousel-delimiter-top-end web-analytics-carousel"
    >
      <VCarouselItem
        v-for="item in websiteAnalytics"
        :key="item.name"
      >
        <VCardText
          class="position-relative hero-slide-content"
          :style="{ minBlockSize: `${heroHeight}px` }"
        >
          <VRow>
            <VCol cols="12">
              <div class="d-flex align-center justify-space-between gap-4 flex-wrap">
                <div>
                  <div class="text-overline text-white mb-2 hero-overline">
                    {{ overline }}
                  </div>
                  <h5 class="text-white mb-1 hero-title">
                    {{ title }}
                  </h5>
                  <p class="mb-0 text-white hero-subtitle">
                    {{ subtitle }}
                  </p>
                </div>

                <VChip
                  label
                  variant="flat"
                  color="rgb(var(--v-theme-primary-darken-1))"
                  class="font-weight-medium text-white hero-period-chip"
                >
                  {{ chip }}
                </VChip>
              </div>
            </VCol>

            <VCol
              cols="12"
              class="pb-0"
            >
              <div class="hero-slide-lane">
                <div class="hero-slide-copy">
                  <h6 class="text-h6 text-white mb-1 mt-3">
                    {{ item.name }}
                  </h6>
                  <p class="text-body-1 mb-0 text-white-variant hero-slide-summary">
                    {{ item.summary }}
                  </p>
                </div>

                <div class="hero-metrics-grid">
                  <div
                    v-for="metric in item.data"
                    :key="`${item.name}-${metric.text}`"
                    class="hero-metric-inline"
                  >
                    <VChip
                      label
                      variant="flat"
                      size="default"
                      color="rgb(var(--v-theme-primary-darken-1))"
                      class="font-weight-medium text-white rounded me-2 px-2 hero-metric-pill"
                      style="block-size: 30px;"
                    >
                      <span class="text-base">{{ metric.number }}</span>
                    </VChip>
                    <span class="d-inline-block text-white-variant">{{ metric.text }}</span>
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>

          <img
            :src="item.slideImg"
            class="card-website-analytics-img hero-orb"
            style="filter: drop-shadow(0 4px 60px rgba(0, 0, 0, 50%));"
          >
        </VCardText>
      </VCarouselItem>
    </VCarousel>
  </VCard>
</template>

<style lang="scss" scoped>
.hero-slide-content {
  padding-block: 1.5rem 1rem;
}

.hero-overline {
  opacity: 0.88;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3.15rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.94;
  text-wrap: balance;
}

.hero-subtitle {
  max-inline-size: 34rem;
  font-size: 1rem;
  line-height: 1.45;
  opacity: 0.92;
}

.hero-period-chip,
.hero-metric-pill {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-slide-lane {
  padding-block-start: 0.35rem;
  padding-inline-end: 10.75rem;
}

.hero-slide-copy {
  max-inline-size: 16rem;
}

.card-website-analytics-img {
  block-size: 150px;
}

.hero-orb {
  opacity: 0.96;
  transform: translate3d(0, 0, 0);
}

.hero-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: 0.8rem 1rem;
  margin-block-start: 1rem;
}

.hero-metric-inline {
  display: flex;
  align-items: center;
  min-inline-size: 0;
  white-space: nowrap;
}

.hero-slide-summary {
  max-inline-size: 15rem;
  font-size: 0.92rem;
  line-height: 1.35;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.text-white-variant {
  color: rgba(255, 255, 255, 82%);
}

@media screen and (min-width: 600px) {
  .card-website-analytics-img {
    position: absolute;
    margin: auto;
    inset-block-end: 0.9rem;
    inset-inline-end: 1.9rem;
  }
}

@media screen and (max-width: 599px) {
  .hero-slide-content {
    block-size: auto;
    min-block-size: auto;
    padding-block: 1.25rem 1rem;
  }

  .card-website-analytics-img {
    display: none;
  }

  .hero-slide-lane {
    padding-inline-end: 0;
  }

  .hero-slide-copy {
    max-inline-size: 100%;
  }

  .hero-metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-slide-summary {
    max-inline-size: 100%;
    -webkit-line-clamp: 2;
  }

  .hero-title {
    font-size: 2rem;
    line-height: 1;
  }

  .hero-subtitle,
  .hero-slide-summary {
    font-size: 0.98rem;
  }
}

.web-analytics-carousel {
  .v-carousel__controls {
    .v-carousel__controls__item {
      &.v-btn--active {
        .v-icon {
          opacity: 1 !important;
        }
      }
    }
  }
}
</style>
