import Datastore from "nedb";
import { resolve } from "path";

const db = {
  floder: new Datastore({
    autoload: true,
    filename: resolve("./db/folder.db")
  }),
  video: new Datastore({
    autoload: true,
    filename: resolve("./db/video.db")
  }),
  history: new Datastore({
    autoload: true,
    filename: resolve("./db/history.db")
  })
};
const consoleError = err => err && console.warn(err);
db.floder.ensureIndex({ fieldName: "path", unique: true }, consoleError);
db.video.ensureIndex({ fieldName: "path", unique: true }, consoleError);
db.history.ensureIndex({ fieldName: "accessTime", unique: true }, consoleError);

global.db = db;
