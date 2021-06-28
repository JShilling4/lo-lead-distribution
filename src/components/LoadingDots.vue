<template>
  <div class="loading-container">
    <p class="loading">{{ loadingText }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingDots',
  props: {
    loadingText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
  p {
    color: $lightTeal;
    text-align: center;
    line-height: 150%;
  }
  .loading:after {
    content: ' .';
    font-weight: 600;
    font-size: 4rem;
    animation: dots 1s steps(5, end) infinite;
  }

@keyframes dots {
  0%, 20% {
    color: rgba(0,0,0,0);
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);}
  40% {
    color: white;
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);}
  60% {
    text-shadow:
      .25em 0 0 $lightTeal,
      .5em 0 0 rgba(0,0,0,0);}
  80%, 100% {
    text-shadow:
      .25em 0 0 $lightTeal,
      .5em 0 0 $lightTeal;}}
</style>
