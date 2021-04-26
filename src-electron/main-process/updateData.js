import { ipcMain } from "electron";
import { exec } from "child_process";

const video = global.db.video;
ipcMain.on("update-data", (event, arg) => {
  const start = new Date();
  video
    .find({ $or: [{ extName: ".jpg" }, { extName: ".png" }] })
    .exec(async (err, list) => {
      const unSizedList = list.filter(item => !item.parentSize);

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

      unSizedList.length &&
        event.reply(
          "update-reply",
          `更新文件夹大小成功！
        共${unSizedList.length}条，耗时${((new Date() - start) / 1000).toFixed(
            2
          )}s`
        );
    });
});
