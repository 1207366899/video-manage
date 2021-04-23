<template>
  <q-page padding>
    <!-- content -->
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
      }
    ],
    folderList: []
  }),
  mounted() {
    this.getFolder();
  },
  methods: {
    getFolder() {
      this.$folderDB.find({}, (err, list) => {
        if (err) throw new Error(err);
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
          const list = filePaths.map(item => {
            return {
              path: item
            };
          });
          this.$folderDB.insert(list, err => {
            if (err) {
              console.log(err);
              return;
            }
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
    async scanFile() {
      const videoDB = this.$videoDB;
      videoDB.remove({}, { multi: true }, function(err, numRemoved) {
        console.log(err, numRemoved);
      });
      async function loopDir(dir, parent, parentPath) {
        try {
          const stat = await fs.promises.stat(dir);
          if (stat.isDirectory()) {
            const dirList = await fs.promises.readdir(dir);
            for (const item of dirList) {
              const floderPath = path.resolve(dir, item);
              loopDir(floderPath, stat, dir);
            }
          } else if (stat.isFile()) {
            const basename = path.basename(dir);
            const extname = path.extname(basename);
            let file = {
              name: basename.replace(extname, ""),
              extName: extname,
              path: dir,
              accessTime: new Date(stat.atime).toLocaleString(),
              modifyTime: new Date(stat.mtime).toLocaleString(),
              birthTime: new Date(stat.birthtime).toLocaleString()
            };
            if (parent && parentPath) {
              file = {
                ...file,
                parentPath,
                parentName: path.basename(parentPath),
                parentSize: parent.size / 1024 / 1024 / 1024
              };
            }
            videoDB.insert(file, (err, res) => {
              if (err) {
                throw new Error(err);
              }
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
      const startTime = new Date();
      await Promise.all(
        this.folderList.map(async item => await loopDir(item.path))
      );
      dialog.showMessageBox({
        type: "info",
        message: `扫描完成，耗时 ${new Date() - startTime} ms`
      });

      // const saveFileInfo = (file, stats) => {
      //   let fileObj = {
      //     fileName: file,
      //     fileType: file.substr(file.lastIndexOf(".") + 1),
      //     fileSize: stats.size / 1024 / 1024 / 1024, // GB
      //     fileCover: "",
      //     atime: stats.atime,
      //     mtime: stats.mtime,
      //     birthtime: stats.birthtime
      //   };
      //   this.$videoDB.insert(fileObj, (err, res) => {
      //     if (err) {
      //       throw new Error(err);
      //     }
      //   });
      // };
      // const readDir = (dir, cb) => {
      //   fs.readdir(dir, (err, files) => {
      //     if (err) throw new Error(err);
      //     let count = 0;
      //     var checkEnd = () => {
      //       ++count === files.length && cb();
      //     };
      //     files.forEach(file => {
      //       const statPath = path.join(dir, file);
      //       fs.stat(statPath, (err, stats) => {
      //         if (err) throw new Error(err);
      //         if (stats.isFile()) {
      //           saveFileInfo(file, stats);
      //           checkEnd();
      //         } else if (stats.isDirectory()) {
      //           readDir(statPath, cb);
      //         }
      //       });
      //     });
      //     files.length === 0 && cb();
      //   });
      // };
      // let taskList = [];
      // for (let i of this.folderList) {
      //   taskList.push(
      //     new Promise((resolve, reject) => {
      //       readDir(i.path, () => resolve());
      //     })
      //   );
      // }
      // const startTime = new Date();
      // Promise.all(taskList).then(() => {
      //   dialog.showMessageBox({
      //     type: "info",
      //     message: `扫描完成，耗时 ${new Date() - startTime} ms`
      //   });
      // });
    }
  }
};
</script>
