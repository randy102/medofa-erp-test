import BaseMock from './base_mock'
import random from '../utils/random';

export class CouponProgramConfig{
  name?: string
}

export default class CouponProgramMock extends BaseMock<CouponProgramConfig>{
  MODEL = 'sale.coupon.program'

  protected async getCreateParam({ name = random() }: CouponProgramConfig): Promise<object> {
    return {
      "active": true,
      "program_type": "coupon_program",
      "rule_products_domain": "[['sale_ok', '=', True]]",
      "rule_min_quantity": 1,
      "rule_minimum_amount": 0,
      "rule_minimum_amount_tax_inclusion": "tax_excluded",
      "validity_duration": 1,
      "reward_type": "discount",
      "reward_product_quantity": 1,
      "discount_type": "percentage",
      "discount_percentage": 10,
      "discount_apply_on": "on_order",
      "discount_max_amount": 0,
      "name": name,
      "discount_fixed_amount": 0,
    }
  }
}