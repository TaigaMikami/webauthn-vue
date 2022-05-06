const engine = require("tingodb")();
const db = new engine.Db("./db", {});

export class DbEngine {
  collection: any;
  constructor(dbName: string) {
    this.collection = db.collection(dbName);
  }

  insert(obj: Object) {
    this.collection.insert([obj]);
  }
}
