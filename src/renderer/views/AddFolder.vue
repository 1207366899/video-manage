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
                    click: () => this.delFolder(params)
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
          this.folderList = list
        })
      },
      addFolder () {
        const {dialog} = remote
        dialog.showOpenDialog({
          properties: ['openDirectory', 'multiSelections']
        }, folders => {
          if (!folders) return
          let newPath = []
          let oldPath = []
          for (let i of folders) {
            if (!this.folderList.find(item => item.path === i)) {
              newPath.push({
                path: i
              })
            } else {
              oldPath.push(i)
            }
          }
          if (oldPath.length) {
            dialog.showMessageBox({
              type: 'warning',
              message: `文件夹 ${[...oldPath]} 已存在！`
            })
          }
          if (!newPath.length) return
          this.$folderDB.insert(newPath, (err, list) => {
            if (err) {
              throw new Error(err)
            }
            this.getFolder()
          })
        })
      },
      delFolder (params) {
        this.$folderDB.remove({
          _id: params.row._id
        }, (err, list) => {
          if (err) {
            throw new Error(err)
          }
          this.getFolder()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .add-folder {
  }
</style>
