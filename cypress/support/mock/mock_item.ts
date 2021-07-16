export interface MockItem{
  generate(config: any): Promise<number>
  cleanup(): Promise<void>
  get(fields: string[]): Promise<object>
}