import { Field, SeedModel, ModelConfig, SeedOption } from 'odoo-seeder'

export class ProgramOption extends SeedOption {
  @Field({ key: 'name' })
  name: string

  @Field({ key: 'public_name', def: (option) => option.name })
  publicName: string

  @Field({ key: 'program_type' })
  type: 'promotion_program' | 'coupon_program'

  @Field({ key: 'is_loyalty' })
  isLoyalty: boolean

  @Field({ key: 'discount_type' })
  discountType: 'fixed_amount' | 'percentage'

  @Field({ key: 'discount_percentage' })
  percentage: number

  @Field({ key: 'discount_fixed_amount' })
  fixAmount: number

  @Field({ key: 'promo_code_usage' })
  usage: 'code_needed' | 'no_code_needed'

  @Field({ key: 'promo_code' })
  code: string

  @Field({ key: 'reward_point' })
  loyaltyReward: number
}

export class ProgramModel extends SeedModel<ProgramOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'sale.coupon.program',
      optionClass: ProgramOption,
    };
  }

}