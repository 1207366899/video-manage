<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn icon="home" to="/" />
        <q-toolbar-title> </q-toolbar-title>
        <q-select
          style="width: 200px"
          clearable
          v-model="model"
          :options="options"
          @input="floderChange"
        />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding>
        <q-infinite-scroll @load="loadMore" :offset="800">
          <div class="flex justify-around example-container">
            <q-card
              class="example-cell"
              v-for="(item, index) in tableData"
              :key="index"
            >
              <img class="cover" :src="item.image" @click="handleClick(item)" />
              <q-card-section class="flex justify-between items-center">
                <div class="text-h6">{{ item.parentName }}</div>
                <div class="text-grey">
                  <q-btn
                    v-show="!isNew(item)"
                    flat
                    round
                    :color="isFavorite(item) ? 'red' : 'grey'"
                    icon="favorite"
                    @click="moveFloder(item, 'favorite')"
                  />
                  <q-btn
                    v-show="isNew(item)"
                    flat
                    round
                    icon="thumb_up"
                    color="primary"
                    @click="moveFloder(item, 'thumb_up')"
                  />
                  <q-btn
                    v-show="isNew(item)"
                    flat
                    round
                    icon="thumb_down"
                    color="secondary"
                    @click="moveFloder(item, 'thumb_down')"
                  />
                  <!-- {{ (item.parentSize / 1024 / 1024 / 1024).toFixed(2) + "Gb" }} -->
                </div>
              </q-card-section>
            </q-card>
          </div>

          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
          <div
            class="text-center"
            v-show="tableData.length === randomList.length"
          >
            END！
          </div>
        </q-infinite-scroll>

        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

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
    </q-page-container>
  </q-layout>
</template>

<script>
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { ipcRenderer } from "electron";

export default {
  // name: 'PageName',
  data() {
    return {
      tableData: [],
      fileList: [],
      randomList: [],
      visible: false,
      loading: false,
      model: undefined,
      options: [],
      param: { $or: [{ extName: ".jpg" }, { extName: ".png" }] }
    };
  },
  computed: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$db.floder.find({}, (err, list) => {
        if (err) throw new Error(err);
        this.options = list.map(item => {
          return {
            label: path.basename(item.path),
            value: item.path
          };
        });
      });
      this.getRandom();
    },
    getRandom() {
      const vm = this;
      this.$db.video.count(this.param, function(err, count) {
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
        vm.getData();
      });
    },
    floderChange(obj) {
      if (obj) {
        this.param = {
          ...this.param,
          parentPath: new RegExp(path.basename(obj.value))
        };
      } else {
        delete this.param.parentPath;
      }
      this.tableData = [];
      this.getRandom();
    },
    loadMore(index, done) {
      this.getData();
      done();
    },
    async getData() {
      if (this.tableData.length === this.randomList.length) return;
      let list = [];
      const fetchList = index => {
        return new Promise((resolve, reject) => {
          const skipNum = this.randomList[index];
          if (skipNum === undefined) reject(new Error("不能为空！"));
          // 查询分页
          this.$db.video
            .findOne(this.param)
            .skip(skipNum)
            .limit(1)
            .exec((err, item) => {
              if (err) throw new Error(err);
              if (!item) return;
              const bData = fs.readFileSync(item.path);
              const base64Str = bData.toString("base64");
              const datauri = "data:image/png;base64," + base64Str;
              resolve({
                ...item,
                image: datauri
              });
            });
        });
      };

      for (let i = 0; i < 20; i++) {
        try {
          const current = this.tableData.length + i;
          if (current >= this.randomList.length) {
            break;
          }
          const item = await fetchList(current);
          list.push(item);
        } catch (error) {
          console.log(error);
          break;
        }
      }
      this.tableData = this.tableData.concat(list);
      console.log(this.tableData);
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
      exec(`"${item.path}"`);
      if (item.type === "video") {
        this.$db.history.insert(
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
    },
    isFavorite(item) {
      return item.path.indexOf("avorite") !== -1;
    },
    isNew(item) {
      return item.path.indexOf("ew") !== -1;
    },
    async moveFloder(item, type) {
      this.loading = true;
      try {
        const list = await new Promise(resolve => {
          this.$db.floder.find({}).exec((err, list) => {
            if (err) throw new Error(err);
            resolve(list);
          });
        });
        const defaultPath = list.filter(
          item => item.path.indexOf("dult") !== -1
        )[0]?.path;
        const favoritePath = list.filter(
          item => item.path.indexOf("avorite") !== -1
        )[0]?.path;

        let source = item.parentPath,
          target;
        switch (type) {
          case "favorite":
            const isFavorite = this.isFavorite(item);
            target = isFavorite ? defaultPath : favoritePath;
            break;
          case "thumb_up":
            target = favoritePath;
            break;
          case "thumb_down":
            target = defaultPath;
            break;
        }
        console.log(source);
        console.log(target);

        // await new Promise(resolve => {
        //   exec(
        //     `powershell.exe -command "Move-Item '${source}' '${target}'`,
        //     function(err, stdout, stderr) {
        //       if (err) throw new Error(err);
        //       resolve();
        //       // console.log("err", err);
        //       // console.log("stdout", stdout);
        //       // console.log("stderr", stderr);
        //     }
        //   );
        // });
        ipcRenderer.send("scan-file");

        const movedPath = `${target}\\${item.name}`;
        // const floder = await fs.promises.readdir(movedPath);
        // await Promise.all(
        //   floder.map(item => {
        //     return new Promise(resolve => {
        //       const current = `${movedPath}\\${item}`;
        //       const name = item.replace(path.extname(item), "");
        //       this.$db.video.update(
        //         { name },
        //         {
        //           $set: {
        //             path: current
        //           }
        //         },
        //         {},
        //         function(err, numReplaced) {
        //           if (err) throw new Error(err);
        //           resolve();
        //         }
        //       );
        //     });
        //   })
        // );
        const newItem = {
          ...item,
          path: `${movedPath}\\${item.name + item.extName}`,
          parentPath: movedPath
        };
        const index = this.tableData.findIndex(
          item => item.name === newItem.name
        );
        this.$set(this.tableData, index, newItem);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
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
