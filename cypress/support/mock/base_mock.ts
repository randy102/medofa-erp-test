import OdooRPC from '../utils/OdooRPC'
import { MockItem } from './mock_item';

export default abstract class BaseMock<Config> implements MockItem<Config> {
  id: number
  rpc: OdooRPC
  MODEL: string
  CAN_DELETE: boolean = false
  config = {}

  constructor(config?: Config) {
    this.rpc = OdooRPC.getInstance()
    this.setConfig(config)
  }

  abstract getConfig(config: Config | {}): Promise<object>

  setConfig(config: Config | {} = {}){
    this.config = config
  }

  async generate(): Promise<number> {
    const config = await this.getConfig(this.config)
    const created = await this.rpc.create(this.MODEL, config)
    console.log('Mock Generated')
    this.id = created
    return created
  }

  async get(fields: string[]): Promise<object> {
    const [result] = await this.rpc.read(this.MODEL, this.id, fields)
    return result
  }

  with_cy(asyncCallback: () => Promise<any>) {
    return cy.wrap("Mock").then({ timeout: 30000 }, () => {
      return new Cypress.Promise(resolve => {
        asyncCallback.call(this).then(resolve)
      })
    })
  }

  async cleanup() {
    if (this.CAN_DELETE)
      await this.rpc.unlink(this.MODEL, this.id)
    else
      await this.rpc.archive(this.MODEL, this.id)
  }
}