<template>
    <button :type="type" :class="classes">
        {{ text }}
    </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    text: {
      type: String,
      required: true,
    },
    classes: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
.btn {
    background-color: transparent;
    border: 1px solid #000;
    border-radius: 2rem;
    font-weight: 600;
    padding: 0.5rem 2rem;
    text-align: center;
    min-width: 9rem;
    transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out;
    cursor: pointer;
    &:focus,
    &:active {
        outline: none;
    }
    &.btn-orange {
        color: $orange;
        border-color: $orange;
        background-color: #fff;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: $orange;
            color: #fff;
        }
        &:focus,
        &:active {
            background-color: #fff;
            color: $orange;
            &:hover {
                background-color: $orange;
                color: #fff;
            }
        }
        &-fill {
            background-color: $orange;
            border-color: #fff;
            color: #fff;
        }
    }
    &.btn-black {
        color: #000;
        border-color: #000;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: #000;
            color: #fff;
        }
    }
    &.btn-blue {
        color: $uiBlue;
        border-color: $uiBlue;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: $uiBlue;
            color: #fff;
        }
    }
    &.btn-white {
        color: #fff;
        border-color: #fff;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: #fff;
            color: $lightTeal;
        }
    }
    &.btn-green {
        color: $lightTeal;
        border-color: $lightTeal;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: $lightTeal;
            color: #fff;
        }
    }
    &.btn-red {
        color: $red;
        border-color: $red;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        &:hover {
            background-color: $red;
            color: #fff;
        }
        &-fill {
            background-color: $red;
            color: #fff;
            border: none;
        }
    }
}
a.btn {
    padding-bottom: 0.25rem;
}
</style>
