import BaseMock, { BaseConfig } from './base_mock'
import ProductMock from './product_mock'

export class SaleOrderConfig extends BaseConfig<SaleOrderDepends> {
  price?: number
  qty?: number
  state?: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing'
}

export type SaleOrderDepends = {
  product?: ProductMock
}

export default class SaleOrderMock extends BaseMock<SaleOrderConfig, SaleOrderDepends> {
  MODEL = 'sale.order'
  CAN_DELETE = true

  protected async getDependency({ depends , price = 100000}: Partial<SaleOrderConfig>): Promise<SaleOrderDepends> {
    const { product } = depends
    if (!product) {
      depends.product = new ProductMock({ price })
    }
    return depends
  }

  protected async getCreateParam({ qty = 1 }: SaleOrderConfig, { product }: SaleOrderDepends): Promise<object> {
    const productData = await product.get(['product_variant_id', 'display_name', 'uom_id'])
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
}