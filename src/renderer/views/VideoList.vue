<template>
    <div class="video-list">
        <header>
            <Icon type="ios-stats" size="24"/>
            <Icon type="ios-folder-open" size="24" @click="$router.push({name: 'AddFolder'})"/>
            <Icon :type="isPhoto ? 'md-images' : 'md-list-box'" size="24" @click="changeShow"/>
            <Icon type="ios-funnel" size="24" @click="showFilter = true"/>
            <Icon :type="isFull ? 'md-contract' : 'md-expand'" size="24" @click="changeFull"/>
        </header>
        <main>
            <section v-if="isPhoto">

            </section>
            <section v-else>
                <Table :loading="loading" :columns="columns" :data="tableData"></Table>
            </section>
        </main>
        <footer>
            <Page :total="total" :current="current" :page-size="pageSize" @on-change="pageChange"
                  @on-page-size-change="pageSizeChange" show-sizer show-elevator show-total/>
        </footer>
        <Drawer title="Filters" placement="left" v-model="showFilter">
        </Drawer>
    </div>
</template>

<script>
  import {remote} from 'electron'

  export default {
    name: 'VideoList',
    data () {
      return {
        showFilter: false,
        isFull: false,
        isPhoto: false,
        loading: false,
        total: 0,
        current: 1,
        pageSize: 10,
        tableData: [],
        columns: [{
          title: '文件名',
          key: 'fileName',
          sortable: true
        }, {
          title: '大小（GB）',
          key: 'fileSize',
          sortable: true
        }, {
          title: '收藏',
          sortable: true,
          render: (h, params) => {
            return h('Icon', {
              props: {
                size: 24,
                type: params.row.favorite ? 'md-star' : 'md-star-outline'
              },
              on: {
                click: () => this.favorite
              }
            })
          }
        }, {
          title: '创建时间',
          sortable: true,
          width: 160,
          render: (h, params) => {
            const time = new Date(params.row.birthtime).toLocaleString()
            return h('span', {}, time)
          }
        }, {
          title: '访问时间',
          sortable: true,
          width: 160,
          render: (h, params) => {
            const time = new Date(params.row.atime).toLocaleString()
            return h('span', {}, time)
          }
        }, {
          title: '操作',
          fixed: 'right',
          width: 170,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'info',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                }
              }, '打开'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                }
              }, '删除')
            ])
          }
        }]
      }
    },
    mounted () {
      this.getData()
    },
    methods: {
      getData (filters) {
        this.loading = true
        const param = {}
        // 查询分页
        this.$videoDB.find(param).sort().skip((this.current - 1) * this.pageSize).limit(this.pageSize).exec((err, list) => {
          this.loading = false
          if (err) throw new Error(err)
          this.tableData = list
        })
        // 总数
        this.$videoDB.count(param, (err, count) => {
          if (err) throw new Error(err)
          this.total = count
        })
      },
      favorite () {
      },
      changeShow () {
        this.isPhoto = !this.isPhoto
      },
      changeFull () {
        this.isFull = !this.isFull
        const win = remote.getCurrentWindow()
        win.setFullScreen(this.isFull)
      },
      pageChange (page) {
        this.current = page
        this.getData()
      },
      pageSizeChange (pageSize) {
        this.pageSize = pageSize
        this.getData()
      }
    }
  }
</script>

<style lang="scss" scoped>
    .video-list {
        width: 100%;
        height: 100%;
    }
</style>
