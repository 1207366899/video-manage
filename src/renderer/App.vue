<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'video-manage'
  }
</script>

<style lang="scss">
  #app {
    width: 100vw;
    height: 100vh;
    /*background: #c3d9ff;*/
    padding: 20px;

    header {
      text-align: right;
      margin-bottom: 20px;

      i {
        cursor: pointer;
      }

      i + i {
        margin-left: 20px;
      }
    }
  }
</style>
