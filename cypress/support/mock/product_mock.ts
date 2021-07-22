import BaseMock, { BaseConfig } from './base_mock'
import random from '../utils/random';

export class ProductConfig extends BaseConfig<ProductDepend>{
  name?: string
  price?: number
}

export type ProductDepend = {}

export default class ProductMock extends BaseMock<ProductConfig, ProductDepend> {
  MODEL = 'product.template'
  CAN_DELETE = true

  protected async getDependency(config: Partial<ProductConfig>): Promise<ProductDepend> {
    return {};
  }

  protected async getCreateParam({ price, name }: ProductConfig): Promise<object> {
    return {
      name: name || random(),
      list_price: price || 100000
    }
  }

}