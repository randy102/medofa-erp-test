import BaseMock from './base_mock'
import ProductMock from './product_mock'
import { MockItem } from './mock_item';

export class SaleOrderConfig{
  productMock?: ProductMock
  price?: number
  qty?: number
}

export default class SaleOrderMock extends BaseMock<SaleOrderConfig> {
  MODEL = 'sale.order'
  CAN_DELETE = true

  private productMock: ProductMock

  async getConfig({ productMock = null, price = 10000, qty = 1 }: SaleOrderConfig): Promise<object> {
    if(productMock){
      this.productMock = productMock
    } else{
      this.productMock = new ProductMock({price})
      await this.productMock.generate()
    }
    const productData = await this.productMock.get(['product_variant_id','display_name','uom_id'])
    return {
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
  }

  async cleanup() {
    await super.cleanup()
    await this.productMock.cleanup()
  }
}