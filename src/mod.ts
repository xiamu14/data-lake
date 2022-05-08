import { Writer } from "@redchili/steno";
import fse from "fs-extra";
import { Schema, validate } from "jtd";
import { nanoid } from "nanoid";
import path from "path";
import { isEmptyArray } from "./is-empty.js";

export { default as createSchema } from "./create-schema.js";

interface Options {
  schema: Record<string, Schema>;
}

interface ItemBaseType {
  id: string;
  createAt: number;
  updateAt: number;
}

type FilterType<T> = (data: T) => boolean;

class Localdb<T> {
  private cacheData: (T & ItemBaseType)[];
  private filepath: string;
  private fileWriter: Writer;
  public tables: Curd<T>;
  constructor(filepath: string, { schema }: Options) {
    this.filepath = filepath;
    if (fse.existsSync(filepath)) {
      if (fse.readFileSync(filepath, "utf8")) {
        this.cacheData = fse.readJsonSync(filepath);
      } else {
        this.cacheData = [];
      }
    } else {
      this.cacheData = [];
      fse.mkdirSync(path.dirname(filepath));
      fse.writeFileSync(filepath, "{}");
    }
    this.fileWriter = new Writer(this.filepath);
    this.tables = new Curd(this.cacheData, schema);
  }
  async write() {
    this.cacheData = this.tables.getAll();

    try {
      await this.fileWriter.write(JSON.stringify(this.cacheData, null, "\t"));
    } catch (error) {
      console.log(error);
    }
  }
}

class Curd<T extends Record<string, any>> {
  private data: (T & ItemBaseType)[];
  private schema: Schema;
  constructor(data: (T & ItemBaseType)[], schema: Schema) {
    this.data = data;
    this.schema = schema;
  }
  create(item: T) {
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

  getAll() {
    return this.data;
  }

  createMany(items: T[]) {
    items.forEach((item) => {
      this.create(item);
    });
  }

  findById(id: string) {
    return this.data.find((it) => it.id === id);
  }

  findMany(condition: { where: FilterType<T> }) {
    const { where } = condition;

    return this.data.filter((item) => {
      return where(item);
    });
  }

  updateById(id: string, data: Partial<T>) {
    const target = this.findById(id);
    if (target) {
      const index = this.data.indexOf(target);
      const source = this.data[index];
      this.data[index] = {
        ...source,
        ...data,
        updateAt: Date.now(),
      };
    }
  }

  updateMany(condition: { where: FilterType<T>; data: Partial<T> }) {
    const { where, data } = condition;
    const target = this.findMany({ where });
    target.forEach((item) => {
      const index = this.data.indexOf(item);
      let source = this.data[index];
      source = {
        ...source,
        ...data,
        updateAt: Date.now(),
      };

      this.data[index] = source;
    });
  }

  deleteById(id: string) {
    const target = this.findById(id);
    if (target) {
      const index = this.data.indexOf(target);
      this.data.splice(index, 1);
    }
  }

  deleteMany(condition: { where: FilterType<T> }) {
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
