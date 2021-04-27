import fs from "fs";
import path from "path";
import { ipcMain } from "electron";
import { exec } from "child_process";

const video = global.db.video;
ipcMain.on("scan-file", async (event, arg) => {
  const start = new Date();
  try {
    const getAll = async () => {
      return new Promise(resolve => {
        video.find({}, (err, list) => {
          if (err) throw new Error(err);
          resolve(list);
        });
      });
    };

    const folderList = await new Promise(resolve => {
      global.db.floder.find({}, (err, list) => {
        if (err) throw new Error(err);
        resolve(list);
      });
    });

    let list = await getAll();
    const pathSet = list.reduce((acc, v) => {
      acc[v.name] = v.path;
      return acc;
    }, {});

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

    await Promise.all(folderList.map(async item => await loopDir(item.path)));
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

    // 插入
    await new Promise(resolve => {
      video.insert(add, (err, newDocs) => {
        if (err) throw new Error(err);
        // console.log("newDocs", newDocs);
        resolve();
      });
    });
    // 更新
    await Promise.all(
      update.map(item => {
        return new Promise(resolve => {
          video.update(
            { name: item.name },
            { $set: { ...item } },
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
    // 删除
    await Promise.all(
      deleteItems.map(item => {
        return new Promise(resolve => {
          video.remove({ _id: item._id }, {}, (err, numRemoved) => {
            if (err) throw new Error(err);
            // console.log("numRemoved", numRemoved);
            resolve();
          });
        });
      })
    );

    // 更新文件夹大小
    list = await getAll();
    const unSizedList = list.filter(
      item =>
        (item.extName === ".jpg" || item.extName === ".png") && !item.parentSize
    );
    await Promise.all(
      unSizedList.map(async item => {
        return new Promise(async resolve => {
          const parentSize = await new Promise(resolve => {
            exec(
              `powershell.exe -command " cd '${item.parentPath}'; Get-ChildItem -Recurse | Measure-Object -Sum Length"`,
              function(err, stdout, stderr) {
                if (err) throw new Error(err);
                const sum = stdout
                  .replace(/\r\n/g, ":")
                  .split(":")[7]
                  .trim();
                resolve(sum);
              }
            );
          });
          video.update(
            { path: item.path },
            { $set: { parentSize } },
            {},
            function(err, numReplaced) {
              // console.log(numReplaced);
              resolve();
            }
          );
        });
      })
    );

    event.reply(
      "scan-reply",
      `扫描完成，新增${add.length}条，更新${update.length}条，删除${
        deleteItems.length
      }条，耗时${((new Date() - start) / 1000).toFixed(2)}s`
    );
  } catch (error) {
    console.log(error);
  }
});
