import path from "path";
import Localdb from "../src/mod.js";
import z from "zod";
import NodeAdapter from "../src/adapter/node.js";
import * as url from "url";
export const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
interface Data extends Record<string, unknown> {
  age: number;
  name: string;
}
const localdb = new Localdb<Data>(
  new NodeAdapter(path.join(__dirname, "./local.test.json"))
);

async function test() {
  await localdb.schema({
    schema: z.object({
      name: z.string(),
      age: z.number().int().positive(),
    }),
  });
  const user = localdb.tables;
  user.create({ name: "Jane", age: 23 });

  // console.log(user.getAll());

  // user.updateMany({
  //   where: (data) => data.name === "Jane",
  //   data: { age: 36 },
  // });
  localdb.write();
}

test();
