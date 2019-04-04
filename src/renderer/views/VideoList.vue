<template>
  <div class="video-list">
    <header>
      <Icon type="ios-stats" size="24"/>
      <Icon type="ios-folder-open" size="24" @click="$router.push({name: 'AddFolder'})"/>
      <Icon type="ios-funnel" size="24" @click="showFilter = true"/>

    </header>
    <main>
    </main>
    <Drawer title="Filters" placement="left" v-model="showFilter">
    </Drawer>
  </div>
</template>

<script>
  export default {
    name: 'VideoList',
    data () {
      return {
        showFilter: false
      }
    },
    methods: {
      openFilter () {
      }
    }
  }
</script>

<style lang="scss" scoped>
  .video-list {
  }
</style>
