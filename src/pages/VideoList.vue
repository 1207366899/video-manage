<template>
  <q-page padding>
    <!-- content -->
    <q-btn icon="west" label="返回" to="/" />
    {{ tableData }}
    <q-card v-for="item in tableData" :key="item._id">
      <q-card-title>
        {{ item.fileName }}
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        Card Content
      </q-card-main>
    </q-card>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
  data() {
    return {
      showFilter: false,
      isFull: false,
      isPhoto: false,
      loading: false,
      total: 0,
      current: 1,
      pageSize: 10,
      tableData: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData(filters) {
      this.loading = true;
      const param = {};
      // 查询分页
      this.$videoDB
        .find(param)
        .sort()
        .skip((this.current - 1) * this.pageSize)
        .limit(this.pageSize)
        .exec((err, list) => {
          this.loading = false;
          if (err) throw new Error(err);
          this.tableData = list;
        });
      // 总数
      this.$videoDB.count(param, (err, count) => {
        if (err) throw new Error(err);
        this.total = count;
      });
    },
    favorite() {},
    changeShow() {
      this.isPhoto = !this.isPhoto;
    },
    changeFull() {
      this.isFull = !this.isFull;
      const win = remote.getCurrentWindow();
      win.setFullScreen(this.isFull);
    },
    pageChange(page) {
      this.current = page;
      this.getData();
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getData();
    }
  }
};
</script>
