<template>
  <transition name="fade">
    <div :class="['modal', classes]" v-if="show">
      <div class="modal__backdrop" @click="clickAway" />

      <transition name="slide-vertical" appear>
        <div class="modal__dialog" :style="`width: ${width}`">
          <loading-spinner v-if="isLoading" />
          <div class="modal__header">
            <slot name="header" />
            <button v-if="showCloseButton" type="button" class="modal__close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                <path
                  fill="currentColor"
                  d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                ></path>
              </svg>
            </button>
          </div>

          <div class="modal__body">
            <slot name="body" />
          </div>

          <div class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  components: {
    'loading-spinner': () => import('@/components/LoadingSpinner'),
  },
  props: {
    width: {
      type: String,
      default: '600px',
    },
    show: {
      type: Boolean,
      required: true,
    },
    clickaway: {
      type: Boolean,
      default: false,
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    classes: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  methods: {
    closeModal() {
      this.$emit('close');
      document.querySelector('body').classList.remove('overflow-hidden');
    },
    clickAway() {
      if (this.clickaway) {
        this.$emit('close');
      }
    },
  },
  mounted() {
    document.querySelector('body').classList.add('overflow-hidden');
  },
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;
  overflow-x: hidden;
  overflow-y: auto;
  &__backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }
  &__dialog {
    position: relative;
    background-color: #ffffff;
    border-radius: 5px;
    margin: 10rem auto 50px;
    padding: 2rem 3rem 3rem;
    display: flex;
    flex-direction: column;
    z-index: 2;
    @include breakpoint(mobile) {
      width: 95% !important;
    }
  }
  &__close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    background-color: transparent;
    border: none;
    outline: none;
    width: 15px;
    height: 15px;
    color: $gray;
    cursor: pointer;
    &:hover {
      color: $orange;
    }
  }
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    // padding: 20px 20px 10px;
  }
  &__body {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  &__footer {
    // padding: 10px 20px 20px;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-vertical-enter-active,
.slide-vertical-leave-active {
  transition: opacity 0.3s, margin 0.3s;
}

.slide-vertical-enter,
.slide-vertical-leave-to {
  opacity: 0;
  margin: 5rem auto 50px !important;
}
</style>
