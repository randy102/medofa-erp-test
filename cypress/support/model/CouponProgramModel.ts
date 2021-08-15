import { Field, SeedModel, ModelConfig, SeedOption } from 'odoo-seeder'

export class CouponProgramOption extends SeedOption {
  @Field({ key: 'name' })
  name: string

  @Field({ key: 'program_type', def: 'coupon_program' })
  type: string
}

export class CouponProgramModel extends SeedModel<CouponProgramOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'sale.coupon.program',
      optionClass: CouponProgramOption,
      canDelete: false
    };
  }

}