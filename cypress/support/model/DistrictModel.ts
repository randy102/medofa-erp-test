import { Field, Model, ModelConfig, SeedOption, randomString } from '../lib';

export class DistrictOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string

  @Field({ key: 'warning_covid' })
  covid: boolean
}

export class DistrictModel extends Model<DistrictOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'medofa.district',
      optionClass: DistrictOption
    };
  }

}