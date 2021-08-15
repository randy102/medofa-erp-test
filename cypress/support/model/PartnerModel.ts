import { Field, Model, ModelConfig, ORecord, randomString, SeedOption } from '../lib';
import { DistrictModel } from './DistrictModel';

export class PartnerOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string

  @Field({ key: 'customer_ref_id' })
  customerRefId: number

  @Field({ key: 'district_id', cls: DistrictModel })
  district: ORecord<DistrictModel>
}

export class PartnerModel extends Model<PartnerOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'res.partner', optionClass: PartnerOption };
  }

}