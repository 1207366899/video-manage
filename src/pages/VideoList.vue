<template>
  <q-page padding>
    <!-- content -->

    <q-infinite-scroll @load="loadMore" :offset="800">
      <div class="flex justify-around example-container">
        <q-card
          class="example-cell"
          v-for="(item, index) in tableData"
          :key="index"
          @click="handleClick(item)"
        >
          <img class="cover" :src="item.image" />
          <q-card-section>
            <div class="text-h6">{{ item.parentName }}</div>
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
import path from "path";
const childProcess = require("child_process");

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
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const vm = this;
      this.$videoDB.count({ extName: ".jpg" }, function(err, count) {
        if (err) console.log(err);
        console.log(`初始化完成，共${count}条数据`);
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
      this.getData();
      done();
    },
    async getData() {
      let list = [];
      const fetchList = index => {
        return new Promise(resolve => {
          const skipNum = this.randomList[this.tableData.length + index];
          if (skipNum === undefined) return;
          // 查询分页
          this.$videoDB
            .findOne({
              extName: ".jpg"
            })
            .skip(skipNum)
            .limit(1)
            .exec((err, item) => {
              if (err) throw new Error(err);
              const bData = fs.readFileSync(item.path);
              const base64Str = bData.toString("base64");
              const datauri = "data:image/png;base64," + base64Str;
              list.push({
                ...item,
                image: datauri
              });
              resolve();
            });
        });
      };

      try {
        for (let i = 0; i < 20; i++) {
          await fetchList(i);
        }
      } catch (error) {
        console.log(error);
      }
      this.tableData = this.tableData.concat(list);
    },
    async handleClick(img) {
      try {
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
          const imageExt = [".jpg"];
          const type =
            videoExt.indexOf(extName) !== -1
              ? "video"
              : imageExt.indexOf(extName) !== -1
              ? "image"
              : "other";
          let res = {
            type,
            name: item.replace(extName, ""),
            path: `${img.parentPath}\\${item}`
          };
          switch (type) {
            case "video":
              res.icon = "play_circle";
              res.cover = img.path;
              break;
            case "image":
              res.icon = "photo";
              break;
            default:
              res.icon = "insert_drive_file";
              break;
          }
          return res;
        });
        this.visible = true;
      } catch (error) {
        console.log(error);
      }
    },
    openFile(item) {
      childProcess.exec(`"${item.path}"`);
      if (item.type === "video") {
        this.$historyDB.insert(
          {
            ...item,
            accessTime: new Date().toLocaleString()
          },
          (err, res) => {
            if (err) {
              throw new Error(err);
            }
          }
        );
        this.visible = false;
      }
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
    width: 800px
    margin-bottom: 20px
    // margin: 10px
    // padding: 1px
</style>
