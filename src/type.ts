export interface ItemType {
  id: string;
  createAt: number;
  updateAt: number;
}
export abstract class Adapter<T> {
  filepath: string;
  constructor(filepath: string) {
    this.filepath = filepath;
  }
  abstract save(data: string): Promise<void>;

  abstract read(): Promise<T[]>;
}
