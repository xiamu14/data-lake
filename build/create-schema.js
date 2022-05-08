export default function createSchemas(schemaArray) {
    const schema = schemaArray.reduce((all, item) => (Object.assign(Object.assign({}, all), item)));
    return schema;
}
//# sourceMappingURL=create-schema.js.map