var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Writer } from "@redchili/steno";
import fse from "fs-extra";
import { validate } from "jtd";
import { nanoid } from "nanoid";
import path from "path";
import { isEmptyArray } from "./is-empty";
export { default as createSchema } from "./create-schema";
class Localdb {
    constructor(filepath, { schema }) {
        this.filepath = filepath;
        if (fse.existsSync(filepath)) {
            if (fse.readFileSync(filepath, "utf8")) {
                this.cacheData = fse.readJsonSync(filepath);
            }
            else {
                this.cacheData = [];
            }
        }
        else {
            this.cacheData = [];
            fse.mkdirSync(path.dirname(filepath));
            fse.writeFileSync(filepath, "{}");
        }
        this.fileWriter = new Writer(this.filepath);
        this.tables = new Curd(this.cacheData, schema);
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cacheData = this.tables.getAll();
            try {
                yield this.fileWriter.write(JSON.stringify(this.cacheData, null, "\t"));
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
class Curd {
    constructor(data, schema) {
        this.data = data;
        this.schema = schema;
    }
    create(item) {
        const jtdRes = validate(this.schema, item);
        if (!isEmptyArray(jtdRes)) {
            throw new Error(`${JSON.stringify(item)} is invalid, ${JSON.stringify(jtdRes)}`);
        }
        const fullItem = Object.assign({ id: nanoid(), createAt: Date.now(), updateAt: Date.now() }, item);
        this.data.push(fullItem);
    }
    getAll() {
        return this.data;
    }
    createMany(items) {
        items.forEach((item) => {
            this.create(item);
        });
    }
    findOne(condition) {
        const { where } = condition;
        const result = this.data.find((item) => {
            return where(item);
        });
        return result;
    }
    findOneById(where) {
        const { id } = where;
        return this.data.find((it) => it.id === id);
    }
    findMany(condition) {
        const { where } = condition;
        return this.data.filter((item) => {
            return where(item);
        });
    }
    update(condition) {
        const { where, data } = condition;
        const target = this.findMany({ where });
        target.forEach((item) => {
            const index = this.data.indexOf(item);
            let source = this.data[index];
            source = Object.assign(Object.assign(Object.assign({}, source), data), { updateAt: Date.now() });
            this.data[index] = source;
        });
    }
    delete(condition) {
        const target = this.findOne(condition);
        if (target) {
            const index = this.data.indexOf(target);
            this.data.splice(index, 1);
        }
    }
    deleteById(condition) {
        const target = this.findOneById(condition);
        if (target) {
            const index = this.data.indexOf(target);
            this.data.splice(index, 1);
        }
    }
    deleteMany(condition) {
        const target = this.findMany(condition);
        const indexArray = [];
        target.forEach((it) => indexArray.push(this.data.indexOf(it)));
        indexArray.forEach((index) => this.data.splice(index, 1));
    }
    deleteAll() {
        this.data = [];
    }
}
export default Localdb;
//# sourceMappingURL=main.js.map