import { Field, SeedModel, ModelConfig, SeedOption, randomString } from 'odoo-seeder';

export class DistrictOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string

  @Field({ key: 'warning_covid' })
  covid: boolean
}

export class DistrictModel extends SeedModel<DistrictOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'medofa.district',
      optionClass: DistrictOption
    };
  }

}