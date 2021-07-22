import BaseMock from './base_mock'
import ProductMock from './product_mock'

export class SaleOrderConfig {
  productMock?: ProductMock
  price?: number
  qty?: number
  state?: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing'
}

export default class SaleOrderMock extends BaseMock<SaleOrderConfig> {
  MODEL = 'sale.order'
  CAN_DELETE = true

  private productMock: ProductMock

  protected async getCreateParam({ productMock = null, price = 10000, qty = 1 }: SaleOrderConfig): Promise<object> {
    if (productMock) {
      this.productMock = productMock
    } else {
      this.productMock = new ProductMock({ price })
    }
    await this.productMock.generate()
    const productData = await this.productMock.get(['product_variant_id', 'display_name', 'uom_id'])
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

  protected async afterGenerated(id: number, config: Partial<SaleOrderConfig>): Promise<void> {
    switch (config.state) {
      case 'Received':
        await this.receive()
        break
      case 'Confirmed':
        await this.confirm()
        break
      case 'Cancelled':
        await this.cancel()
        break
    }
  }

  async confirm(): Promise<void> {
    await this.rpc.call(this.MODEL, 'action_confirm', [this.getId()])
  }

  async receive(): Promise<void> {
    await this.rpc.call(this.MODEL, 'action_receive', [this.getId()])
  }

  async cancel(): Promise<void> {
    const [cancelType] = await this.rpc.search('medofa.cancel.type', [], ['id'])
    await this.rpc.call(this.MODEL, 'cancel_order_with_reason', this.getId(), cancelType.id, 'Cancel')
  }

  protected async beforeCleanup(config: Partial<SaleOrderConfig>): Promise<void> {
    await this.cancel()
    if (config.state == "Confirmed") {
      const { picking_ids } = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }

  protected async afterCleanup(config: Partial<SaleOrderConfig>): Promise<void> {
    await this.productMock.cleanup()
  }
}