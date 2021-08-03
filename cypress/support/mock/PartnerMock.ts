import { BaseConfig, BaseMock } from "./BaseMock";
import { randomString } from "../utils";
import { DistrictMock } from "./DistrictMock";

type PartnerDepend = {
  district?: DistrictMock
}

class PartnerConfig extends BaseConfig<PartnerDepend> {
  name: string
  customerRefId: number
}

export class PartnerMock extends BaseMock<PartnerConfig, PartnerDepend> {
  MODEL = 'res.partner'
  CAN_DELETE = true

  protected async getCreateParam(config: Partial<PartnerConfig>, depends: Partial<PartnerDepend>): Promise<object> {
    const { name = randomString(), customerRefId } = config
    const { district } = depends
    return {
      name,
      customer_ref_id: customerRefId,
      district_id: district.getId()
    }
  }

  protected async getDependency({ depends }: Partial<PartnerConfig>): Promise<PartnerDepend> {
    const { district } = depends
    if (!district) {
      depends.district = new DistrictMock()
    }
    return depends
  }


}