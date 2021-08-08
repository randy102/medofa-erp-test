import { BaseConfig, BaseMock } from "../lib";
import { randomString } from "../utils";

type DistrictDepend = {}

class DistrictConfig extends BaseConfig<DistrictDepend> {
  name: string
}

export class DistrictMock extends BaseMock<DistrictConfig, DistrictDepend> {
  MODEL = 'medofa.district'
  CAN_DELETE = true

  protected async getCreateParam(config: Partial<DistrictConfig>, depends: Partial<DistrictDepend>): Promise<object> {
    const { name = randomString() } = config
    return {
      name,
    }
  }

  protected async getDependency(config: Partial<DistrictConfig>): Promise<DistrictDepend> {
    return {}
  }
}