import Chainable = Cypress.Chainable;
import OdooRPC from '../utils/OdooRPC';

export interface MockItem<Config = {}> {
  getId(): number

  generate(): Promise<number>

  cleanup(): Promise<void>

  get(fields: string[]): Promise<object>

  with_cy(asyncCallback: () => Promise<any>): Chainable
}