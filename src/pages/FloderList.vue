<template>
  <q-page padding>
    <!-- content -->
    <q-btn color="primary" label="新增" @click="addFolder" />
    <q-btn label="清空" @click="clearData" />
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
// import fs from "fs";
// import path from "path";
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
    clearData() {
      this.$db.video.remove({}, { multi: true }, function(err, numRemoved) {
        if (err) {
          throw new Error(err);
        }
        console.log(`删除成功，共 ${numRemoved} 条`);
      });
    },
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
      ipcRenderer.send("scan-file");
    }
  }
};
</script>
