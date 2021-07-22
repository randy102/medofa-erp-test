import OdooRPC from '../utils/OdooRPC'
import { MockItem } from './mock_item';

export default abstract class BaseMock<Config> implements MockItem<Config> {
  protected rpc: OdooRPC
  protected MODEL: string
  protected CAN_DELETE: boolean = false
  private generated:boolean = false

  private id: number
  private config: Partial<Config>

  constructor(config?: Partial<Config>) {
    this.rpc = OdooRPC.getInstance()
    this.setConfig(config)
  }

  protected abstract getCreateParam(config: Partial<Config>): Promise<object>

  setConfig(config: Partial<Config>) {
    this.config = config || {}
  }
  protected async beforeGenerated(config: Partial<Config>) {}
  protected async afterGenerated(id: number, config: Partial<Config>) {}

  async generate(): Promise<number> {
    await this.beforeGenerated(this.config)
    const config = await this.getCreateParam(this.config)
    const created = await this.rpc.create(this.MODEL, config)
    cy.log('Mock Generated')

    this.id = created
    this.generated = true
    await this.afterGenerated(created, this.config)
    return created
  }


  async get(fields: string[]): Promise<any> {
    const [result] = await this.rpc.read(this.MODEL, this.id, fields)
    return result
  }

  getId(): number {
    return this.id
  }

  getConfig(): Partial<Config> {
    return this.config
  }

  static with_cy(asyncCallback: () => Promise<any>) {
    return cy.wrap("Mock").then({ timeout: 30000 }, () => {
      return new Cypress.Promise(resolve => {
        asyncCallback().then((result) => {
          resolve(result)
        })
      })
    })
  }

  protected async beforeCleanup(config: Partial<Config>): Promise<void> {
  }

  protected async afterCleanup(config: Partial<Config>): Promise<void> {
  }


  async cleanup() {
    if (!this.generated) return

    await this.beforeCleanup(this.config)

    if (this.CAN_DELETE)
      await this.rpc.unlink(this.MODEL, this.id)
    else
      await this.rpc.archive(this.MODEL, this.id)

    await this.afterCleanup(this.config)
  }
}