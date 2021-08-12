import { OdooRPC } from '../../utils'
import { MockItem } from './MockItem';
import { BaseConfig } from "./BaseConfig";

export type RawConfig<C, D> = {
  config?: Partial<C>,
  depend?: Partial<D>
}

export type BaseMockConfig = {
  configClass: any,
  model: string
  canDelete?: boolean
}

export type RefFieldInitiator = { [field: string]: MockInitiator }

export class MockInitiator<Config = any> {
  private readonly config: Config
  private readonly MockClass

  constructor(mockClass, config?: Config) {
    this.MockClass = mockClass
    this.config = config
  }

  init() {
    return new this.MockClass(this.config)
  }

}

export abstract class BaseMock<Config extends BaseConfig, Depend> implements MockItem<Config> {
  protected rpc: OdooRPC
  protected readonly MODEL: string
  private readonly CAN_DELETE: boolean

  private CACHE: { [key: string]: any } = {}
  private id: number

  private readonly rawConfig: RawConfig<Config, Depend>
  private readonly config: Config
  protected dependencies: Depend
  protected refFieldInitiator: RefFieldInitiator


  constructor(config?: RawConfig<Config, Depend> | number) {
    this.rpc = OdooRPC.getInstance()
    if (typeof config == 'number')
      this.id = config
    else
      this.rawConfig = config || { config: {}, depend: {} }

    const { configClass, model, canDelete = false } = this.getMockConfig()
    this.config = new configClass(this.rawConfig)
    this.MODEL = model
    this.CAN_DELETE = canDelete
  }

  protected abstract getMockConfig(): BaseMockConfig

  private async generateDependency() {
    for (const depends of Object.keys(this.dependencies)) {
      await this.dependencies[depends]?.generate()
    }
  }

  protected async beforeGenerated(config: Partial<Config>, depends: Partial<Depend>) {
  }

  protected abstract getCreateParam(config: Partial<Config>, depends: Partial<Depend>): Promise<object>

  protected async afterGenerated(id: number, config: RawConfig<Config, Depend>, depends: Depend) {
  }

  protected async getInitiator(config: RawConfig<Config, Depend>): Promise<RefFieldInitiator> {
    return null
  }

  protected async getDependency(config: RawConfig<Config, Depend>): Promise<Depend> {
    return null
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
    console.log(this.config)

    this.dependencies = await this.getDependency(this.rawConfig)

    await this.beforeGenerated(this.config, this.dependencies)

    await this.generateDependency()

    this.refFieldInitiator = await this.getInitiator(this.rawConfig)

    this.config.convertRefToMock(this.refFieldInitiator)

    const config = await this.getCreateParam(this.config, this.dependencies)

    const created = await this.rpc.create(this.MODEL, { ...config, ...this.config.raw })
    cy.log(`${this.constructor.name}(${created}) Generated`)

    this.id = created
    await this.afterGenerated(created, this.rawConfig, this.dependencies)
    return created
  }


  async get(fields: string[]): Promise<any> {
    if (!this.id) throw Error('Mock Item is not generated yet!')

    let result = {}
    const fieldsToFetch = []

    for (const field of fields) {
      const KEY = 'field_' + field
      if (this.existCache(KEY)) result[field] = this.getCache(KEY)
      else fieldsToFetch.push(field)
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

  protected async beforeCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<void> {
  }

  protected async afterCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<void> {
  }

  protected async shouldCleanup(config: Partial<Config>, depends: Partial<Depend>): Promise<boolean> {
    return true
  }

  /**
   * Clean up method
   * @param cleanupDependencies decide whether to cleanup its dependency after cleanup mock
   */
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