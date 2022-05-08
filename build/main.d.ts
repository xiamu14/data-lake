import { Schema } from "jtd";
export { default as createSchema } from "./create-schema";
interface Options {
    schema: Record<string, Schema>;
}
interface ItemBaseType {
    id: string;
    createAt: number;
    updateAt: number;
}
declare type FilterType<T> = (data: T) => boolean;
interface WhereById {
    id: string;
}
declare class Localdb<T> {
    private cacheData;
    private filepath;
    private fileWriter;
    tables: Curd<T>;
    constructor(filepath: string, { schema }: Options);
    write(): Promise<void>;
}
declare class Curd<T extends Record<string, any>> {
    private data;
    private schema;
    constructor(data: (T & ItemBaseType)[], schema: Schema);
    create(item: T): void;
    getAll(): (T & ItemBaseType)[];
    createMany(items: T[]): void;
    findOne(condition: {
        where: FilterType<T>;
    }): (T & ItemBaseType) | undefined;
    findOneById(where: WhereById): (T & ItemBaseType) | undefined;
    findMany(condition: {
        where: FilterType<T>;
    }): (T & ItemBaseType)[];
    update(condition: {
        where: FilterType<T>;
        data: Partial<T>;
    }): void;
    delete(condition: {
        where: FilterType<T>;
    }): void;
    deleteById(condition: WhereById): void;
    deleteMany(condition: {
        where: FilterType<T>;
    }): void;
    deleteAll(): void;
}
export default Localdb;
