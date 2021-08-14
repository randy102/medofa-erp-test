import { OdooRPC } from '../../utils';
import { SeedOption } from './SeedOption';

export type ModelConfig = {
  modelName: string
  optionClass: any
}


export abstract class Model<Option extends SeedOption> {
  protected readonly rpc: OdooRPC = OdooRPC.getInstance()
  protected MODEL: string
  protected ID: number
  protected OptionClass: any
  protected option: Option


  constructor(options?: Partial<Option> | number) {
    this.setupModel()
    this.setupOption(options)
  }

  private setupOption(option) {
    if (Number.isInteger(option)) {
      this.ID = option
    } else {
      this.option = new this.OptionClass(option)
    }
  }

  private setupModel() {
    const { modelName, optionClass } = this.getModelConfig()
    this.MODEL = modelName
    this.OptionClass = optionClass
  }

  protected abstract getModelConfig(): ModelConfig

  async generate() {
    if (this.ID) return this.ID
    await this.option.generateORecord()
    console.log(JSON.stringify(this.option.getSeedData(), null, ' '))
    this.ID ||= 9999
  }

  async get(fields: string[]): Promise<any> {
    if (!this.ID) throw Error('ID undefined')
    return this.rpc.read(this.MODEL, this.ID, fields)
  }

  getId(): number {
    return this.ID
  }

  getModelName(): string {
    return this.MODEL
  }

}