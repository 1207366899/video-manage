import Vue from "vue";
import Datastore from "nedb";
// import path from "path";
// import { remote } from "electron";

const folderDB = new Datastore({
  autoload: true,
  // filename: path.join(remote.app.getPath("userData"), "/folders.db")
  filename: "D:\\folders.db"
});
const videoDB = new Datastore({
  autoload: true,
  filename: "D:\\videos.db"
  // filename: path.join(remote.app.getPath("userData"), "/videos.db")
});
const historyDB = new Datastore({
  autoload: true,
  filename: "D:\\history.db"
  // filename: path.join(remote.app.getPath("userData"), "/videos.db")
});
folderDB.ensureIndex({ fieldName: "path", unique: true }, err => {
  if (err) console.log(err);
});
videoDB.ensureIndex({ fieldName: "path", unique: true }, err => {
  if (err) console.log(err);
});
historyDB.ensureIndex({ fieldName: "accessTime", unique: true }, err => {
  if (err) console.log(err);
});

Vue.prototype.$folderDB = folderDB;
Vue.prototype.$videoDB = videoDB;
Vue.prototype.$historyDB = historyDB;
