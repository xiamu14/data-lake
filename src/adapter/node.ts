import fse from "fs-extra";
import path from "path";
import { Writer } from "@redchili/steno";
import { Adapter } from "../type";

export default class NodeAdapter<T> extends Adapter<T> {
  instance: Writer;
  constructor(filePath: string) {
    super(filePath);
    this.instance = new Writer(filePath);
  }
  async save(data: string) {
    this.instance.write(data);
  }
  async read() {
    let data = [];
    if (fse.existsSync(this.filepath)) {
      if (fse.readFileSync(this.filepath, "utf8")) {
        data = fse.readJsonSync(this.filepath);
      }
    } else {
      fse.mkdirSync(path.dirname(this.filepath));
      fse.writeFileSync(this.filepath, "[]");
    }
    return data as T[];
  }
}
