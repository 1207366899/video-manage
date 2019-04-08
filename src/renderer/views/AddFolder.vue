<template>
    <div class="add-folder">
        <header>
            <Icon type="md-arrow-back" size="24" style="float: left" @click="$router.push({name: 'VideoList'})"/>
            <Icon type="md-wifi" size="24" @click="scanFile"/>
            <Icon type="md-add" size="24" @click="addFolder"/>
        </header>
        <main>
            <Table border :columns="columns" :data="folderList"></Table>
        </main>
    </div>
</template>

<script>
  import fs from 'fs'
  import path from 'path'
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
          if (err) throw new Error(err)
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
            if (err) throw new Error(err)
            this.getFolder()
          })
        })
      },
      delFolder (params) {
        this.$folderDB.remove({
          _id: params.row._id
        }, (err, list) => {
          if (err) throw new Error(err)
          this.getFolder()
        })
      },
      // 遍历文件目录
      scanFile () {
        const saveFileInfo = (file, stats) => {
          let fileObj = {
            fileName: file,
            fileType: file.substr(file.lastIndexOf('.') + 1),
            fileSize: stats.size / 1024 / 1024 / 1024, // GB
            fileCover: '',
            atime: stats.atime,
            mtime: stats.mtime,
            birthtime: stats.birthtime
          }
          this.$videoDB.insert(fileObj, (err, res) => {
            if (err) console.log(err)
          })
        }
        const readDir = dir => {
          fs.readdir(dir, (err, files) => {
            if (err) throw new Error(err)
            files.forEach(file => {
              const statPath = path.join(dir, file)
              fs.stat(statPath, (err, stats) => {
                if (err) throw new Error(err)
                if (stats.isFile()) {
                  saveFileInfo(file, stats)
                } else if (stats.isDirectory()) {
                  readDir(statPath)
                }
              })
            })
          })
        }

        for (let i of this.folderList) {
          readDir(i.path)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
    .add-folder {
        main{
            height: 100%;
        }
    }
</style>
