import BaseMock from './base_mock'
import ProductMock from './product_mock'
import random from '../utils/random'

export default class SaleOrderMock extends BaseMock {
  MODEL = 'sale.order'
  productMock

  constructor() {
    super(true)
    this.productMock = new ProductMock()
  }

  async generate(price=10000) {
    await this.productMock.generate(random(), price)
    const productData = await this.productMock._get(['product_variant_id','display_name','uom_id'])
    const val = {
      "picking_policy": "direct",
      "partner_id": Cypress.env('erpPartnerId'),
      "order_line": [[0, 0, {
        "product_uom_qty": 1,
        "product_id": productData['product_variant_id'][0],
        "name": productData['display_name'],
        "product_uom": productData['uom_id'][0],
      }]],
      "is_return": false,
    }
    return this._generate(val)
  }

  cleanup() {
    super.cleanup()
    this.productMock.cleanup()
  }
}