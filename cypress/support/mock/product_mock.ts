import BaseMock from './base_mock'
import random from '../utils/random';
import { MockItem } from './mock_item';

class GenerateConfig {
  name?: string
  price?: number
}

export default class ProductMock extends BaseMock implements MockItem {
  MODEL = 'product.template'

  constructor() {
    super(true);
  }

  generate({ name = random(), price = 10000 }: GenerateConfig) {
    const val = {
      name,
      list_price: price
    }
    return super._generate(val)
  }

}