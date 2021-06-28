<template>
  <div class="tooltip">
    <i
      class="fas fa-info-circle tipIcon"
      @click="tipTextShowing = !tipTextShowing"
      :style="{
        color: iconColor,
        left: iconPosition == 'left' ? iconPositionLeft : 'unset',
        right: iconPosition == 'right' ? iconPositionRight : 'unset',
      }"
    ></i>
    <slot>
      <transition name="tooltip">
        <div
          v-if="tipTextShowing"
          class="tipText-container"
          v-on-clickaway="closeTipText"
          :style="{ width: tipWidth, bottom: tipMarginBottom }"
        >
          <p class="tipText" :style="{ color: tipTextColor }">
            {{ tipText }}
          </p>
        </div>
      </transition>
    </slot>
  </div>
</template>

<script>
// mixins
import { mixin as clickaway } from 'vue-clickaway';

export default {
  name: 'AppTooltip',
  mixins: [clickaway],
  props: {
    iconColor: {
      type: String,
      default: '#fff',
    },
    iconPosition: {
      type: String,
      default: 'left',
    },
    iconPositionLeft: {
      type: String,
      default: '-1.9rem',
    },
    iconPositionRight: {
      type: String,
      default: '-1rem',
    },
    tipPosition: {
      type: String,
      default: 'top',
    },
    tipMarginBottom: {
      type: String,
      default: '3.5rem',
    },
    tipText: {
      type: String,
      default: '',
    },
    tipTextColor: {
      type: String,
      default: '#333',
    },
    tipWidth: {
      type: String,
      default: '28rem',
    },
  },
  data() {
    return {
      tipTextShowing: false,
      iconSpacing: '-1.8rem',
    };
  },
  methods: {
    closeTipText() {
      this.tipTextShowing = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.tooltip {
  display: inline-block;
  cursor: pointer;
  .tipIcon {
    position: absolute;
    top: -1.3rem;
    left: -1.8rem;
    font-size: 16px;
  }
  .tipText-container {
    position: absolute;
    z-index: 100;
    box-shadow: 0 .5rem 1rem rgba(73, 73, 73, 0.5);;
    padding: 1rem 1.5rem;
    background-color: #fff;
    transform-origin: bottom;
    .tipText {
      color: #333;
      font-weight: 500;
      font-size: 1.4rem;
    }
  }
}
</style>
