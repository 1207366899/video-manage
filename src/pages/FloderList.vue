<template>
  <q-page padding>
    <!-- content -->
    <!-- <q-icon name="west" /> -->

    <q-btn icon="west" label="返回" to="/" />
    <q-btn color="primary" label="新增" @click="addFolder" />
    <q-btn color="primary" label="扫描" @click="scanFile" />
    <q-table
      title="Table Title"
      :data="folderList"
      :columns="columns"
      row-key="name"
    >
      <q-td slot="body-cell-action" slot-scope="props" :props="props">
        <q-btn color="negative" label="删除" @click="delFolder(props)" />
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
import fs from "fs";
import path from "path";
const dialog = require("electron").remote.dialog;

export default {
  data: () => ({
    columns: [
      {
        label: "路径",
        name: "path",
        field: "path",
        align: "left"
      },
      {
        label: "操作",
        name: "action",
        field: "action"
        // width: 120,
        // render: (h, params) => {
        //   return h("div", [
        //     h(
        //       "Button",
        //       {
        //         props: {
        //           type: "error",
        //           size: "small"
        //         },
        //         on: {
        //           click: () => this.delFolder(params)
        //         }
        //       },
        //       "删除"
        //     )
        //   ]);
        // }
      }
      // {
      //   name: "desc",
      //   required: true,
      //   label: "Dessert (100g serving)",
      //   align: "left",
      //   field: "name",
      //   sortable: true
      // }
    ],
    folderList: [
      // {
      //   name: "Frozen Yogurt",
      //   calories: 159,
      //   fat: 6.0,
      //   carbs: 24,
      //   protein: 4.0,
      //   sodium: 87,
      //   calcium: "14%",
      //   iron: "1%",
      //   path: "aaaaaaaaaaaaaaaaa"
      // }
    ]
  }),
  mounted() {
    this.getFolder();
  },
  methods: {
    getFolder() {
      this.$folderDB.find({}, (err, list) => {
        if (err) throw new Error(err);
        console.log("list", list);
        this.folderList = list;
      });
    },
    addFolder() {
      dialog
        .showOpenDialog({
          properties: ["openDirectory", "multiSelections"]
        })
        .then(({ filePaths }) => {
          if (!filePaths) return;
          // console.log("folders", folders);
          let newPath = [];
          let oldPath = [];
          for (let i of filePaths) {
            if (!this.folderList.find(item => item.path === i)) {
              newPath.push({
                path: i
              });
            } else {
              oldPath.push(i);
            }
          }
          if (oldPath.length) {
            dialog.showMessageBox({
              type: "warning",
              message: `文件夹 ${[...oldPath]} 已存在！`
            });
          }
          if (!newPath.length) return;
          console.log("folderDB", this.$folderDB);
          this.$folderDB.insert(newPath, err => {
            if (err) throw new Error(err);
            this.getFolder();
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    delFolder(params) {
      this.$folderDB.remove(
        {
          _id: params.row._id
        },
        err => {
          if (err) throw new Error(err);
          this.getFolder();
        }
      );
    },
    // 遍历文件目录
    scanFile() {
      const saveFileInfo = (file, stats) => {
        let fileObj = {
          fileName: file,
          fileType: file.substr(file.lastIndexOf(".") + 1),
          fileSize: stats.size / 1024 / 1024 / 1024, // GB
          fileCover: "",
          atime: stats.atime,
          mtime: stats.mtime,
          birthtime: stats.birthtime
        };
        this.$videoDB.insert(fileObj, (err, res) => {
          if (err) {
            throw new Error(err);
          }
        });
      };
      const readDir = (dir, cb) => {
        fs.readdir(dir, (err, files) => {
          if (err) throw new Error(err);
          let count = 0;
          var checkEnd = () => {
            ++count === files.length && cb();
          };
          files.forEach(file => {
            const statPath = path.join(dir, file);
            fs.stat(statPath, (err, stats) => {
              if (err) throw new Error(err);
              if (stats.isFile()) {
                saveFileInfo(file, stats);
                checkEnd();
              } else if (stats.isDirectory()) {
                readDir(statPath, cb);
              }
            });
          });
          files.length === 0 && cb();
        });
      };
      let taskList = [];
      for (let i of this.folderList) {
        taskList.push(
          new Promise((resolve, reject) => {
            readDir(i.path, () => resolve());
          })
        );
      }
      const startTime = new Date();
      Promise.all(taskList).then(() => {
        dialog.showMessageBox({
          type: "info",
          message: `扫描完成，耗时 ${new Date() - startTime} ms`
        });
      });
    }
  }
};
</script>
