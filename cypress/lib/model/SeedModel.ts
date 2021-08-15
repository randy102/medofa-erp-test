import { SeedOption } from './SeedOption';
import { clone, OdooRPC } from '../helper';
import { IModel } from './IModel';

export type ModelConfig = {
  modelName: string
  optionClass: any
  canDelete?: boolean
}


export abstract class SeedModel<Option extends SeedOption> implements IModel {
  protected readonly rpc: OdooRPC = OdooRPC.getInstance()
  protected MODEL: string
  protected ID: number
  protected CAN_DELETE: boolean
  protected OptionClass: any
  protected option: Option


  constructor(options?: Partial<Option> | number) {
    this.setupModel()
    this.setupOption(options)
  }

  private setupOption(option) {
    if (Number.isInteger(option)) {
      this.setId(option)
    } else {
      this.option = new this.OptionClass(option)
    }
  }

  private setupModel() {
    const { modelName, optionClass, canDelete } = this.getModelConfig()
    this.MODEL = modelName
    this.OptionClass = optionClass
    this.CAN_DELETE = canDelete !== undefined ? canDelete : true
  }

  protected abstract getModelConfig(): ModelConfig

  protected async beforeGenerate(option: Option) {
  }

  protected async afterGenerate(option: Option, id: number) {
  }

  async generate(): Promise<number> {
    const id = this.getId()
    if (id) return id
    try {
      await this.option.generateORecord()
      await this.beforeGenerate(this.option)
      const data = this.option.getSeedData()
      const createdId = await this._create(data)
      this.setId(createdId)
      await this.afterGenerate(clone(this.option), createdId)
      return createdId
    } catch (err) {
      console.log('An error occurs during model generating: ', { err })
    }
  }

  protected async beforeCleanup(option: Option): Promise<void> {
  }

  protected async afterCleanup(option: Option): Promise<void> {
  }

  protected async shouldCleanup(option: Option): Promise<boolean> {
    return true
  }

  /**
   * Clean up method
   * @param cleanupDependencies decide whether to cleanup its dependency after cleanup mock
   */
  async cleanup(cleanupDependencies = true) {
    if (!this.getId() || !(await this.shouldCleanup(clone(this.option)))) return
    await this.beforeCleanup(clone(this.option))
    if (this.CAN_DELETE)
      await this.unlink()
    else
      await this.archive()
    await this.afterCleanup(clone(this.option))
    if (cleanupDependencies) {
      await this.option.cleanupORecord()
    }
  }

  async get(fields: string[]): Promise<any> {
    this.ensureIdExisted()
    const [data] = await this.rpc.read(this.getModelName(), [this.getId()], fields)
    return data
  }

  call(method: string, ...args): Promise<any> {
    this.ensureIdExisted()
    return this.rpc.call(this.getModelName(), method, this.getId(), ...args)
  }

  write(method: string, val: object): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.write(this.getModelName(), this.getId(), val)
  }

  unlink(): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.unlink(this.getModelName(), this.getId())
  }

  archive(): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.archive(this.getModelName(), this.getId())
  }

  private async _create(val: object): Promise<number> {
    const id = this.getId()
    if (id) return id
    return this.create(val, clone(this.option))
  }

  create(val: object, option: Option): Promise<number> {
    return this.rpc.create(this.getModelName(), val)
  }

  ensureIdExisted() {
    if (!this.getId()) throw Error('ID undefined. SeedModel is not generated.')
  }

  getId(): number {
    return this.ID
  }

  setId(id: number) {
    if (this.getId()) return
    this.ID = id
  }

  getModelName(): string {
    return this.MODEL
  }

}