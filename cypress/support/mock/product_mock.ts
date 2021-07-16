import BaseMock from './base_mock'

export default class ProductMock extends BaseMock{
  MODEL = 'product.template'

  constructor() {
    super(true);
  }

  generate(name, sale_price=10000){
    const val = {
      name,
      list_price: sale_price
    }
    return super._generate(val)
  }

}