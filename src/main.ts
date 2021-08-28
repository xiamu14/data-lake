import { Writer } from "@redchili/steno";
import fse from "fs-extra";
import { Schema, validate } from "jtd";
import { nanoid } from "nanoid";
import path from "path";
import { isEmptyArray } from "./is-empty";

export { default as createSchema } from "./create-schema";

interface Options {
  schema: Record<string, Schema>;
}

class Localdb {
  private cacheData: Record<string, any[]>;
  private filepath: string;
  private fileWriter: Writer;
  public tables: Record<string, Curd> = {};
  constructor(filepath: string, { schema }: Options) {
    this.filepath = filepath;
    if (fse.existsSync(filepath)) {
      if (fse.readFileSync(filepath, "utf8")) {
        this.cacheData = fse.readJsonSync(filepath);
      } else {
        this.cacheData = { user: [] };
      }
    } else {
      this.cacheData = { user: [] };
      fse.mkdirSync(path.dirname(filepath));
      fse.writeFileSync(filepath, "{}");
    }
    this.fileWriter = new Writer(this.filepath);
    Object.keys(schema).forEach((key) => {
      if (this.cacheData.hasOwnProperty(key)) {
        this.tables[key] = new Curd(this.cacheData[key], schema[key]);
      } else {
        this.tables[key] = new Curd([], schema[key]);
      }
    });
  }
  async write() {
    Object.keys(this.tables).forEach((key) => {
      this.cacheData[key] = this.tables[key].get();
    });

    try {
      await this.fileWriter.write(JSON.stringify(this.cacheData));
    } catch (error) {
      throw error;
    }
  }
}

class Curd {
  private data: any[];
  private schema: Schema;
  constructor(data: any, schema: Schema) {
    this.data = data;
    this.schema = schema;
  }
  create(item: Record<string, any>) {
    const jtdRes = validate(this.schema, item);
    if (!isEmptyArray(jtdRes)) {
      throw new Error(
        `${JSON.stringify(item)} is invalid, ${JSON.stringify(jtdRes)}`
      );
    }
    const fullItem = {
      id: nanoid(),
      createAt: Date.now(),
      updateAt: Date.now(),
      ...item,
    };
    this.data.push(fullItem);
  }

  get() {
    return this.data;
  }

  createMany(items: Record<string, any>[]) {
    this.data = this.data.concat(items);
  }

  findUnique(condition: { where: any }) {
    const { where } = condition;
    const keys = Object.keys(where);
    const result = this.data.filter((item) => {
      return keys.every((key) => where[key] === item[key]);
    });
    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  findMany(condition: { where: any }) {
    const { where } = condition;
    const keys = Object.keys(where);
    return this.data.filter((item) => {
      return keys.every((key) => where[key] === item[key]);
    });
  }

  update(condition: { where: any; data: Record<string, any> }) {
    const { where, data } = condition;
    const target = this.findMany({ where });
    target.forEach((item) => {
      const index = this.data.indexOf(item);
      const source = this.data[index];
      // TODO: 增量更新
      for (const key in data) {
        if (source.hasOwnProperty(key)) {
          source[key] = data[key];
          source.updateAt = Date.now();
        }
      }
      this.data[index] = source;
    });
  }

  delete(condition: { where: any }) {
    const index = this.data.indexOf(this.findUnique(condition));
    this.data.splice(index, 1);
  }

  deleteMany(condition: { where: any }) {
    const target = this.findMany(condition);
    const indexArray: number[] = [];
    target.forEach((it) => indexArray.push(this.data.indexOf(it)));

    indexArray.forEach((index) => this.data.splice(index, 1));
  }

  deleteAll() {
    this.data = [];
  }
}

export default Localdb;
