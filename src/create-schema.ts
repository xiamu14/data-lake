export default function createSchemas(schemaArray: { [key: string]: any }[]) {
  const schema: Record<string, any> = schemaArray.reduce((all, item) => ({
    ...all,
    ...item,
  }));
  return schema;
}
