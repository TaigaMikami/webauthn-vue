import { DBLoggedInUser } from "../types/server";
import { Collection, MongoClient } from "mongodb";

const  url = "mongodb://localhost:27017";

export class DbEngine {
  dbName: string;
  client: MongoClient | any;
  collection: Collection | any;
  constructor(dbName: string) {
    this.client = new MongoClient(url);
    this.dbName = dbName;
  }

  async init() {
    await this.client.connect();
    const db = this.client.db(this.dbName);
    this.collection =  db.collection("user");
  }

  async insert(obj: Object) {
    await this.collection.insertOne(obj);
  }

  async findOne(userId: string): Promise<DBLoggedInUser> {
    return new Promise((resolve, reject) =>  {
      this.collection.findOne({ id: userId }, (err: any, item: DBLoggedInUser) => {
        if (!err) {
          resolve(item);
        } else {
          reject(err);
        }
      });
    })
  }

  async updateOne(userId: string, obj: Object) {
    await this.collection.updateOne({ id: userId }, { $set: obj });
  }

  close() {
    this.client.close();
  }
}
