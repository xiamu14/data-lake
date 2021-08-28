import path from "path";
import Localdb, { createSchema } from "../src/main";
import userModel from "./schema/user.model";

const localdb = new Localdb(path.join(__dirname, "./local.test.json"), {
  schema: createSchema([userModel]),
});

const { user } = localdb.tables;

user.create({ name: "Jane", age: 23.2 });

user.update({ where: { id: "wxygUB5NWFkkfyLzsur01" }, data: { age: 20 } });
localdb.write();
