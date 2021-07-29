import { BaseConfig, BaseMock } from "./BaseMock";
import { randomString } from "../utils";

type PartnerDepend = {}

class PartnerConfig extends BaseConfig<PartnerDepend> {
  name: string
  customerRefId: number
}

export class PartnerMock extends BaseMock<PartnerConfig, PartnerDepend> {
  MODEL = 'res.partner'

  protected async getCreateParam({
                                   name = randomString(),
                                   customerRefId
                                 }: Partial<PartnerConfig>, depends: Partial<PartnerDepend>): Promise<object> {
    return {
      name,
      customer_ref_id: customerRefId
    }
  }

  protected async getDependency(config: Partial<PartnerConfig>): Promise<PartnerDepend> {
    return {}
  }


}