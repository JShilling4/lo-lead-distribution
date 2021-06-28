<template>
  <div class="loadingScreen">
    <transition name="slide">
      <div class="loader">
        <!-- <div class="loader--dot"></div>
        <div class="loader--dot"></div>
        <div class="loader--dot"></div>
        <div class="loader--dot"></div>
        <div class="loader--dot"></div>
        <div class="loader--dot"></div> -->
        <div class="loader--text"></div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'LoadingScreen',
};
</script>

<style lang="scss" scoped>
$loader--width: 250px;
$loader-dot--size: 20px;

.loadingScreen {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-color: transparent;
  z-index: 11;
}

.loader {
  height: 50px;
  width: 450px;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%,-50%);
}
.loader--dot {
  animation-name: loader;
  animation-timing-function: ease-in-out;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  height: 40px;
  width: 40px;
  border-radius: 100%;
  background-color: black;
  position: absolute;
}
.loader--dot:first-child {
  background-color: #001b26;
  animation-delay: 0.5s;
}
.loader--dot:nth-child(2) {
  background-color: #142f42;
  animation-delay: 0.4s;
}
.loader--dot:nth-child(3) {
  background-color: #00485c;
  animation-delay: 0.3s;
}
.loader--dot:nth-child(4) {
  background-color: #0f8c73;
  animation-delay: 0.2s;
}
.loader--dot:nth-child(5) {
  background-color: #16af8c;
  animation-delay: 0.1s;
}
.loader--dot:nth-child(6) {
  background-color: #f38e36;
  animation-delay: 0s;
}
.loader--text {
  position: absolute;
  top: 200%;
  width: 200px;
  left: 0;
  right: 0;
  margin: auto;
}
.loader--text:after {
  content: "Loading";
  font-weight: bold;
  color: #333;
  font-size: 30px;
  animation-name: loading-text;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

@keyframes loader {
  15% {
    transform: translateX(0);
  }
  45% {
    transform: translateX(300px);
  }
  65% {
    transform: translateX(300px);
  }
  95% {
    transform: translateX(0);
  }
}
@keyframes loading-text {
  0% {
    content: "Loading";
  }
  25% {
    content: "Loading .";
  }
  50% {
    content: "Loading . .";
  }
  75% {
    content: "Loading . . .";
  }
}
</style>
