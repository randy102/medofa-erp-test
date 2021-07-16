import BaseMock from './base_mock'
import ProductMock from './product_mock'
import { MockItem } from './mock_item';

class GenerateConfig{
  productMock?: ProductMock
  price?: number
  qty?: number
}

export default class SaleOrderMock extends BaseMock implements MockItem{
  MODEL = 'sale.order'
  private productMock: ProductMock

  constructor() {
    super(true)
  }

  async generate({ productMock = null, price = 10000, qty = 1 }: GenerateConfig) {
    if(productMock){
      this.productMock = productMock
    } else{
      this.productMock = new ProductMock()
      await this.productMock.generate({price})
    }
    const productData = await this.productMock.get(['product_variant_id','display_name','uom_id'])
    const val = {
      "picking_policy": "direct",
      "partner_id": Cypress.env('erpPartnerId'),
      "order_line": [[0, 0, {
        "product_uom_qty": qty,
        "product_id": productData['product_variant_id'][0],
        "name": productData['display_name'],
        "product_uom": productData['uom_id'][0],
      }]],
      "is_return": false,
    }
    return this._generate(val)
  }

  async cleanup() {
    await super.cleanup()
    await this.productMock.cleanup()
  }
}