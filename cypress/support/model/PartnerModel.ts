import { Field, Model, ModelConfig, SeedOption } from '../lib';
import { randomString } from '../utils';

export class PartnerOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string
}

export class PartnerModel extends Model<PartnerOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'res.partner', optionClass: PartnerOption };
  }

}