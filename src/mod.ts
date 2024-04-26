import { ZodObject } from "zod";
import { nanoid } from "nanoid";
import * as util from "./util/index.js";
import { Adapter, ItemType } from "./type.js";
export const helper = util;

type Schema = ZodObject<any>;

type FilterType<T> = (data: T) => boolean;

class Curd<T extends Record<string, unknown>> {
  public data: (T & ItemType)[] = [];
  private schema: Schema;
  constructor(schema: Schema) {
    this.schema = schema;
  }
  mount(data: (T & ItemType)[]) {
    this.data = data;
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
      return fullItem;
    } else {
      throw valid.error;
    }
  }

  getAll() {
    return this.data;
  }

  createMany(items: T[]) {
    return items.map((item) => {
      return this.create(item);
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
      const newItem = {
        ...source,
        ...data,
        updateAt: Date.now(),
      };
      this.data[index] = newItem;
      return newItem;
    }
    return undefined;
  }

  updateMany(condition: { where: FilterType<T>; data: Partial<T> }) {
    const { where, data } = condition;
    const target = this.findMany({ where });
    return target.map((item) => {
      const index = this.data.indexOf(item);
      let source = this.data[index];
      source = {
        ...source,
        ...data,
        updateAt: Date.now(),
      };

      this.data[index] = source;
      return source;
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

class DataLake<T extends Record<string, unknown>> extends Curd<T> {
  private adapter: Adapter<T & ItemType>;
  constructor(options: { schema: Schema; adapter: Adapter<T & ItemType> }) {
    super(options.schema);
    this.adapter = options.adapter;
  }
  async load() {
    try {
      const data = await this.adapter.read();
      this.mount(data);
    } catch (error) {
      console.error(error);
    }
  }
  async save() {
    try {
      await this.adapter.save(JSON.stringify(this.data, null, "\t"));
    } catch (error) {
      console.log(error);
    }
  }
}

export default DataLake;
