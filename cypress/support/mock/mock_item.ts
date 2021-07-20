import Chainable = Cypress.Chainable;
import OdooRPC from '../utils/OdooRPC';

export interface MockItem<Config = {}> {
  MODEL: string
  CAN_DELETE: boolean
  config: Config | {}
  id: number
  rpc: OdooRPC

  generate(): Promise<number>

  cleanup(): Promise<void>

  get(fields: string[]): Promise<object>

  with_cy(asyncCallback: () => Promise<any>): Chainable

  getConfig(config: Config | {}): Promise<object>
}