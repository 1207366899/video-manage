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
// import { exec } from "child_process";
import { ipcRenderer, remote } from "electron";
const { dialog } = remote;

// const { ipcRenderer } = require("electron");
// console.log(ipcRenderer.sendSync("synchronous-message", "ping")); // prints "pong"

// ipcRenderer.on("asynchronous-reply", (event, arg) => {
//   console.log(arg); // prints "pong"
// });
// ipcRenderer.send("asynchronous-message", "ping");

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
      this.$db.floder.find({}, (err, list) => {
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
          this.$db.floder.insert(list, err => {
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
      this.$db.floder.remove(
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
      const db = this.$db.video;
      // videoDB.remove({}, { multi: true }, function(err, numRemoved) {
      //   if (err) {
      //     throw new Error(err);
      //   }
      //   console.log(`删除成功，共 ${numRemoved} 条`);
      // });

      db.find({}, async (err, list) => {
        if (err) throw new Error(err);
        const pathSet = list.reduce((acc, v) => {
          acc[v.name] = v.path;
          return acc;
        }, {});
        // console.log("pathSet", pathSet);

        let fileList = [];
        function loopDir(dir, parent, parentPath) {
          return new Promise(async resolve => {
            try {
              const stat = await fs.promises.stat(dir);
              if (stat.isDirectory()) {
                const dirList = await fs.promises.readdir(dir);
                for (const item of dirList) {
                  const floderPath = path.resolve(dir, item);
                  await loopDir(floderPath, stat, dir);
                }
              } else if (stat.isFile()) {
                const basename = path.basename(dir);
                const extname = path.extname(basename);
                fileList.push({
                  name: basename.replace(extname, ""),
                  extName: extname,
                  path: dir,
                  accessTime: new Date(stat.atime).toLocaleString(),
                  modifyTime: new Date(stat.mtime).toLocaleString(),
                  birthTime: new Date(stat.birthtime).toLocaleString(),
                  parentPath,
                  parentName: path.basename(parentPath)
                });
              }
              resolve();
            } catch (error) {
              console.log(error);
            }
          });
        }

        const startTime = new Date();
        try {
          await Promise.all(
            this.folderList.map(async item => await loopDir(item.path))
          );

          const nameSet = fileList.reduce((total, v) => {
            total[v.name] = true;
            return total;
          }, {});
          // console.log("nameSet", nameSet);

          let add = [],
            update = [];
          fileList.forEach(item => {
            if (!pathSet[item.name]) {
              add.push(item);
            } else if (item.path !== pathSet[item.name]) {
              update.push(item);
            }
          });
          const deleteItems = list.filter(v => !nameSet[v.name]);

          await new Promise(resolve => {
            db.insert(add, (err, newDocs) => {
              if (err) throw new Error(err);
              // console.log("newDocs", newDocs);
              resolve();
            });
          });
          await Promise.all(
            update.map(item => {
              return new Promise(resolve => {
                db.update(
                  { name: item.name },
                  { $set: { path: item.path } },
                  {},
                  (err, numReplaced) => {
                    if (err) throw new Error(err);
                    // console.log("numReplaced", numReplaced);
                    resolve();
                  }
                );
              });
            })
          );
          await Promise.all(
            deleteItems.map(item => {
              return new Promise(resolve => {
                db.remove({ _id: item._id }, {}, (err, numRemoved) => {
                  if (err) throw new Error(err);
                  // console.log("numRemoved", numRemoved);
                  resolve();
                });
              });
            })
          );

          this.$q.notify({
            type: "positive",
            message: `扫描完成，新增${add.length}条，更新${
              update.length
            }条，删除${deleteItems.length}条，耗时 ${new Date() - startTime} ms`
          });
          ipcRenderer.send("update-data");
        } catch (error) {
          console.log(error);
        }
      });
    }
  }
};
</script>
