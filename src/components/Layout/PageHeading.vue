<template>
  <div class="pageHeading">
    <h1>{{ heading }}</h1>
  </div>
</template>

<script>
export default {
  name: 'PageHeading',
  props: {
    heading: {
      type: String,
      default: 'leads.ruoff.com',
    },
  },
};
</script>

<style lang="scss" scoped>
.pageHeading {
  padding: 1rem 18.7rem .5rem;
  background-color: $blueGreen;
  @include breakpoint(laptop) {
    padding: 1rem 8.7rem;
  }
  @include breakpoint(tablet-port) {
    padding: 1rem 6.7rem;
  }
  @include breakpoint(mobile-small) {
        padding: 1rem 4.9rem;
      }
  h1 {
    font-size: 1.75rem;
    color: #fff;
    @include breakpoint(tablet-port) {
      font-size: 1.35rem;
    }
  }
}
</style>
