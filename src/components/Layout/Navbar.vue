<template>
  <div class="navbar">
    <img
      class="logo"
      src="https://webresources.ruoff.com/logo-horizontal-color-nmls/png/200/0"
      alt="Ruoff Marketing Logo"
      @click="$router.push('/')"
    />
    <ul class="option-list">
      <!-- <li v-if="!isAdmin" class="option" @click="$emit('open-info-modal')">
        Info
      </li> -->
      <li class="option" @click="$emit('logout')">
        Log Out
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Navbar',
  props: {
    isAdmin: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState(['userProfile']),
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 12rem 1rem;
  min-height: 93px;
  @include breakpoint(desktop) {
    padding: 2rem 4rem;
  }
  @include breakpoint(laptop) {
    padding: 2rem 2rem;
  }
  @include breakpoint(tablet-port) {
    min-height: 92px;
  }
  @include breakpoint(mobile-small) {
    min-height: 84px;
    padding: 1rem 1rem;
  }
  .option-list {
    display: flex;
    align-items: center;
    align-self: flex-end;
    .option {
      margin-left: 6rem;
      font-weight: 600;
      font-size: 2rem;
      cursor: pointer;
      color: $gray;
      transition: color 0.3s;
      @include breakpoint(tablet-port) {
        font-size: 1.6rem;
        margin-left: 4rem;
      }
      @include breakpoint(mobile-small) {
        font-size: 1.4rem;
      }
      &:hover {
        color: $orange;
      }
    }
  }

  .logo {
    @include breakpoint(tablet-port) {
      width: 140px;
    }
    @include breakpoint(mobile-small) {
      width: 120px;
    }
  }
}
</style>
