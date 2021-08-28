import { Schema } from "jtd";

const model = {
  properties: {
    name: { type: "string" },
    age: { type: "int32" },
  },
} as Schema;

export default { user: model };
