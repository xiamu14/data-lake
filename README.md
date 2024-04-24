```ts
import path from "path";
import DataLake from "../src/mod.js";
import z from "zod";
import NodeAdapter from "../src/adapter/node.js";
import * as url from "url";
export const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const User = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});
const userTable = new DataLake<z.infer<typeof User>>({
  schema: User,
  adapter: new NodeAdapter(path.join(__dirname, "./user.test.json")),
});

async function main() {
  await userTable.load();
  userTable.create({ name: "Jane", age: 23 });

  // console.log(userTable.findById("Atw2ExFczYHIacTOxLxmz"));

  console.log(userTable.findMany({ where: (data) => data.name === "Jane" }));

  // userTable.updateMany({
  //   where: (data) => data.name === "Jane",
  //   data: { age: 36 },
  // });
  userTable.save();
}

main();
```
