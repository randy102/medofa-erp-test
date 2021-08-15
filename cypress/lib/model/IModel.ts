export interface IModel {
  generate(): Promise<number>

  cleanup(cleanupDependencies: boolean): Promise<void>

  getId(): number

  setId(id: number)

  get(fields: string[]): Promise<any>

  call(method: string, ...args): Promise<any>

  write(method: string, val: object): Promise<void>

  unlink(): Promise<void>

  archive(): Promise<void>

  ensureIdExisted()

  getModelName(): string
}