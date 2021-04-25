<template>
  <q-page padding>
    <q-list bordered>
      <q-item
        clickable
        v-ripple
        v-for="(item, index) in historyList"
        :key="index"
        @click="openFile(item)"
      >
        <img :src="item.image" />
        <q-item-section>{{ item.name }}</q-item-section>

        <q-item-section side top>
          <q-item-label caption>{{ item.accessTime }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
<script>
import fs from "fs";
const childProcess = require("child_process");

export default {
  data() {
    return {
      historyList: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$db.history
        .find()
        .sort({ accessTime: -1 })
        .limit(10)
        .exec((err, list) => {
          if (err) throw new Error(err);
          // console.log(list);
          this.historyList = list.map(item => {
            const bData = fs.readFileSync(item.cover);
            const base64Str = bData.toString("base64");
            const datauri = "data:image/png;base64," + base64Str;
            return {
              ...item,
              image: datauri
            };
          });
        });
    },
    openFile(item) {
      childProcess.exec(`"${item.path}"`);
    }
  }
};
</script>
