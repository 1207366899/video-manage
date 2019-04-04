import {dialog, ipcMain} from 'electron'

ipcMain.on('open-directory-dialog', (event, p) => {
  dialog.showOpenDialog({
    properties: [p]
  }, folders => {
    // if (files) {
    //   // 如果有选中
    //   // 发送选择的对象给子进程
    //   event.sender.send('selectedItem', files[0])
    // }
    console.log(folders)
  })
})
