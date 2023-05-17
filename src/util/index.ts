export function isEmptyArray(data: unknown[]) {
  return Array.isArray(data) && data.length === 0;
}
