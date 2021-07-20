import BaseMock from './base_mock'
import random from '../utils/random';

export class ProductConfig {
  name?: string
  price?: number
}

export default class ProductMock extends BaseMock<ProductConfig> {
  MODEL = 'product.template'
  CAN_DELETE = true

  async getConfig({ name = random(), price = 10000 }: ProductConfig): Promise<object> {
    return {
      name,
      list_price: price
    };
  }

}