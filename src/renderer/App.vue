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
        display: flex;
        width: 100vw;
        height: 100vh;
        background: #eeeeee;

        header {
            padding: 10px 20px;
            height: 50px;
            text-align: right;
            background: #ffffff;
            border-bottom: 1px solid #c3d9ff;

            i {
                cursor: pointer;
            }

            i + i {
                margin-left: 20px;
            }
        }

        main {
            padding: 20px;
            height: calc(100% - 100px);
        }

        footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-right: 20px;
            height: 50px;
            background: #ffffff;
            border-top: 1px solid #c3d9ff;
        }
    }
</style>
