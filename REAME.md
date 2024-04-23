```ts
import path from "path";
import DataLake from "../src/mod.js";
import z from "zod";
import NodeAdapter from "../src/adapter/node.js";
import * as url from "url";
export const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
interface Data extends Record<string, unknown> {
  age: number;
  name: string;
}
const dataLake = new DataLake<Data>(new NodeAdapter(path.join(__dirname, "./user.test.json")));

async function main() {
  await dataLake.schema({
    schema: z.object({
      name: z.string(),
      age: z.number().int().positive(),
    }),
  });
  const user = dataLake.table;
  user.create({ name: "Jane", age: 23 });

  console.log(user.getAll());

  user.updateMany({
    where: (data) => data.name === "Jane",
    data: { age: 36 },
  });
  dataLake.save();
}

main();
```
