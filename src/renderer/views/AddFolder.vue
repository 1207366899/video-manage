<template>
  <div class="add-folder">
    <header>
      <Icon type="md-arrow-back" size="24" style="float: left" @click="$router.push({name: 'VideoList'})"/>
      <Icon type="md-add" size="24" @click="addFolder"/>
    </header>
    <main>
      <Table border :columns="columns" :data="folderList"></Table>
    </main>
  </div>
</template>

<script>
  import {remote} from 'electron'

  export default {
    name: 'AddFolder',
    data () {
      return {
        folderList: [],
        columns: [
          {
            title: '路径',
            key: 'path'
          },
          {
            title: '操作',
            key: '',
            width: 120,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: this.delFolder(params)
                  }
                }, '删除')
              ])
            }
          }
        ]
      }
    },
    mounted () {
      this.getFolder()
    },
    methods: {
      getFolder () {
        this.$folderDB.find({}, (err, list) => {
          if (err) {
            throw new Error(err)
          }
          console.log(list)
          this.folderList = list
        })
      },
      addFolder () {
        remote.dialog.showOpenDialog({
          properties: ['openDirectory', 'multiSelections']
        }, folders => {
          if (!folders) return
          let newPath = []
          for (let i of folders) {
            let isAdd = false
            for (let j of this.folderList) {
              if (i === j) {
                isAdd = true
              }
            }
            !isAdd && newPath.push({path: i})
          }
          console.log(newPath)
          // this.$folderDB.insert(newPath, (err, list) => {
          //   if (err) {
          //     throw new Error(err)
          //   }
          //   this.folderList = list
          // })
        })
      },
      delFolder ({row}) {
        this.$folderDB.remove({
          _id: row._id
        }, (err, list) => {
          if (err) {
            throw new Error(err)
          }
          this.folderList = list
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .add-folder {
  }
</style>
