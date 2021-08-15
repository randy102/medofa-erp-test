import { Field, Model, ModelConfig, SeedOption } from '../lib';

export class CouponProgramOption extends SeedOption {
  @Field({ key: 'name' })
  name: string

  @Field({ key: 'program_type', def: 'coupon_program' })
  type: string
}

export class CouponProgramModel extends Model<CouponProgramOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'sale.coupon.program',
      optionClass: CouponProgramOption,
      canDelete: false
    };
  }

}