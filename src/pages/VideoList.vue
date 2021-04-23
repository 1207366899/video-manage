<template>
  <q-page padding>
    <!-- content -->

    <q-infinite-scroll @load="loadMore">
      <div class="flex justify-around example-container">
        <q-card
          class="example-cell"
          v-for="(item, index) in tableData"
          :key="index"
          @click="handleClick(item)"
        >
          <img class="cover" :src="item.image" />
          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
          </q-card-section>
        </q-card>
      </div>

      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
    <q-dialog v-model="visible">
      <div class="q-pa-md" style="background: #fff">
        <q-list bordered>
          <q-item
            clickable
            v-ripple
            v-for="(item, index) in fileList"
            :key="index"
            @click="openFile(item)"
          >
            <q-item-section avatar>
              <q-icon
                :color="
                  item.icon === 'play_circle'
                    ? 'primary'
                    : item.icon === 'photo'
                    ? 'secondary'
                    : 'tertiary'
                "
                :name="item.icon"
              />
            </q-item-section>

            <q-item-section>{{ item.name }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-dialog>
  </q-page>
</template>

<script>
import fs from "fs";
import path, { extname } from "path";
const nodeCmd = require("node-cmd");

export default {
  // name: 'PageName',
  data() {
    return {
      current: 1,
      pageSize: 10,
      tableData: [],
      fileList: [],
      randomList: [],
      visible: false
    };
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      const vm = this;
      this.$videoDB.count({ extName: ".png" }, function(err, count) {
        if (err) console.log(err);
        console.log("count", count);
        let randomList = [];
        for (var i = 0; i < count; i++) {
          randomList[i] = i;
        }
        randomList.sort(() => {
          return 0.5 - Math.random();
        });
        vm.randomList = randomList;
      });
    },
    loadMore(index, done) {
      this.current = index;
      this.getData();
      done();
    },
    getData(filters) {
      const param = {
        extName: ".png"
      };
      const skipNum = this.randomList[this.tableData.length];
      if (skipNum === undefined) return;
      // 查询分页
      this.$videoDB
        .findOne(param)
        .skip(skipNum)
        .limit(1)
        .exec((err, item) => {
          if (err) throw new Error(err);
          const bData = fs.readFileSync(item.path);
          const base64Str = bData.toString("base64");
          const datauri = "data:image/png;base64," + base64Str;
          this.tableData.push({
            ...item,
            image: datauri
          });
        });
    },
    async handleClick(img) {
      const list = await fs.promises.readdir(img.parentPath);
      this.fileList = list.map(item => {
        const extName = path.extname(item);
        const videoExt = [
          ".avi",
          ".dat",
          ".mkv",
          ".flv",
          ".vob",
          ".wmv",
          ".asf",
          ".asx",
          ".rm",
          ".rmvb",
          ".mpg",
          ".mpeg",
          ".mpe",
          ".3gp",
          ".mp4",
          ".mov",
          ".m4v"
        ];
        const imageExt = [".png"];
        const icon =
          videoExt.indexOf(extName) !== -1
            ? "play_circle"
            : imageExt.indexOf(extName) !== -1
            ? "photo"
            : "insert_drive_file";
        return {
          icon,
          name: item,
          path: `${img.parentPath}\\${item}`
        };
      });
      this.visible = true;
    },
    openFile(item) {
      nodeCmd.run(item.path);
    }
  }
};
</script>
<style lang="sass" scoped>
.cover
//  width: 200px

$x: 4

@for $i from 1 through ($x - 1)
  .example-container > div:nth-child(#{$x}n + #{$i})
    order: #{$i}

.example-container > div:nth-child(#{$x}n)
  order: #{$x}

.example-container
  // height: 700px

  .example-cell
    width: 22%
    margin-bottom: 20px
    // margin: 10px
    // padding: 1px
</style>
