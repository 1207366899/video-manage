import Vue from 'vue'
import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

const folderDB = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/folders.db')
})
const videoDB = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/videos.db')
})

Vue.prototype.$folderDB = folderDB
Vue.prototype.$videoDB = videoDB
