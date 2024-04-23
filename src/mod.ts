import { ZodObject } from "zod";
import { nanoid } from "nanoid";
import * as util from "./util/index.js";
import { Adapter, ItemType } from "./type.js";
export const helper = util;

type Schema = ZodObject<any>;

type FilterType<T> = (data: T) => boolean;

class DataLake<T extends Record<string, unknown>> {
  // @ts-ignore
  private data: (T & ItemType)[];
  private fileTool: Adapter<T & ItemType>;
  // @ts-ignore
  public table: Curd<T>;
  constructor(adapter: Adapter<T & ItemType>) {
    this.fileTool = adapter;
  }
  async schema({ schema }: { schema: Schema }) {
    const data = await this.fileTool.read();
    try {
      this.table = new Curd(data, schema);
    } catch (error) {
      console.error(error);
    }
  }
  async save() {
    this.data = this.table.getAll();

    try {
      await this.fileTool.save(JSON.stringify(this.data, null, "\t"));
    } catch (error) {
      console.log(error);
    }
  }
}

class Curd<T extends Record<string, unknown>> {
  private data: (T & ItemType)[];
  private schema: Schema;
  constructor(data: (T & ItemType)[], schema: Schema) {
    this.data = data;
    this.schema = schema;
  }
  create(item: T) {
    const valid = this.schema.safeParse(item);
    if (valid.success) {
      const fullItem = {
        id: nanoid(),
        createAt: Date.now(),
        updateAt: Date.now(),
        ...item,
      };
      this.data.push(fullItem);
    } else {
      throw valid.error;
    }
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

export default DataLake;
