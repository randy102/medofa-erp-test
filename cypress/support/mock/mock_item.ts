import Chainable = Cypress.Chainable;

export interface MockItem{
  generate(config: any): Promise<number>
  cleanup(): Promise<void>
  get(fields: string[]): Promise<object>
  with_cy(asyncCallback: () => Promise<any>): Chainable
}