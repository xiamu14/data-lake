```js
const localdb = new Localdb("./db/local.dev.json");

// default genId = nanoId // (index) => index+1
const localdb = new Localdb("", { schema: createSchema(
  {
  "id": "string", // nanoid
  "*name": "tom", // required
  "*email": "tom@gmail.com",
  "createAt": "string",
  'updateAt':"string",
  "arr": [
    {
      "site": "string",
      "url": "string"
    }
  ]
})}); // 数据定义 easy-json-schema

// create
await localdb.posts.create({
  title: "",
});

await localdb.posts.createMany([]);

// read
localdb.posts.findUnique({
  where: {
    // title: "",
    id: "",
  },
});

localdb.posts.findMany({
  where: {
    age: (it) => it > 10,
  },
  orderBy: {
    createAt: "asc", // 降序/升序- des/asc / sort function
  },
});

// update
localdb.posts.update(where: {
  id: '',
}, data: {
  role: 'Admin'
});

// delete
localdb.posts.delete({
  where: {
    id:''
  }
});

localdb.posts.deleteMany({
  where: {
    email: (it) => {/qq.com/.test(it)}
  }
})

// delete all
localdb.posts.deleteMany({})

```
