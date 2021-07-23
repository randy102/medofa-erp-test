import OdooRPC from '../utils/OdooRPC'
import { MockItem } from './MockItem';

export abstract class BaseConfig<Depend> {
  depends: Partial<Depend>
}

export abstract class BaseMock<Config extends BaseConfig<Depend>, Depend> implements MockItem<Config> {
  protected rpc: OdooRPC
  protected MODEL: string
  protected CAN_DELETE: boolean = false

  private CACHE: { [key: string]: any } = {}
  private id: number
  private config: Partial<Config>
  protected dependencies: Partial<Depend>

  constructor(config?: Partial<Config>) {
    this.rpc = OdooRPC.getInstance()
    this.setConfig(config)
  }

  protected abstract getCreateParam(config: Partial<Config>, depends: Partial<Depend>): Promise<object>

  setConfig(config: Partial<Config>) {
    this.config = config || {}
    this.config['depends'] = this.config['depends'] || {}
  }

  protected async beforeGenerated(config: Partial<Config>, depends: Partial<Depend>) {
  }

  protected async afterGenerated(id: number, config: Partial<Config>, depends: Partial<Depend>) {
  }

  protected abstract getDependency(config: Partial<Config>): Promise<Depend>

  private async generateDependency() {
    for (const depends of Object.keys(this.dependencies)) {
      await this.dependencies[depends].generate()
    }
  }

  /**
   * @name generate
   * @description A method to generate mock item base on config and dependencies.
   *  After method is called, the method will do some actions:
   *  1. Check if the mock is generated before, if so, it just ignore and return generated id
   *  2. Setup dependencies
   *  3. Run BeforeGenerated hook
   *  4. Run generate method in all dependency item
   *  5. Setup param used to pass in create method
   *  6. Create mock item
   *  7. Store created id
   *  8. Run AfterGenerated hook
   *  @return id Item's id
   */
  async generate(): Promise<number> {
    if (this.id) return this.id

    this.dependencies = await this.getDependency(this.config)
    await this.beforeGenerated(this.config, this.dependencies)

    await this.generateDependency()

    const config = await this.getCreateParam(this.config, this.dependencies)

    const created = await this.rpc.create(this.MODEL, config)
    cy.log('Mock Generated')

    this.id = created
    await this.afterGenerated(created, this.config, this.dependencies)
    return created
  }


  async get(fields: string[]): Promise<any> {
    if (!this.id) {
      throw Error('Mock Item is not generated yet!')
    }
    let result = {}
    const fieldsToFetch = []
    for (const field of fields) {
      const KEY = 'field_' + field
      if (this.existCache(KEY)) {
        result[field] = this.getCache(KEY)
      } else {
        fieldsToFetch.push(field)
      }
    }
    if (fieldsToFetch.length > 0) {
      const [fetchResult] = await this.rpc.read(this.MODEL, this.id, fieldsToFetch)
      result = { ...result, ...fetchResult }
    }
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

  protected async beforeCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<void> {
  }

  protected async afterCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<void> {
  }

  protected async shouldCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<boolean> {
    return true
  }

  async cleanup(cleanupDependencies = true) {
    if (!this.id || !(await this.shouldCleanup(this.config, this.dependencies))) return

    await this.beforeCleanup(this.config, this.dependencies)

    if (this.CAN_DELETE)
      await this.rpc.unlink(this.MODEL, this.id)
    else
      await this.rpc.archive(this.MODEL, this.id)

    await this.afterCleanup(this.config, this.dependencies)

    if (cleanupDependencies) {
      await this.cleanupDependencies()
    }
  }

  async cleanupDependencies() {
    for (const depends of Object.keys(this.dependencies)) {
      await this.dependencies[depends].cleanup()
    }
  }

  protected getCache<T = any>(key: any): T {
    key = String(key)
    if (key in this.CACHE) {
      return this.CACHE[key]
    }
    return undefined
  }

  protected setCache(key: any, value: any) {
    key = String(key)
    this.CACHE[key] = value
  }

  protected existCache(key: any): boolean {
    key = String(key)
    return key in this.CACHE
  }
}