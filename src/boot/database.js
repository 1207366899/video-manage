// import something here
import Datastore from "nedb";
import { resolve } from "path";
// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async (/* { app, router, Vue ... } */ { Vue }) => {
  const db = {
    floder: new Datastore({
      autoload: true,
      filename: resolve("./folder.db")
    }),
    video: new Datastore({
      autoload: true,
      filename: resolve("./video.db")
    }),
    history: new Datastore({
      autoload: true,
      filename: resolve("./history.db")
    })
  };
  const consoleError = err => err && console.warn(err);
  db.floder.ensureIndex({ fieldName: "path", unique: true }, consoleError);
  db.video.ensureIndex({ fieldName: "path", unique: true }, consoleError);
  db.history.ensureIndex(
    { fieldName: "accessTime", unique: true },
    consoleError
  );
  Vue.prototype.$db = db;
  // something to do
};
