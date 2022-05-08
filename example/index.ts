import path from "path";
import Localdb, { createSchema } from "../src/mod";
import userModel from "./schema/user.model";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const localdb = new Localdb<{ age: number; name: string }>(
  path.join(__dirname, "./local.test.json"),
  {
    schema: createSchema([userModel]),
  }
);

const user = localdb.tables;

// user.create({ name: "Jane", age: 23.2 });

// console.log(user.getAll());

user.updateMany({
  where: (data) => data.name === "Jane",
  data: { age: 36 },
});

localdb.write();
