export interface MockItem<Config = {}> {
  getId(): number

  generate(): Promise<number>

  cleanup(cleanupDependencies?: boolean): Promise<void>

  get(fields: string[]): Promise<object>
}