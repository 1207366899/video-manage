// import something here
import { remote } from "electron";
// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async (/* { app, router, Vue ... } */ { Vue }) => {
  const db = remote.getGlobal("db");
  Vue.prototype.$db = db;
  // something to do
};
