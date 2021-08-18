import { Field, SeedModel, ModelConfig, ORecord, randomString, SeedOption } from 'odoo-seeder';
import { DistrictModel } from './DistrictModel';


export class PartnerOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string

  @Field({ key: 'customer_ref_id' })
  customerRefId: number

  @Field({ key: 'district_id', cls: DistrictModel })
  district: ORecord<DistrictModel>

  @Field({ key: 'loyalty_rank' })
  loyaltyRank: string
}

export class PartnerModel extends SeedModel<PartnerOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'res.partner', optionClass: PartnerOption };
  }

}